'use client';
/**
 * Browser-side API client for the booking endpoints. Pure fetch wrappers —
 * the server re-validates and re-prices everything.
 */
import type { DayAvailability } from '@/core/booking/slots';
import type { AppointmentType } from '@/core/domain';
import type { ClientCheckout } from '@/core/payments/provider';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-store', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch {
    throw new ApiError(0, 'NETWORK', 'We couldn’t reach the clinic’s server. Check your connection and try again.');
  }
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    const err = (body as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null)?.error;
    throw new ApiError(res.status, err?.code ?? 'SERVER_ERROR', err?.message ?? 'Something went wrong. Please try again.', err?.fields);
  }
  return body as T;
}

export interface BookableDate {
  date: string;
  label: string;
  open: boolean;
  reason?: string;
  message?: string;
}

export const getDates = (type: AppointmentType) => request<{ dates: BookableDate[] }>(`/api/dates?type=${type}`).then((r) => r.dates);

export const getAvailability = (date: string, type: AppointmentType) =>
  request<DayAvailability>(`/api/availability?date=${encodeURIComponent(date)}&type=${type}`);

export interface CreateBookingResponse {
  reference: string;
  token: string;
  status: string;
  holdExpiresAt?: string;
  amountDue: number;
  checkout: ClientCheckout | null;
}

export const createBooking = (body: unknown) =>
  request<CreateBookingResponse>('/api/bookings', { method: 'POST', body: JSON.stringify(body) });

export type MockResult =
  | { ok: true; orderId: string; paymentId: string; signature: string }
  | { ok: false; orderId: string; paymentId: string; reason: string };

export const mockCheckout = (orderId: string, outcome: 'success' | 'failure') =>
  request<MockResult>('/api/payments/mock-checkout', { method: 'POST', body: JSON.stringify({ orderId, outcome }) });

export const verifyPayment = (body: { reference: string; token: string; orderId: string; paymentId: string; signature: string }) =>
  request<{ outcome: string; reference: string; status: string }>('/api/payments/verify', { method: 'POST', body: JSON.stringify(body) });

// ------------------------------------------------------------ razorpay ----
interface RazorpayInstance {
  open(): void;
  on(event: 'payment.failed', cb: (resp: { error?: { description?: string } }) => void): void;
}
declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => RazorpayInstance;
  }
}

let scriptPromise: Promise<void> | null = null;
export function loadScriptOnce(src: string) {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      scriptPromise = null;
      reject(new ApiError(0, 'SCRIPT', 'The payment window could not be loaded. Check your connection and try again.'));
    };
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// ------------------------------------------------------- session resume ---
export interface HeldBooking {
  reference: string;
  token: string;
  holdExpiresAt?: string;
  amountDue: number;
  checkout: ClientCheckout | null;
  type: AppointmentType;
  summary: { title: string; date: string; slotLabel: string; patientName: string };
}

const KEY = 'lfc.pendingBooking';
export const saveHeld = (h: HeldBooking) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(h));
  } catch {
    /* storage unavailable (private mode) */
  }
};
export const loadHeld = (): HeldBooking | null => {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const h = JSON.parse(raw) as HeldBooking;
    if (h.holdExpiresAt && new Date(h.holdExpiresAt).getTime() < Date.now()) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return h;
  } catch {
    return null;
  }
};
export const clearHeld = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

export const newKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
