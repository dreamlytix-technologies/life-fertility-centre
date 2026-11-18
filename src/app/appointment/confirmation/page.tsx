import { googleCalendarUrl } from '@/core/booking/ics';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/core/booking/status';
import { formatDateLong, formatTime12 } from '@/core/booking/time';
import { formatMoney } from '@/core/domain';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CLINIC, LEGAL } from '@/content/facts';
import { Acknowledgement } from '@/components/booking/Acknowledgement';
import { CopyButton, PendingCountdown, PrintButton } from '@/components/booking/ConfirmationActions';
import { Icon, LogoMark } from '@/components/ui/Icon';
import { api } from '@/lib/api';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Your appointment',
  robots: { index: false, follow: false },
  alternates: { canonical: '/appointment/confirmation' },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const ref = one(sp.ref).slice(0, 40);
  const token = one(sp.token).slice(0, 128);
  const booking = ref && token ? await api.server.booking(ref, token) : null;

  if (!booking)
    return (
      <section className="shell grid min-h-[55vh] place-items-center py-20 text-center">
        <div className="max-w-xl">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold text-plum">
            <Icon name="info" size={26} />
          </span>
          <h1 className="t-1 mt-6">We couldn’t find that booking</h1>
          <p className="intro mt-4">
            The link may be incomplete. Please use the full link from your confirmation, or call the centre with your booking ID (it starts with LFC).
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={`tel:${CLINIC.phone}`} className="btn btn-plum">
              <Icon name="phone" size={18} /> Call {CLINIC.phoneDisplay}
            </a>
            <Link href="/appointment" className="btn btn-line">
              Book a consultation
            </Link>
          </div>
        </div>
      </section>
    );

  const b = booking;
  const money = (p: number) => formatMoney(p, b.currency);
  const confirmed = ['CONFIRMED', 'RESCHEDULED', 'COMPLETED'].includes(b.status);
  const pending = b.status === 'PAYMENT_PENDING' || b.status === 'PENDING';
  // Shorter address for this page (the full state name stays in SEO data and policies).
  const address = b.clinic.address.replace('West Bengal', 'WB');
  const rows: [string, string][] = [
    ['Patient', b.patientName],
    ['Doctor', b.doctorName],
    ['Visit', [b.visitReasonLabel ?? 'Consultation', b.serviceTitle].filter(Boolean).join(' · ')],
    ['Date', formatDateLong(b.date)],
    ['Time', `${formatTime12(b.startTime)} – ${formatTime12(b.endTime)}`],
    ['Advance paid', b.payment?.status === 'PAID' ? money(b.payment.amount) : money(0)],
    ['Payment status', b.payment ? PAYMENT_STATUS_LABELS[b.payment.status] : 'No payment'],
    ['Transaction ID', b.payment?.transactionId ?? '—'],
    ['Pay at the centre', money(b.remainingAmount)],
    ['Address', address],
  ];

  return (
    <div className="shell py-8 lg:py-10">
      {confirmed && <Acknowledgement b={b} />}
      <div className="no-print mx-auto max-w-4xl">
        <header className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
          <span
            className={`no-print flex size-14 items-center justify-center rounded-full border ${confirmed ? 'border-ok bg-blush-light text-ok' : pending ? 'border-warn bg-gold-soft text-warn' : 'border-line bg-blush-light text-ink-soft'}`}
          >
            <Icon name={confirmed ? 'check' : pending ? 'clock' : 'info'} size={26} strokeWidth={confirmed ? 2 : 1.5} />
          </span>
          <div>
            <h1 className="t-2 !text-[clamp(1.45rem,2.3vw,1.9rem)]">
              {confirmed ? (
                <>
                  Appointment <span className="accent">Confirmed</span>
                </>
              ) : pending ? (
                'Awaiting payment'
              ) : (
                BOOKING_STATUS_LABELS[b.status]
              )}
            </h1>
            <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-soft">
              {confirmed && `See you on ${formatDateLong(b.date)} at ${formatTime12(b.startTime)}.`}
              {pending && 'Your time is held while the advance is paid. If the hold runs out, the time is released and nothing is charged.'}
              {b.status === 'REFUND_PENDING' &&
                'Your payment arrived after the hold had expired and the time had been taken, or the centre had to cancel. The advance is being refunded to the original payment method; banks usually take 5–7 working days.'}
              {b.status === 'REFUNDED' && 'This booking was cancelled and the advance has been refunded.'}
              {b.status === 'CANCELLED' && 'This booking has been cancelled. Please call the centre if you have questions.'}
              {b.status === 'NO_SHOW' && 'This appointment was marked as missed. Please call the centre to rebook.'}
            </p>
          </div>
        </header>

        {pending && (
          <div className="no-print mt-8 grid max-w-md gap-3">
            <PendingCountdown until={b.holdExpiresAt} />
            <Link href="/appointment" className="btn btn-plum">
              Resume payment <Icon name="arrow" size={18} />
            </Link>
            <p className="text-[0.8rem] text-muted">Resume works in the same browser tab you booked from. Otherwise, call the centre.</p>
          </div>
        )}

        <section aria-labelledby="details-title" className="panel mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-blush-light px-5 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <LogoMark size={26} className="no-print" />
              <div>
                <h2 id="details-title" className="font-display text-lg font-semibold">
                  Booking details
                </h2>
                <p className="text-[0.8rem] text-muted">Status: {BOOKING_STATUS_LABELS[b.status]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-plum-deep px-3 py-1.5 font-mono text-[0.8rem] tracking-wider text-cream">{b.reference}</span>
              <CopyButton text={b.reference} label="Copy ID" />
            </div>
          </div>
          <dl className="grid sm:grid-cols-2">
            {rows.map(([k, v], i) => (
              <div
                key={k}
                className={`border-line px-5 py-2.5 sm:px-6 ${i < rows.length - 1 ? 'border-b' : ''} ${i >= rows.length - 2 ? 'sm:border-b-0' : ''} ${i % 2 === 0 ? 'sm:border-r' : ''}`}
              >
                <dt className="text-[0.78rem] text-muted">{k}</dt>
                <dd className={`mt-0.5 font-semibold break-words ${k === 'Transaction ID' ? 'font-mono text-[0.8rem]' : 'text-[0.93rem]'}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {confirmed && (
          <>
            <div className="no-print mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 [&>*]:w-full [&>*]:justify-center [&>*]:px-3 [&>*]:text-center [&>*]:text-[0.86rem]">
              <PrintButton />
              <a href={googleCalendarUrl(b)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                Google Calendar <Icon name="arrowUpRight" size={15} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              {b.clinic.mapsUrl && (
                <a href={b.clinic.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                  <Icon name="directions" size={18} /> Get Directions
                  <span className="sr-only">(opens Google Maps in a new tab)</span>
                </a>
              )}
              <a href={`tel:${b.clinic.phone}`} className="btn btn-quiet">
                <Icon name="phone" size={17} /> Call Clinic
              </a>
            </div>
            <section aria-labelledby="next-title" className="panel mt-6 p-5 sm:p-6">
              <h2 id="next-title" className="text-[1rem] font-semibold">
                Please note
              </h2>
              <ol className="mt-3 grid list-decimal gap-2 pl-5 text-[0.9rem] leading-relaxed text-ink-soft marker:font-semibold marker:text-ink-soft">
                <li>Registration fee is not refundable.</li>
                <li>Please pay the consultation charges to the doctor at the centre.</li>
                <li>Please bring this confirmation or the SMS to your consultation and for any follow-up.</li>
                <li>
                  Please arrive on time for your time slot.{' '}
                  <span className="font-semibold text-danger">
                    (In case of a doctor’s emergency, it may be delayed by up to 1 hour.)
                  </span>
                </li>
              </ol>
            </section>
            <p className="no-print mt-4 text-[0.8rem] text-muted">{LEGAL.pcpndt}</p>
          </>
        )}
      </div>
    </div>
  );
}
