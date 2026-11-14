import Link from 'next/link';
import type { ReactNode } from 'react';
import { PageHero } from '@/components/ui/bits';

const POLICIES = [
  { href: '/privacy-policy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of use' },
  { href: '/cancellation-refund', label: 'Cancellation & refunds' },
];

export function PolicyLayout({ title, path, updated, intro, children }: { title: string; path: string; updated: string; intro: string; children: ReactNode }) {
  return (
    <>
      <PageHero kicker={`Last updated ${updated}`} title={title} intro={intro} crumbs={[{ href: path, label: title }]} />
      <div className="shell grid gap-12 py-14 lg:grid-cols-[14rem_1fr] lg:py-20">
        <nav aria-label="Policies" className="lg:sticky lg:top-32 lg:self-start">
          <ul className="flex flex-wrap gap-2 lg:grid">
            {POLICIES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={p.href === path ? 'page' : undefined}
                  className="block rounded-lg border border-line bg-paper px-4 py-2.5 text-[0.92rem] font-semibold text-ink-soft aria-[current=page]:border-plum aria-[current=page]:text-plum"
                >
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="prose-lfc max-w-3xl">
          {children}
          <p className="mt-10 rounded-lg border border-gold/60 bg-gold-soft p-4 text-[0.9rem]">
            Draft prepared for the centre’s review. Please have it checked before launch.
          </p>
        </article>
      </div>
    </>
  );
}
