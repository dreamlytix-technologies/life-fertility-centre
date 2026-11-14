import type { BookingStatus, PaymentStatus } from '../domain';

/** Allowed booking status transitions (admin + system). Anything else is rejected. */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ['PAYMENT_PENDING', 'CONFIRMED', 'CANCELLED'],
  PAYMENT_PENDING: ['CONFIRMED', 'CANCELLED', 'REFUND_PENDING'],
  CONFIRMED: ['RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REFUND_PENDING'],
  RESCHEDULED: ['RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REFUND_PENDING'],
  COMPLETED: [],
  CANCELLED: ['REFUND_PENDING'],
  NO_SHOW: [],
  REFUND_PENDING: ['REFUNDED', 'CANCELLED'],
  REFUNDED: [],
};

export const canTransition = (from: BookingStatus, to: BookingStatus) => BOOKING_TRANSITIONS[from].includes(to);

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  PAYMENT_PENDING: 'Awaiting payment',
  CONFIRMED: 'Confirmed',
  RESCHEDULED: 'Rescheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
  REFUND_PENDING: 'Refund in progress',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  PAID: 'Paid',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
  PARTIALLY_PAID: 'Partially paid',
};
