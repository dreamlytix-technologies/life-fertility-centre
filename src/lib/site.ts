import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3103').replace(/\/$/, '');
export const SITE_NAME = 'Life Fertility Centre';
export const SITE_TITLE = 'Life Fertility Centre, Malda — Dr. Debchandan Roy, Gynaecologist & Fertility Specialist';
export const DEFAULT_DESCRIPTION =
  'Life Fertility Centre in Mokdumpur, Malda: gynaecology, fertility (IVF, ICSI, IUI) and pregnancy care with Dr. Debchandan Roy, obstetrician, gynaecologist and laparoscopic surgeon. Mon–Sat 10 AM–2 PM. Book a consultation online.';

/** Per-page metadata with canonical, Open Graph and Twitter cards. */
export function pageMetadata(opts: {
  title?: string;
  description?: string;
  path: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const description = opts.description ?? DEFAULT_DESCRIPTION;
  const fullTitle = opts.title ? `${opts.title} · ${SITE_NAME}` : SITE_TITLE;
  // Social images come from app/opengraph-image.tsx + twitter-image.tsx unless overridden.
  const images = opts.image ? [{ url: opts.image, alt: SITE_NAME }] : undefined;
  return {
    title: opts.title ?? { absolute: fullTitle },
    description,
    alternates: { canonical: opts.path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_IN',
      url: opts.path,
      title: fullTitle,
      description,
      ...(images ? { images } : {}),
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
    robots: opts.noIndex ? { index: false, follow: false } : undefined,
  };
}
