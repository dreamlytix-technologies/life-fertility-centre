import type { AppointmentType, ClinicSettings, SlotPool, TimeRange } from '../domain';
import { poolFor } from '../domain';
import { resolveDayHours } from './schedule';
import {
  addDaysISO,
  diffDaysISO,
  formatDateShort,
  formatTime12,
  fromMinutes,
  isHHmm,
  isISODate,
  toMinutes,
  weekdayOf,
  zonedParts,
  zonedToUtc,
} from './time';

export type SlotStatus = 'AVAILABLE' | 'LIMITED' | 'FULLY_BOOKED' | 'UNAVAILABLE' | 'PAST';

export interface SlotTemplate {
  start: string;
  end: string;
  startsAt: Date;
  endsAt: Date;
}

/** Per-slot state as known by the store. */
export interface SlotOccupancy {
  occupied: number;
  capacity?: number; // staff override
  disabled?: boolean;
}
export type OccupancyMap = Record<string, SlotOccupancy>; // keyed by start "HH:mm"

export interface SlotAvailability {
  start: string;
  end: string;
  label: string; // "10:30 AM"
  startsAt: string;
  status: SlotStatus;
  capacity: number;
  remaining: number;
}

export type DayClosedReason =
  | 'PAST_DATE'
  | 'BEYOND_WINDOW'
  | 'CLOSED_DAY'
  | 'HOLIDAY'
  | 'EMERGENCY_DISABLED'
  | 'NOT_EMERGENCY_DAY';

export interface DayAvailability {
  date: string;
  pool: SlotPool;
  open: boolean;
  reason?: DayClosedReason;
  message?: string;
  slots: SlotAvailability[];
  summary: { total: number; available: number; fullyBooked: boolean };
}

export function buildSlotTemplates(
  dateISO: string,
  ranges: TimeRange[],
  durationMinutes: number,
  tz: string,
): SlotTemplate[] {
  const out: SlotTemplate[] = [];
  for (const r of ranges) {
    for (let t = toMinutes(r.start); t + durationMinutes <= toMinutes(r.end); t += durationMinutes) {
      const start = fromMinutes(t);
      const end = fromMinutes(t + durationMinutes);
      out.push({ start, end, startsAt: zonedToUtc(dateISO, start, tz), endsAt: zonedToUtc(dateISO, end, tz) });
    }
  }
  return out;
}

/** Ranges + slot length for a pool on a date (null when the pool doesn't run that day). */
export function poolRangesFor(
  dateISO: string,
  pool: SlotPool,
  settings: ClinicSettings,
): { ranges: TimeRange[]; duration: number; capacity: number; reason?: DayClosedReason; message?: string } {
  const day = resolveDayHours(dateISO, settings.weekly, settings.exceptions);
  if (pool === 'STANDARD') {
    if (!day.open) {
      const holiday = day.exception?.type === 'HOLIDAY';
      return {
        ranges: [],
        duration: settings.rules.slotDurationMinutes,
        capacity: settings.rules.maxPerSlot,
        reason: holiday ? 'HOLIDAY' : 'CLOSED_DAY',
        message: holiday ? `Clinic closed — ${day.exception?.label}` : 'The clinic is closed on this day',
      };
    }
    return { ranges: day.ranges, duration: settings.rules.slotDurationMinutes, capacity: settings.rules.maxPerSlot };
  }

  const e = settings.emergency;
  const base = { ranges: [] as TimeRange[], duration: e.slotDurationMinutes, capacity: e.capacityPerSlot };
  if (!e.enabled) return { ...base, reason: 'EMERGENCY_DISABLED', message: 'Online emergency booking is not offered right now' };
  if (!e.daysOfWeek.includes(weekdayOf(dateISO)))
    return { ...base, reason: 'NOT_EMERGENCY_DAY', message: 'Emergency booking does not run on this day' };
  if (e.closedOnHolidays && day.exception?.type === 'HOLIDAY')
    return { ...base, reason: 'HOLIDAY', message: `Closed — ${day.exception.label}` };
  return { ...base, ranges: [e.window] };
}

export type WindowCheck = { ok: true } | { ok: false; reason: DayClosedReason; message: string };

export function checkBookingWindow(dateISO: string, settings: ClinicSettings, now: Date, pool: SlotPool): WindowCheck {
  const today = zonedParts(now, settings.clinic.timezone).date;
  if (dateISO < today) return { ok: false, reason: 'PAST_DATE', message: 'This date is in the past' };
  // Emergency booking is same-day only.
  const maxDays = pool === 'EMERGENCY' ? 0 : settings.rules.bookingWindowDays;
  if (diffDaysISO(dateISO, today) > maxDays)
    return {
      ok: false,
      reason: 'BEYOND_WINDOW',
      message:
        pool === 'EMERGENCY'
          ? 'Emergency visits can only be booked for today'
          : `Bookings open ${settings.rules.bookingWindowDays} days in advance`,
    };
  return { ok: true };
}

/** The single source of truth for "what can be booked on this date". Pure — the store supplies occupancy. */
export function computeDayAvailability(args: {
  date: string;
  type: AppointmentType;
  settings: ClinicSettings;
  occupancy: OccupancyMap;
  now?: Date;
}): DayAvailability {
  const { date, type, settings, occupancy } = args;
  const now = args.now ?? new Date();
  const pool = poolFor(type);
  const empty = (reason: DayClosedReason, message: string): DayAvailability => ({
    date,
    pool,
    open: false,
    reason,
    message,
    slots: [],
    summary: { total: 0, available: 0, fullyBooked: false },
  });

  if (!isISODate(date)) return empty('PAST_DATE', 'Invalid date');
  const window = checkBookingWindow(date, settings, now, pool);
  if (!window.ok) return empty(window.reason, window.message);

  const { ranges, duration, capacity, reason, message } = poolRangesFor(date, pool, settings);
  if (reason) return empty(reason, message ?? 'Unavailable');

  const leadMs = (pool === 'EMERGENCY' ? 0 : settings.rules.minLeadMinutes) * 60_000;
  const slots = buildSlotTemplates(date, ranges, duration, settings.clinic.timezone).map((t) => {
    const occ = occupancy[t.start];
    const cap = Math.max(0, occ?.capacity ?? capacity);
    const remaining = Math.max(0, cap - (occ?.occupied ?? 0));
    let status: SlotStatus;
    // Emergency slots stay bookable until they end (a parent at 8:05 can take the 8:00 slot).
    const cutoff = pool === 'EMERGENCY' ? t.endsAt.getTime() : t.startsAt.getTime() - leadMs;
    if (now.getTime() >= cutoff) status = 'PAST';
    else if (occ?.disabled || cap === 0) status = 'UNAVAILABLE';
    else if (remaining === 0) status = 'FULLY_BOOKED';
    else if (cap > 1 && remaining === 1) status = 'LIMITED';
    else status = 'AVAILABLE';
    return {
      start: t.start,
      end: t.end,
      label: formatTime12(t.start),
      startsAt: t.startsAt.toISOString(),
      status,
      capacity: cap,
      remaining: status === 'AVAILABLE' || status === 'LIMITED' ? remaining : 0,
    } satisfies SlotAvailability;
  });

  let available = slots.filter((s) => s.status === 'AVAILABLE' || s.status === 'LIMITED').length;

  // Emergency daily cap: once maxPerDay is reached, every remaining slot is FULLY_BOOKED.
  if (pool === 'EMERGENCY') {
    const usedToday = Object.values(occupancy).reduce((n, o) => n + o.occupied, 0);
    if (usedToday >= settings.emergency.maxPerDay) {
      for (const s of slots) if (s.status === 'AVAILABLE' || s.status === 'LIMITED') {
        s.status = 'FULLY_BOOKED';
        s.remaining = 0;
      }
      available = 0;
    }
  }

  const bookable = slots.filter((s) => s.status !== 'PAST');
  return {
    date,
    pool,
    open: true,
    slots,
    summary: {
      total: slots.length,
      available,
      fullyBooked: bookable.length > 0 && available === 0 && bookable.every((s) => s.status !== 'UNAVAILABLE'),
    },
  };
}

/** Validate that a specific slot is bookable right now. Used on the server before reserving. */
export function assertSlotBookable(day: DayAvailability, start: string):
  | { ok: true; slot: SlotAvailability }
  | { ok: false; code: 'SLOT_NOT_FOUND' | 'SLOT_FULL' | 'SLOT_PAST' | 'SLOT_UNAVAILABLE' | 'DAY_CLOSED'; message: string } {
  if (!day.open) return { ok: false, code: 'DAY_CLOSED', message: day.message ?? 'No appointments on this date' };
  if (!isHHmm(start)) return { ok: false, code: 'SLOT_NOT_FOUND', message: 'Invalid time' };
  const slot = day.slots.find((s) => s.start === start);
  if (!slot) return { ok: false, code: 'SLOT_NOT_FOUND', message: 'That time is not an appointment slot' };
  if (slot.status === 'PAST') return { ok: false, code: 'SLOT_PAST', message: 'That time has already passed' };
  if (slot.status === 'FULLY_BOOKED') return { ok: false, code: 'SLOT_FULL', message: 'That slot was just booked. Please pick another time.' };
  if (slot.status === 'UNAVAILABLE') return { ok: false, code: 'SLOT_UNAVAILABLE', message: 'That slot is not available' };
  return { ok: true, slot };
}

/** Dates in the booking window with a quick open/closed flag (for date pickers, no occupancy needed). */
export function bookableDates(settings: ClinicSettings, type: AppointmentType, now = new Date()) {
  const pool = poolFor(type);
  const today = zonedParts(now, settings.clinic.timezone).date;
  const days = pool === 'EMERGENCY' ? 0 : settings.rules.bookingWindowDays;
  const out: { date: string; label: string; open: boolean; reason?: DayClosedReason; message?: string }[] = [];
  for (let i = 0; i <= days; i++) {
    const date = addDaysISO(today, i);
    const r = poolRangesFor(date, pool, settings);
    out.push({
      date,
      label: formatDateShort(date, settings.clinic.locale),
      open: !r.reason,
      reason: r.reason,
      message: r.message,
    });
  }
  return out;
}
