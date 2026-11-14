import { MockProvider } from './mock';
import type { PaymentProvider } from './provider';
import { PaymentConfigError } from './provider';
import { RazorpayProvider } from './razorpay';

export type { ClientCheckout, PaymentProvider } from './provider';
export { MockProvider };

const g = globalThis as unknown as { __lfcPayment?: PaymentProvider };

/** Resolve the configured provider once per process. Server-only. */
export function getPaymentProvider(): PaymentProvider {
  if (g.__lfcPayment) return g.__lfcPayment;
  const name = (process.env.PAYMENT_PROVIDER ?? 'mock').toLowerCase();
  let provider: PaymentProvider;
  switch (name) {
    case 'razorpay':
      provider = new RazorpayProvider(
        process.env.RAZORPAY_KEY_ID ?? '',
        process.env.RAZORPAY_KEY_SECRET ?? '',
        process.env.RAZORPAY_WEBHOOK_SECRET,
      );
      break;
    // case 'cashfree': provider = new CashfreeProvider(...); break;
    // case 'stripe':   provider = new StripeProvider(...);   break;
    case 'mock':
      if (process.env.NODE_ENV === 'production' && process.env.ALLOW_MOCK_PAYMENTS !== 'true' && process.env.VERCEL_ENV === 'production')
        throw new PaymentConfigError('Mock payments are disabled in production. Set PAYMENT_PROVIDER=razorpay.');
      provider = new MockProvider(process.env.MOCK_PAYMENT_SECRET);
      break;
    default:
      throw new PaymentConfigError(`Unknown PAYMENT_PROVIDER "${name}"`);
  }
  g.__lfcPayment = provider;
  return provider;
}
