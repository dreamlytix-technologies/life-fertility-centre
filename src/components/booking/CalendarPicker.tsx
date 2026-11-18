'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { BookableDate } from './client';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** "2026-11" for "2026-11-16". */
const monthOf = (iso: string) => iso.slice(0, 7);

function shiftMonth(month: string, by: number) {
  const [y, m] = month.split('-').map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function fullLabel(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

/** Every cell of a Sunday-first month grid, with nulls as leading blanks. */
function monthCells(month: string): (string | null)[] {
  const [y, m] = month.split('-').map(Number) as [number, number];
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from({ length: first }, () => null);
  for (let d = 1; d <= count; d++) cells.push(`${month}-${String(d).padStart(2, '0')}`);
  return cells;
}

export interface CalendarPickerProps {
  /** The bookable window from the server (today first). Dates outside it are shown but cannot be chosen. */
  dates: BookableDate[];
  value: string | null;
  onChange: (date: string) => void;
}

/**
 * Month calendar for choosing an appointment date. Only the dates the centre
 * offers online (today + the booking window) are selectable; closed days in
 * the window (Sundays) are marked, everything else is greyed out.
 */
export function CalendarPicker({ dates, value, onChange }: CalendarPickerProps) {
  const today = dates[0]?.date ?? null;
  const byDate = useMemo(() => new Map(dates.map((d) => [d.date, d])), [dates]);
  const firstMonth = today ? monthOf(today) : monthOf(new Date().toISOString());
  const lastMonth = dates.length ? monthOf(dates[dates.length - 1]!.date) : firstMonth;
  const [month, setMonth] = useState(() => (value ? monthOf(value) : firstMonth));

  const navBtn =
    'grid size-9 place-items-center rounded-full text-plum-deep ring-1 ring-line transition hover:bg-plum hover:text-cream hover:ring-plum disabled:pointer-events-none disabled:opacity-30';

  return (
    <div className="w-full max-w-[26rem] rounded-[var(--radius-card)] bg-paper p-4 shadow-[var(--shadow-card)] ring-1 ring-line sm:p-5 xl:max-w-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[1.05rem] font-bold tracking-[-0.01em] text-plum-deep" aria-live="polite">
          {monthLabel(month)}
        </p>
        <div className="flex gap-2">
          <button type="button" className={navBtn} onClick={() => setMonth((m) => shiftMonth(m, -1))} disabled={month <= firstMonth} aria-label="Previous month">
            <Icon name="arrowLeft" size={16} />
          </button>
          <button type="button" className={navBtn} onClick={() => setMonth((m) => shiftMonth(m, 1))} disabled={month >= lastMonth} aria-label="Next month">
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center" role="radiogroup" aria-label="Appointment date">
        {WEEKDAYS.map((w) => (
          <span key={w} aria-hidden="true" className={`pb-2 text-[0.68rem] font-bold tracking-[0.12em] uppercase ${w === 'Sun' ? 'text-gold-ink' : 'text-muted'}`}>
            {w}
          </span>
        ))}
        {monthCells(month).map((iso, i) => {
          if (!iso) return <span key={`blank-${i}`} aria-hidden="true" />;
          const info = byDate.get(iso);
          const bookable = !!info?.open;
          const closedInWindow = !!info && !info.open;
          const selected = value === iso;
          const isToday = iso === today;
          const day = Number(iso.slice(8));

          let tone = 'text-ink-soft/35';
          if (closedInWindow) tone = 'text-muted line-through decoration-muted/60';
          if (bookable) tone = 'font-bold text-plum-deep hover:bg-blush-light';
          if (selected) tone = 'bg-plum font-bold text-cream';

          return (
            <button
              key={iso}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={!bookable}
              onClick={() => onChange(iso)}
              aria-label={`${fullLabel(iso)}${isToday ? ', today' : ''}${closedInWindow ? ', closed' : bookable ? ', available' : ', not open for online booking'}`}
              title={closedInWindow ? info?.message : undefined}
              className={`relative mx-auto grid aspect-square w-full max-w-10 place-items-center rounded-full text-[0.92rem] tabular-nums transition disabled:cursor-default ${tone}`}
            >
              {day}
              {isToday && <span aria-hidden="true" className={`absolute bottom-1 size-1 rounded-full ${selected ? 'bg-cream' : 'bg-gold'}`} />}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-4 text-[0.78rem] text-muted">
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="font-bold text-plum-deep">16</span> Can book
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-3 rounded-full bg-plum" /> Selected
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" /> Today
        </li>
        {dates.some((d) => !d.open) && <li className="line-through">Closed</li>}
      </ul>
    </div>
  );
}
