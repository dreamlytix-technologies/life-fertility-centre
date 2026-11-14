import { createHmac, randomBytes } from 'node:crypto';
import type { ClientCheckout, CreateOrderInput, PaymentProvider, VerifyPaymentInput } from './provider';
import { safeEqualHex } from './razorpay';

/**
 * Demo provider with the same security shape as a real gateway: the browser
 * never computes signatures. The demo checkout calls /api/payments/mock-checkout,
 * the *server* signs the result, and verification uses the normal HMAC path.
 */
export class MockProvider implements PaymentProvider {
  readonly name = 'mock';
  private readonly secret: string;
  constructor(secret?: string) {
    this.secret = secret || randomBytes(32).toString('hex');
  }

  async createOrder(input: CreateOrderInput): Promise<ClientCheckout> {
    return {
      provider: this.name,
      orderId: `order_mock_${randomBytes(9).toString('base64url')}`,
      amount: input.amount,
      currency: input.currency,
      prefill: input.customer,
    };
  }

  /** Server-side only: simulate the gateway completing a payment. */
  simulate(orderId: string, outcome: 'success' | 'failure') {
    const paymentId = `pay_mock_${randomBytes(9).toString('base64url')}`;
    if (outcome === 'failure') return { ok: false as const, orderId, paymentId, reason: 'Payment declined (demo)' };
    const signature = createHmac('sha256', this.secret).update(`${orderId}|${paymentId}`).digest('hex');
    return { ok: true as const, orderId, paymentId, signature };
  }

  verifyPayment({ orderId, paymentId, signature }: VerifyPaymentInput) {
    const expected = createHmac('sha256', this.secret).update(`${orderId}|${paymentId}`).digest('hex');
    return safeEqualHex(expected, signature);
  }

  parseWebhook() {
    return null;
  }

  async refund() {
    return { refundId: `rfnd_mock_${randomBytes(6).toString('base64url')}` };
  }
}
