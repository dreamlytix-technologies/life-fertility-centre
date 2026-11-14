import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { createSeed } from '../content/base-seed';
import { MemoryStore } from '../store/memory';
import { computeDayAvailability } from './slots';
import { getEmergencyStatus } from './emergency';
import { resolveDayHours } from './schedule';
import { createBooking, verifyPayment, BookingError } from './service';
import { zonedToUtc } from './time';
import { getPaymentProvider, MockProvider } from '../payments';
import { bookingRequestSchema } from '../validation';

process.env.PAYMENT_PROVIDER = 'mock';

const seed = createSeed({
  clinic: {
    name: 'Test Clinic',
    phone: '+910000000000',
    phoneDisplay: '+91 00000 00000',
    email: 't@example.com',
    address: { line1: '1 Road', city: 'Malda', state: 'West Bengal', postalCode: '732103', country: 'IN' },
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    locale: 'en-IN',
  },
  rules: { maxPerSlot: 1 },
  doctor: {
    id: 'doc', slug: 'doc', honorific: 'Dr.', name: 'Test', specialization: 'Obstetrics & Gynaecology', qualifications: ['MBBS'],
    experienceSince: 2004, shortBio: '', biography: '', approach: '', previousExperience: [], languages: [], memberships: [],
  },
  testimonials: [],
  gallery: [],
});

// Monday 2026-11-16, 09:00 IST
const MONDAY_9AM = zonedToUtc('2026-11-16', '09:00', 'Asia/Kolkata');

const patient = {
  patientName: 'Asha Das',
  age: 31,
  contactNumber: '98765 43210',
  email: '',
  partnerName: '',
};
const body = (slot: string, name = 'Asha Das', over: Record<string, unknown> = {}) => ({
  patient: { ...patient, patientName: name, ...over },
  appointment: { type: 'CONSULTATION', date: '2026-11-16', slot, visitReason: 'FERTILITY' },
  consent: true,
  idempotencyKey: randomUUID(),
});
const fieldsOf = (e: unknown) => (e instanceof BookingError ? (e.fields ?? {}) : {});

test('weekly hours, holidays and special hours resolve correctly', () => {
  const s = seed.settings;
  assert.equal(resolveDayHours('2026-11-15', s.weekly, s.exceptions).open, false); // Sunday
  assert.equal(resolveDayHours('2026-12-25', s.weekly, s.exceptions).open, false); // holiday
  assert.deepEqual(resolveDayHours('2026-11-28', s.weekly, s.exceptions).ranges, [{ start: '10:00', end: '13:00' }]);
});

test('slots are generated from configurable hours and duration (Mon–Sat 10:00–14:00, 15 min)', () => {
  const day = computeDayAvailability({ date: '2026-11-16', type: 'CONSULTATION', settings: seed.settings, occupancy: {}, now: MONDAY_9AM });
  assert.equal(day.open, true);
  assert.equal(day.slots.length, (4 * 60) / 15);
  assert.equal(day.slots[0]?.start, '10:00');
  assert.equal(day.slots.at(-1)?.start, '13:45');
});

test('adult patient validation: whole years 16–70 only', () => {
  const ok = (age: unknown) => bookingRequestSchema.safeParse(body('10:00', 'Asha Das', { age })).success;
  assert.equal(ok(16), true);
  assert.equal(ok(70), true);
  assert.equal(ok(15), false);
  assert.equal(ok(71), false);
  assert.equal(ok(30.5), false);
  assert.equal(ok('30'), false);
});

test('invalid age is rejected by the booking service with a 422 field error', async () => {
  const store = new MemoryStore(seed);
  await assert.rejects(createBooking(store, body('10:00', 'Asha Das', { age: 12 }), MONDAY_9AM), (e) => {
    assert.ok(e instanceof BookingError);
    assert.equal(e.status, 422);
    assert.ok('patient.age' in fieldsOf(e));
    return true;
  });
});

test('only consultations can be booked online, with a valid visit reason and a short note', async () => {
  const store = new MemoryStore(seed);
  const withAppt = (appointment: Record<string, unknown>) => ({ ...body('10:15'), appointment });
  await assert.rejects(
    createBooking(store, withAppt({ type: 'EMERGENCY', date: '2026-11-16', slot: '08:00', reason: 'Severe pain' }), MONDAY_9AM),
    (e) => e instanceof BookingError && e.status === 422,
  );
  await assert.rejects(
    createBooking(store, withAppt({ type: 'CONSULTATION', date: '2026-11-16', slot: '10:15', visitReason: 'VACCINATION' }), MONDAY_9AM),
    (e) => e instanceof BookingError && 'appointment.visitReason' in fieldsOf(e),
  );
  await assert.rejects(
    createBooking(store, withAppt({ type: 'CONSULTATION', date: '2026-11-16', slot: '10:15', visitReason: 'GYNAE', reason: 'x'.repeat(301) }), MONDAY_9AM),
    (e) => e instanceof BookingError && 'appointment.reason' in fieldsOf(e),
  );
});

test('concurrent bookings for the last seat: exactly one wins', async () => {
  const store = new MemoryStore(seed);
  const results = await Promise.allSettled(
    Array.from({ length: 6 }, (_, i) => createBooking(store, body('11:00', `Patient ${String.fromCharCode(65 + i)}`), MONDAY_9AM)),
  );
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  for (const r of results)
    if (r.status === 'rejected') assert.ok(r.reason instanceof BookingError && r.reason.code === 'SLOT_FULL' && r.reason.status === 409);
  const day = computeDayAvailability({
    date: '2026-11-16', type: 'CONSULTATION', settings: seed.settings,
    occupancy: await store.getOccupancy('2026-11-16', 'STANDARD', MONDAY_9AM), now: MONDAY_9AM,
  });
  assert.equal(day.slots.find((s) => s.start === '11:00')?.status, 'FULLY_BOOKED');
});

test('same patient on the same day is rejected as a duplicate (409)', async () => {
  const store = new MemoryStore(seed);
  const first = await createBooking(store, body('11:15'), MONDAY_9AM);
  await assert.rejects(createBooking(store, body('11:30', 'asha das'), MONDAY_9AM), (e) => {
    assert.ok(e instanceof BookingError);
    assert.equal(e.code, 'DUPLICATE');
    assert.equal(e.status, 409);
    assert.match(e.message, new RegExp(first.reference));
    return true;
  });
});

test('replaying the same idempotency key cannot create a second booking', async () => {
  const store = new MemoryStore(seed);
  const req = body('11:45');
  await createBooking(store, req, MONDAY_9AM);
  await assert.rejects(createBooking(store, req, MONDAY_9AM), (e) => e instanceof BookingError && e.code === 'DUPLICATE_REQUEST' && e.status === 409);
});

test('price comes from settings, not the client; reference uses the LFC prefix', async () => {
  const store = new MemoryStore(seed);
  const res = await createBooking(store, { ...body('12:00'), amount: 1 }, MONDAY_9AM);
  assert.equal(res.amountDue, seed.settings.rules.advancePayment);
  assert.match(res.reference, /^LFC-261116-[0-9A-Z]{5}$/);
});

test('payment is verified server-side and confirms the booking', async () => {
  const store = new MemoryStore(seed);
  const res = await createBooking(store, body('12:15'), MONDAY_9AM);
  const provider = getPaymentProvider() as MockProvider;
  const sim = provider.simulate(res.checkout!.orderId, 'success');
  assert.ok(sim.ok);
  await assert.rejects(
    verifyPayment(store, { reference: res.reference, token: res.token, orderId: sim.orderId, paymentId: sim.paymentId, signature: 'f'.repeat(64) }, MONDAY_9AM),
    (e) => e instanceof BookingError && e.code === 'SIGNATURE_INVALID',
  );
  const ok = await verifyPayment(store, { reference: res.reference, token: res.token, orderId: sim.orderId, paymentId: sim.paymentId, signature: sim.signature }, MONDAY_9AM);
  assert.equal(ok.status, 'CONFIRMED');
});

test('late payment after the hold expired and the slot was re-booked → refund, never overbook', async () => {
  const store = new MemoryStore(seed);
  const provider = getPaymentProvider() as MockProvider;
  const late = await createBooking(store, body('12:30', 'Late Payer'), MONDAY_9AM);
  const t11 = new Date(MONDAY_9AM.getTime() + 11 * 60_000);
  const taker = await createBooking(store, body('12:30', 'Second Patient', { contactNumber: '91234 56789' }), t11);
  const simTaker = provider.simulate(taker.checkout!.orderId, 'success');
  assert.ok(simTaker.ok);
  await verifyPayment(store, { reference: taker.reference, token: taker.token, orderId: simTaker.orderId, paymentId: simTaker.paymentId, signature: simTaker.signature }, t11);

  const sim = provider.simulate(late.checkout!.orderId, 'success');
  assert.ok(sim.ok);
  const t12 = new Date(MONDAY_9AM.getTime() + 12 * 60_000);
  const res = await verifyPayment(store, { reference: late.reference, token: late.token, orderId: sim.orderId, paymentId: sim.paymentId, signature: sim.signature }, t12);
  assert.equal(res.outcome, 'LATE_REFUND_REQUIRED');
  assert.equal(res.status, 'REFUND_PENDING');
  const occ = await store.getOccupancy('2026-11-16', 'STANDARD', t12);
  assert.equal(occ['12:30']?.occupied, 1);
});

test('expired holds release the slot', async () => {
  const store = new MemoryStore(seed);
  await createBooking(store, body('13:00'), MONDAY_9AM);
  const later = new Date(MONDAY_9AM.getTime() + 11 * 60_000);
  const occ = await store.getOccupancy('2026-11-16', 'STANDARD', later);
  assert.equal(occ['13:00']?.occupied ?? 0, 0);
});

test('past dates, closed days and out-of-hours slots are rejected', async () => {
  const store = new MemoryStore(seed);
  const at = (date: string, slot: string) => ({ ...body(slot), appointment: { type: 'CONSULTATION', date, slot, visitReason: 'GYNAE' } });
  await assert.rejects(createBooking(store, at('2026-11-15', '10:00'), MONDAY_9AM)); // Sunday
  await assert.rejects(createBooking(store, at('2026-11-01', '10:00'), MONDAY_9AM)); // past
  await assert.rejects(createBooking(store, at('2026-11-16', '14:00'), MONDAY_9AM)); // after closing
});

test('engine urgent pool: status moves COMING_SOON → OPEN → CLOSED, and DISABLED when switched off', () => {
  const s = seed.settings;
  const at = (t: string) => zonedToUtc('2026-11-16', t, 'Asia/Kolkata');
  assert.equal(getEmergencyStatus(s, {}, at('07:00')).state, 'COMING_SOON');
  assert.equal(getEmergencyStatus(s, {}, at('08:30')).state, 'OPEN');
  const closed = getEmergencyStatus(s, {}, at('11:00'));
  assert.equal(closed.state, 'CLOSED');
  assert.match(closed.nextOpenLabel ?? '', /Tomorrow at 8:00 AM/);
  assert.equal(getEmergencyStatus({ ...s, emergency: { ...s.emergency, enabled: false } }, {}, at('08:30')).state, 'DISABLED');
});

test('engine urgent pool: daily cap → FULLY_BOOKED', () => {
  const s = { ...seed.settings, emergency: { ...seed.settings.emergency, maxPerDay: 2 } };
  const now = zonedToUtc('2026-11-16', '08:20', 'Asia/Kolkata');
  assert.equal(getEmergencyStatus(s, { '08:00': { occupied: 1 }, '08:15': { occupied: 1 } }, now).state, 'FULLY_BOOKED');
});
