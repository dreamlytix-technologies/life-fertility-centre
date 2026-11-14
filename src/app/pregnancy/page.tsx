import { faqJsonLd } from '@/core/seo/jsonld';
import Link from 'next/link';
import { FAQ_GROUPS } from '@/content/faqs';
import { treatmentBySlug } from '@/content/treatments';
import { ClosingCta } from '@/components/sections/ClosingCta';
import { Icon } from '@/components/ui/Icon';
import { CheckList, FaqList, LegalNotice, PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Pregnancy, Antenatal & High-Risk Pregnancy Care in Malda',
  description:
    'Antenatal check-ups, high-risk pregnancy care and normal / assisted vaginal delivery with Dr. Debchandan Roy at Life Fertility Centre, Malda. Sex determination is not done (PCPNDT Act).',
  path: '/pregnancy',
});

const TRIMESTERS = [
  {
    label: 'First trimester',
    weeks: 'Weeks 1–13',
    items: ['Confirming and dating the pregnancy', 'First blood and urine tests', 'Early scan, and the first-trimester screening scan', 'Folic acid, diet and what to avoid'],
  },
  {
    label: 'Second trimester',
    weeks: 'Weeks 14–27',
    items: ['Monthly check-ups: blood pressure, weight, growth', 'Anomaly scan around 18–20 weeks', 'Screening for diabetes in pregnancy', 'Iron, calcium and vaccination advice'],
  },
  {
    label: 'Third trimester',
    weeks: 'Week 28 to birth',
    items: ['More frequent visits', 'Growth and wellbeing scans when needed', 'Counting baby movements', 'Planning the birth and signs of labour'],
  },
];

export default function PregnancyPage() {
  const faqs = FAQ_GROUPS.find((g) => g.id === 'pregnancy')!.items;
  const care = treatmentBySlug('pregnancy-care')!;
  const delivery = treatmentBySlug('delivery')!;
  return (
    <>
      <JsonLd data={crumbs([{ name: 'Pregnancy care', path: '/pregnancy' }])} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PageHero
        kicker="Maternity care"
        title={
          <>
            Through pregnancy, <span className="accent">one visit at a time</span>
          </>
        }
        intro="Regular check-ups follow the health of mother and baby from the first positive test to the birth, with closer care for pregnancies that need it."
        crumbs={[{ href: '/pregnancy', label: 'Pregnancy care' }]}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/appointment?reason=PREGNANCY" className="btn btn-plum">
            Book a pregnancy check-up <Icon name="arrow" size={18} />
          </Link>
          <Link href="/urgent" className="btn btn-line">
            Bleeding or pain? Urgent help
          </Link>
        </div>
        <LegalNotice kind="PCPNDT" className="mt-8 max-w-2xl" />
      </PageHero>

      <section aria-labelledby="tri-title" className="py-16 lg:py-20">
        <div className="shell">
          <p className="kicker">Antenatal care</p>
          <h2 id="tri-title" className="t-2 mt-3 max-w-2xl">
            What usually happens <span className="accent">each trimester</span>
          </h2>
          <ol className="mt-10 grid gap-4 lg:grid-cols-3">
            {TRIMESTERS.map((t, i) => (
              <li key={t.label} className={`rounded-[var(--radius-card)] p-6 sm:p-7 ${i === 1 ? 'on-dark bg-plum text-cream' : 'panel'}`}>
                <p className={`numeral text-[2.4rem] leading-none ${i === 1 ? 'text-gold-pale' : 'text-gold-ink'}`}>{['I', 'II', 'III'][i]}</p>
                <h3 className="t-3 mt-3">{t.label}</h3>
                <p className={`text-[0.85rem] font-semibold ${i === 1 ? 'text-cream/80' : 'text-muted'}`}>{t.weeks}</p>
                <ul className="mt-4 grid gap-2 text-[0.95rem]">
                  {t.items.map((x) => (
                    <li key={x} className="flex gap-2.5">
                      <span aria-hidden="true" className={`mt-2 size-1.5 flex-none rounded-full ${i === 1 ? 'bg-gold-pale' : 'bg-gold'}`} />
                      <span className={i === 1 ? 'text-cream/90' : 'text-ink-soft'}>{x}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="mt-6 max-w-3xl text-[0.9rem] text-muted">
            Your own schedule of visits and tests may differ; Dr. Roy will plan it with you.
          </p>
        </div>
      </section>

      <section aria-labelledby="hr-title" className="border-y border-line bg-paper py-16 lg:py-20">
        <div className="shell grid gap-12 lg:grid-cols-2">
          <div>
            <p className="kicker">High-risk pregnancy</p>
            <h2 id="hr-title" className="t-2 mt-3">
              When a pregnancy needs <span className="accent">closer care</span>
            </h2>
            <p className="intro mt-4">{care.overview[1]}</p>
            <CheckList className="mt-6" items={care.whoFor} />
            <Link href="/treatments/pregnancy-care" className="text-link mt-6 inline-block">
              Antenatal &amp; high-risk care in detail
            </Link>
          </div>
          <div>
            <p className="kicker">Birth</p>
            <h2 className="t-2 mt-3">
              Normal &amp; assisted <span className="accent">vaginal delivery</span>
            </h2>
            <p className="intro mt-4">{delivery.overview[1]}</p>
            <Link href="/treatments/delivery" className="text-link mt-6 inline-block">
              Delivery options in detail
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="warn-title" className="py-16 lg:py-20">
        <div className="shell">
          <div className="grid gap-8 rounded-[var(--radius-card)] border-2 border-danger/40 bg-blush-light p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="kicker !text-danger">Warning signs</p>
              <h2 id="warn-title" className="t-2 mt-3">
                Do not wait for your next appointment
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {['Bleeding from the vagina', 'Severe or constant abdominal pain', 'Fluid leaking', 'Baby moving less than usual', 'Severe headache, blurred vision or swelling of face and hands', 'Fever, or burning when passing urine'].map((x) => (
                  <li key={x} className="flex gap-2.5 text-ink">
                    <Icon name="alert" size={18} className="mt-0.5 flex-none text-danger" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid content-center gap-3">
              <p className="font-semibold">
                If it is heavy bleeding, severe pain or you feel faint, go to the nearest hospital emergency department now.
              </p>
              <Link href="/urgent" className="btn btn-plum">
                Urgent help &amp; contacts
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="pfaq-title" className="border-t border-line bg-paper py-20">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 id="pfaq-title" className="t-2">
            Pregnancy <span className="accent">questions</span>
          </h2>
          <FaqList items={[...faqs, ...care.faqs.slice(0, 1), ...delivery.faqs.slice(1, 3)]} />
        </div>
      </section>
      <div className="pt-20">
        <ClosingCta title="Expecting?" reason="PREGNANCY" />
      </div>
    </>
  );
}
