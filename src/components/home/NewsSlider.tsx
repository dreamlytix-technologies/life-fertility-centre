'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatPressDate, type PressItem } from '@/content/press';

const LANG_CODE: Record<PressItem['language'], string> = { Bengali: 'bn', English: 'en', Hindi: 'hi' };
import { Icon } from '@/components/ui/Icon';

function ReadLink({ item }: { item: PressItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-6 inline-flex items-center gap-1.5 text-[0.9rem] font-semibold text-plum underline decoration-gold underline-offset-4 hover:text-plum-deep"
    >
      Read in {item.outlet}
      {item.language !== 'English' && <span className="font-normal text-muted">({item.language})</span>}
      <Icon name="arrow" size={16} />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

function Slide({ item, index, total }: { item: PressItem; index: number; total: number }) {
  return (
    <article
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${total}`}
      className="grid w-full shrink-0 snap-start overflow-hidden rounded-[var(--radius-card)] bg-paper shadow-[var(--shadow-card)] ring-1 ring-line lg:grid-cols-[1.15fr_0.85fr]"
    >
      <div className="relative p-6 sm:p-10">
        <span aria-hidden="true" className="absolute top-0 left-0 h-1 w-24 bg-gold" />
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.78rem] font-semibold tracking-[0.12em] text-gold-ink uppercase">
          <span>{item.outlet}</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-gold" />
          <span>{formatPressDate(item.date)}</span>
        </p>
        <h3
          lang={item.originalHeadline ? LANG_CODE[item.language] : undefined}
          className={`mt-4 text-[1.45rem] font-bold text-plum-deep sm:text-[1.9rem] ${item.originalHeadline ? 'leading-[1.35]' : 'leading-[1.2] tracking-[-0.02em]'}`}
        >
          {item.originalHeadline ?? item.headline}
        </h3>
        <p className="mt-4 max-w-xl leading-relaxed text-ink-soft">{item.summary}</p>
        <ReadLink item={item} />
      </div>

      <div className="on-dark relative isolate overflow-hidden bg-plum-deep p-6 text-cream sm:p-10">
        {item.moments && item.moments.length > 0 ? (
          <>
            <p className="kicker">What happened</p>
            <ol className="mt-6 grid">
              {item.moments.map((m, i) => (
                <li key={m} className="relative grid grid-cols-[2.25rem_1fr] gap-3 pb-6 last:pb-0">
                  {i < item.moments!.length - 1 && (
                    <span aria-hidden="true" className="absolute top-9 bottom-1 left-[1.05rem] w-px bg-gold/35" />
                  )}
                  <span className="grid size-9 place-items-center rounded-full text-sm font-bold text-gold-pale ring-1 ring-gold/50">
                    {i + 1}
                  </span>
                  <span className="pt-1.5 text-[0.95rem] leading-snug text-cream/90">{m}</span>
                </li>
              ))}
            </ol>
          </>
        ) : (
          <div className="flex h-full flex-col justify-between gap-8">
            <svg aria-hidden="true" className="absolute -right-20 -bottom-20 -z-10 size-72 text-gold" viewBox="0 0 200 200" fill="none">
              {[40, 60, 80, 98].map((r, i) => (
                <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeOpacity={0.4 - i * 0.08} />
              ))}
            </svg>
            <p className="kicker">Reported by</p>
            <p className="text-[1.8rem] leading-tight font-bold tracking-[-0.02em] text-gold-pale">{item.outlet}</p>
            <p className="text-[0.9rem] text-cream/70">
              {formatPressDate(item.date)} · {item.language}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

/** Horizontal, swipeable slider of press stories (scroll-snap + arrow buttons + dots). */
export function NewsSlider({ items }: { items: PressItem[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const total = items.length;

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, el.children.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const arrow =
    'grid size-11 place-items-center rounded-full bg-paper text-plum-deep ring-1 ring-line transition hover:bg-plum hover:text-cream hover:ring-plum disabled:pointer-events-none disabled:opacity-35';

  return (
    <div role="region" aria-roledescription="carousel" aria-label="News stories" className="mt-10">
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') goTo(index + 1);
          if (e.key === 'ArrowLeft') goTo(index - 1);
        }}
      >
        {items.map((item, i) => (
          <Slide key={item.id} item={item} index={i} total={total} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2" aria-hidden={total < 2}>
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show story ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-plum' : 'w-2 bg-plum/25 hover:bg-plum/50'}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[0.85rem] font-semibold text-muted tabular-nums" aria-live="polite">
            {String(index + 1).padStart(2, '0')} <span className="text-line">/</span> {String(total).padStart(2, '0')}
          </p>
          <button type="button" className={arrow} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous story">
            <Icon name="arrowLeft" size={18} />
          </button>
          <button type="button" className={arrow} onClick={() => goTo(index + 1)} disabled={index >= total - 1} aria-label="Next story">
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
