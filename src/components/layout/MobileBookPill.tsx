'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CLINIC } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';

/** Sticky "Book consultation" pill on small screens (hidden in the booking flow itself). */
export function MobileBookPill() {
  const path = usePathname();
  if (path.startsWith('/appointment')) return null;
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pt-2 pb-[max(0.85rem,env(safe-area-inset-bottom))] lg:hidden"
      data-site-chrome
    >
      <div className="flex w-full max-w-sm items-center gap-1.5 rounded-full bg-plum-deep p-1.5 shadow-[var(--shadow-float)]">
        <Link
          href="/appointment"
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-cream px-4 text-[0.95rem] font-semibold text-plum-deep"
        >
          <Icon name="calendar" size={18} /> Book consultation
        </Link>
        <a
          href={`tel:${CLINIC.phone}`}
          className="flex size-12 flex-none items-center justify-center rounded-full text-cream ring-1 ring-cream/30"
        >
          <Icon name="phone" size={19} />
          <span className="sr-only">Call {CLINIC.phoneDisplay}</span>
        </a>
      </div>
    </div>
  );
}
