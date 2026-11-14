import Link from 'next/link';
import { TREATMENTS, type TreatmentCategory } from '@/content/treatments';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { Icon } from '@/components/ui/Icon';
import { LegalNotice, PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Treatments — Fertility, Gynaecology & Pregnancy Care',
  description:
    'Treatments at Life Fertility Centre, Malda: infertility evaluation, IVF & ICSI, IUI, egg/sperm/embryo freezing, PGT, PCOS, fibroids, laparoscopic & hysteroscopic surgery, antenatal and high-risk pregnancy care, delivery.',
  path: '/treatments',
});

const GROUPS: { cat: TreatmentCategory; blurb: string }[] = [
  { cat: 'Fertility', blurb: 'Evaluation and assisted reproduction for couples trying to conceive.' },
  { cat: 'Gynaecology', blurb: 'Everyday and specialist women’s health, including keyhole surgery.' },
  { cat: 'Pregnancy', blurb: 'Antenatal check-ups, high-risk care and delivery.' },
];

export default function TreatmentsPage() {
  return (
    <>
      <JsonLd data={crumbs([{ name: 'Treatments', path: '/treatments' }])} />
      <PageHero
        kicker="Treatments"
        title={
          <>
            Thirteen treatments, <span className="accent">one specialist</span>
          </>
        }
        intro="Each page explains what the treatment is, who it is for and what to expect, in plain language. Your own plan is always made with you at a consultation."
        crumbs={[{ href: '/treatments', label: 'Treatments' }]}
      >
        <nav aria-label="Jump to a group" className="mt-8 flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <a key={g.cat} href={`#${g.cat.toLowerCase()}`} className="btn btn-quiet btn-sm">
              {g.cat}
            </a>
          ))}
        </nav>
      </PageHero>

      {GROUPS.map((g, gi) => {
        const items = TREATMENTS.filter((t) => t.category === g.cat);
        return (
          <section key={g.cat} id={g.cat.toLowerCase()} aria-labelledby={`${g.cat}-title`} className={`py-16 lg:py-20 ${gi % 2 ? 'bg-paper' : ''}`}>
            <div className="shell grid gap-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-14">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <p className="numeral text-[3.5rem] leading-none text-gold-ink">{String(gi + 1).padStart(2, '0')}</p>
                <h2 id={`${g.cat}-title`} className="t-2 mt-2">
                  {g.cat}
                </h2>
                <p className="mt-3 text-ink-soft">{g.blurb}</p>
                {g.cat === 'Fertility' && <LegalNotice kind="ART" className="mt-6" />}
                {g.cat === 'Pregnancy' && <LegalNotice kind="PCPNDT" className="mt-6" />}
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {items.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/treatments/${t.slug}`} className="panel group flex h-full flex-col p-6 transition-shadow hover:shadow-[var(--shadow-card)]">
                      <Icon name={t.icon} size={28} className="text-plum" />
                      <h3 className="t-3 mt-5">{t.title}</h3>
                      <p className="mt-2 flex-1 text-[0.95rem] text-ink-soft">{t.summary}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-plum">
                        Overview, what to expect &amp; FAQs <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
      <div className="pt-4">
        <ClosingCta title="Not sure which applies to you" />
      </div>
    </>
  );
}
