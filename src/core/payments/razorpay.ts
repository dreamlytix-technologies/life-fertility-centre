import { createHmac, timingSafeEqual } from 'node:crypto';
import type { ClientCheckout, CreateOrderInput, PaymentProvider, VerifyPaymentInput, WebhookResult } from './provider';
import { PaymentConfigError } from './provider';

const API = 'https://api.razorpay.com/v1';

export function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export class RazorpayProvider implements PaymentProvider {
  readonly name = 'razorpay';
  constructor(
    private readonly keyId: string,
    private readonly keySecret: string,
    private readonly webhookSecret?: string,
  ) {
    if (!keyId || !keySecret) throw new PaymentConfigError('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are required');
  }

  private auth() {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
  }

  async createOrder(input: CreateOrderInput): Promise<ClientCheckout> {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { Authorization: this.auth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: input.amount, currency: input.currency, receipt: input.receipt, notes: input.notes }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
    const order = (await res.json()) as { id: string; amount: number; currency: string };
    return {
      provider: this.name,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      publicKey: this.keyId,
      scriptUrl: 'https://checkout.razorpay.com/v1/checkout.js',
      prefill: input.customer,
    };
  }

  verifyPayment({ orderId, paymentId, signature }: VerifyPaymentInput) {
    const expected = createHmac('sha256', this.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    return safeEqualHex(expected, signature);
  }

  parseWebhook(rawBody: string, headers: Headers): WebhookResult | null {
    const sig = headers.get('x-razorpay-signature');
    if (!this.webhookSecret || !sig) return null;
    const expected = createHmac('sha256', this.webhookSecret).update(rawBody).digest('hex');
    if (!safeEqualHex(expected, sig)) return null;
    const body = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: { entity: { id: string; order_id: string; amount: number; error_description?: string } };
        refund?: { entity: { id: string; payment_id: string; amount: number } };
      };
    };
    const eventId = headers.get('x-razorpay-event-id') ?? `${body.event}:${body.payload?.payment?.entity.id ?? body.payload?.refund?.entity.id}`;
    const p = body.payload?.payment?.entity;
    const r = body.payload?.refund?.entity;
    if (body.event === 'payment.captured' && p)
      return { kind: 'payment.captured', eventId, orderId: p.order_id, paymentId: p.id, amount: p.amount };
    if (body.event === 'payment.failed' && p)
      return { kind: 'payment.failed', eventId, orderId: p.order_id, paymentId: p.id, reason: p.error_description };
    if (body.event === 'refund.processed' && r)
      return { kind: 'refund.processed', eventId, paymentId: r.payment_id, amount: r.amount, refundId: r.id };
    return { kind: 'ignored', eventId, type: body.event };
  }

  async refund(paymentId: string, amount: number, notes?: Record<string, string>) {
    const res = await fetch(`${API}/payments/${encodeURIComponent(paymentId)}/refund`, {
      method: 'POST',
      headers: { Authorization: this.auth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, notes }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Razorpay refund failed (${res.status})`);
    const refund = (await res.json()) as { id: string };
    return { refundId: refund.id };
  }
}
