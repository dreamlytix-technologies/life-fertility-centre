import type {
  AppointmentRecord,
  AppointmentType,
  BookingStatus,
  ClinicSettings,
  Doctor,
  GalleryImage,
  PaymentRecord,
  PaymentStatus,
  Service,
  SlotPool,
  Testimonial,
} from '../domain';
import type { OccupancyMap } from '../booking/slots';

export interface ReserveInput {
  pool: SlotPool;
  date: string;
  startTime: string;
  endTime: string;
  /** Capacity from the rules; a staff override on the slot row wins. */
  defaultCapacity: number;
  /** Emergency only: max occupied across the whole day. */
  dailyCap?: number;
  appointment: Omit<AppointmentRecord, 'id' | 'payments' | 'createdAt' | 'updatedAt'>;
}

export type ReserveResult =
  | { ok: true; appointment: AppointmentRecord }
  | { ok: false; code: 'SLOT_FULL' | 'SLOT_UNAVAILABLE' | 'DUPLICATE'; message: string; existing?: AppointmentRecord };

export interface ConfirmPaymentInput {
  providerOrderId: string;
  providerPaymentId: string;
  amount?: number;
  now: Date;
  /** Rules capacity for the appointment's slot (used when a hold expired before payment landed). */
  defaultCapacity: (a: AppointmentRecord) => number;
}

export type ConfirmPaymentResult =
  | { outcome: 'CONFIRMED' | 'ALREADY_CONFIRMED'; appointment: AppointmentRecord }
  /** Paid after the hold expired and the slot was re-booked → refund needed. */
  | { outcome: 'LATE_REFUND_REQUIRED'; appointment: AppointmentRecord }
  | { outcome: 'NOT_FOUND' };

export interface AppointmentFilter {
  q?: string; // reference, patient name or phone
  status?: BookingStatus[];
  type?: AppointmentType;
  from?: string; // YYYY-MM-DD
  to?: string;
  paymentStatus?: PaymentStatus;
  limit?: number;
  cursor?: string;
}

export interface ContactMessageInput {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  ipHash?: string;
}

/**
 * Persistence port. `MemoryStore` (demo) and `PrismaStore` (PostgreSQL)
 * implement it; the booking service and API never touch a DB directly.
 * Reservation and payment confirmation MUST be atomic per slot.
 */
export interface ClinicStore {
  readonly kind: 'memory' | 'prisma';

  getSettings(): Promise<ClinicSettings>;
  getDoctor(): Promise<Doctor>;
  listServices(opts?: { includeInactive?: boolean }): Promise<Service[]>;
  listTestimonials(opts?: { includeUnapproved?: boolean }): Promise<Testimonial[]>;
  listGallery(opts?: { includeInactive?: boolean }): Promise<GalleryImage[]>;

  /** Occupied counts per slot start for a date+pool. Expired holds do not count. */
  getOccupancy(date: string, pool: SlotPool, now: Date): Promise<OccupancyMap>;

  /** Lock the slot, re-check capacity, then create a PAYMENT_PENDING hold (or CONFIRMED when nothing is due). */
  reserve(input: ReserveInput, now: Date): Promise<ReserveResult>;
  findByIdempotencyKey(key: string): Promise<AppointmentRecord | null>;
  findByReference(reference: string): Promise<AppointmentRecord | null>;
  findByOrderId(orderId: string): Promise<AppointmentRecord | null>;
  addPayment(appointmentId: string, payment: Omit<PaymentRecord, 'id' | 'createdAt' | 'refundedAmount'>): Promise<PaymentRecord>;
  confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult>;
  markPaymentFailed(providerOrderId: string, reason: string, providerPaymentId?: string): Promise<void>;
  /** Returns false when the event was already processed (webhook replay). */
  claimWebhookEvent(provider: string, eventId: string, type: string): Promise<boolean>;

  updateStatus(id: string, to: BookingStatus, actor: string, note?: string): Promise<AppointmentRecord>;
  listAppointments(filter: AppointmentFilter): Promise<{ items: AppointmentRecord[]; nextCursor?: string }>;

  createContactMessage(input: ContactMessageInput): Promise<{ id: string }>;
}
