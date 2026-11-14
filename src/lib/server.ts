/** Server-only helpers built on the core store (never import from client files). */
import { bookableDates, computeDayAvailability } from '@/core/booking/slots';
import { zonedParts } from '@/core/booking/time';
import { isDemoMode } from '@/core/store/index';
import { api } from './api';

export async function isDemo() {
  const store = await api.server.store();
  return store.kind === 'memory' || isDemoMode();
}

export interface NextSlot {
  date: string;
  label: string;
  isToday: boolean;
  dayLabel: string;
  remainingToday: number;
}

/** First bookable consultation slot (server truth), scanning the booking window. */
export async function nextAvailableSlot(): Promise<NextSlot | null> {
  const store = await api.server.store();
  const settings = await store.getSettings();
  const now = new Date();
  const today = zonedParts(now, settings.clinic.timezone).date;
  const dates = bookableDates(settings, 'CONSULTATION', now).filter((d) => d.open);
  for (const d of dates.slice(0, 8)) {
    const occupancy = await store.getOccupancy(d.date, 'STANDARD', now);
    const day = computeDayAvailability({ date: d.date, type: 'CONSULTATION', settings, occupancy, now });
    const open = day.slots.filter((s) => s.status === 'AVAILABLE' || s.status === 'LIMITED');
    const first = open[0];
    if (first) {
      const isToday = d.date === today;
      return {
        date: d.date,
        label: first.label,
        isToday,
        dayLabel: isToday ? 'Today' : d.label,
        remainingToday: isToday ? open.length : 0,
      };
    }
  }
  return null;
}
