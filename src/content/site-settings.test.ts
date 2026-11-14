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

test('site settings: the booking date strip shows 7 dates, today included', () => {
  const dates = bookableDates(seed.settings, 'CONSULTATION', MONDAY_9AM);
  assert.equal(dates.length, 7);
  assert.equal(dates[0]?.date, '2026-11-16');
  assert.equal(dates.at(-1)?.date, '2026-11-22');
});
