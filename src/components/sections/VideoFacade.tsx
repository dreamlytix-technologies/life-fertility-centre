'use client';
import { useState } from 'react';
import { DOCTOR, LINKS } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';

/**
 * Click-to-load YouTube facade. Nothing is requested from YouTube/Google until
 * the visitor presses play; then a privacy-enhanced (youtube-nocookie.com)
 * iframe is inserted. The CSP frame-src allows only that host for video.
 * The poster is the video's own YouTube thumbnail (i.ytimg.com, allowed in CSP img-src).
 */
export function VideoFacade({ title = 'A video from Dr. Debchandan Roy' }: { title?: string }) {
  const [live, setLive] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-card)] bg-plum-deep shadow-[var(--shadow-card)]">
      {live ? (
        <iframe
          className="absolute inset-0 size-full border-0"
          src={`https://www.youtube-nocookie.com/embed/${LINKS.youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button type="button" onClick={() => setLive(true)} className="group on-dark absolute inset-0 flex size-full flex-col justify-between p-5 text-left text-cream sm:p-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube poster, not worth proxying */}
          <img
            src={`https://i.ytimg.com/vi/${LINKS.youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="absolute inset-0 size-full object-cover"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-deep/95 via-plum-deep/45 to-plum-deep/30" />
          <span className="relative kicker">{LINKS.youtubeChannelName} · YouTube</span>
          <span className="relative flex items-end justify-between gap-4">
            <span className="max-w-md">
              <span className="block font-display text-[1.35rem] leading-tight font-semibold sm:text-[1.75rem]">{title}</span>
              <span className="mt-2 block text-[0.85rem] text-cream/80">
                {DOCTOR.honorific} {DOCTOR.name} · Watch on this page
              </span>
            </span>
            <span className="flex size-16 flex-none items-center justify-center rounded-full bg-cream text-plum-deep transition-transform group-hover:scale-105 sm:size-20">
              <Icon name="play" size={28} className="translate-x-0.5" />
              <span className="sr-only">Play video: {title}</span>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
