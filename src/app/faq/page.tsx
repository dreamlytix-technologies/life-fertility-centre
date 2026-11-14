import { faqJsonLd } from '@/core/seo/jsonld';
import { FAQ_GROUPS } from '@/content/faqs';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { FaqList, PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Frequently Asked Questions',
  description: 'Answers about booking, fees, fertility treatment, pregnancy care and privacy at Life Fertility Centre, Malda.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={crumbs([{ name: 'FAQ', path: '/faq' }])} />
      <JsonLd data={faqJsonLd(FAQ_GROUPS.flatMap((g) => g.items))} />
      <PageHero
        kicker="FAQ"
        title={
          <>
            Questions, <span className="accent">answered plainly</span>
          </>
        }
        crumbs={[{ href: '/faq', label: 'FAQ' }]}
      >
        <nav aria-label="FAQ topics" className="mt-8 flex flex-wrap gap-2">
          {FAQ_GROUPS.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="btn btn-quiet btn-sm">
              {g.title}
            </a>
          ))}
        </nav>
      </PageHero>
      <div className="shell grid gap-16 py-16 lg:py-20">
        {FAQ_GROUPS.map((g, i) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="grid gap-6 lg:grid-cols-[0.6fr_1.4fr] lg:gap-14">
            <div>
              <p className="numeral text-[2.6rem] leading-none text-gold-ink">{String(i + 1).padStart(2, '0')}</p>
              <h2 id={`${g.id}-title`} className="t-2 mt-2">
                {g.title}
              </h2>
            </div>
            <FaqList items={g.items} />
          </section>
        ))}
      </div>
      <ClosingCta title="Still have a question" />
    </>
  );
}
