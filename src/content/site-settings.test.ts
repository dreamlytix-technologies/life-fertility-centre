import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bookableDates, computeDayAvailability } from '../core/booking/slots';
import { zonedToUtc } from '../core/booking/time';
import { seed } from './seed';

const MONDAY_9AM = zonedToUtc('2026-11-16', '09:00', 'Asia/Kolkata');

test('site settings: 5-minute online slots, Mon–Sat 10:00–14:00 (48 a day)', () => {
  assert.equal(seed.settings.rules.slotDurationMinutes, 5);
  const day = computeDayAvailability({ date: '2026-11-16', type: 'CONSULTATION', settings: seed.settings, occupancy: {}, now: MONDAY_9AM });
  assert.equal(day.open, true);
  assert.equal(day.slots.length, (4 * 60) / 5);
  assert.equal(day.slots[0]?.start, '10:00');
  assert.equal(day.slots[1]?.start, '10:05');
  assert.equal(day.slots.at(-1)?.start, '13:55');
});

test('site settings: online booking is open for today and the next 2 days', () => {
  const dates = bookableDates(seed.settings, 'CONSULTATION', MONDAY_9AM);
  assert.equal(dates.length, 3);
  assert.equal(dates[0]?.date, '2026-11-16');
  assert.equal(dates.at(-1)?.date, '2026-11-18');
});

test('site settings: ₹600 consultation = ₹200 online advance + ₹400 at the centre', () => {
  const { consultationFee, advancePayment } = seed.settings.rules;
  assert.equal(consultationFee, 60000); // paise
  assert.equal(advancePayment, 20000);
  assert.equal(consultationFee - advancePayment, 40000);
});
