import type { ClinicSettings, ScheduleException, TimeRange, WeeklyHours } from '../domain';
import {
  addDaysISO,
  formatDateShort,
  formatTime12,
  toMinutes,
  weekdayOf,
  WEEKDAY_NAMES,
  zonedParts,
} from './time';

export interface DayHours {
  date: string;
  open: boolean;
  ranges: TimeRange[];
  /** Set when an exception changed the normal weekly hours. */
  exception?: ScheduleException;
}

/** Resolve opening hours for a date: weekly hours, then holiday / special-hours overrides. */
export function resolveDayHours(
  dateISO: string,
  weekly: WeeklyHours[],
  exceptions: ScheduleException[],
): DayHours {
  const dayExceptions = exceptions.filter((e) => e.date === dateISO);
  const holiday = dayExceptions.find((e) => e.type === 'HOLIDAY');
  if (holiday) return { date: dateISO, open: false, ranges: [], exception: holiday };

  const special = dayExceptions.filter((e) => e.type === 'SPECIAL_HOURS');
  if (special.length > 0) {
    const ranges = normalizeRanges(special.flatMap((e) => e.ranges ?? []));
    return { date: dateISO, open: ranges.length > 0, ranges, exception: special[0] };
  }

  const ranges = normalizeRanges(weekly.find((w) => w.dayOfWeek === weekdayOf(dateISO))?.ranges ?? []);
  return { date: dateISO, open: ranges.length > 0, ranges };
}

/** Sort, drop invalid, merge overlapping ranges. */
export function normalizeRanges(ranges: TimeRange[]): TimeRange[] {
  const valid = ranges
    .filter((r) => toMinutes(r.end) > toMinutes(r.start))
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const out: TimeRange[] = [];
  for (const r of valid) {
    const last = out[out.length - 1];
    if (last && toMinutes(r.start) <= toMinutes(last.end)) {
      if (toMinutes(r.end) > toMinutes(last.end)) last.end = r.end;
    } else out.push({ ...r });
  }
  return out;
}

export const formatRanges = (ranges: TimeRange[]) =>
  ranges.map((r) => `${formatTime12(r.start)} – ${formatTime12(r.end)}`).join(', ');

export interface OpenStatus {
  isOpenNow: boolean;
  today: DayHours;
  /** e.g. "Open until 5:00 PM", "Opens today at 10:00 AM", "Closed today · Opens Mon 10:00 AM" */
  label: string;
}

export function getOpenStatus(settings: ClinicSettings, now = new Date()): OpenStatus {
  const tz = settings.clinic.timezone;
  const local = zonedParts(now, tz);
  const today = resolveDayHours(local.date, settings.weekly, settings.exceptions);
  const current = today.ranges.find(
    (r) => local.minutes >= toMinutes(r.start) && local.minutes < toMinutes(r.end),
  );
  if (current) return { isOpenNow: true, today, label: `Open now · until ${formatTime12(current.end)}` };

  const laterToday = today.ranges.find((r) => toMinutes(r.start) > local.minutes);
  if (laterToday) return { isOpenNow: false, today, label: `Opens today at ${formatTime12(laterToday.start)}` };

  for (let i = 1; i <= 21; i++) {
    const date = addDaysISO(local.date, i);
    const day = resolveDayHours(date, settings.weekly, settings.exceptions);
    const first = day.ranges[0];
    if (day.open && first) {
      const when = i === 1 ? 'tomorrow' : formatDateShort(date, settings.clinic.locale);
      const prefix = today.exception?.type === 'HOLIDAY' ? `Closed today (${today.exception.label})` : 'Closed now';
      return { isOpenNow: false, today, label: `${prefix} · Opens ${when} at ${formatTime12(first.start)}` };
    }
  }
  return { isOpenNow: false, today, label: 'Closed' };
}

/** Weekly table for display (Monday first), with ranges as text. */
export function weeklyTable(weekly: WeeklyHours[]) {
  return [1, 2, 3, 4, 5, 6, 0].map((dow) => {
    const ranges = normalizeRanges(weekly.find((w) => w.dayOfWeek === dow)?.ranges ?? []);
    return {
      dayOfWeek: dow,
      day: WEEKDAY_NAMES[dow] as string,
      open: ranges.length > 0,
      ranges,
      text: ranges.length ? formatRanges(ranges) : 'Closed',
    };
  });
}

/** Exceptions in the next N days, for "Upcoming changes to our hours". */
export function upcomingExceptions(settings: ClinicSettings, now = new Date(), days = 30) {
  const today = zonedParts(now, settings.clinic.timezone).date;
  const until = addDaysISO(today, days);
  return settings.exceptions
    .filter((e) => e.date >= today && e.date <= until)
    .sort((a, b) => a.date.localeCompare(b.date));
}
