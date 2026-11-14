/**
 * Photo registry. Files live in /public/photos. Intrinsic sizes must be exact so
 * next/image reserves space; alt text must describe what is actually in the frame.
 *
 * STATUS (2026-11-14): only Dr. Roy's portrait (supplied by the user). The Unsplash step could not run (the
 * Unsplash search endpoint answered "Authorization required" to the build
 * machine), so no stock photography ships. Every component that would show a
 * photo renders an art-directed, clearly non-photographic placeholder instead.
 *
 * To add photos:
 *   1. Put the JPG in /public/photos (≈1600px wide, q≈80) and credit it in CREDITS.md.
 *   2. Add an entry below, e.g.
 *        ultrasound: p('ultrasound-scan', 1600, 1067, 'A sonographer moves an ultrasound probe …'),
 *   3. Reference it from the gallery list (GALLERY) or a page.
 *
 * NEVER caption a stock image as Dr. Roy or as this centre.
 */
import type { GalleryCategory } from '@/core/domain';

export type PhotoAsset = { src: string; w: number; h: number; alt: string };

const p = (file: string, w: number, h: number, alt: string): PhotoAsset => ({ src: `/photos/${file}.jpg`, w, h, alt });

export const PHOTOS: Record<string, PhotoAsset> = {
  // e.g. clinicReception: p('clinic-reception', 1600, 1067, 'Reception desk of Life Fertility Centre, Malda'),
};
void p;

/**
 * Dr. Debchandan Roy's portrait.
 *
 * ONE-LINE SWAP: when his real photograph is supplied, save it as
 * /public/photos/dr-debchandan-roy.jpg and replace `null` below with:
 *   p('dr-debchandan-roy', 1200, 1500, 'Dr. Debchandan Roy, gynaecologist and fertility specialist, at Life Fertility Centre in Malda')
 * (use the file's real pixel size). Until then a monogram frame is shown.
 * Do not use a stock photograph here.
 */
export const DOCTOR_PORTRAIT: PhotoAsset | null = {
  src: '/photos/dr-debchandan-roy-desk.png',
  w: 407,
  h: 508,
  alt: 'Dr. Debchandan Roy in a pale pink shirt and dark tie, seated at his desk with hands folded, in front of shelves of books and framed certificates',
};

/** Gallery entries (real photos of the centre only, once supplied). */
export const GALLERY: { id: string; photo: PhotoAsset; category: GalleryCategory; caption?: string }[] = [];

/** Wider crop of the same photograph, used in the home hero's round frame. */
export const DOCTOR_PORTRAIT_WIDE: PhotoAsset | null = {
  src: '/photos/dr-debchandan-roy-office.png',
  w: 587,
  h: 650,
  alt: 'Dr. Debchandan Roy smiling, in a pale pink shirt and dark tie, seated in his office in front of books and framed certificates',
};
