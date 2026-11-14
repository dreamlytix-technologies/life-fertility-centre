import type { ClinicSettings } from '../domain';
import { computeDayAvailability, poolRangesFor, type OccupancyMap } from './slots';
import { addDaysISO, formatDateShort, formatTime12, toMinutes, zonedParts, zonedToUtc } from './time';

export type EmergencyState = 'OPEN' | 'CLOSED' | 'COMING_SOON' | 'FULLY_BOOKED' | 'DISABLED';

export interface EmergencyStatus {
  state: EmergencyState;
  /** Today's window, when emergency booking runs today. */
  window?: { start: string; end: string; label: string };
  /** Next time it opens (ISO) when not currently open. */
  nextOpenAt?: string;
  nextOpenLabel?: string; // "Tomorrow at 8:00 AM"
  remaining: number;
  capacity: number;
  headline: string; // short status line for badges
  message: string; // honest explanation for parents
  phone?: { tel: string; display: string };
  notice?: string;
  generatedAt: string;
}

/**
 * Emergency booking status. Never shows an "always available" emergency
 * button: the state is derived from config + live occupancy + the clock.
 */
export function getEmergencyStatus(settings: ClinicSettings, occupancyToday: OccupancyMap, now = new Date()): EmergencyStatus {
  const e = settings.emergency;
  const tz = settings.clinic.timezone;
  const local = zonedParts(now, tz);
  const phone = settings.clinic.emergencyPhone
    ? { tel: settings.clinic.emergencyPhone, display: settings.clinic.emergencyPhoneDisplay ?? settings.clinic.emergencyPhone }
    : { tel: settings.clinic.phone, display: settings.clinic.phoneDisplay };
  const base = { phone, notice: e.notice, generatedAt: now.toISOString() };
  const urgentAdvice =
    'If your child has trouble breathing, a seizure, is unresponsive or seriously injured, go to the nearest hospital emergency department immediately.';

  if (!e.enabled) {
    return {
      ...base,
      state: 'DISABLED',
      remaining: 0,
      capacity: 0,
      headline: 'Not available online',
      message: `Online emergency booking is currently switched off. Please call the clinic. ${urgentAdvice}`,
    };
  }

  const windowLabel = `${formatTime12(e.window.start)} – ${formatTime12(e.window.end)}`;
  const todayRanges = poolRangesFor(local.date, 'EMERGENCY', settings);
  const runsToday = !todayRanges.reason;
  const next = findNextOpening(settings, now);

  if (runsToday) {
    const start = toMinutes(e.window.start);
    const end = toMinutes(e.window.end);
    const window = { start: e.window.start, end: e.window.end, label: windowLabel };

    if (local.minutes < start) {
      return {
        ...base,
        state: 'COMING_SOON',
        window,
        nextOpenAt: zonedToUtc(local.date, e.window.start, tz).toISOString(),
        nextOpenLabel: `Today at ${formatTime12(e.window.start)}`,
        remaining: 0,
        capacity: 0,
        headline: `Opens at ${formatTime12(e.window.start)}`,
        message: `Emergency booking opens today at ${formatTime12(e.window.start)} and closes at ${formatTime12(e.window.end)}. ${urgentAdvice}`,
      };
    }

    if (local.minutes < end) {
      const day = computeDayAvailability({ date: local.date, type: 'EMERGENCY', settings, occupancy: occupancyToday, now });
      const live = day.slots.filter((s) => s.status !== 'PAST');
      const remaining = live.reduce((n, s) => n + s.remaining, 0);
      const capacity = live.reduce((n, s) => n + s.capacity, 0);
      if (remaining > 0) {
        return {
          ...base,
          state: 'OPEN',
          window,
          remaining,
          capacity,
          headline: `Open · ${remaining} ${remaining === 1 ? 'slot' : 'slots'} left`,
          message: `Emergency booking is open until ${formatTime12(e.window.end)} today. ${urgentAdvice}`,
        };
      }
      return {
        ...base,
        state: 'FULLY_BOOKED',
        window,
        nextOpenAt: next?.at,
        nextOpenLabel: next?.label,
        remaining: 0,
        capacity,
        headline: 'Fully booked',
        message: `All emergency slots for today are taken.${next ? ` Next window: ${next.label}.` : ''} Please call the clinic — ${urgentAdvice}`,
      };
    }
  }

  return {
    ...base,
    state: 'CLOSED',
    window: runsToday ? { start: e.window.start, end: e.window.end, label: windowLabel } : undefined,
    nextOpenAt: next?.at,
    nextOpenLabel: next?.label,
    remaining: 0,
    capacity: 0,
    headline: next ? `Closed · Opens ${next.label.replace(/^Tomorrow/, 'tomorrow')}` : 'Closed',
    message: `Emergency booking is closed right now.${next ? ` It next opens ${next.label} (${windowLabel}).` : ''} ${urgentAdvice}`,
  };
}

function findNextOpening(settings: ClinicSettings, now: Date): { at: string; label: string } | undefined {
  const tz = settings.clinic.timezone;
  const today = zonedParts(now, tz).date;
  for (let i = 1; i <= 14; i++) {
    const date = addDaysISO(today, i);
    if (!poolRangesFor(date, 'EMERGENCY', settings).reason) {
      const when = i === 1 ? 'Tomorrow' : formatDateShort(date, settings.clinic.locale);
      return {
        at: zonedToUtc(date, settings.emergency.window.start, tz).toISOString(),
        label: `${when} at ${formatTime12(settings.emergency.window.start)}`,
      };
    }
  }
  return undefined;
}
