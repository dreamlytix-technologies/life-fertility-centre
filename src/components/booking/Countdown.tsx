'use client';
import { useEffect, useRef, useState } from 'react';

export function useCountdown(until?: string, onExpire?: () => void) {
  const [left, setLeft] = useState<number | null>(null);
  const cb = useRef(onExpire);
  useEffect(() => {
    cb.current = onExpire;
  });
  useEffect(() => {
    if (!until) {
      setLeft(null);
      return;
    }
    const end = new Date(until).getTime();
    let fired = false;
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      setLeft(ms);
      if (ms === 0 && !fired) {
        fired = true;
        cb.current?.();
      }
    };
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [until]);
  return left;
}

export const mmss = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Live hold timer. Announces only at minute boundaries to avoid screen-reader chatter. */
export function HoldCountdown({ until, onExpire, tone = 'light' }: { until?: string; onExpire?: () => void; tone?: 'light' | 'dark' }) {
  const left = useCountdown(until, onExpire);
  if (left === null) return null;
  const urgent = left < 120_000;
  const minutes = Math.ceil(left / 60_000);
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${
        tone === 'dark' ? 'bg-cream/10 text-cream' : urgent ? 'bg-blush text-gold-ink' : 'bg-blush-light text-plum'
      }`}
    >
      <svg width="28" height="28" viewBox="0 0 36 36" aria-hidden="true" className="-rotate-90">
        <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(1, left / 600_000) * 94.2} 94.2`}
          style={{ transition: 'stroke-dasharray 1s linear' }}
        />
      </svg>
      <p>
        <span className="font-semibold">Your time is held for </span>
        <span className="font-semibold tabular-nums" aria-hidden="true">
          {mmss(left)}
        </span>
        <span className="sr-only" aria-live="polite">
          {minutes} {minutes === 1 ? 'minute' : 'minutes'}
        </span>
      </p>
    </div>
  );
}
