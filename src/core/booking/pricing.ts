import type { AppointmentType, BookingRules } from '../domain';

export interface PriceQuote {
  type: AppointmentType;
  fee: number; // total visit fee (paise)
  advance: number; // payable online now
  remaining: number; // payable at the clinic
  currency: string;
}

/**
 * Server-authoritative price. The client may *display* a quote from
 * /api/config but the booking API always recomputes it here and ignores any
 * amount sent by the browser.
 */
export function quote(type: AppointmentType, rules: BookingRules, currency = 'INR'): PriceQuote {
  const fee = type === 'EMERGENCY' ? rules.emergencyFee : rules.consultationFee;
  const configuredAdvance = type === 'EMERGENCY' ? rules.emergencyAdvancePayment : rules.advancePayment;
  const advance = Math.max(0, Math.min(configuredAdvance, fee));
  return { type, fee, advance, remaining: fee - advance, currency };
}

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: 'Consultation',
  EMERGENCY: 'Urgent visit',
};
