/**
 * Line icons drawn for this site (24px grid, 1.5 stroke, round joins).
 * No icon library. Decorative by default (aria-hidden); pass `title` to label one.
 */
import type { SVGProps } from 'react';

const PATHS = {
  phone: 'M5 4h3.2l1.6 4-2 1.3a11 11 0 0 0 6.9 6.9l1.3-2 4 1.6V19a1.5 1.5 0 0 1-1.6 1.5A16.5 16.5 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z',
  whatsapp:
    'M4 20l1.2-3.9A8 8 0 1 1 8 19l-4 1Z M9.3 8.6c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .4-.1.6l-.5.6c.6 1.2 1.6 2.1 2.8 2.7l.6-.6c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.3.3.6-.1.9-.9 1.6-1.8 1.6-3.1-.2-5.8-2.8-6-5.9 0-.6.1-1.2.4-1.7Z',
  mail: 'M3.5 6.5h17v11h-17z M3.8 7l8.2 6 8.2-6',
  pin: 'M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11Z M12 12.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 7.5V12l3 2',
  calendar: 'M4 6.5h16V20H4z M4 10.5h16 M8.5 4v4 M15.5 4v4',
  arrow: 'M5 12h14 M13.5 6.5 19 12l-5.5 5.5',
  arrowLeft: 'M19 12H5 M10.5 6.5 5 12l5.5 5.5',
  arrowUpRight: 'M7 17 17 7 M9 7h8v8',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  close: 'M6 6l12 12 M18 6 6 18',
  menu: 'M4 7h16 M4 12h16 M4 17h10',
  alert: 'M12 4 2.8 19.5h18.4L12 4Z M12 10v4.2 M12 17h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M12 11v5 M12 8h.01',
  lock: 'M6 10.5h12V20H6z M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5',
  shield: 'M12 3.5 5 6v5.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V6l-7-2.5Z',
  copy: 'M9 9h10v11H9z M15 9V4H5v11h4',
  download: 'M12 4v11 M7 10.5l5 5 5-5 M5 20h14',
  star: 'M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8Z',
  play: 'M8 5.5v13l10.5-6.5Z',
  plus: 'M12 5v14 M5 12h14',
  directions: 'M12 3l9 9-9 9-9-9 9-9Z M9 13.5V11h5.5 M12.5 8.5 15 11l-2.5 2.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z M3 12h18 M12 3c2.5 2.6 3.5 5.6 3.5 9s-1 6.4-3.5 9c-2.5-2.6-3.5-5.6-3.5-9s1-6.4 3.5-9Z',
  facebook: 'M14.5 8H16V4.8h-2.2c-2.4 0-3.8 1.5-3.8 4V11H8v3h2v6.5h3.2V14h2.3l.5-3h-2.8V9.2c0-.8.4-1.2 1.3-1.2Z',
  youtube: 'M3.5 8.2c.2-1.4 1.2-2.4 2.6-2.5C8 5.5 10 5.4 12 5.4s4 .1 5.9.3c1.4.1 2.4 1.1 2.6 2.5.2 1.2.3 2.5.3 3.8s-.1 2.6-.3 3.8c-.2 1.4-1.2 2.4-2.6 2.5-1.9.2-3.9.3-5.9.3s-4-.1-5.9-.3c-1.4-.1-2.4-1.1-2.6-2.5-.2-1.2-.3-2.5-.3-3.8s.1-2.6.3-3.8Z M10.3 9.3v5.4l4.6-2.7Z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20.5c.8-3.6 3.8-5.5 7.5-5.5s6.7 1.9 7.5 5.5',
  hospital: 'M4 20.5V7.5h16v13 M2.5 20.5h19 M12 10v5 M9.5 12.5h5 M9 20.5v-3h6v3 M8 4h8v3.5H8z',
  // Treatment icons
  seed: 'M12 20c-4.5 0-7-3.2-7-7.2C5 8.4 8.5 4 12 4s7 4.4 7 8.8c0 4-2.5 7.2-7 7.2Z M12 20v-6.5 M12 13.5c0-2 1.3-3.3 3.2-3.6 M12 15.5c0-1.6-1-2.7-2.6-3',
  cell: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M10 12.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z M15.5 15.5h.01 M14.5 8h.01 M8 16.5h.01',
  flask: 'M9.5 3.5h5 M10.5 3.5v5.2L5 18.2A1.5 1.5 0 0 0 6.3 20.5h11.4a1.5 1.5 0 0 0 1.3-2.3l-5.5-9.5V3.5 M7.5 14.5h9',
  snow: 'M12 3v18 M4.2 7.5l15.6 9 M4.2 16.5l15.6-9 M9.5 4.5 12 7l2.5-2.5 M9.5 19.5 12 17l2.5 2.5',
  helix: 'M7 3c0 6 10 6 10 12 0 3-2 5-2 6 M17 3c0 6-10 6-10 12 0 3 2 5 2 6 M8.2 6.5h7.6 M8.2 17.5h7.6 M9.5 9.5h5 M9.5 14.5h5',
  cycle: 'M19 12a7 7 0 1 1-2.1-5 M19 4.5V7h-2.5 M12 9v3.2l2 1.3',
  leaf: 'M5 19c0-8 5.5-13.5 14-14 0 8.5-5.5 14-14 14Z M5 19l7-7',
  scope: 'M10.5 17.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z M15.5 15.5 21 21 M10.5 7.5v6 M7.5 10.5h6',
  drop: 'M12 3.5s6 6.6 6 10.8a6 6 0 0 1-12 0C6 10.1 12 3.5 12 3.5Z M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5',
  bump: 'M12 5.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z M10.5 8c-2 1-2.5 3-2.5 5 0 2.2 1 3.2 2 4l-.5 4.5 M13 8.2c2.5.6 4.5 2.6 4.5 5.3 0 2.6-1.9 4.1-4.5 4.3l.5 3.7',
  cradle: 'M4 11h16a8 8 0 0 1-16 0Z M7.5 20.5h9 M12 19v1.5 M9 7.5a3 3 0 0 1 6 0',
  heart: 'M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.5,
  title,
  className,
  ...rest
}: { name: IconName; size?: number; strokeWidth?: number; title?: string } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  const filled = name === 'star' || name === 'play';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Logo mark: two offset rings (cells meeting) around a gold nucleus. */
export function LogoMark({ size = 40, tone = 'light', className }: { size?: number; tone?: 'light' | 'dark'; className?: string }) {
  const ring = tone === 'dark' ? '#EDD9AE' : '#4A2545';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="16" cy="20" r="11" fill="none" stroke={ring} strokeWidth="1.6" />
      <circle cx="24" cy="20" r="11" fill="none" stroke={ring} strokeWidth="1.6" strokeOpacity="0.55" />
      <circle cx="20" cy="20" r="3.2" fill="#C9A25E" />
    </svg>
  );
}
