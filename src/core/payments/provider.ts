/**
 * Payment provider abstraction. Razorpay is implemented; Cashfree / Stripe /
 * PhonePe plug in by implementing this interface and registering in index.ts.
 * Secrets never leave the server — the browser only receives `checkout`.
 */

export interface CreateOrderInput {
  amount: number; // paise
  currency: string;
  receipt: string; // our booking reference
  notes?: Record<string, string>;
  customer?: { name?: string; contact?: string; email?: string };
}

/** Safe-to-expose data the browser needs to open the provider's checkout. */
export interface ClientCheckout {
  provider: string;
  orderId: string;
  amount: number;
  currency: string;
  /** Publishable key only (e.g. rzp_live_xxx key id). Never a secret. */
  publicKey?: string;
  /** Script the browser should load to open the checkout, if any. */
  scriptUrl?: string;
  prefill?: { name?: string; contact?: string; email?: string };
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export type WebhookResult =
  | { kind: 'payment.captured'; eventId: string; orderId: string; paymentId: string; amount: number }
  | { kind: 'payment.failed'; eventId: string; orderId: string; paymentId?: string; reason?: string }
  | { kind: 'refund.processed'; eventId: string; paymentId: string; amount: number; refundId: string }
  | { kind: 'ignored'; eventId: string; type: string };

export interface PaymentProvider {
  readonly name: string;
  createOrder(input: CreateOrderInput): Promise<ClientCheckout>;
  /** Verifies the signature the browser received from the checkout. Must be constant-time. */
  verifyPayment(input: VerifyPaymentInput): boolean;
  /** Verifies and parses a webhook. Returns null if the signature is invalid. */
  parseWebhook(rawBody: string, headers: Headers): WebhookResult | null;
  refund(paymentId: string, amount: number, notes?: Record<string, string>): Promise<{ refundId: string }>;
}

export class PaymentConfigError extends Error {}
