'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Subtle reveal-on-scroll for elements marked [data-reveal]. Respects reduced motion via CSS. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    // Fallback: a fast scroll can skip past an element without the observer ever seeing it
    // intersect; reveal anything that is already in or above the viewport.
    let frame = 0;
    const sweep = () => {
      frame = 0;
      for (const el of els)
        if (!el.classList.contains('is-revealed') && el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add('is-revealed');
          io.unobserve(el);
        }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(sweep);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);
  return null;
}
