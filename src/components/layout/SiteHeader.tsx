'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CLINIC, whatsappLink } from '@/content/facts';
import { Icon, LogoMark } from '@/components/ui/Icon';
import { useDialog } from '@/lib/useDialog';
import { NAV_ALL, NAV_LEFT, NAV_RIGHT } from './nav';

function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Life Fertility Centre, home">
      <LogoMark size={compact ? 34 : 40} />
      <span className="flex flex-col items-center leading-none">
        <span className="font-display text-[1.2rem] font-bold tracking-[-0.015em] text-plum-deep lg:text-[1.35rem]">
          Life Fertility Centre
        </span>
        {/* -mr offsets the trailing letter-spacing so the line is optically centred */}
        <span className="mt-1 -mr-[0.24em] text-[0.62rem] font-bold tracking-[0.24em] text-gold-ink uppercase">Dr. Debchandan Roy</span>
      </span>
    </Link>
  );
}

const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

/**
 * Centred-wordmark header: four links left, wordmark in the middle, three links
 * and the booking button right. Below lg it becomes wordmark + menu.
 */
export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  useDialog(open, sheet, () => setOpen(false));
  useEffect(() => setOpen(false), [path]);

  const link = (l: { href: string; label: string }) => (
    <Link
      key={l.href}
      href={l.href}
      aria-current={isActive(path, l.href) ? 'page' : undefined}
      className="relative py-2 text-[0.92rem] font-medium text-ink-soft transition-colors hover:text-plum aria-[current=page]:text-plum aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-0 aria-[current=page]:after:-bottom-0.5 aria-[current=page]:after:h-px aria-[current=page]:after:bg-gold"
    >
      {l.label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/85" data-site-chrome>
      <div className="shell hidden h-[5.25rem] grid-cols-[1fr_auto_1fr] items-center gap-6 lg:grid">
        <nav aria-label="Primary" className="flex items-center gap-7">
          {NAV_LEFT.map(link)}
        </nav>
        <Wordmark />
        <div className="flex items-center justify-end gap-7">
          <nav aria-label="Secondary" className="flex items-center gap-7">
            {NAV_RIGHT.map(link)}
          </nav>
          <Link href="/appointment" className="btn btn-plum btn-sm">
            Book consultation
          </Link>
        </div>
      </div>

      <div className="shell flex h-[4.25rem] items-center justify-between gap-3 lg:hidden">
        <Wordmark compact />
        <button
          type="button"
          className="inline-flex size-11 flex-none items-center justify-center rounded-lg border border-line bg-paper text-plum"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <Icon name="menu" size={22} />
          <span className="sr-only">Open menu</span>
        </button>
      </div>

      {open &&
        // Rendered at the end of <body>: the header is sticky with a backdrop blur, which would
        // otherwise become the containing block and push the fixed sheet down by the notice bar.
        createPortal(
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" aria-hidden="true" onClick={() => setOpen(false)} />
          <div
            ref={sheet}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="on-dark animate-rise absolute inset-x-0 top-0 max-h-dvh overflow-y-auto bg-plum-deep px-4 pt-4 pb-8 text-cream"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <LogoMark size={32} tone="dark" />
                <span className="font-display text-xl font-semibold">Life Fertility Centre</span>
              </span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-lg border border-cream/30"
                onClick={() => setOpen(false)}
                data-autofocus
              >
                <Icon name="close" size={22} />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-6">
              <ol className="divide-y divide-cream/15 border-y border-cream/15">
                {[{ href: '/', label: 'Home' }, ...NAV_ALL].map((l, i) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={path === l.href ? 'page' : undefined}
                      className="flex items-baseline gap-4 py-3.5 aria-[current=page]:text-gold-pale"
                    >
                      <span className="numeral w-7 text-lg text-gold-pale">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-[1.35rem] font-semibold leading-none">{l.label}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-6 grid gap-3">
              <Link href="/appointment" className="btn btn-cream">
                Book consultation <Icon name="arrow" size={18} />
              </Link>
              <div className="grid grid-cols-2 gap-3">
                <a href={`tel:${CLINIC.phone}`} className="btn btn-outline-cream">
                  <Icon name="phone" size={18} /> Call
                </a>
                <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-outline-cream">
                  <Icon name="whatsapp" size={18} /> WhatsApp
                </a>
              </div>
              <p className="mt-2 text-center text-sm text-cream/80">{CLINIC.hoursLabel}</p>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </header>
  );
}
