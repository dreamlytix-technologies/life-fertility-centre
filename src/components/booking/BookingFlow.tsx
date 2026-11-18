'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import type { DayAvailability, SlotAvailability } from '@/core/booking/slots';
import { formatDateLong } from '@/core/booking/time';
import { formatMoney, GENDER_LABELS, GENDERS, VISIT_REASON_LABELS, VISIT_REASONS, type VisitReason } from '@/core/domain';
import { AGE_LIMITS, patientSchema } from '@/core/validation';
import { Icon } from '@/components/ui/Icon';
import { ApiError, getAvailability, getDates, type BookableDate } from './client';
import { CalendarPicker } from './CalendarPicker';
import { PaymentSheet } from './PaymentSheet';
import { useBooking } from './useBooking';

const REASON_HELP: Record<VisitReason, string> = {
  GYNAE: 'Periods, PCOS, fibroids, infections, pelvic pain, menopause',
  FERTILITY: 'Trying to conceive, IVF / IUI questions; couples welcome',
  PREGNANCY: 'Antenatal check-up, early pregnancy, high-risk care',
  FOLLOW_UP: 'Review after a visit, test results or treatment',
  SECOND_OPINION: 'A view on a diagnosis or plan from elsewhere',
};

const formSchema = patientSchema.extend({
  note: z.string().trim().max(300, 'Please keep the note under 300 characters'),
  consent: z.boolean().refine((v) => v, 'Please accept the terms and privacy policy'),
  website: z.string().max(0).optional(),
});
type FormIn = z.input<typeof formSchema>;
type FormOut = z.output<typeof formSchema>;

type Step = 1 | 2 | 3;

export interface BookingFlowProps {
  initialDates: BookableDate[];
  feePaise: number;
  advancePaise: number;
  holdMinutes: number;
  /** Length of one appointment slot, from the centre settings. */
  slotMinutes: number;
  /** Number of dates offered (today included). */
  daysShown: number;
  initialReason?: VisitReason;
  service?: { slug: string; title: string };
}

export function BookingFlow({ initialDates, feePaise, advancePaise, holdMinutes, slotMinutes, daysShown, initialReason, service }: BookingFlowProps) {
  const engine = useBooking('CONSULTATION');
  const [step, setStep] = useState<Step>(initialReason ? 2 : 1);
  const [reason, setReason] = useState<VisitReason | null>(initialReason ?? null);
  const [dates, setDates] = useState(initialDates);
  const [date, setDate] = useState<string | null>(() => initialDates.find((d) => d.open)?.date ?? null);
  const [day, setDay] = useState<DayAvailability | null>(null);
  const [loadingDay, setLoadingDay] = useState(() => initialDates.some((d) => d.open)); // first paint shows the skeleton while times load
  const [dayError, setDayError] = useState<string | null>(null);
  const [slot, setSlot] = useState<SlotAvailability | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const form = useForm<FormIn, unknown, FormOut>({
    resolver: zodResolver(formSchema),
    defaultValues: { patientName: '', contactNumber: '', email: '', partnerName: '', note: '', consent: false, website: '' },
    mode: 'onTouched',
  });
  const { register, handleSubmit, formState, setError, watch } = form;
  const noteLen = (watch('note') ?? '').length;

  const loadDay = useCallback(async (d: string) => {
    setLoadingDay(true);
    setDayError(null);
    try {
      setDay(await getAvailability(d, 'CONSULTATION'));
    } catch (e) {
      setDay(null);
      setDayError(e instanceof ApiError ? e.message : 'Could not load times. Please try again.');
    } finally {
      setLoadingDay(false);
    }
  }, []);

  useEffect(() => {
    if (date) void loadDay(date);
  }, [date, loadDay]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: false });
  }, [step]);

  const go = (s: Step) => {
    setNotice(null);
    setStep(s);
  };

  const refreshAll = useCallback(async () => {
    try {
      setDates(await getDates('CONSULTATION'));
    } catch {
      /* keep current */
    }
    if (date) await loadDay(date);
  }, [date, loadDay]);

  const onExpire = useCallback(() => {
    engine.expire();
    setSlot(null);
    setStep(2);
    setNotice(`Your ${holdMinutes}-minute hold ran out, so the time was released and nothing was charged. Please choose a time again.`);
    void refreshAll();
  }, [engine, holdMinutes, refreshAll]);

  const onSubmit = handleSubmit(async (v) => {
    if (!reason || !date || !slot) return;
    const outcome = await engine.submit({
      patient: {
        patientName: v.patientName,
        age: v.age,
        gender: v.gender,
        contactNumber: v.contactNumber,
        email: v.email || undefined,
        partnerName: reason === 'FERTILITY' ? v.partnerName || undefined : undefined,
      },
      appointment: {
        type: 'CONSULTATION',
        date,
        slot: slot.start,
        visitReason: reason,
        serviceSlug: service?.slug,
        reason: v.note || undefined,
      },
      website: v.website ?? '',
      summary: { title: VISIT_REASON_LABELS[reason], date: formatDateLong(date), slotLabel: slot.label, patientName: v.patientName },
    });
    if (outcome.ok) return;
    const { kind, error } = outcome;
    if (kind === 'slot') {
      setSlot(null);
      setStep(2);
      setNotice(error.message);
      void refreshAll();
    } else if (kind === 'patient' && error.fields) {
      for (const [k, msg] of Object.entries(error.fields)) {
        const field = k.replace(/^patient\./, '') as keyof FormIn;
        setError(field, { message: msg });
      }
    } else {
      setNotice(error.message);
    }
  });

  const groups = useMemo(() => {
    // Times already gone today are hidden; booked ones stay visible but crossed out.
    const slots = (day?.slots ?? []).filter((s) => s.status !== 'PAST');
    return [
      { label: 'Morning', slots: slots.filter((s) => s.start < '12:00') },
      { label: 'Midday', slots: slots.filter((s) => s.start >= '12:00') },
    ].filter((g) => g.slots.length);
  }, [day]);

  const busy = engine.phase === 'creating' || engine.phase === 'processing';
  const err = (k: keyof FormIn) => formState.errors[k]?.message;
  const fieldProps = (k: keyof FormIn) => ({
    'aria-invalid': !!formState.errors[k] || undefined,
    'aria-describedby': formState.errors[k] ? `${k}-err` : undefined,
  });
  const ErrorText = ({ k }: { k: keyof FormIn }) =>
    err(k) ? (
      <p id={`${k}-err`} className="error">
        <Icon name="alert" size={15} className="mt-0.5 flex-none" /> {err(k)}
      </p>
    ) : null;

  const steps: { n: Step; label: string; value?: string }[] = [
    { n: 1, label: 'Reason', value: reason ? VISIT_REASON_LABELS[reason] : undefined },
    { n: 2, label: 'Date & time', value: date && slot ? `${formatDateLong(date)}, ${slot.label}` : undefined },
    { n: 3, label: 'Your details & payment' },
  ];

  const summaryCard = (
    <div className="panel overflow-hidden">
      <div className="on-dark bg-plum-deep px-5 py-4 text-cream">
        <p className="kicker">Your booking</p>
        <p className="mt-1 font-display text-xl font-semibold">Consultation with Dr. Roy</p>
      </div>
      <dl className="grid gap-3 p-5 text-[0.92rem]">
        <div>
          <dt className="text-muted">Visit</dt>
          <dd className="font-semibold">{reason ? VISIT_REASON_LABELS[reason] : 'Not chosen yet'}</dd>
        </div>
        {service && (
          <div>
            <dt className="text-muted">About</dt>
            <dd className="font-semibold">{service.title}</dd>
          </div>
        )}
        <div>
          <dt className="text-muted">When</dt>
          <dd className="font-semibold">{date && slot ? `${formatDateLong(date)}, ${slot.label}` : 'Not chosen yet'}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
          <dt className="text-muted">Consultation fee</dt>
          <dd className="font-semibold">{formatMoney(feePaise)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Pay online now</dt>
          <dd className="numeral text-[1.5rem] leading-none text-plum-deep">{formatMoney(advancePaise)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted">Pay at the centre</dt>
          <dd className="font-semibold">{formatMoney(Math.max(0, feePaise - advancePaise))}</dd>
        </div>
      </dl>
      <p className="border-t border-line px-5 py-4 text-[0.82rem] text-muted">
        Check your details before you confirm. The advance is non-refundable.
      </p>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
      <div className="min-w-0">
        {engine.resumable && engine.phase === 'idle' && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gold/60 bg-gold-soft p-4">
            <p className="text-[0.92rem]">
              <strong className="font-semibold">You have an unfinished booking</strong> ({engine.resumable.reference}, {engine.resumable.summary.date}).
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn btn-plum btn-sm" onClick={engine.resume}>
                Resume payment
              </button>
              <button type="button" className="btn btn-quiet btn-sm" onClick={engine.dismissResume}>
                Start again
              </button>
            </div>
          </div>
        )}

        <ol className="mb-8 grid grid-cols-3 gap-2" aria-label="Booking steps">
          {steps.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                disabled={s.n > step || busy}
                onClick={() => go(s.n)}
                aria-current={s.n === step ? 'step' : undefined}
                className="w-full border-t-2 border-line pt-2 text-left disabled:cursor-default aria-[current=step]:border-plum"
              >
                <span className="numeral text-lg text-gold-ink">{s.n}</span>{' '}
                <span className={`text-[0.82rem] font-semibold ${s.n === step ? 'text-plum' : 'text-muted'}`}>{s.label}</span>
              </button>
            </li>
          ))}
        </ol>

        <div aria-live="polite">
          {notice && (
            <p role="alert" className="mb-6 flex gap-2 rounded-lg border border-danger/40 bg-blush-light p-4 text-[0.92rem] font-semibold text-danger">
              <Icon name="alert" size={18} className="mt-0.5 flex-none" /> {notice}
            </p>
          )}
        </div>

        {step === 1 && (
          <section aria-labelledby="s1">
            <h2 id="s1" ref={headingRef} tabIndex={-1} className="t-2 outline-none">
              What is the visit <span className="accent">for?</span>
            </h2>
            <div role="radiogroup" aria-labelledby="s1" className="mt-6 grid gap-3 sm:grid-cols-2">
              {VISIT_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={reason === r}
                  className="choice"
                  onClick={() => {
                    setReason(r);
                    go(2);
                  }}
                >
                  <span className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full border border-plum">
                    {reason === r && <span className="size-2.5 rounded-full bg-plum" />}
                  </span>
                  <span>
                    <span className="block font-semibold">{VISIT_REASON_LABELS[r]}</span>
                    <span className="mt-0.5 block text-[0.86rem] text-muted">{REASON_HELP[r]}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-[0.9rem] text-muted">
              Bleeding or severe pain in pregnancy? Do not book; <Link href="/urgent" className="text-link">see urgent help</Link>.
            </p>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="s2">
            <h2 id="s2" ref={headingRef} tabIndex={-1} className="t-2 outline-none">
              Choose a <span className="accent">date and time</span>
            </h2>
            <p className="mt-2 text-[0.92rem] text-muted">Mon–Sat, 10:00 AM – 2:00 PM · {slotMinutes}-minute appointments · today and the next {daysShown - 1} days</p>

            <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)]">
              <CalendarPicker
                dates={dates}
                value={date}
                onChange={(d) => {
                  setDate(d);
                  setSlot(null);
                }}
              />

              <div className="min-h-40 rounded-[var(--radius-card)] bg-paper p-3.5 shadow-[var(--shadow-card)] ring-1 ring-line sm:p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line pb-2.5">
                <p className="text-[1.05rem] font-bold tracking-[-0.01em] text-plum-deep">{date ? formatDateLong(date) : 'Pick a date'}</p>
                {!loadingDay && day?.open && (
                  <p className="text-[0.8rem] font-semibold text-gold-ink tabular-nums">
                    {day.summary.available} {day.summary.available === 1 ? 'time' : 'times'} free
                  </p>
                )}
              </div>
              {!date && <p className="text-ink-soft">Choose a highlighted date on the calendar to see the free times.</p>}
              {loadingDay && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="status" aria-label="Loading times">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="skeleton h-12" />
                  ))}
                </div>
              )}
              {!loadingDay && dayError && (
                <div>
                  <p className="error mt-0">{dayError}</p>
                  <button type="button" className="btn btn-quiet btn-sm mt-3" onClick={() => date && loadDay(date)}>
                    Try again
                  </button>
                </div>
              )}
              {!loadingDay && day && !day.open && <p className="text-ink-soft">{day.message ?? 'The centre is closed on this day.'}</p>}
              {!loadingDay && day?.open && day.summary.available === 0 && (
                <div>
                  <p className="font-semibold">No times left on this day.</p>
                  <p className="mt-1 text-[0.92rem] text-ink-soft">Please choose another date, or call the centre.</p>
                </div>
              )}
              {!loadingDay && day?.open && day.summary.available > 0 && (
                <div className="grid gap-4 xl:max-h-[27rem] xl:overflow-y-auto xl:pr-1">
                  {groups.map((g) => (
                    <fieldset key={g.label}>
                      <legend className="text-[0.78rem] font-bold tracking-[0.14em] text-muted uppercase">{g.label}</legend>
                      <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-5">
                        {g.slots.map((s) => {
                          const free = s.status === 'AVAILABLE' || s.status === 'LIMITED';
                          return (
                            <button
                              key={s.start}
                              type="button"
                              disabled={!free}
                              aria-pressed={slot?.start === s.start}
                              onClick={() => setSlot(s)}
                              className="min-h-9 rounded-md border border-line bg-paper px-1 text-[0.8rem] font-semibold tabular-nums disabled:cursor-not-allowed disabled:bg-blush-light disabled:text-muted disabled:line-through aria-pressed:border-plum aria-pressed:bg-plum aria-pressed:text-cream"
                            >
                              {s.label}
                              {!free && <span className="sr-only"> (not available)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ))}
                </div>
              )}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" className="btn btn-plum" disabled={!slot} onClick={() => go(3)}>
                Continue <Icon name="arrow" size={18} />
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => go(1)}>
                Back
              </button>
            </div>
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="s3">
            <h2 id="s3" ref={headingRef} tabIndex={-1} className="t-2 outline-none">
              Your <span className="accent">details</span>
            </h2>
            <p className="mt-2 text-[0.92rem] text-muted">Only what the centre needs to see you. No medical history is asked for online.</p>
            <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-5">
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-[1fr_7rem_9rem]">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="patientName" className="label">
                    Patient’s full name
                  </label>
                  <input id="patientName" className="field" autoComplete="name" {...register('patientName')} {...fieldProps('patientName')} />
                  <ErrorText k="patientName" />
                </div>
                <div>
                  <label htmlFor="age" className="label">
                    Age (years)
                  </label>
                  <input
                    id="age"
                    className="field"
                    type="number"
                    inputMode="numeric"
                    min={AGE_LIMITS.min}
                    max={AGE_LIMITS.max}
                    {...register('age', { valueAsNumber: true })}
                    {...fieldProps('age')}
                  />
                  <ErrorText k="age" />
                </div>
                <div>
                  <label htmlFor="gender" className="label">
                    Gender
                  </label>
                  <select id="gender" className="field" defaultValue="" {...register('gender')} {...fieldProps('gender')}>
                    <option value="" disabled>
                      Select
                    </option>
                    {GENDERS.map((g) => (
                      <option key={g} value={g}>
                        {GENDER_LABELS[g]}
                      </option>
                    ))}
                  </select>
                  <ErrorText k="gender" />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contactNumber" className="label">
                    Mobile number
                  </label>
                  <input id="contactNumber" className="field" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" {...register('contactNumber')} {...fieldProps('contactNumber')} />
                  <ErrorText k="contactNumber" />
                </div>
                <div>
                  <label htmlFor="email" className="label">
                    Email <span className="font-normal text-muted">(optional, for the confirmation)</span>
                  </label>
                  <input id="email" className="field" type="email" autoComplete="email" {...register('email')} {...fieldProps('email')} />
                  <ErrorText k="email" />
                </div>
              </div>
              {reason === 'FERTILITY' && (
                <div>
                  <label htmlFor="partnerName" className="label">
                    Partner’s name <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <input id="partnerName" className="field" autoComplete="off" {...register('partnerName')} {...fieldProps('partnerName')} />
                  <ErrorText k="partnerName" />
                </div>
              )}
              <div>
                <label htmlFor="note" className="label">
                  Anything the centre should know? <span className="font-normal text-muted">(optional)</span>
                </label>
                <textarea id="note" className="field" rows={3} maxLength={300} {...register('note')} {...fieldProps('note')} aria-describedby={formState.errors.note ? 'note-err' : 'note-hint'} />
                <p id="note-hint" className="hint mt-1 flex justify-between gap-3">
                  <span>For example, a preferred language. Please don’t include medical history.</span>
                  <span className="tabular-nums">{noteLen}/300</span>
                </p>
                <ErrorText k="note" />
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>
              <div>
                <label className="flex items-start gap-3 text-[0.92rem]">
                  <input type="checkbox" className="mt-1 size-5 flex-none accent-plum" {...register('consent')} {...fieldProps('consent')} />
                  <span>
                    I agree to the <Link href="/terms" className="text-link" target="_blank">terms</Link>,{' '}
                    <Link href="/privacy-policy" className="text-link" target="_blank">privacy policy</Link> and{' '}
                    <Link href="/cancellation-refund" className="text-link" target="_blank">cancellation policy</Link>.
                  </span>
                </label>
                <ErrorText k="consent" />
              </div>
              {engine.message && engine.phase !== 'failed' && (
                <p role="alert" className="error mt-0">
                  <Icon name="alert" size={15} className="mt-0.5 flex-none" /> {engine.message}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn-plum" disabled={busy || !slot}>
                  {engine.phase === 'creating' ? (
                    <>
                      <span className="spinner" aria-hidden="true" /> Holding your time…
                    </>
                  ) : (
                    <>
                      <Icon name="lock" size={18} /> Pay {formatMoney(advancePaise)} &amp; confirm
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-quiet" onClick={() => go(2)} disabled={busy}>
                  Back
                </button>
              </div>
              {engine.held && engine.phase !== 'paid' && !engine.sheetOpen && (
                <button type="button" className="btn btn-line justify-self-start" onClick={() => engine.held && engine.openCheckout(engine.held)}>
                  Open payment again
                </button>
              )}
            </form>
          </section>
        )}
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">{summaryCard}</aside>
      <PaymentSheet engine={engine} onExpire={onExpire} />
    </div>
  );
}
