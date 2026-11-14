import { faqJsonLd } from '@/core/seo/jsonld';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TREATMENTS, treatmentBySlug } from '@/content/treatments';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { Icon } from '@/components/ui/Icon';
import { CheckList, FaqList, LegalNotice, PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata, SITE_URL } from '@/lib/site';

export const dynamicParams = false;

export function generateStaticParams() {
  return TREATMENTS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = treatmentBySlug(slug);
  if (!t) return { title: 'Treatment not found', robots: { index: false } };
  return pageMetadata({ title: `${t.title} in Malda`, description: t.summary, path: `/treatments/${t.slug}` });
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = treatmentBySlug(slug);
  if (!t) notFound();
  const related = TREATMENTS.filter((x) => x.category === t.category && x.slug !== t.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MedicalWebPage',
          name: t.title,
          url: `${SITE_URL}/treatments/${t.slug}`,
          about: { '@type': 'MedicalTherapy', name: t.title, description: t.summary },
          lastReviewed: '2026-11-14',
          reviewedBy: { '@id': `${SITE_URL}/#doctor` },
        }}
      />
      <JsonLd data={crumbs([{ name: 'Treatments', path: '/treatments' }, { name: t.title, path: `/treatments/${t.slug}` }])} />
      <JsonLd data={faqJsonLd(t.faqs)} />

      <PageHero
        kicker={`${t.category} · Treatment`}
        title={t.title}
        intro={t.summary}
        crumbs={[
          { href: '/treatments', label: 'Treatments' },
          { href: `/treatments/${t.slug}`, label: t.short },
        ]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/appointment?reason=${t.visitReason}&service=${t.slug}`} className="btn btn-plum">
            Book a consultation <Icon name="arrow" size={18} />
          </Link>
          <a href="#what-to-expect" className="btn btn-line">
            What to expect
          </a>
        </div>
      </PageHero>

      <div className="shell grid gap-14 py-16 lg:grid-cols-[1.35fr_0.65fr] lg:py-20">
        <article className="min-w-0">
          <section aria-labelledby="overview-title">
            <p className="kicker">Overview</p>
            <h2 id="overview-title" className="t-2 mt-3">
              What it <span className="accent">involves</span>
            </h2>
            <div className="prose-lfc mt-5 max-w-2xl">
              {t.overview.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {t.notices?.map((n) => <LegalNotice key={n} kind={n} className="mt-4 max-w-2xl" />)}
          </section>

          <section aria-labelledby="who-title" className="mt-14">
            <p className="kicker">Who it is for</p>
            <h2 id="who-title" className="t-2 mt-3">
              It may help if you have
            </h2>
            <CheckList items={t.whoFor} className="mt-6 max-w-2xl" />
          </section>

          <section id="what-to-expect" aria-labelledby="expect-title" className="mt-14">
            <p className="kicker">What to expect</p>
            <h2 id="expect-title" className="t-2 mt-3">
              Step by <span className="accent">step</span>
            </h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2">
              {t.expect.map((s, i) => (
                <li key={s.title} className="panel p-5">
                  <span className="numeral text-[2rem] leading-none text-gold-ink">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="t-3 mt-3">{s.title}</h3>
                  <p className="mt-2 text-[0.95rem] text-ink-soft">{s.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-title" className="mt-14">
            <p className="kicker">Questions</p>
            <h2 id="faq-title" className="t-2 mt-3 mb-6">
              Frequently asked
            </h2>
            <FaqList items={t.faqs} />
          </section>

          <p className="mt-10 max-w-2xl text-[0.88rem] text-muted">
            This page is general information, not medical advice for your situation. Results of any treatment vary from person to person;
            please discuss your own circumstances with Dr. Roy.
          </p>
        </article>

        <aside className="grid content-start gap-4 lg:sticky lg:top-32 lg:self-start">
          <div className="on-dark rounded-[var(--radius-card)] bg-plum-deep p-6 text-cream">
            <p className="kicker">Book</p>
            <p className="mt-3 font-display text-[1.35rem] leading-tight font-semibold">Talk it through with Dr. Roy</p>
            <p className="mt-2 text-[0.92rem] text-cream/80">Mon–Sat, 10:00 AM – 2:00 PM. ₹200 advance online.</p>
            <Link href={`/appointment?reason=${t.visitReason}&service=${t.slug}`} className="btn btn-cream mt-5 w-full">
              Choose a time
            </Link>
          </div>
          {related.length > 0 && (
            <nav aria-label="Related treatments" className="panel p-6">
              <p className="kicker">Related</p>
              <ul className="mt-3 grid">
                {related.map((r) => (
                  <li key={r.slug} className="border-b border-line last:border-0">
                    <Link href={`/treatments/${r.slug}`} className="group flex items-center justify-between gap-3 py-3 font-semibold text-ink-soft hover:text-plum">
                      {r.title}
                      <Icon name="arrow" size={16} className="flex-none opacity-50 group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>
      </div>
      <ClosingCta reason={t.visitReason} />
    </>
  );
}
