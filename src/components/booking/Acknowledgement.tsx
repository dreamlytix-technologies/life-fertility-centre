import { PAYMENT_STATUS_LABELS } from '@/core/booking/status';
import { formatTime12 } from '@/core/booking/time';
import { formatMoney, GENDER_LABELS, type PublicBooking } from '@/core/domain';
import { Icon, LogoMark } from '@/components/ui/Icon';

type IconName = Parameters<typeof Icon>[0]['name'];

/** Pieces of "2026-11-19" for the date tile. */
function dateParts(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  const opt = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-IN', { ...o, timeZone: 'UTC' });
  return {
    day: String(d.getUTCDate()).padStart(2, '0'),
    monthYear: `${opt({ month: 'short' })} ${d.getUTCFullYear()}`,
    weekday: opt({ weekday: 'long' }),
  };
}

/** Small uppercase section heading with an icon. */
function SectionTitle({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-[7.5pt] font-bold tracking-[0.16em] text-gold-ink uppercase">
      <Icon name={icon} size={12} />
      {children}
    </p>
  );
}

/** Label / value pair stacked vertically. */
function Field({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-[7.5pt] text-muted">{label}</dt>
      <dd className={`mt-0.5 font-semibold text-ink ${mono ? 'font-mono text-[8.5pt] break-all' : 'text-[10pt]'}`}>{children}</dd>
    </div>
  );
}

/**
 * The printable "Appointment Acknowledgement" slip. Hidden on screen; it is
 * the only thing printed when the patient uses "Download Confirmation"
 * (window.print → Save as PDF). Designed to fit one A4 page.
 */
export function Acknowledgement({ b }: { b: PublicBooking }) {
  const money = (p: number) => formatMoney(p, b.currency);
  const { day, monthYear, weekday } = dateParts(b.date);
  const paid = b.payment?.status === 'PAID';
  const visit = [b.visitReasonLabel ?? 'Consultation', b.serviceTitle].filter(Boolean).join(' · ');

  return (
    <div className="print-only ack text-[9.5pt] leading-snug text-ink">
      <div className="overflow-hidden rounded-[14px] border border-line">
        {/* ---------------------------------------------------------------- header band */}
        <div className="relative flex items-center justify-between gap-4 bg-plum-deep px-6 py-5 text-cream">
          <div className="flex items-center gap-2.5">
            <LogoMark size={40} tone="dark" />
            <span className="flex flex-col items-start leading-none">
              <span className="font-display text-[16pt] font-bold tracking-[-0.015em]">Life Fertility Centre</span>
              <span className="mt-1.5 text-[6.8pt] font-bold tracking-[0.26em] text-gold uppercase">Dr. Debchandan Roy</span>
            </span>
          </div>
          <div className="text-right">
            <p className="text-[6.8pt] font-bold tracking-[0.22em] text-gold uppercase">Booking ID</p>
            <p className="mt-1 rounded-md bg-cream/10 px-2.5 py-1 font-mono text-[10.5pt] font-bold tracking-wider">{b.reference}</p>
          </div>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-gold" />
        </div>

        <div className="px-6 pt-5 pb-6">
          {/* ------------------------------------------------------------ title + status */}
          <div className="flex items-end justify-between gap-4 border-b border-dashed border-line pb-4">
            <div>
              <h1 className="font-display text-[17pt] leading-tight font-bold tracking-[-0.01em] text-plum-deep">Appointment Acknowledgement</h1>
              <p className="mt-1 text-[8.5pt] text-muted">Please show this at the reception desk when you arrive.</p>
            </div>
            <span
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[8.5pt] font-bold ${paid ? 'bg-[#E4F1E8] text-ok' : 'bg-gold-soft text-warn'}`}
            >
              <Icon name={paid ? 'check' : 'clock'} size={13} strokeWidth={2.4} />
              {paid ? 'Confirmed' : 'Awaiting payment'}
            </span>
          </div>

          {/* ------------------------------------------------------------ appointment tiles */}
          <div className="mt-5 grid grid-cols-[auto_1fr_1fr] gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl bg-plum px-5 py-3 text-cream">
              <span className="font-display text-[24pt] leading-none font-bold">{day}</span>
              <span className="mt-1 text-[7.5pt] font-semibold tracking-[0.14em] uppercase">{monthYear}</span>
            </div>
            <div className="rounded-xl bg-blush-light px-4 py-3">
              <SectionTitle icon="calendar">Day</SectionTitle>
              <p className="mt-1.5 text-[13pt] font-bold text-plum-deep">{weekday}</p>
            </div>
            <div className="rounded-xl bg-blush-light px-4 py-3">
              <SectionTitle icon="clock">Time</SectionTitle>
              <p className="mt-1.5 text-[13pt] font-bold whitespace-nowrap text-plum-deep">
                {formatTime12(b.startTime)} – {formatTime12(b.endTime)}
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------ patient + payment */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line px-4 py-3.5">
              <SectionTitle icon="user">Patient details</SectionTitle>
              <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                <div className="col-span-2">
                  <Field label="Patient Name">{b.patientName}</Field>
                </div>
                <Field label="Age">{b.patientAge} years</Field>
                <Field label="Gender">{b.patientGender ? GENDER_LABELS[b.patientGender] : '—'}</Field>
                <div className="col-span-2">
                  <Field label="Visit">{visit}</Field>
                </div>
              </dl>
            </div>
            <div className="rounded-xl border border-line px-4 py-3.5">
              <SectionTitle icon="lock">Payment</SectionTitle>
              <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
                <Field label="Paid Online">{paid ? money(b.payment!.amount) : money(0)}</Field>
                <Field label="Status">
                  <span className={paid ? 'text-ok' : 'text-warn'}>{b.payment ? PAYMENT_STATUS_LABELS[b.payment.status] : 'No payment'}</span>
                </Field>
                <div className="col-span-2">
                  <Field label="Transaction ID" mono>
                    {b.payment?.transactionId ?? '—'}
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Consultation charges">Payable to the doctor at the centre</Field>
                </div>
              </dl>
            </div>
          </div>

          {/* ------------------------------------------------------------ doctor + clinic */}
          <div className="mt-4 rounded-xl border border-line px-4 py-3.5">
            <SectionTitle icon="hospital">Doctor &amp; clinic</SectionTitle>
            <div className="mt-2.5 grid grid-cols-[1fr_1.6fr] gap-4">
              <dl>
                <Field label="Doctor">{b.doctorName}</Field>
                <p className="mt-0.5 text-[7.5pt] text-muted">Gynaecologist &amp; Fertility Specialist</p>
              </dl>
              <div className="grid gap-1.5 text-[8.5pt] text-ink-soft">
                <p className="flex gap-2">
                  <Icon name="pin" size={13} className="mt-0.5 shrink-0 text-gold-ink" />
                  <span>
                    <span className="font-semibold text-ink">{b.clinic.name}</span>, {b.clinic.address.replace('West Bengal', 'WB')}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Icon name="phone" size={13} className="shrink-0 text-gold-ink" />
                  <span className="font-semibold text-ink">{b.clinic.phoneDisplay}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ notes */}
          <div className="mt-4 rounded-xl bg-blush-light px-4 py-3.5">
            <SectionTitle icon="info">Please note</SectionTitle>
            <ol className="mt-2.5 grid gap-1.5 text-[8.8pt] text-ink-soft">
              {[
                'Registration fee is not refundable.',
                'Please pay the consultation charges to the doctor at the centre.',
                'Please bring this acknowledgement or the SMS to your consultation and for any follow-up.',
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5">
                  <span className="grid size-[15px] shrink-0 place-items-center rounded-full bg-plum text-[7pt] font-bold text-cream">{i + 1}</span>
                  {t}
                </li>
              ))}
              <li className="flex gap-2.5">
                <span className="grid size-[15px] shrink-0 place-items-center rounded-full bg-plum text-[7pt] font-bold text-cream">4</span>
                <span>
                  Please arrive on time for your time slot.{' '}
                  <span className="font-semibold text-danger">(In case of a doctor’s emergency, it may be delayed by up to 1 hour.)</span>
                </span>
              </li>
            </ol>
          </div>
        </div>

        {/* ---------------------------------------------------------------- footer */}
        <div className="border-t border-line bg-cream px-6 py-2.5 text-center text-[7.5pt] text-muted">
          This is a computer-generated acknowledgement and needs no signature.
        </div>
      </div>
    </div>
  );
}
