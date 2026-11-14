'use client';
import { useState } from 'react';
import { CLINIC } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';

/**
 * Map card. The interactive Google map is inserted only when the visitor asks
 * for it, so no third-party request happens on page load. The resting state is
 * an abstract locator (not a fake street map).
 */
export function MapFacade({ embedUrl, mapsUrl }: { embedUrl?: string; mapsUrl?: string }) {
  const [live, setLive] = useState(false);
  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-[var(--radius-card)] border border-line bg-blush lg:min-h-full">
      {live && embedUrl ? (
        <iframe
          title={`Map showing ${CLINIC.name}, Mokdumpur, Malda`}
          src={embedUrl}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <>
          <svg viewBox="0 0 600 420" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden="true">
            <rect width="600" height="420" fill="#F6E3E5" />
            {[60, 110, 160, 210, 260].map((r) => (
              <circle key={r} cx="300" cy="190" r={r} fill="none" stroke="#4A2545" strokeOpacity="0.12" />
            ))}
            <path d="M0 300 C 160 260 260 330 600 250" fill="none" stroke="#C9A25E" strokeWidth="2" strokeDasharray="2 8" strokeLinecap="round" />
          </svg>
          <div className="absolute top-[45%] left-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <span className="rounded-lg bg-plum-deep px-4 py-2 text-[0.85rem] font-semibold whitespace-nowrap text-cream">{CLINIC.name}</span>
            <span aria-hidden="true" className="-mt-1 size-3 rotate-45 bg-plum-deep" />
            <span aria-hidden="true" className="mt-1.5 size-4 rounded-full border-4 border-paper bg-gold" />
          </div>
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-paper/95 p-4 sm:inset-x-5 sm:bottom-5">
            <p className="text-[0.88rem]">
              <span className="block font-semibold">Near Employment Exchange Office, Singatala</span>
              <span className="text-muted">Locator graphic, not a map</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {embedUrl && (
                <button type="button" className="btn btn-quiet btn-sm" onClick={() => setLive(true)}>
                  Load Google map
                </button>
              )}
              {mapsUrl && (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-plum btn-sm">
                  Open in Maps <Icon name="arrowUpRight" size={15} />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
