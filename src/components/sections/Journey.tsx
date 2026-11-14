import { SectionHead } from '@/components/ui/bits';

export const JOURNEY_STEPS = [
  {
    title: 'Consultation',
    body: 'A private first conversation with Dr. Roy about your history, cycles and any previous treatment. Both partners are welcome.',
    note: 'Bring earlier reports and prescriptions',
  },
  {
    title: 'Tests',
    body: 'Usually an ultrasound scan, hormone blood tests and a semen analysis, some timed to the menstrual cycle.',
    note: 'For both partners',
  },
  {
    title: 'Treatment plan',
    body: 'Results explained in plain words, and the options that suit you, from ovulation support or IUI to IVF / ICSI, with costs set out.',
    note: 'Decided together',
  },
  {
    title: 'Procedure',
    body: 'The treatment you choose, with monitoring scans along the way and clear instructions at every step.',
    note: 'Medicines, monitoring, procedure',
  },
  {
    title: 'Follow-up',
    body: 'A pregnancy test and review. If pregnant, early pregnancy care; if not, an honest talk about what next.',
    note: 'Support whatever the result',
  },
] as const;

/** Numbered vertical timeline: consultation → tests → treatment plan → procedure → follow-up. */
export function Journey({ headingLevel = 'h2' }: { headingLevel?: 'h2' | 'h1' }) {
  return (
    <section aria-labelledby="journey-title" className="bg-blush-light py-20 lg:py-28">
      <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHead
            id="journey-title"
            as={headingLevel}
            kicker="The fertility journey"
            title={
              <>
                Five steps, <span className="accent">one conversation at a time</span>
              </>
            }
            intro="Fertility treatment can feel overwhelming. This is the usual path at the centre, though your own plan may skip or repeat steps depending on what the tests show."
          />
        </div>
        <ol className="relative">
          <span aria-hidden="true" className="absolute top-4 bottom-4 left-[1.45rem] w-px bg-gradient-to-b from-gold via-gold/60 to-transparent" />
          {JOURNEY_STEPS.map((s, i) => (
            <li key={s.title} className="relative grid grid-cols-[3rem_1fr] gap-5 pb-10 last:pb-0" data-reveal>
              <span className="numeral relative z-10 flex size-12 items-center justify-center rounded-full border border-gold bg-cream text-[1.35rem] text-plum-deep">
                {i + 1}
              </span>
              <div className="panel p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h3 className="t-3">{s.title}</h3>
                  <span className="text-[0.75rem] font-bold tracking-[0.12em] text-gold-ink uppercase">{s.note}</span>
                </div>
                <p className="mt-2 text-ink-soft">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
