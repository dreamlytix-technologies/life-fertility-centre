import Image from 'next/image';
import { DOCTOR_PORTRAIT } from '@/content/photos';

/**
 * Decorative, clearly non-photographic artwork for the arched frames (concentric
 * "cell" rings and two botanical stems). It stands in for photography until real
 * pictures of the centre are supplied (see src/content/photos.ts). aria-hidden.
 */
export function ArchArt({ variant = 'plum' }: { variant?: 'plum' | 'blush' }) {
  const dark = variant === 'plum';
  const bg1 = dark ? '#4A2545' : '#F6E3E5';
  const bg2 = dark ? '#2E1530' : '#FBF1F2';
  const ring = dark ? '#EDD9AE' : '#4A2545';
  const stem = dark ? '#E7C3CB' : '#7A5A22';
  return (
    <svg viewBox="0 0 400 560" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bg1} />
          <stop offset="1" stopColor={bg2} />
        </linearGradient>
        <radialGradient id={`n-${variant}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#C9A25E" stopOpacity="0.95" />
          <stop offset="1" stopColor="#C9A25E" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="560" fill={`url(#g-${variant})`} />
      {[150, 118, 86, 56].map((r, i) => (
        <circle key={r} cx="200" cy="230" r={r} fill="none" stroke={ring} strokeOpacity={0.18 + i * 0.12} strokeWidth="1.2" />
      ))}
      <circle cx="236" cy="230" r="86" fill="none" stroke={ring} strokeOpacity="0.35" strokeWidth="1.2" />
      <circle cx="218" cy="230" r="30" fill={`url(#n-${variant})`} />
      <circle cx="218" cy="230" r="9" fill="#C9A25E" />
      {/* botanical stems */}
      <path d="M90 560 C 100 470 120 420 160 380" fill="none" stroke={stem} strokeWidth="1.4" />
      <path d="M128 452 c -30 -8 -44 -30 -42 -52 c 24 2 40 22 42 52 Z" fill={stem} fillOpacity="0.35" />
      <path d="M146 404 c 26 -16 50 -12 62 4 c -18 16 -44 16 -62 -4 Z" fill={stem} fillOpacity="0.28" />
      <path d="M318 560 C 312 500 296 462 268 432" fill="none" stroke={stem} strokeWidth="1.4" />
      <path d="M300 488 c 28 -6 42 -26 40 -46 c -22 2 -38 20 -40 46 Z" fill={stem} fillOpacity="0.3" />
      {[
        [70, 120],
        [330, 96],
        [352, 330],
        [52, 300],
        [300, 160],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" fill={ring} fillOpacity="0.5" />
      ))}
    </svg>
  );
}

/**
 * Dr. Roy's portrait. Shows his real photograph once DOCTOR_PORTRAIT is set in
 * src/content/photos.ts (a one-line swap); until then, a monogram in an arch.
 * Never replace this with a stock photograph.
 */
export function DoctorPortrait({ sizes, className = '', priority = false }: { sizes: string; className?: string; priority?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden="true" className="arch-keyline" />
      <div className="arch relative aspect-[4/5] bg-blush">
        {DOCTOR_PORTRAIT ? (
          <Image
            src={DOCTOR_PORTRAIT.src}
            alt={DOCTOR_PORTRAIT.alt}
            width={DOCTOR_PORTRAIT.w}
            height={DOCTOR_PORTRAIT.h}
            sizes={sizes}
            preload={priority}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center" role="img" aria-label="Monogram for Dr. Debchandan Roy (portrait to be added)">
            <ArchArt variant="blush" />
            <span className="relative font-display text-[4.5rem] leading-none font-bold tracking-[-0.04em] text-plum-deep">DR</span>
            <span className="relative mt-3 rounded-md bg-paper/90 px-3 py-1 text-[0.72rem] font-bold tracking-[0.18em] text-ink-soft uppercase">
              Portrait to be added
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
