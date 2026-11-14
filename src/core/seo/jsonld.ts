import type { ClinicSettings, Doctor, Service } from '../domain';

const DAY_URI = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
  (d) => `https://schema.org/${d}`,
);

/** schema.org specialty enumeration members for an OB/GYN + fertility practice. */
const SPECIALTIES = ['https://schema.org/Gynecologic', 'https://schema.org/Obstetric', 'https://schema.org/ReproductiveMedicine'];

export interface AggregateRatingInput {
  ratingValue: number;
  reviewCount: number;
  /** Where the rating lives (e.g. the Google Business Profile). */
  sourceName: string;
}

const postalAddress = (c: ClinicSettings['clinic']) => ({
  '@type': 'PostalAddress',
  streetAddress: [c.address.line1, c.address.line2].filter(Boolean).join(', '),
  addressLocality: c.address.city,
  addressRegion: c.address.state,
  postalCode: c.address.postalCode,
  addressCountry: c.address.country,
});

/**
 * MedicalClinic with local-SEO fields. `rating` is emitted only when the page
 * visibly shows the same aggregate (never synthesised).
 */
export function clinicJsonLd(
  settings: ClinicSettings,
  services: Service[],
  siteUrl: string,
  opts: { image?: string; rating?: AggregateRatingInput } = {},
) {
  const c = settings.clinic;
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    '@id': `${siteUrl}/#clinic`,
    name: c.name,
    url: siteUrl,
    image: opts.image ? new URL(opts.image, siteUrl).toString() : undefined,
    telephone: c.phone,
    email: c.email,
    medicalSpecialty: SPECIALTIES,
    address: postalAddress(c),
    geo: c.geo ? { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng } : undefined,
    hasMap: c.mapsUrl,
    areaServed: { '@type': 'City', name: c.address.city },
    currenciesAccepted: c.currency,
    openingHoursSpecification: settings.weekly.flatMap((w) =>
      w.ranges.map((r) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_URI[w.dayOfWeek], opens: r.start, closes: r.end })),
    ),
    availableService: services.map((s) => ({ '@type': 'MedicalProcedure', name: s.title, description: s.shortDescription })),
    employee: { '@id': `${siteUrl}/#doctor` },
    potentialAction: { '@type': 'ReserveAction', target: `${siteUrl}/appointment`, name: 'Book a consultation' },
    sameAs: Object.values(c.social ?? {}).filter(Boolean),
    aggregateRating: opts.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: opts.rating.ratingValue,
          reviewCount: opts.rating.reviewCount,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}

export function physicianJsonLd(settings: ClinicSettings, doctor: Doctor, siteUrl: string, opts: { sameAs?: string[] } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${siteUrl}/#doctor`,
    name: `${doctor.honorific} ${doctor.name}`,
    url: `${siteUrl}/about`,
    image: doctor.photoUrl ? new URL(doctor.photoUrl, siteUrl).toString() : undefined,
    medicalSpecialty: SPECIALTIES,
    description: doctor.shortBio,
    knowsLanguage: doctor.languages,
    hasCredential: doctor.qualifications.map((q) => ({ '@type': 'EducationalOccupationalCredential', name: q })),
    worksFor: { '@id': `${siteUrl}/#clinic` },
    address: postalAddress(settings.clinic),
    telephone: settings.clinic.phone,
    sameAs: opts.sameAs,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${siteUrl}${it.path}` })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

/** Serialise for <script type="application/ld+json"> safely (no </script> breakouts). */
export const jsonLdString = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
