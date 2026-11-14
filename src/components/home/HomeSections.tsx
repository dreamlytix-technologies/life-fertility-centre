import Link from 'next/link';
import { DOCTOR } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';
import { CheckList, LegalNotice, SectionHead } from '@/components/ui/bits';
import { VideoFacade } from '@/components/sections/VideoFacade';

export function DoctorIntro() {
  const [years, ...yearsRest] = DOCTOR.experienceLabel.split(' ');
  const roles = DOCTOR.role.split(' · ');

  return (
    <section aria-labelledby="doctor-title" className="relative isolate overflow-hidden border-y border-line bg-blush-light py-16 lg:py-20">
      {/* Decoration: soft rings and a large faint monogram */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-32 -left-32 size-96 rounded-full border border-gold/40" />
        <span className="absolute -top-16 -left-48 size-96 rounded-full border border-plum/10" />
        <span className="absolute right-[-2rem] bottom-[-5rem] text-[18rem] leading-none font-extrabold tracking-[-0.06em] text-plum/[0.04] select-none">
          DR
        </span>
      </div>

      {/* A short teaser; the full profile lives on /about. */}
      <div className="shell grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
        <div>
          <p className="kicker">Your doctor</p>
          <h2 id="doctor-title" className="t-1 mt-3">
            {DOCTOR.honorific} <span className="accent">{DOCTOR.name}</span>
          </h2>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Specialities">
            {roles.map((r) => (
              <li key={r} className="rounded-full bg-paper px-3.5 py-1.5 text-[0.85rem] font-semibold text-plum ring-1 ring-gold/50">
                {r}
              </li>
            ))}
          </ul>
          <p className="intro mt-6 max-w-xl">
            Fertility, gynaecology and pregnancy care with one doctor who knows your story, close to home in Malda.
          </p>
          <Link href="/about" className="btn btn-plum mt-8">
            Meet Dr. Roy <Icon name="arrow" size={18} />
          </Link>
        </div>

        <Link
          href="/about"
          className="group on-dark relative isolate block overflow-hidden rounded-[var(--radius-card)] bg-plum-deep p-8 text-cream transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]"
        >
          <svg aria-hidden="true" className="absolute -top-24 -right-24 -z-10 size-72 text-gold" viewBox="0 0 200 200" fill="none">
            {[40, 60, 80, 98].map((r, i) => (
              <circle key={r} cx="100" cy="100" r={r} stroke="currentColor" strokeOpacity={0.4 - i * 0.08} />
            ))}
          </svg>
          <span className="kicker">Experience</span>
          <span className="mt-3 flex items-end gap-3">
            <span className="text-[clamp(3.5rem,7vw,5rem)] leading-[0.85] font-extrabold tracking-[-0.05em] text-gold-pale">{years}</span>
            <span className="pb-1 text-[1.05rem] leading-snug text-cream/85">
              {yearsRest.join(' ')} in obstetrics
              <br />& gynaecology
            </span>
          </span>
          <span className="mt-6 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-gold-pale">
            Read his full profile
            <Icon name="arrow" size={16} className="transition group-hover:translate-x-1" />
          </span>
        </Link>
      </div>
    </section>
  );
}

export function PregnancyFeature() {
  return (
    <section aria-labelledby="pregnancy-title" className="py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHead
            id="pregnancy-title"
            kicker="Pregnancy care"
            title={
              <>
                Nine months, <span className="accent">checked with care</span>
              </>
            }
            intro="Regular antenatal check-ups from the first positive test, closer monitoring for pregnancies that need it, and planning for a safe birth, including normal and assisted vaginal delivery."
          />
          <CheckList
            className="mt-8"
            items={[
              'Antenatal check-ups and scans at the recommended stages',
              'High-risk pregnancy care: blood pressure, diabetes, thyroid, twins, previous caesarean',
              'Pregnancy after fertility treatment',
              'Birth planning: normal and assisted vaginal delivery',
            ]}
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/pregnancy" className="btn btn-plum">
              Pregnancy care <Icon name="arrow" size={18} />
            </Link>
            <Link href="/appointment?reason=PREGNANCY" className="btn btn-line">
              Book a pregnancy check-up
            </Link>
          </div>
        </div>
        <div className="grid content-start gap-4">
          <div className="on-dark rounded-[var(--radius-card)] bg-plum p-6 text-cream sm:p-8">
            <p className="kicker">Do not wait for an appointment if</p>
            <ul className="mt-4 grid gap-2.5 text-[0.98rem]">
              {['You have heavy bleeding', 'You have severe abdominal pain', 'Fluid is leaking, or the baby is moving less', 'You feel faint, or have a severe headache with blurred vision'].map((x) => (
                <li key={x} className="flex gap-3">
                  <Icon name="alert" size={18} className="mt-0.5 flex-none text-gold-pale" /> {x}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[0.95rem] text-cream/80">Go to the nearest hospital emergency department, and call the centre on the way.</p>
            <Link href="/urgent" className="btn btn-cream mt-5">
              Urgent help
            </Link>
          </div>
          <LegalNotice kind="PCPNDT" />
        </div>
      </div>
    </section>
  );
}

export function VideoSection() {
  return (
    <section aria-labelledby="video-title" className="bg-blush-light py-20 lg:py-24">
      <div className="shell grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHead
          id="video-title"
          kicker="Watch"
          title={
            <>
              Hear from <span className="accent">Dr. Roy</span>
            </>
          }
          intro="A short video about Dr. Roy and Life Fertility Centre, shared on the IVF India YouTube channel."
        />
        <VideoFacade />
      </div>
    </section>
  );
}
