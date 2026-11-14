import { addDaysISO, formatDateShort, formatTime12, zonedParts } from '@/core/booking/time';
import type { ClinicSettings } from '@/core/domain';
import { notices, type NoticeTone } from '@/content/notices';

export interface Notice {
  id: string;
  message: string;
  href?: string;
  linkLabel?: string;
  tone: NoticeTone;
}

/** How far ahead schedule exceptions (holidays / short days) are announced. */
const EXCEPTION_LOOKAHEAD_DAYS = 21;

function todayISO(tz: string, now: Date): string {
  const p = zonedParts(now, tz);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Active notices for today: upcoming closures from the schedule first, then CMS notices. */
export function activeNotices(settings: ClinicSettings, now = new Date()): Notice[] {
  const today = todayISO(settings.clinic.timezone, now);
  const horizon = addDaysISO(today, EXCEPTION_LOOKAHEAD_DAYS);

  const fromSchedule: Notice[] = settings.exceptions
    .filter((e) => e.date >= today && e.date <= horizon)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => {
      const day = e.date === today ? 'today' : `on ${formatDateShort(e.date)}`;
      const hours = (e.ranges ?? []).map((r) => `${formatTime12(r.start)}–${formatTime12(r.end)}`).join(', ');
      return e.type === 'HOLIDAY'
        ? { id: `closed-${e.date}`, tone: 'alert' as const, message: `Clinic closed ${day} (${e.label}).` }
        : {
            id: `hours-${e.date}`,
            tone: 'alert' as const,
            message: `${e.label}: open ${hours || 'shorter hours'} ${day}.`,
          };
    });

  const fromCms: Notice[] = notices
    .filter((n) => n.isActive && (!n.startsOn || n.startsOn <= today) && (!n.endsOn || n.endsOn >= today))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(({ id, message, href, linkLabel, tone }) => ({ id, message, href, linkLabel, tone: tone ?? 'info' }));

  return [...fromSchedule, ...fromCms];
}
