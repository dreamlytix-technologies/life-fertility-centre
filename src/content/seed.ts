/**
 * Life Fertility Centre — site content for demo mode and `npm run db:seed`.
 * Facts come from src/content/facts.ts (all to be verified, see
 * content-to-verify-2026-11-14.md). No testimonials are seeded: the site shows
 * only the public Google aggregate with a link to the reviews.
 */
import { createSeed, rupees } from '@/core/content/base-seed';
import type { GalleryImage, Service } from '@/core/domain';
import { CLINIC, DOCTOR, LINKS } from './facts';
import { DOCTOR_PORTRAIT, GALLERY } from './photos';
import { TREATMENTS } from './treatments';

const services: Service[] = TREATMENTS.map((t, i) => ({
  slug: t.slug,
  title: t.title,
  shortDescription: t.summary,
  description: t.overview.join('\n\n'),
  highlights: t.whoFor,
  icon: t.icon,
  category: t.category,
  appointmentType: 'CONSULTATION',
  isActive: true,
  sortOrder: i + 1,
}));

const gallery: GalleryImage[] = GALLERY.map((g, i) => ({
  id: g.id,
  src: g.photo.src,
  alt: g.photo.alt,
  caption: g.caption,
  category: g.category,
  width: g.photo.w,
  height: g.photo.h,
  isActive: true,
  sortOrder: i + 1,
}));

export const seed = createSeed({
  clinic: {
    name: CLINIC.name,
    tagline: 'Gynaecology, fertility and pregnancy care in Malda',
    phone: CLINIC.phone,
    phoneDisplay: CLINIC.phoneDisplay,
    whatsapp: CLINIC.whatsapp,
    email: CLINIC.email,
    address: {
      line1: CLINIC.line1,
      line2: CLINIC.line2,
      city: CLINIC.city,
      state: CLINIC.state,
      postalCode: CLINIC.postalCode,
      country: 'IN',
    },
    geo: CLINIC.geo,
    mapsUrl: LINKS.googleMaps,
    mapEmbedUrl: LINKS.mapEmbed,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    locale: 'en-IN',
    social: { facebook: LINKS.facebook, youtube: LINKS.youtubeVideo },
  },
  rules: {
    consultationFee: rupees(CLINIC.consultationFeeRupees),
    // ADVANCE_PAYMENT_AMOUNT: configurable (₹200 for now; 0 = confirm without payment).
    advancePayment: rupees(CLINIC.advanceRupees),
    slotDurationMinutes: 5,
    maxPerSlot: 1,
    // Today + the next 2 days can be booked; the calendar greys out every other date.
    bookingWindowDays: 2,
    referencePrefix: 'LFC',
  },
  // No online emergency booking at this centre: urgent problems → /urgent.
  emergency: { enabled: false },
  doctor: {
    id: 'dr-debchandan-roy',
    slug: 'dr-debchandan-roy',
    honorific: DOCTOR.honorific,
    name: DOCTOR.name,
    photoUrl: DOCTOR_PORTRAIT?.src,
    specialization: 'Obstetrics & Gynaecology · Fertility (IVF) · Laparoscopic gynae surgery',
    qualifications: [...DOCTOR.qualifications],
    experienceSince: DOCTOR.experienceSince,
    shortBio:
      'Dr. Debchandan Roy is an obstetrician and gynaecologist in Malda who works in fertility care and laparoscopic (endoscopic) gynaecological surgery.',
    biography:
      'Dr. Roy has more than 20 years of experience in obstetrics and gynaecology and has worked in hospitals in Kolkata, Mumbai and Malda. At Life Fertility Centre he sees couples for fertility evaluation and treatment, women for gynaecological problems, and expectant mothers through pregnancy.',
    approach:
      'Clear explanations, time for questions and decisions made together, with treatment matched to each patient rather than one plan for everyone.',
    previousExperience: [],
    languages: [...DOCTOR.languages],
    memberships: [],
  },
  services,
  testimonials: [],
  gallery,
});
