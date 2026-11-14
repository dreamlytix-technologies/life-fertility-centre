import { faqJsonLd } from '@/core/seo/jsonld';
import Link from 'next/link';
import { FAQ_GROUPS } from '@/content/faqs';
import { treatmentsIn } from '@/content/treatments';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { Journey } from '@/components/sections/Journey';
import { Icon } from '@/components/ui/Icon';
import { CheckList, FaqList, LegalNotice, PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Fertility & IVF Journey in Malda',
  description:
    'How fertility care works at Life Fertility Centre, Malda: consultation, tests for both partners, a treatment plan (ovulation support, IUI, IVF/ICSI), procedure and follow-up with Dr. Debchandan Roy.',
  path: '/fertility',
});

export default function FertilityPage() {
  const faqs = FAQ_GROUPS.find((g) => g.id === 'fertility')!.items;
  const fertility = treatmentsIn('Fertility');
  return (
    <>
      <JsonLd data={crumbs([{ name: 'Fertility', path: '/fertility' }])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHero
        kicker="Fertility & IVF"
        title={
          <>
            Trying for a baby, <span className="accent">with a clear plan</span>
          </>
        }
        intro="If pregnancy has not happened yet, you are far from alone. The first step is understanding why. From there, treatment ranges from simple measures to IVF, and you decide each step together with Dr. Roy."
        crumbs={[{ href: '/fertility', label: 'Fertility' }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/appointment?reason=FERTILITY" className="btn btn-plum">
            Book a fertility consultation <Icon name="arrow" size={18} />
          </Link>
          <a href="#journey-title" className="btn btn-line">
            See the five steps
          </a>
        </div>
        <LegalNotice kind="ART" className="mt-8 max-w-2xl" />
      </PageHero>

      <section className="py-16 lg:py-20">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <div>
            <p className="kicker">When to seek help</p>
            <h2 className="t-2 mt-3">
              It may be time to <span className="accent">see a specialist</span> if
            </h2>
            <CheckList
              className="mt-6"
              items={[
                'You have been trying for 12 months (6 months if you are 35 or older)',
                'Your periods are very irregular or absent',
                'You have had two or more miscarriages',
                'There is a known condition such as PCOS, endometriosis or a low sperm count',
              ]}
            />
          </div>
          <div className="panel p-6 sm:p-8">
            <p className="kicker">For the first visit</p>
            <h2 className="t-3 mt-3">What to bring</h2>
            <CheckList
              className="mt-5"
              items={[
                'Both partners, if possible',
                'Previous test reports, scans and semen analysis',
                'Prescriptions and details of any earlier treatment',
                'The dates of your last few periods',
              ]}
            />
          </div>
        </div>
      </section>

      <Journey />

      <section aria-labelledby="options-title" className="py-20 lg:py-24">
        <div className="shell">
          <p className="kicker">Treatment options</p>
          <h2 id="options-title" className="t-2 mt-3 max-w-2xl">
            What a plan <span className="accent">may include</span>
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fertility.map((t) => (
              <li key={t.slug}>
                <Link href={`/treatments/${t.slug}`} className="panel group flex h-full flex-col p-6 hover:shadow-[var(--shadow-card)]">
                  <Icon name={t.icon} size={26} className="text-plum" />
                  <h3 className="t-3 mt-4">{t.title}</h3>
                  <p className="mt-2 flex-1 text-[0.95rem] text-ink-soft">{t.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold text-plum">
                    Read more <Icon name="arrow" size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-[0.9rem] text-muted">
            The chance of pregnancy with any treatment depends on factors such as age and the cause of infertility. Dr. Roy will discuss
            what is realistic for you; no treatment can be guaranteed to work.
          </p>
        </div>
      </section>

      <section aria-labelledby="ffaq-title" className="border-t border-line bg-paper py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="kicker">Questions</p>
            <h2 id="ffaq-title" className="t-2 mt-3">
              About fertility treatment
            </h2>
          </div>
          <FaqList items={faqs} />
        </div>
      </section>
      <div className="pt-20">
        <ClosingCta title="Take the first step" reason="FERTILITY" />
      </div>
    </>
  );
}
