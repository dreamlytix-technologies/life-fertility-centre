import Link from 'next/link';
import type { Notice } from '@/lib/notices';

/**
 * Notice ticker at the very top of the page, above the header.
 * - Pauses while hovered or while a link inside it has keyboard focus.
 * - prefers-reduced-motion: no movement; the strip becomes a swipeable row.
 * - The duplicate copy that makes the loop seamless is aria-hidden + inert.
 */
export function NoticeMarquee({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;
  const seconds = Math.max(30, notices.reduce((n, x) => n + x.message.length, 0) * 0.3);

  const items = (copy: boolean) => (
    <ul className="lfc-ticker__group" aria-hidden={copy || undefined} inert={copy || undefined}>
      {notices.map((n) => (
        <li key={n.id} className="lfc-ticker__item" data-tone={n.tone}>
          <span aria-hidden="true" className="lfc-ticker__ring" />
          {n.tone === 'alert' && <span className="sr-only">Important: </span>}
          <span>{n.message}</span>
          {n.href && n.linkLabel && (
            <Link href={n.href} className="lfc-ticker__link">
              {n.linkLabel}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Notices from the centre" className="lfc-ticker">
      <div className="shell flex items-center gap-3">
        <p className="lfc-ticker__label">Notices</p>
        <div className="lfc-ticker__viewport">
          <div className="lfc-ticker__track" style={{ animationDuration: `${seconds}s` }}>
            {items(false)}
            {items(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
