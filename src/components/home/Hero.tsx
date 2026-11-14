import Image from 'next/image';
import Link from 'next/link';
import { CLINIC, DOCTOR } from '@/content/facts';
import { DOCTOR_PORTRAIT, DOCTOR_PORTRAIT_WIDE } from '@/content/photos';
import { Icon } from '@/components/ui/Icon';
import { RatingCard } from '@/components/ui/bits';
import type { NextSlot } from '@/lib/server';

/**
 * Home hero: dark plum stage, text left, the doctor in a round frame inside
 * gold orbit rings (echoing the logo) on the right. Deliberately unlike the
 * light, arched portrait on /about.
 */
export function Hero({ next }: { next: NextSlot | null }) {
  const photo = DOCTOR_PORTRAIT_WIDE ?? DOCTOR_PORTRAIT;
  const facts = [
    { label: 'Experience', value: DOCTOR.experienceLabel },
    { label: 'Hours', value: CLINIC.hoursLabel },
    { label: 'Languages', value: DOCTOR.languages.join(', ') },
  ];

  return (
    <section className="on-dark relative isolate overflow-hidden bg-plum-deep text-cream">
      {/* Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-32 size-[34rem] rounded-full bg-plum/70 blur-3xl" />
        <div className="absolute right-[-10rem] bottom-[-12rem] size-[30rem] rounded-full bg-gold/15 blur-3xl" />
      </div>

      <div className="shell grid items-center gap-14 pt-12 pb-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-16 lg:pb-24">
        <div>
          <p className="kicker">Gynaecology · Fertility · Pregnancy care · Malda</p>
          <h1 className="t-hero mt-5 text-cream">
            Careful, unhurried care on the way to <span className="accent">becoming a family</span>
          </h1>
          <p className="mt-6 max-w-xl text-[clamp(1.05rem,1.3vw,1.18rem)] leading-[1.7] text-cream/80">
            {DOCTOR.honorific} {DOCTOR.name} sees women and couples at Life Fertility Centre in Mokdumpur for fertility evaluation and
            IVF, gynaecological problems and keyhole surgery, and care through pregnancy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/appointment" className="btn btn-cream">
              Book a consultation <Icon name="arrow" size={18} />
            </Link>
            <Link href="/fertility" className="btn btn-outline-cream">
              The fertility journey
            </Link>
          </div>
          <dl className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-[0.75fr_1.35fr_1fr]">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-cream/[0.06] px-4 py-3.5 ring-1 ring-cream/15">
                <dt className="text-[0.7rem] font-bold tracking-[0.16em] text-gold-pale/90 uppercase">{f.label}</dt>
                <dd className="mt-1.5 text-[0.95rem] leading-snug font-semibold whitespace-nowrap text-cream">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[24rem] sm:max-w-[30rem]">
          {/* Orbit rings */}
          <svg aria-hidden="true" className="absolute inset-[-6%] size-[112%] text-gold" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="198" stroke="currentColor" strokeOpacity="0.18" />
            <circle cx="200" cy="200" r="178" stroke="currentColor" strokeOpacity="0.35" strokeDasharray="2 7" strokeLinecap="round" />
            <circle cx="200" cy="200" r="160" stroke="currentColor" strokeOpacity="0.55" />
            <circle cx="341" cy="105" r="6" fill="currentColor" />
            <circle cx="52" cy="282" r="4" fill="currentColor" fillOpacity="0.7" />
          </svg>

          {/* Round portrait */}
          <div className="absolute inset-[10%] overflow-hidden rounded-full bg-plum shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)] ring-[6px] ring-gold-pale/80">
            {photo && (
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 24rem, 80vw"
                preload
                /* The face sits ~58% across the photo; zoom slightly and shift left so it lands in the centre of the circle. */
                className="-translate-x-[9.5%] scale-[1.22] object-cover object-[50%_28%]"
              />
            )}
          </div>

          {/* Next free time pill */}
          <Link
            href="/appointment"
            className="absolute top-[4%] right-0 flex items-center gap-3 rounded-full bg-cream py-2 pr-4 pl-2 text-plum-deep shadow-[var(--shadow-float)] transition hover:-translate-y-0.5 sm:right-[-4%]"
          >
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-gold-pale to-gold">
              <Icon name="calendar" size={17} />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.66rem] font-bold tracking-[0.16em] text-gold-ink uppercase">Next free time</span>
              <span className="block text-[0.88rem] font-semibold">{next ? `${next.dayLabel}, ${next.label}` : 'Call to book'}</span>
            </span>
          </Link>

          <RatingCard className="absolute bottom-[2%] left-[-2%] w-[16.5rem] max-w-[calc(100%-1rem)] sm:left-[-8%]" />
        </div>
      </div>
    </section>
  );
}
