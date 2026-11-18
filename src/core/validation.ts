/**
 * Zod schemas shared by the browser (React Hook Form) and the server.
 * The server re-validates everything — client validation is only for UX.
 */
import { z } from 'zod';
import { GENDERS, VISIT_REASONS } from './domain';
import { isHHmm, isISODate } from './booking/time';

const NAME_RE = /^[\p{L}][\p{L}\p{M} .'-]*$/u;

export const phoneSchema = z
  .string({ error: 'Enter a mobile number' })
  .trim()
  .transform((s) => s.replace(/[\s()-]/g, '').replace(/^0/, '').replace(/^(\+?91)(?=\d{10}$)/, ''))
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'));

const personName = (label: string) =>
  z
    .string({ error: `Enter ${label}` })
    .trim()
    .min(2, `${label[0]?.toUpperCase()}${label.slice(1)} must be at least 2 characters`)
    .max(80, 'Please keep this under 80 characters')
    .regex(NAME_RE, 'Use letters, spaces, dots, apostrophes or hyphens');

/** Adult gynaecology / fertility / pregnancy patients: whole years only. */
export const AGE_LIMITS = { min: 16, max: 70 } as const;

const AGE_MESSAGE = `Online booking is for patients aged ${AGE_LIMITS.min}–${AGE_LIMITS.max}. Please call the centre.`;

export const patientSchema = z.object({
  patientName: personName("the patient's name"),
  age: z
    .number({ error: 'Enter age in years' })
    .int('Use whole years')
    .min(AGE_LIMITS.min, AGE_MESSAGE)
    .max(AGE_LIMITS.max, AGE_MESSAGE),
  gender: z.enum(GENDERS, { error: 'Choose gender' }),
  contactNumber: phoneSchema,
  email: z.union([z.literal(''), z.email('Enter a valid email')]).optional(),
  /** '' is treated as "not given" (normalised to undefined by the booking service). */
  partnerName: z.union([z.literal(''), personName("your partner's name")]).optional(),
});
export type PatientInput = z.input<typeof patientSchema>;
export type PatientData = z.output<typeof patientSchema>;

const dateField = z.string().refine(isISODate, 'Choose a date');
const slotField = z.string().refine(isHHmm, 'Choose a time slot');

export const consultationSchema = z.object({
  type: z.literal('CONSULTATION'),
  date: dateField,
  slot: slotField,
  visitReason: z.enum(VISIT_REASONS, { error: 'Choose the reason for your visit' }),
  /** Optional treatment of interest (e.g. when booking from a treatment page). */
  serviceSlug: z.string().max(80).optional(),
  reason: z.string().trim().max(300, 'Please keep the note under 300 characters').optional(),
});

/** Only consultations can be booked online. Urgent problems: /urgent (call, or go to hospital). */
export const appointmentSchema = consultationSchema;
export type AppointmentInput = z.input<typeof appointmentSchema>;

export const bookingRequestSchema = z.object({
  patient: patientSchema,
  appointment: appointmentSchema,
  consent: z.literal(true, { error: 'Please accept the terms and privacy policy' }),
  idempotencyKey: z.uuid(),
  /** Honeypot. Humans never see it; bots fill it. */
  website: z.string().max(0).optional(),
});
export type BookingRequest = z.input<typeof bookingRequestSchema>;

export const verifyPaymentSchema = z.object({
  reference: z.string().min(4).max(40),
  token: z.string().min(16).max(128),
  orderId: z.string().min(4).max(100),
  paymentId: z.string().min(4).max(100),
  signature: z.string().min(16).max(256),
});

export const mockCheckoutSchema = z.object({
  orderId: z.string().min(4).max(100),
  outcome: z.enum(['success', 'failure']),
});

export const availabilityQuerySchema = z.object({
  date: dateField,
  type: z.enum(['CONSULTATION', 'EMERGENCY']).default('CONSULTATION'),
});

export const contactSchema = z.object({
  name: personName('your name'),
  email: z.email('Enter a valid email'),
  phone: z.union([z.literal(''), phoneSchema]).optional(),
  subject: z.string().trim().min(3, 'Add a short subject').max(120, 'Subject is too long'),
  message: z.string().trim().min(10, 'Please write at least 10 characters').max(2000, 'Message is too long'),
  website: z.string().max(0).optional(),
});
export type ContactInput = z.input<typeof contactSchema>;

/** Flatten Zod issues to { "patient.age": "message" } for API error responses. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.');
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
