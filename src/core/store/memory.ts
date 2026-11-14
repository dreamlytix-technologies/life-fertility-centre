import { randomUUID } from 'node:crypto';
import type { AppointmentRecord, BookingStatus, ClinicSeed, PaymentRecord, SlotPool } from '../domain';
import { OCCUPYING_STATUSES } from '../domain';
import type { OccupancyMap, SlotOccupancy } from '../booking/slots';
import { canTransition } from '../booking/status';
import type {
  AppointmentFilter,
  ClinicStore,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  ContactMessageInput,
  ReserveInput,
  ReserveResult,
} from './types';

/** Serialises critical sections — the in-process equivalent of SELECT … FOR UPDATE. */
class Mutex {
  private tail = Promise.resolve();
  run<T>(fn: () => T | Promise<T>): Promise<T> {
    const next = this.tail.then(fn, fn);
    this.tail = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }
}

export const occupies = (a: Pick<AppointmentRecord, 'status' | 'holdExpiresAt'>, now: Date) =>
  OCCUPYING_STATUSES.includes(a.status) ||
  (a.status === 'PAYMENT_PENDING' && !!a.holdExpiresAt && new Date(a.holdExpiresAt) > now);

const clone = <T>(v: T): T => structuredClone(v);

/**
 * Demo / test store. Same contract and same concurrency guarantees as the
 * Prisma store within one process. Data resets on restart.
 */
export class MemoryStore implements ClinicStore {
  readonly kind = 'memory' as const;
  private appointments = new Map<string, AppointmentRecord>();
  private slotOverrides = new Map<string, SlotOccupancy>(); // `${pool}|${date}|${start}`
  private webhookEvents = new Set<string>();
  private contactMessages: (ContactMessageInput & { id: string; createdAt: string })[] = [];
  private lock = new Mutex();

  constructor(private readonly seed: ClinicSeed) {}

  async getSettings() {
    return clone(this.seed.settings);
  }
  async getDoctor() {
    return clone(this.seed.doctor);
  }
  async listServices(opts?: { includeInactive?: boolean }) {
    return clone(this.seed.services.filter((s) => opts?.includeInactive || s.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
  }
  async listTestimonials(opts?: { includeUnapproved?: boolean }) {
    return clone(
      this.seed.testimonials
        .filter((t) => opts?.includeUnapproved || (t.status === 'APPROVED' && t.isActive))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  }
  async listGallery(opts?: { includeInactive?: boolean }) {
    return clone(this.seed.gallery.filter((g) => opts?.includeInactive || g.isActive).sort((a, b) => a.sortOrder - b.sortOrder));
  }

  /** Staff/admin: override capacity or disable a slot. */
  async setSlotOverride(pool: SlotPool, date: string, start: string, patch: { capacity?: number; disabled?: boolean }) {
    const key = `${pool}|${date}|${start}`;
    this.slotOverrides.set(key, { occupied: 0, ...this.slotOverrides.get(key), ...patch });
  }

  private poolOf(a: AppointmentRecord): SlotPool {
    return a.type === 'EMERGENCY' ? 'EMERGENCY' : 'STANDARD';
  }

  async getOccupancy(date: string, pool: SlotPool, now: Date): Promise<OccupancyMap> {
    const map: OccupancyMap = {};
    for (const [key, o] of this.slotOverrides) {
      const [p, d, start] = key.split('|');
      if (p === pool && d === date && start) map[start] = { occupied: 0, capacity: o.capacity, disabled: o.disabled };
    }
    for (const a of this.appointments.values()) {
      if (a.date !== date || this.poolOf(a) !== pool || !occupies(a, now)) continue;
      const entry = (map[a.startTime] ??= { occupied: 0 });
      entry.occupied += 1;
    }
    return map;
  }

  reserve(input: ReserveInput, now: Date): Promise<ReserveResult> {
    return this.lock.run(async () => {
      if (input.appointment.idempotencyKey) {
        const existing = [...this.appointments.values()].find((a) => a.idempotencyKey === input.appointment.idempotencyKey);
        if (existing) return { ok: false, code: 'DUPLICATE', message: 'Booking already created', existing: clone(existing) };
      }
      const occupancy = await this.getOccupancy(input.date, input.pool, now);
      const slot = occupancy[input.startTime];
      if (slot?.disabled) return { ok: false, code: 'SLOT_UNAVAILABLE', message: 'That slot is not available' };
      const capacity = slot?.capacity ?? input.defaultCapacity;
      if ((slot?.occupied ?? 0) >= capacity)
        return { ok: false, code: 'SLOT_FULL', message: 'That slot was just booked. Please pick another time.' };
      if (input.dailyCap !== undefined) {
        const used = Object.values(occupancy).reduce((n, o) => n + o.occupied, 0);
        if (used >= input.dailyCap) return { ok: false, code: 'SLOT_FULL', message: 'All emergency slots for today are taken.' };
      }
      // Same patient (phone + name), same day, same type, still active → duplicate booking.
      const dup = [...this.appointments.values()].find(
        (a) =>
          a.date === input.date &&
          a.type === input.appointment.type &&
          a.patient.contactNumber === input.appointment.patient.contactNumber &&
          a.patient.patientName.toLowerCase() === input.appointment.patient.patientName.toLowerCase() &&
          occupies(a, now),
      );
      if (dup)
        return {
          ok: false,
          code: 'DUPLICATE',
          message: `${dup.patient.patientName} already has a booking on this day (${dup.reference}). Please call the centre to change it.`,
        };

      const ts = now.toISOString();
      const record: AppointmentRecord = { ...clone(input.appointment), id: randomUUID(), payments: [], createdAt: ts, updatedAt: ts };
      this.appointments.set(record.id, record);
      return { ok: true, appointment: clone(record) };
    });
  }

  async findByIdempotencyKey(key: string) {
    const a = [...this.appointments.values()].find((x) => x.idempotencyKey === key);
    return a ? clone(a) : null;
  }
  async findByReference(reference: string) {
    const a = [...this.appointments.values()].find((x) => x.reference === reference);
    return a ? clone(a) : null;
  }
  async findByOrderId(orderId: string) {
    const a = [...this.appointments.values()].find((x) => x.payments.some((p) => p.providerOrderId === orderId));
    return a ? clone(a) : null;
  }

  async addPayment(appointmentId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'refundedAmount'>) {
    const a = this.appointments.get(appointmentId);
    if (!a) throw new Error('Appointment not found');
    const record: PaymentRecord = { ...payment, id: randomUUID(), refundedAmount: 0, createdAt: new Date().toISOString() };
    a.payments.push(record);
    a.updatedAt = record.createdAt;
    return clone(record);
  }

  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    return this.lock.run(async () => {
      const a = [...this.appointments.values()].find((x) => x.payments.some((p) => p.providerOrderId === input.providerOrderId));
      if (!a) return { outcome: 'NOT_FOUND' };
      const payment = a.payments.find((p) => p.providerOrderId === input.providerOrderId)!;
      if (payment.status === 'PAID' && (a.status === 'CONFIRMED' || a.status === 'RESCHEDULED'))
        return { outcome: 'ALREADY_CONFIRMED', appointment: clone(a) };

      const ts = input.now.toISOString();
      payment.status = 'PAID';
      payment.providerPaymentId = input.providerPaymentId;
      payment.paidAt = ts;
      a.updatedAt = ts;

      const holdLive = a.status === 'PAYMENT_PENDING' && !!a.holdExpiresAt && new Date(a.holdExpiresAt) > input.now;
      if (!holdLive && a.status === 'PAYMENT_PENDING') {
        // Hold expired: only confirm if the slot still has room.
        const occ = await this.getOccupancy(a.date, this.poolOf(a), input.now);
        const s = occ[a.startTime];
        const cap = s?.capacity ?? input.defaultCapacity(a);
        if (s?.disabled || (s?.occupied ?? 0) >= cap) {
          a.status = 'REFUND_PENDING';
          return { outcome: 'LATE_REFUND_REQUIRED', appointment: clone(a) };
        }
      }
      a.status = 'CONFIRMED';
      a.confirmedAt = ts;
      a.holdExpiresAt = undefined;
      return { outcome: 'CONFIRMED', appointment: clone(a) };
    });
  }

  async markPaymentFailed(providerOrderId: string, reason: string, providerPaymentId?: string) {
    for (const a of this.appointments.values()) {
      const p = a.payments.find((x) => x.providerOrderId === providerOrderId);
      if (p && p.status !== 'PAID') {
        p.status = 'FAILED';
        p.failureReason = reason;
        p.providerPaymentId = providerPaymentId ?? p.providerPaymentId;
        a.updatedAt = new Date().toISOString();
      }
    }
  }

  async claimWebhookEvent(provider: string, eventId: string) {
    const key = `${provider}:${eventId}`;
    if (this.webhookEvents.has(key)) return false;
    this.webhookEvents.add(key);
    return true;
  }

  async updateStatus(id: string, to: BookingStatus) {
    const a = this.appointments.get(id);
    if (!a) throw new Error('Appointment not found');
    if (!canTransition(a.status, to)) throw new Error(`Cannot change ${a.status} → ${to}`);
    a.status = to;
    a.updatedAt = new Date().toISOString();
    if (to === 'CANCELLED') a.cancelledAt = a.updatedAt;
    return clone(a);
  }

  async listAppointments(filter: AppointmentFilter) {
    const q = filter.q?.toLowerCase().trim();
    let items = [...this.appointments.values()].filter((a) => {
      if (filter.status?.length && !filter.status.includes(a.status)) return false;
      if (filter.type && a.type !== filter.type) return false;
      if (filter.from && a.date < filter.from) return false;
      if (filter.to && a.date > filter.to) return false;
      if (filter.paymentStatus && a.payments.at(-1)?.status !== filter.paymentStatus) return false;
      if (q)
        return [a.reference, a.patient.patientName, a.patient.contactNumber].some((f) =>
          f.toLowerCase().includes(q),
        );
      return true;
    });
    items = items.sort((x, y) => x.scheduledStart.localeCompare(y.scheduledStart));
    const start = filter.cursor ? items.findIndex((a) => a.id === filter.cursor) + 1 : 0;
    const limit = Math.min(filter.limit ?? 50, 200);
    const page = items.slice(start, start + limit);
    return { items: clone(page), nextCursor: items.length > start + limit ? page.at(-1)?.id : undefined };
  }

  async createContactMessage(input: ContactMessageInput) {
    const id = randomUUID();
    this.contactMessages.push({ ...input, id, createdAt: new Date().toISOString() });
    return { id };
  }
}
