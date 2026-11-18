/**
 * Store-agnostic domain types. Mirrors prisma/schema.prisma but is safe to
 * import from client components (no server dependencies).
 * Money is integer paise. Times of day are "HH:mm" in the clinic timezone.
 */

/**
 * CONSULTATION is the only type the public booking API accepts. EMERGENCY stays
 * in the engine (its own time-boxed pool and status model, covered by tests) but
 * is switched off in this site's seed: urgent problems are sent to /urgent.
 */
export const APPOINTMENT_TYPES = ['CONSULTATION', 'EMERGENCY'] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export type SlotPool = 'STANDARD' | 'EMERGENCY';
export const poolFor = (type: AppointmentType): SlotPool => (type === 'EMERGENCY' ? 'EMERGENCY' : 'STANDARD');

/** Why the patient is coming. A fixed list, so no free-text medical history is needed. */
export const GENDERS = ['FEMALE', 'MALE', 'OTHER'] as const;
export type Gender = (typeof GENDERS)[number];
export const GENDER_LABELS: Record<Gender, string> = { FEMALE: 'Female', MALE: 'Male', OTHER: 'Other' };

export const VISIT_REASONS = ['GYNAE', 'FERTILITY', 'PREGNANCY', 'FOLLOW_UP', 'SECOND_OPINION'] as const;
export type VisitReason = (typeof VISIT_REASONS)[number];
export const VISIT_REASON_LABELS: Record<VisitReason, string> = {
  GYNAE: 'Gynae consultation',
  FERTILITY: 'Fertility consultation',
  PREGNANCY: 'Pregnancy check-up',
  FOLLOW_UP: 'Follow-up visit',
  SECOND_OPINION: 'Second opinion',
};

export const BOOKING_STATUSES = [
  'PENDING',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'RESCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
  'REFUND_PENDING',
  'REFUNDED',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIALLY_PAID'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Statuses that occupy capacity in a slot (PAYMENT_PENDING only while its hold is live). */
export const OCCUPYING_STATUSES: readonly BookingStatus[] = ['CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'NO_SHOW'];

export interface TimeRange {
  start: string; // HH:mm
  end: string; // HH:mm (exclusive)
}

/** One entry per weekday. Empty ranges = closed. */
export interface WeeklyHours {
  dayOfWeek: number; // 0 = Sunday
  ranges: TimeRange[];
}

export interface ScheduleException {
  date: string; // YYYY-MM-DD
  type: 'HOLIDAY' | 'SPECIAL_HOURS';
  label: string;
  ranges?: TimeRange[]; // for SPECIAL_HOURS
}

export interface BookingRules {
  consultationFee: number;
  emergencyFee: number;
  /** ADVANCE_PAYMENT_AMOUNT — configurable, never trusted from the client. */
  advancePayment: number;
  emergencyAdvancePayment: number;
  slotDurationMinutes: number;
  maxPerSlot: number;
  bookingWindowDays: number;
  minLeadMinutes: number;
  /** Online booking desk hours. null = accept bookings 24h. */
  deskHours: TimeRange | null;
  holdMinutes: number;
  referencePrefix: string;
}

export interface EmergencyConfig {
  enabled: boolean;
  daysOfWeek: number[];
  window: TimeRange;
  slotDurationMinutes: number;
  capacityPerSlot: number;
  maxPerDay: number;
  closedOnHolidays: boolean;
  notice?: string;
}

export interface PostalAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ClinicInfo {
  name: string;
  legalName?: string;
  tagline?: string;
  phone: string; // E.164 for tel: links
  phoneDisplay: string;
  emergencyPhone?: string;
  emergencyPhoneDisplay?: string;
  whatsapp?: string;
  email: string;
  address: PostalAddress;
  geo?: { lat: number; lng: number };
  mapsUrl?: string;
  mapEmbedUrl?: string;
  timezone: string;
  currency: string;
  locale: string;
  social?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'google', string>>;
}

export interface ClinicSettings {
  clinic: ClinicInfo;
  rules: BookingRules;
  weekly: WeeklyHours[];
  exceptions: ScheduleException[];
  emergency: EmergencyConfig;
}

export interface DoctorExperience {
  role: string;
  organisation: string;
  from: number;
  to?: number;
}

export interface Doctor {
  id: string;
  slug: string;
  honorific: string;
  name: string;
  photoUrl?: string;
  specialization: string;
  qualifications: string[];
  experienceSince: number;
  registrationNo?: string;
  shortBio: string;
  biography: string;
  approach: string;
  previousExperience: DoctorExperience[];
  languages: string[];
  memberships: string[];
}

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  highlights: string[];
  icon: string;
  imageUrl?: string;
  /** Grouping shown on the treatments page: Fertility · Gynaecology · Pregnancy. */
  category?: string;
  appointmentType: AppointmentType;
  isActive: boolean;
  sortOrder: number;
}

export type TestimonialSource = 'GOOGLE' | 'FACEBOOK' | 'INSTAGRAM' | 'PRACTO' | 'JUSTDIAL' | 'IN_CLINIC' | 'OTHER';

/** Only real, consented reviews may ever be stored here. This site seeds none. */
export interface Testimonial {
  id: string;
  authorName: string;
  relation?: string;
  content: string;
  rating?: number;
  source: TestimonialSource;
  sourceUrl?: string;
  avatarUrl?: string;
  publishedAt: string; // ISO date
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isActive: boolean;
  sortOrder: number;
}

export const GALLERY_CATEGORIES = ['CLINIC', 'CONSULTATION', 'PREGNANCY', 'LABORATORY', 'NEWBORN', 'EVENTS'] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const GALLERY_CATEGORY_LABELS: Record<GalleryCategory, string> = {
  CLINIC: 'The centre',
  CONSULTATION: 'Consultation',
  PREGNANCY: 'Pregnancy care',
  LABORATORY: 'Laboratory',
  NEWBORN: 'New beginnings',
  EVENTS: 'Camps & events',
};

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  category: GalleryCategory;
  width: number;
  height: number;
  isActive: boolean;
  sortOrder: number;
}

/** Everything needed to boot a store (demo mode) or seed a database. */
export interface ClinicSeed {
  settings: ClinicSettings;
  doctor: Doctor;
  services: Service[];
  testimonials: Testimonial[];
  gallery: GalleryImage[];
}

// ------------------------------------------------------------ records ------

/**
 * Deliberately minimal because health data is sensitive: no date of birth,
 * address or medical history. Age is whole years.
 */
export interface PatientDetails {
  contactNumber: string;
  patientName: string;
  age: number;
  /** Optional only so records made before the field existed still load. */
  gender?: Gender;
  email?: string;
  /** Optional, for fertility consultations attended as a couple. */
  partnerName?: string;
}

export interface PaymentRecord {
  id: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureReason?: string;
  refundedAmount: number;
  paidAt?: string;
  createdAt: string;
}

export interface AppointmentRecord {
  id: string;
  reference: string;
  accessTokenHash: string;
  type: AppointmentType;
  status: BookingStatus;
  doctorId: string;
  serviceSlug?: string;
  visitReason?: VisitReason;
  patient: PatientDetails;
  date: string; // YYYY-MM-DD clinic-local
  startTime: string; // HH:mm
  endTime: string;
  scheduledStart: string; // ISO
  scheduledEnd: string;
  /** Optional short note from the patient (max 300 characters). */
  reason?: string;
  holdExpiresAt?: string;
  consultationFee: number;
  advanceAmount: number;
  currency: string;
  idempotencyKey?: string;
  payments: PaymentRecord[];
  confirmedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** What the public confirmation page is allowed to see (no phone, email or note). */
export interface PublicBooking {
  reference: string;
  type: AppointmentType;
  status: BookingStatus;
  patientName: string;
  patientAge: number;
  patientGender?: Gender;
  doctorName: string;
  visitReasonLabel?: string;
  serviceTitle?: string;
  date: string;
  startTime: string;
  endTime: string;
  scheduledStart: string;
  scheduledEnd: string;
  consultationFee: number;
  advanceAmount: number;
  remainingAmount: number;
  currency: string;
  payment: {
    status: PaymentStatus;
    transactionId?: string;
    paidAt?: string;
    amount: number;
  } | null;
  holdExpiresAt?: string;
  clinic: {
    name: string;
    phone: string;
    phoneDisplay: string;
    address: string;
    mapsUrl?: string;
  };
}

export const yearsOfExperience = (doctor: Pick<Doctor, 'experienceSince'>, now = new Date()) =>
  Math.max(0, now.getFullYear() - doctor.experienceSince);

export const formatMoney = (paise: number, currency = 'INR', locale = 'en-IN') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);

export const formatAddress = (a: PostalAddress) =>
  [a.line1, a.line2, `${a.city}, ${a.state} ${a.postalCode}`].filter(Boolean).join(', ');
