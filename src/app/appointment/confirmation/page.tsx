import { googleCalendarUrl } from '@/core/booking/ics';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/core/booking/status';
import { formatDateLong, formatTime12 } from '@/core/booking/time';
import { formatMoney } from '@/core/domain';
import type { Metadata } from 'next';
import Link from 'next/link';
import { CLINIC, LEGAL } from '@/content/facts';
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
  const icsUrl = `/api/bookings/ics?ref=${encodeURIComponent(b.reference)}&token=${encodeURIComponent(token)}`;
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
    ['Address', `${b.clinic.name}, ${b.clinic.address}`],
  ];

  return (
    <div className="shell py-12 lg:py-16">
      <div className="print-only mb-6 border-b pb-4">
        <p style={{ fontSize: '18pt', fontWeight: 600 }}>{b.clinic.name}</p>
        <p>
          {b.clinic.address} · {b.clinic.phoneDisplay}
        </p>
      </div>
      <div className="mx-auto max-w-4xl">
        <header className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <span
            className={`no-print flex size-20 items-center justify-center rounded-full border ${confirmed ? 'border-ok bg-blush-light text-ok' : pending ? 'border-warn bg-gold-soft text-warn' : 'border-line bg-blush-light text-ink-soft'}`}
          >
            <Icon name={confirmed ? 'check' : pending ? 'clock' : 'info'} size={34} strokeWidth={confirmed ? 2 : 1.5} />
          </span>
          <div>
            <p className="kicker">Booking {b.reference}</p>
            <h1 className="t-1 mt-2">
              {confirmed ? (
                <>
                  Appointment <span className="accent">confirmed</span>
                </>
              ) : pending ? (
                'Awaiting payment'
              ) : (
                BOOKING_STATUS_LABELS[b.status]
              )}
            </h1>
            <p className="intro mt-3">
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

        <section aria-labelledby="details-title" className="panel mt-10 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line bg-blush-light px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <LogoMark size={30} className="no-print" />
              <div>
                <h2 id="details-title" className="font-display text-xl font-semibold">
                  Booking details
                </h2>
                <p className="text-[0.85rem] text-muted">Status: {BOOKING_STATUS_LABELS[b.status]}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-plum-deep px-3.5 py-2 font-mono text-[0.85rem] tracking-wider text-cream">{b.reference}</span>
              <CopyButton text={b.reference} label="Copy ID" />
            </div>
          </div>
          <dl className="grid sm:grid-cols-2">
            {rows.map(([k, v], i) => (
              <div
                key={k}
                className={`border-line px-5 py-3.5 sm:px-7 ${i < rows.length - 1 ? 'border-b' : ''} ${i % 2 === 0 && k !== 'Address' ? 'sm:border-r' : ''} ${k === 'Address' ? 'sm:col-span-2' : ''}`}
              >
                <dt className="text-[0.85rem] text-muted">{k}</dt>
                <dd className={`mt-0.5 font-semibold break-words ${k === 'Transaction ID' ? 'font-mono text-[0.85rem]' : ''}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {confirmed && (
          <>
            <div className="no-print mt-6 flex flex-wrap gap-3">
              <PrintButton />
              <a href={icsUrl} className="btn btn-quiet">
                <Icon name="calendar" size={18} /> Add to calendar (.ics)
              </a>
              <a href={googleCalendarUrl(b)} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                Google Calendar <Icon name="arrowUpRight" size={15} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              {b.clinic.mapsUrl && (
                <a href={b.clinic.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-quiet">
                  <Icon name="directions" size={18} /> Directions
                  <span className="sr-only">(opens Google Maps in a new tab)</span>
                </a>
              )}
            </div>
            <section aria-labelledby="next-title" className="mt-10 grid gap-4 sm:grid-cols-3">
              <h2 id="next-title" className="sr-only">
                Before your visit
              </h2>
              {[
                ['clock', 'Arrive 10 minutes early', 'It gives time for a short registration at the desk.'],
                ['download', 'Bring your reports', 'Prescriptions, blood tests, ultrasound reports and films. For fertility visits, both partners’ reports.'],
                ['phone', 'Need to change it?', `Call ${b.clinic.phoneDisplay}. See the cancellation policy for refunds.`],
              ].map(([icon, title, body]) => (
                <div key={title} className="panel p-5">
                  <Icon name={icon as 'clock'} size={22} className="text-gold-ink" />
                  <p className="mt-3 font-semibold">{title}</p>
                  <p className="mt-1 text-[0.9rem] text-ink-soft">{body}</p>
                </div>
              ))}
            </section>
            <p className="mt-6 text-[0.85rem] text-muted">{LEGAL.pcpndt}</p>
          </>
        )}

        <div className="no-print mt-10 flex flex-wrap gap-3">
          <a href={`tel:${b.clinic.phone}`} className="btn btn-line">
            <Icon name="phone" size={18} /> Call the centre
          </a>
          <Link href="/" className="btn btn-quiet">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
