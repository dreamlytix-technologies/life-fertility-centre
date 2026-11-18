import Link from 'next/link';
import { weeklyTable } from '@/core/booking/schedule';
import type { ClinicSettings } from '@/core/domain';
import { CLINIC, DOCTOR, LEGAL, LINKS, whatsappLink } from '@/content/facts';
import { Icon, LogoMark, type IconName } from '@/components/ui/Icon';

const QUICK_LINKS: [string, string][] = [
  ['/about', 'About Dr. Roy'],
  ['/team', 'Our team'],
  ['/treatments', 'Treatments'],
  ['/fertility', 'Fertility & IVF'],
  ['/pregnancy', 'Pregnancy care'],
  ['/urgent', 'Urgent help'],
  ['/faq', 'FAQ'],
];

const SOCIAL: { href: string; icon: IconName; label: string }[] = [
  { href: LINKS.facebook, icon: 'facebook', label: 'Facebook' },
  { href: LINKS.youtubeVideo, icon: 'youtube', label: 'YouTube' },
  { href: LINKS.googleMaps, icon: 'pin', label: 'Google Maps' },
];

/** Gold double chevron used as the list bullet. */
function Chevrons() {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" className="mt-[0.4rem] shrink-0 text-gold">
      <path d="M3 3.5 7.5 8 3 12.5M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[1.05rem] font-bold tracking-[-0.01em] text-cream">
      {children}
      <span aria-hidden="true" className="mt-3 block h-[3px] w-12 rounded-full bg-gradient-to-r from-gold-pale to-gold" />
    </h2>
  );
}

function ContactItem({ icon, children }: { icon: IconName; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full text-gold-pale ring-1 ring-gold/50">
        <Icon name={icon} size={15} />
      </span>
      <span className="min-w-0 leading-snug">{children}</span>
    </li>
  );
}

export function SiteFooter({ settings }: { settings: ClinicSettings; demo?: boolean }) {
  const days = weeklyTable(settings.weekly);
  const year = new Date().getFullYear();
  const linkCls = 'text-cream/75 transition hover:text-gold-pale';

  return (
    <footer className="on-dark relative isolate overflow-hidden bg-plum-deep pb-28 text-cream/75 lg:pb-0" data-site-chrome>
      {/* Atmosphere: soft glow + concentric rings echoing the logo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -left-40 size-[30rem] rounded-full bg-plum/60 blur-3xl" />
        <svg className="absolute -top-60 -right-60 size-[40rem] text-gold" viewBox="0 0 400 400" fill="none">
          {[60, 100, 140, 180].map((r, i) => (
            <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeOpacity={0.13 - i * 0.025} />
          ))}
        </svg>
      </div>

      {/* Four columns: brand · quick links · schedule · contact */}
      <div className="shell grid gap-12 pt-16 pb-12 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.75fr_1.2fr_1.15fr] lg:gap-10 lg:pt-20">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Life Fertility Centre — home">
            <LogoMark size={46} tone="dark" />
            <span className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-[-0.015em] text-cream">Life Fertility Centre</span>
              <span className="mt-1.5 text-[0.62rem] font-bold tracking-[0.24em] text-gold-pale/85 uppercase">
                {DOCTOR.honorific} {DOCTOR.name}
              </span>
            </span>
          </Link>
          <p className="mt-6 text-[0.86rem] leading-relaxed">
            Fertility, gynaecology and pregnancy care with {DOCTOR.experienceLabel} of experience — unhurried, private and close to
            home.
          </p>
          <p className="mt-4 text-[0.86rem] leading-relaxed">
            We aim to give every woman and couple clear answers, a plan they understand and support at each step.
          </p>
          <ul className="mt-6 flex gap-2.5" aria-label="Find us online">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-full text-cream/85 ring-1 ring-cream/20 transition duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-plum-deep hover:ring-gold"
                >
                  <Icon name={s.icon} size={17} />
                  <span className="sr-only">{s.label} (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Quick links">
          <ColumnTitle>Quick Links</ColumnTitle>
          <ul className="mt-6 grid gap-3 text-[0.88rem]">
            {QUICK_LINKS.map(([href, label]) => (
              <li key={href} className="flex gap-2.5">
                <Chevrons />
                <Link href={href} className={linkCls}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ColumnTitle>Open Schedule</ColumnTitle>
          <ul className="mt-6 grid gap-3 text-[0.88rem]">
            {days.map((d) => (
              <li key={d.dayOfWeek} className="flex gap-2.5">
                <Chevrons />
                <span>
                  <span className="text-cream">{d.day}</span>
                  <span className="text-cream/50"> : </span>
                  <span className={`whitespace-nowrap ${d.open ? 'text-cream/80' : 'font-semibold text-gold-pale'}`}>{d.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Contact Details</ColumnTitle>
          <ul className="mt-6 grid gap-2.5 text-[0.86rem]">
            <ContactItem icon="pin">
              <a href={LINKS.googleMaps} target="_blank" rel="noopener noreferrer" className={linkCls}>
                {CLINIC.street}, {CLINIC.line2}, {CLINIC.city}
                <span className="sr-only"> (directions, opens in a new tab)</span>
              </a>
            </ContactItem>
            <ContactItem icon="phone">
              <a href={`tel:${CLINIC.phone}`} className={linkCls}>
                {CLINIC.phoneDisplay}
              </a>
            </ContactItem>
            <ContactItem icon="whatsapp">
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className={linkCls}>
                {CLINIC.whatsappDisplay}
                <span className="sr-only"> (WhatsApp, opens in a new tab)</span>
              </a>
            </ContactItem>
            <ContactItem icon="mail">
              <a href={`mailto:${CLINIC.email}`} className={`${linkCls} break-all`}>
                {CLINIC.email}
              </a>
            </ContactItem>
          </ul>
          <Link
            href="/appointment"
            className="group mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-pale to-gold px-5 py-3 text-[0.88rem] font-bold text-plum-deep transition hover:brightness-105"
          >
            <Icon name="calendar" size={17} />
            Book a consultation
            <Icon name="arrow" size={17} className="transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Statutory notices */}
      {/* Same width as the footer columns; the box hugs its content. Notice + both registration badges fit on one line on desktops and wrap on smaller screens. */}
      <div className="shell pb-12">
        <div className="relative mx-auto flex w-fit max-w-full flex-wrap items-center gap-x-3 gap-y-2.5 overflow-hidden rounded-2xl bg-black/20 py-3 pr-3 pl-5 ring-1 ring-cream/10">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold-pale to-gold" />
          <p className="flex min-w-0 items-start gap-2 text-[0.72rem] leading-relaxed text-cream sm:items-center">
            <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-gold-pale sm:mt-0" />
            <span>
              <strong className="font-semibold text-gold-pale">PCPNDT notice: </strong>
              {LEGAL.pcpndt}
            </span>
          </p>
          <ul className="flex flex-wrap gap-1.5 text-[0.66rem]">
            {[LEGAL.artRegistration, LEGAL.medicalRegistration].map((r) => (
              <li key={r} className="rounded-full px-2 py-0.5 whitespace-nowrap text-cream/80 ring-1 ring-cream/20">
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Oversized outlined wordmark */}
      <p aria-hidden="true" className="footer-wordmark select-none">
        Life Fertility
      </p>

      {/* Bottom bar: copyright left, policies right */}
      <div className="relative border-t border-cream/10 bg-plum-deep/80 backdrop-blur-sm">
        <div className="shell flex flex-col gap-3 py-5 text-[0.78rem] text-cream/70 md:flex-row md:items-center md:justify-between md:gap-8">
          <p>
            © Copyright {year}. All Rights Reserved. Developed by{' '}
            <a
              href="https://dreamlytix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold-pale underline-offset-4 hover:text-cream hover:underline"
            >
              Dreamlytix
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
          <ul className="flex shrink-0 flex-wrap gap-x-5 gap-y-1">
            {[
              ['/privacy-policy', 'Privacy'],
              ['/terms', 'Terms'],
              ['/cancellation-refund', 'Cancellation & refunds'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href!} className="whitespace-nowrap hover:text-cream">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
