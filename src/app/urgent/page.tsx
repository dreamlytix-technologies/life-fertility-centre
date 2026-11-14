import Link from 'next/link';
import { CLINIC, whatsappLink } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Urgent Help — Bleeding or Pain in Pregnancy',
  description:
    'What to do with heavy bleeding, severe pain or other warning signs in pregnancy or after a procedure: go to the nearest hospital, and contact Life Fertility Centre, Malda.',
  path: '/urgent',
});

const NOW = [
  'Heavy vaginal bleeding (soaking a pad in an hour), or passing large clots',
  'Severe abdominal or shoulder-tip pain, especially in early pregnancy',
  'Fainting, dizziness, a racing heart or breathlessness',
  'A fit, or a severe headache with blurred vision in pregnancy',
  'Fluid gushing from the vagina, or the baby not moving',
  'Severe pain, swelling or breathlessness after egg collection or surgery',
];

const SOON = [
  'Light spotting in pregnancy',
  'Fever or burning when passing urine',
  'Vomiting that stops you keeping fluids down',
  'Mild abdominal bloating after fertility medicines',
];

export default function UrgentPage() {
  return (
    <>
      <JsonLd data={crumbs([{ name: 'Urgent help', path: '/urgent' }])} />
      <PageHero
        kicker="Urgent help"
        title={
          <>
            In an emergency, <span className="accent">go to the nearest hospital</span>
          </>
        }
        intro="Life Fertility Centre does not offer emergency appointments online. If you have any of the warning signs below, do not wait for a booking."
        crumbs={[{ href: '/urgent', label: 'Urgent help' }]}
      />

      <section className="py-14 lg:py-20">
        <div className="shell grid gap-6 lg:grid-cols-2">
          <div className="rounded-[var(--radius-card)] border-2 border-danger/50 bg-paper p-6 sm:p-8">
            <p className="flex items-center gap-2 text-[0.78rem] font-bold tracking-[0.18em] text-danger uppercase">
              <Icon name="alert" size={18} /> Go to hospital now
            </p>
            <h2 className="t-2 mt-3">Emergency warning signs</h2>
            <ul className="mt-6 grid gap-3">
              {NOW.map((x) => (
                <li key={x} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2 size-2 flex-none rounded-full bg-danger" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3 rounded-lg bg-blush-light p-5">
              <p className="font-semibold">
                Go to the nearest hospital emergency department, or call the national emergency number <a href="tel:112" className="text-link">112</a> (ambulance{' '}
                <a href="tel:108" className="text-link">108</a>).
              </p>
              <p className="text-[0.95rem] text-ink-soft">Take any reports and prescriptions with you, and let the centre know when you can.</p>
            </div>
          </div>

          <div className="grid content-start gap-6">
            <div className="on-dark rounded-[var(--radius-card)] bg-plum-deep p-6 text-cream sm:p-8">
              <p className="kicker">Contact the centre</p>
              <h2 className="t-2 mt-3">During clinic hours</h2>
              <p className="mt-2 text-cream/80">{CLINIC.hoursLabel}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href={`tel:${CLINIC.phone}`} className="btn btn-cream">
                  <Icon name="phone" size={18} /> Call {CLINIC.phoneDisplay}
                </a>
                <a href={whatsappLink('Urgent: I need advice from Life Fertility Centre.')} target="_blank" rel="noopener noreferrer" className="btn btn-outline-cream">
                  <Icon name="whatsapp" size={18} /> WhatsApp
                  <span className="sr-only">(opens WhatsApp)</span>
                </a>
              </div>
              <p className="mt-5 text-[0.9rem] text-cream/80">
                WhatsApp messages may not be read straight away. For anything in the red list, go to hospital first.
              </p>
            </div>

            <div className="panel p-6 sm:p-8">
              <p className="kicker">Call the same day</p>
              <h2 className="t-3 mt-3">Contact the centre today if you have</h2>
              <ul className="mt-5 grid gap-2.5">
                {SOON.map((x) => (
                  <li key={x} className="flex gap-3 text-ink-soft">
                    <span aria-hidden="true" className="mt-2 size-1.5 flex-none rounded-full bg-gold" />
                    {x}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[0.92rem] text-muted">
                For routine questions, <Link href="/appointment" className="text-link">book a consultation</Link>.
              </p>
            </div>
          </div>
        </div>
        <p className="shell mt-10 text-[0.88rem] text-muted">
          This page is general guidance and does not replace medical assessment. If in doubt, seek care at a hospital.
        </p>
      </section>
    </>
  );
}
