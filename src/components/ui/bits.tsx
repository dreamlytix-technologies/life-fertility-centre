import Link from 'next/link';
import type { ReactNode } from 'react';
import { LEGAL, LINKS, REPUTATION } from '@/content/facts';
import { Icon } from './Icon';

/** Section heading: kicker, serif title, optional intro. Left-aligned by default. */
export function SectionHead({
  kicker,
  title,
  intro,
  center = false,
  id,
  as: H = 'h2',
}: {
  kicker?: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
  id?: string;
  as?: 'h1' | 'h2';
}) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {kicker && <p className="kicker">{kicker}</p>}
      <H id={id} className={`${H === 'h1' ? 't-1' : 't-2'} mt-3`}>
        {title}
      </H>
      {intro && <p className="intro mt-4">{intro}</p>}
    </div>
  );
}

/** Page header band used by inner pages: breadcrumb trail + title on blush-light. */
export function PageHero({
  kicker,
  title,
  intro,
  crumbs,
  children,
}: {
  kicker: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs: { href: string; label: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-blush-light">
      <span aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full border border-gold/50" />
      <span aria-hidden="true" className="absolute -top-10 -right-40 size-80 rounded-full border border-plum/10" />
      <div className="shell relative py-12 lg:py-16">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-[0.82rem] text-muted">
            <li>
              <Link href="/" className="hover:text-plum">
                Home
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className="text-ink-soft">
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-plum">
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="kicker mt-8">{kicker}</p>
        <h1 className="t-1 mt-3 max-w-3xl">{title}</h1>
        {intro && <p className="intro mt-5 max-w-2xl">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-gold" role="img" aria-label={`${value} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Icon key={i} name="star" size={size} />
      ))}
    </span>
  );
}

/** The aggregate Google rating, always with a link to the real reviews. Never individual quotes. */
export function RatingCard({ className = '' }: { className?: string }) {
  return (
    <div className={`panel flex items-center gap-4 p-4 shadow-[var(--shadow-float)] ${className}`}>
      <p className="numeral text-[2.6rem] leading-none text-plum-deep">{REPUTATION.googleRating}</p>
      <div className="min-w-0">
        <Stars value={REPUTATION.googleRating} />
        <p className="mt-1 text-[0.82rem] leading-snug text-ink-soft">
          {REPUTATION.googleReviewCountLabel} Google reviews
          <br />
          <a href={LINKS.googleReviews} target="_blank" rel="noopener noreferrer" className="text-link text-[0.82rem]">
            Read reviews on Google
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </div>
  );
}

/** Statutory notices: PCPNDT (pregnancy/ultrasound) and ART Act registration (fertility). */
export function LegalNotice({ kind, className = '' }: { kind: 'PCPNDT' | 'ART'; className?: string }) {
  return (
    <p className={`flex items-start gap-3 rounded-lg border border-gold/60 bg-gold-soft px-4 py-3 text-[0.9rem] text-ink ${className}`}>
      <Icon name={kind === 'PCPNDT' ? 'shield' : 'info'} size={19} className="mt-0.5 flex-none text-gold-ink" />
      <span>
        <strong className="font-semibold">{kind === 'PCPNDT' ? 'PCPNDT Act notice. ' : 'ART (Regulation) Act, 2021. '}</strong>
        {kind === 'PCPNDT' ? LEGAL.pcpndt : LEGAL.artRegistration}
      </span>
    </p>
  );
}

export function CheckList({ items, className = '' }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={`grid gap-3 ${className}`}>
      {items.map((it) => (
        <li key={it} className="flex gap-3">
          <span className="mt-1 inline-flex size-5 flex-none items-center justify-center rounded-full border border-gold text-plum">
            <Icon name="check" size={12} strokeWidth={2} />
          </span>
          <span className="text-ink-soft">{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function FaqList({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="faq">
          <summary>
            <span>{f.q}</span>
            <span aria-hidden="true" className="faq-icon" />
          </summary>
          <div>
            <p>{f.a}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
