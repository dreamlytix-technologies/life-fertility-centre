/**
 * Public facts about the practice, gathered from public listings (Nov 2026).
 * Every item here is listed in content-to-verify-2026-11-14.md and must be
 * confirmed by Dr. Roy before launch. Do not add claims that are not here.
 */

export const DOCTOR = {
  honorific: 'Dr.',
  name: 'Debchandan Roy',
  /** Shown on the site. Listings disagree; see the verify file for every variant. */
  qualificationsLine: 'MBBS (Calcutta) · MD (Obstetrics & Gynaecology) · Diploma in Gynaecological Endoscopy (Germany)',
  qualifications: ['MBBS (Calcutta University)', 'MD (Obstetrics & Gynaecology)', 'Diploma in Gynaecological Endoscopy (Germany)'],
  role: 'Obstetrician & gynaecologist · Fertility (IVF) specialist · Laparoscopic gynae surgeon',
  /** Listings say 18+, 20+ and 22 years. "20+" is used everywhere on the site. */
  experienceLabel: '20+ years',
  /** Practo: MBBS, Calcutta University, 2004. Used only for the data model, never displayed as a count. */
  experienceSince: 2004,
  workedIn: ['Kolkata', 'Mumbai', 'Malda'],
  languages: ['Bengali', 'English', 'Hindi'],
  pronoun: { subject: 'he', object: 'him', possessive: 'his' },
} as const;

export const CLINIC = {
  name: 'Life Fertility Centre',
  shortName: 'Life Fertility Centre',
  line1: 'Thakurdas Babu Lane, near Employment Exchange Office',
  /** Short street line used in the footer (no landmark). */
  street: 'Thakurdas Babu Lane',
  line2: 'Singatala, Mokdumpur',
  city: 'Malda',
  district: 'Malda (English Bazar)',
  state: 'West Bengal',
  postalCode: '732103',
  /** Approximate (Mokdumpur, English Bazar). Replace with the exact pin from Google Maps. */
  geo: { lat: 25.0057, lng: 88.1413 },
  phone: '+918759835989',
  phoneDisplay: '+91 87598 35989',
  whatsapp: '917586963412',
  whatsappDisplay: '+91 75869 63412',
  email: 'debchandanroy@gmail.com',
  hoursLabel: 'Mon–Sat · 10:00 AM – 2:00 PM',
  hoursShort: 'Mon–Sat 10–2',
  consultationFeeRupees: 650,
  advanceRupees: 200,
} as const;

export const LINKS = {
  facebook: 'https://www.facebook.com/debchandan.roy/',
  youtubeVideo: 'https://www.youtube.com/watch?v=6PdMqzMBmdE',
  youtubeId: '6PdMqzMBmdE',
  youtubeChannelName: 'IVF India',
  googleMaps: 'https://www.google.com/maps/search/?api=1&query=Life+Fertility+Centre+Mokdumpur+Malda',
  googleReviews: 'https://www.google.com/maps/search/?api=1&query=Life+Fertility+Centre+Mokdumpur+Malda',
  mapEmbed: 'https://www.google.com/maps?q=Life+Fertility+Centre+Mokdumpur+Malda&output=embed',
  /**
   * "Also listed on" links. Paste the exact listing URLs (not known at build time);
   * a link is rendered only when its URL is set.
   */
  justdial: null as string | null,
  justopd: null as string | null,
} as const;

/** Public reputation figures as shown on Google / Facebook (Nov 2026). Update before launch. */
export const REPUTATION = {
  googleRating: 4.9,
  googleReviewCount: 1233,
  googleReviewCountLabel: '1,233',
  facebookFollowersLabel: '13.8K',
  asOf: 'November 2026',
} as const;

/** Statutory notices for an Indian fertility / obstetric practice. */
export const LEGAL = {
  pcpndt: 'Sex determination of the foetus is not done at this centre. It is a punishable offence under the PCPNDT Act, 1994.',
  /** ART (Regulation) Act, 2021: display the National Registry registration number. */
  artRegistration: 'ART clinic registration no.: [to be added]',
  /** Placeholder until the doctor confirms; never invent a number. */
  medicalRegistration: 'Medical registration no.: [to be added]',
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${CLINIC.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
