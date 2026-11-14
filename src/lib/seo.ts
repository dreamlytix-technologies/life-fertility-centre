import { breadcrumbJsonLd, clinicJsonLd, physicianJsonLd } from '@/core/seo/jsonld';
import type { ClinicSettings, Doctor, Service } from '@/core/domain';
import { LINKS, REPUTATION } from '@/content/facts';
import { SITE_URL } from './site';

/**
 * MedicalClinic + Physician. The aggregate rating is included because the same
 * figure is visibly shown on the page (hero card + stats band). Note: Google may
 * treat a business's own rating markup as self-serving and not show stars.
 */
export function practiceJsonLd(settings: ClinicSettings, doctor: Doctor, services: Service[], opts: { rating?: boolean } = {}) {
  const sameAs = [LINKS.facebook, LINKS.youtubeVideo];
  return [
    clinicJsonLd(settings, services, SITE_URL, {
      rating: opts.rating
        ? { ratingValue: REPUTATION.googleRating, reviewCount: REPUTATION.googleReviewCount, sourceName: 'Google' }
        : undefined,
    }),
    physicianJsonLd(settings, doctor, SITE_URL, { sameAs }),
  ];
}

export const crumbs = (items: { name: string; path: string }[]) => breadcrumbJsonLd([{ name: 'Home', path: '/' }, ...items], SITE_URL);
