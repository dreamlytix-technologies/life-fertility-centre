import Link from 'next/link';
import { CLINIC, whatsappLink } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';

/** Closing call to action: split card, plum left / cream right. */
export function ClosingCta({ title = 'Ready when you are', reason }: { title?: string; reason?: string }) {
  const href = reason ? `/appointment?reason=${reason}` : '/appointment';
  return (
    <section className="pb-20 lg:pb-28">
      <div className="shell">
        <div className="grid overflow-hidden rounded-[var(--radius-card)] border border-line md:grid-cols-[1.3fr_1fr]">
          <div className="on-dark relative overflow-hidden bg-plum p-8 text-cream sm:p-12">
            <span aria-hidden="true" className="absolute -right-20 -bottom-24 size-72 rounded-full border border-gold/40" />
            <p className="kicker">Book a consultation</p>
            <h2 className="t-2 relative mt-3">
              {title}. <span className="accent">Choose a time online.</span>
            </h2>
            <p className="relative mt-4 max-w-md text-cream/80">
              Consultation fee ₹{CLINIC.consultationFeeRupees}. Pay ₹{CLINIC.advanceRupees} online to hold your time; the rest is paid at the
              centre.
            </p>
            <Link href={href} className="btn btn-cream relative mt-7">
              Choose a date &amp; time <Icon name="arrow" size={18} />
            </Link>
          </div>
          <div className="grid content-center gap-4 bg-paper p-8 sm:p-12">
            <p className="kicker">Prefer to talk?</p>
            <a href={`tel:${CLINIC.phone}`} className="flex items-center gap-3 font-display text-[1.45rem] font-semibold text-plum-deep">
              <Icon name="phone" size={22} className="text-gold-ink" /> {CLINIC.phoneDisplay}
            </a>
            <a href={whatsappLink('Hello, I would like to book a consultation at Life Fertility Centre.')} target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-2">
              <Icon name="whatsapp" size={18} /> WhatsApp {CLINIC.whatsappDisplay}
            </a>
            <p className="text-[0.9rem] text-muted">{CLINIC.hoursLabel}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
