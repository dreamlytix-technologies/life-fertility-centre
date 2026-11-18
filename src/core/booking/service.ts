import type { AppointmentRecord, ClinicSettings, Doctor, PublicBooking } from '../domain';
import { formatAddress, poolFor, VISIT_REASON_LABELS } from '../domain';
import { getPaymentProvider, type ClientCheckout } from '../payments';
import { generateAccessToken, generateReference, safeEqual, sha256 } from '../security';
import type { ClinicStore } from '../store/types';
import { fieldErrors, bookingRequestSchema, verifyPaymentSchema } from '../validation';
import { quote } from './pricing';
import { assertSlotBookable, computeDayAvailability } from './slots';
import { toMinutes, zonedParts } from './time';
import { sendBookingConfirmation } from '../notifications/email';

export class BookingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

export interface CreateBookingResult {
  reference: string;
  token: string;
  status: AppointmentRecord['status'];
  holdExpiresAt?: string;
  amountDue: number;
  checkout: ClientCheckout | null;
}

const capacityFor = (a: Pick<AppointmentRecord, 'type'>, s: ClinicSettings) =>
  a.type === 'EMERGENCY' ? s.emergency.capacityPerSlot : s.rules.maxPerSlot;

/**
 * Step 1 — validate, re-check availability on the server, compute the price,
 * atomically hold the slot and open a payment order.
 */
export async function createBooking(store: ClinicStore, body: unknown, now = new Date()): Promise<CreateBookingResult> {
  const parsed = bookingRequestSchema.safeParse(body);
  if (!parsed.success) throw new BookingError('VALIDATION', 'Please check the highlighted fields', 422, fieldErrors(parsed.error));
  const { patient, appointment, idempotencyKey, website } = parsed.data;
  if (website) throw new BookingError('SPAM', 'Request rejected', 400);

  // Idempotent retry (double-tap, flaky network): return the same booking + a fresh order if still pending.
  const existing = await store.findByIdempotencyKey(idempotencyKey);
  if (existing) throw new BookingError('DUPLICATE_REQUEST', 'This booking was already submitted. Check your confirmation.', 409);

  const [settings, doctor] = await Promise.all([store.getSettings(), store.getDoctor()]);
  const tz = settings.clinic.timezone;

  // Online booking desk hours (configurable "booking opening / closing time").
  if (settings.rules.deskHours) {
    const m = zonedParts(now, tz).minutes;
    if (m < toMinutes(settings.rules.deskHours.start) || m >= toMinutes(settings.rules.deskHours.end))
      throw new BookingError('DESK_CLOSED', 'Online booking is closed right now. Please try again during booking hours.', 409);
  }

  // Catalog check — never trust codes from the client.
  if (appointment.serviceSlug) {
    const ok = (await store.listServices()).some((s) => s.slug === appointment.serviceSlug);
    if (!ok) throw new BookingError('SERVICE_UNKNOWN', 'Unknown service', 422);
  }

  // Authoritative availability check (the client's view may be stale).
  const pool = poolFor(appointment.type);
  const occupancy = await store.getOccupancy(appointment.date, pool, now);
  const day = computeDayAvailability({ date: appointment.date, type: appointment.type, settings, occupancy, now });
  const check = assertSlotBookable(day, appointment.slot);
  if (!check.ok) throw new BookingError(check.code, check.message, 409);

  const price = quote(appointment.type, settings.rules, settings.clinic.currency);
  const { token, hash } = generateAccessToken();
  const reference = generateReference(settings.rules.referencePrefix, appointment.date);
  const needsPayment = price.advance > 0;
  const holdExpiresAt = new Date(now.getTime() + settings.rules.holdMinutes * 60_000).toISOString();

  const reserved = await store.reserve(
    {
      pool,
      date: appointment.date,
      startTime: check.slot.start,
      endTime: check.slot.end,
      defaultCapacity: check.slot.capacity,
      dailyCap: pool === 'EMERGENCY' ? settings.emergency.maxPerDay : undefined,
      appointment: {
        reference,
        accessTokenHash: hash,
        type: appointment.type,
        status: needsPayment ? 'PAYMENT_PENDING' : 'CONFIRMED',
        doctorId: doctor.id,
        serviceSlug: appointment.serviceSlug || undefined,
        visitReason: appointment.visitReason,
        patient: {
          patientName: patient.patientName,
          age: patient.age,
          gender: patient.gender,
          contactNumber: patient.contactNumber,
          email: patient.email || undefined,
          partnerName: patient.partnerName || undefined,
        },
        date: appointment.date,
        startTime: check.slot.start,
        endTime: check.slot.end,
        scheduledStart: check.slot.startsAt,
        scheduledEnd: new Date(new Date(check.slot.startsAt).getTime() + (pool === 'EMERGENCY' ? settings.emergency.slotDurationMinutes : settings.rules.slotDurationMinutes) * 60_000).toISOString(),
        reason: appointment.reason || undefined,
        holdExpiresAt: needsPayment ? holdExpiresAt : undefined,
        consultationFee: price.fee,
        advanceAmount: price.advance,
        currency: price.currency,
        idempotencyKey,
        confirmedAt: needsPayment ? undefined : now.toISOString(),
      },
    },
    now,
  );
  if (!reserved.ok) throw new BookingError(reserved.code, reserved.message, 409);

  if (!needsPayment) {
    void notify(reserved.appointment, settings, doctor, token);
    return { reference, token, status: 'CONFIRMED', amountDue: 0, checkout: null };
  }

  const provider = getPaymentProvider();
  const checkout = await provider.createOrder({
    amount: price.advance,
    currency: price.currency,
    receipt: reference,
    notes: { reference, type: appointment.type },
    customer: { name: patient.patientName, contact: `+91${patient.contactNumber}`, email: patient.email || undefined },
  });
  await store.addPayment(reserved.appointment.id, {
    provider: provider.name,
    providerOrderId: checkout.orderId,
    amount: price.advance,
    currency: price.currency,
    status: 'PENDING',
  });

  return { reference, token, status: 'PAYMENT_PENDING', holdExpiresAt, amountDue: price.advance, checkout };
}

/** Step 2 — verify the gateway signature server-side, then confirm atomically. */
export async function verifyPayment(store: ClinicStore, body: unknown, now = new Date()) {
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) throw new BookingError('VALIDATION', 'Invalid payment payload', 422);
  const { reference, token, orderId, paymentId, signature } = parsed.data;

  const appt = await store.findByReference(reference);
  if (!appt || !safeEqual(appt.accessTokenHash, sha256(token))) throw new BookingError('NOT_FOUND', 'Booking not found', 404);
  const payment = appt.payments.find((p) => p.providerOrderId === orderId);
  if (!payment) throw new BookingError('ORDER_MISMATCH', 'Payment does not belong to this booking', 400);

  const provider = getPaymentProvider();
  if (provider.name !== payment.provider || !provider.verifyPayment({ orderId, paymentId, signature })) {
    await store.markPaymentFailed(orderId, 'Signature verification failed', paymentId);
    throw new BookingError('SIGNATURE_INVALID', 'We could not verify this payment. You have not been charged twice — please contact the clinic.', 400);
  }

  return finalizePaid(store, orderId, paymentId, now, token);
}

export async function finalizePaid(store: ClinicStore, orderId: string, paymentId: string, now: Date, token?: string) {
  const settings = await store.getSettings();
  const result = await store.confirmPayment({
    providerOrderId: orderId,
    providerPaymentId: paymentId,
    now,
    defaultCapacity: (a) => capacityFor(a, settings),
  });
  if (result.outcome === 'NOT_FOUND') throw new BookingError('NOT_FOUND', 'Booking not found', 404);
  if (result.outcome === 'LATE_REFUND_REQUIRED') {
    // Paid after the hold lapsed and someone else took the slot: refund automatically.
    try {
      await getPaymentProvider().refund(paymentId, result.appointment.advanceAmount, { reference: result.appointment.reference });
    } catch (err) {
      console.error('[booking] automatic refund failed — staff action needed', result.appointment.reference, err);
    }
  }
  if (result.outcome === 'CONFIRMED' && token) {
    const doctor = await store.getDoctor();
    void notify(result.appointment, settings, doctor, token);
  }
  return { outcome: result.outcome, reference: result.appointment.reference, status: result.appointment.status };
}

async function notify(a: AppointmentRecord, settings: ClinicSettings, doctor: Doctor, token: string) {
  try {
    await sendBookingConfirmation({ appointment: a, settings, doctor, token });
  } catch (err) {
    console.error('[booking] confirmation email failed', a.reference, err);
  }
}

/** Public, token-gated view used by the confirmation page. No phone, email, partner name or note leaks out. */
export async function getPublicBooking(store: ClinicStore, reference: string, token: string): Promise<PublicBooking | null> {
  if (!reference || !token || token.length > 128) return null;
  const a = await store.findByReference(reference);
  if (!a || !safeEqual(a.accessTokenHash, sha256(token))) return null;
  const [settings, doctor, services] = await Promise.all([
    store.getSettings(),
    store.getDoctor(),
    store.listServices({ includeInactive: true }),
  ]);
  const payment = a.payments.at(-1);
  const paid = payment?.status === 'PAID' ? payment.amount : 0;
  return {
    reference: a.reference,
    type: a.type,
    status: a.status,
    patientName: a.patient.patientName,
    patientAge: a.patient.age,
    patientGender: a.patient.gender,
    doctorName: `${doctor.honorific} ${doctor.name}`,
    visitReasonLabel: a.visitReason ? VISIT_REASON_LABELS[a.visitReason] : undefined,
    serviceTitle: services.find((s) => s.slug === a.serviceSlug)?.title,
    date: a.date,
    startTime: a.startTime,
    endTime: a.endTime,
    scheduledStart: a.scheduledStart,
    scheduledEnd: a.scheduledEnd,
    consultationFee: a.consultationFee,
    advanceAmount: a.advanceAmount,
    remainingAmount: Math.max(0, a.consultationFee - paid),
    currency: a.currency,
    payment: payment
      ? { status: payment.status, transactionId: payment.providerPaymentId, paidAt: payment.paidAt, amount: payment.amount }
      : null,
    holdExpiresAt: a.status === 'PAYMENT_PENDING' ? a.holdExpiresAt : undefined,
    clinic: {
      name: settings.clinic.name,
      phone: settings.clinic.phone,
      phoneDisplay: settings.clinic.phoneDisplay,
      address: formatAddress(settings.clinic.address),
      mapsUrl: settings.clinic.mapsUrl,
    },
  };
}
