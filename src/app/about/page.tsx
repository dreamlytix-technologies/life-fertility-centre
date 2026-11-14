import Link from 'next/link';
import { CLINIC, DOCTOR, LEGAL } from '@/content/facts';
import { treatmentsIn } from '@/content/treatments';
import { StatsBand } from '@/components/sections/StatsBand';
import { VideoFacade } from '@/components/sections/VideoFacade';
import { DoctorPortrait } from '@/components/ui/Art';
import { Icon } from '@/components/ui/Icon';
import { RatingCard } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { api } from '@/lib/api';
import { crumbs, practiceJsonLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Dr. Debchandan Roy — Gynaecologist & Fertility Specialist in Malda',
  description:
    'Dr. Debchandan Roy, MBBS (Calcutta), MD (Obstetrics & Gynaecology), Diploma in Gynaecological Endoscopy (Germany): fertility, gynaecology, laparoscopic surgery and pregnancy care at Life Fertility Centre, Malda.',
  path: '/about',
});

export default async function AboutPage() {
  const site = await api.server.site();
  const areas = [
    { title: 'Fertility', items: treatmentsIn('Fertility') },
    { title: 'Gynaecology', items: treatmentsIn('Gynaecology') },
    { title: 'Pregnancy', items: treatmentsIn('Pregnancy') },
  ];
  return (
    <>
      <JsonLd data={practiceJsonLd(site.settings, site.doctor, site.services, { rating: true })} />
      <JsonLd data={crumbs([{ name: 'Dr. Debchandan Roy', path: '/about' }])} />

      <section className="relative overflow-hidden bg-blush-light">
        <div className="shell grid items-center gap-14 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <nav aria-label="Breadcrumb" className="text-[0.82rem] text-muted">
              <Link href="/" className="hover:text-plum">
                Home
              </Link>{' '}
              / <span aria-current="page">Dr. Debchandan Roy</span>
            </nav>
            <p className="kicker mt-8">About the doctor</p>
            <h1 className="t-hero mt-4">
              {DOCTOR.honorific} {DOCTOR.name}
            </h1>
            <p className="mt-4 text-[1.05rem] font-semibold text-plum">{DOCTOR.role}</p>
            <p className="mt-2 text-muted">{DOCTOR.qualificationsLine}</p>
            <p className="intro mt-6 max-w-xl">{site.doctor.shortBio}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/appointment" className="btn btn-plum">
                Book with Dr. Roy <Icon name="arrow" size={18} />
              </Link>
              <a href={`tel:${CLINIC.phone}`} className="btn btn-line">
                <Icon name="phone" size={18} /> {CLINIC.phoneDisplay}
              </a>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[22rem]">
            <DoctorPortrait sizes="(min-width: 1024px) 22rem, 80vw" priority />
            <RatingCard className="absolute -bottom-6 -left-4 w-[16rem] max-w-[calc(100%-1rem)]" />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="shell grid gap-14 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="prose-lfc max-w-2xl">
            <h2>Background</h2>
            <p>{site.doctor.biography}</p>
            <p>
              Dr. Roy trained in medicine at Calcutta University and specialised in obstetrics and gynaecology. He also holds a diploma in
              gynaecological endoscopy from Germany, the training behind the laparoscopic and hysteroscopic (keyhole) procedures he
              performs.
            </p>
            <h2>How he works</h2>
            <p>{site.doctor.approach}</p>
            <ul>
              <li>Both partners are seen together for fertility consultations whenever possible.</li>
              <li>Tests are advised only when they will change what happens next.</li>
              <li>Costs and options are discussed openly before treatment starts.</li>
              <li>Consultations in Bengali, English or Hindi.</li>
            </ul>
          </div>
          <aside className="grid content-start gap-4">
            <div className="panel p-6">
              <p className="kicker">Qualifications</p>
              <ul className="mt-4 grid gap-3">
                {DOCTOR.qualifications.map((q) => (
                  <li key={q} className="flex gap-3">
                    <span className="mt-2 size-1.5 flex-none rounded-full bg-gold" aria-hidden="true" />
                    <span className="font-semibold">{q}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-line pt-4 text-[0.88rem] text-muted">{LEGAL.medicalRegistration}</p>
            </div>
            <div className="panel p-6">
              <p className="kicker">At a glance</p>
              <dl className="mt-4 grid gap-3 text-[0.95rem]">
                {[
                  ['Experience', DOCTOR.experienceLabel],
                  ['Has worked in', DOCTOR.workedIn.join(', ')],
                  ['Languages', DOCTOR.languages.join(', ')],
                  ['Consults at', `${CLINIC.name}, Mokdumpur, Malda`],
                  ['Hours', CLINIC.hoursLabel],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section aria-labelledby="areas-title" className="border-t border-line bg-paper py-20 lg:py-24">
        <div className="shell">
          <p className="kicker">Areas of practice</p>
          <h2 id="areas-title" className="t-2 mt-3">
            What Dr. Roy <span className="accent">treats</span>
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {areas.map((a) => (
              <div key={a.title}>
                <h3 className="t-3 border-b border-gold/60 pb-3">{a.title}</h3>
                <ul className="mt-4 grid gap-2">
                  {a.items.map((t) => (
                    <li key={t.slug}>
                      <Link href={`/treatments/${t.slug}`} className="group flex items-center justify-between gap-3 py-1 text-ink-soft hover:text-plum">
                        {t.title}
                        <Icon name="arrow" size={16} className="flex-none opacity-50 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      <section className="py-20 lg:py-24">
        <div className="shell max-w-4xl">
          <VideoFacade />
        </div>
      </section>
    </>
  );
}
