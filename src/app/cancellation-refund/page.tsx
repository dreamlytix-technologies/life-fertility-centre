import { CLINIC } from '@/content/facts';
import { PolicyLayout } from '@/components/sections/PolicyLayout';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Cancellation & Refund Policy',
  description: 'The ₹200 online advance for a consultation at Life Fertility Centre is non-refundable. How to reschedule, and when a payment is returned.',
  path: '/cancellation-refund',
});

export default function CancellationPage() {
  return (
    <PolicyLayout
      title="Cancellation & refund policy"
      path="/cancellation-refund"
      updated="18 November 2026"
      intro={`This policy covers the ₹${CLINIC.advanceRupees} advance paid online to hold a consultation time. The advance is non-refundable.`}
    >
      <h2>Rescheduling</h2>
      <p>
        Call {CLINIC.phoneDisplay} during clinic hours ({CLINIC.hoursLabel}) at least 4 hours before your time and we will move your booking to
        another available time. The advance carries over.
      </p>

      <h2>Cancelling</h2>
      <ul>
        <li>
          <strong>Cancelled by you</strong>, at any time, or not attended: the advance is not refunded. You may ask to reschedule once within 14
          days instead.
        </li>
        <li>
          <strong>Cancelled or moved by the centre</strong> (for example because the doctor is called to an emergency): full refund, or a new time
          of your choice.
        </li>
      </ul>

      <h2>Payment problems</h2>
      <ul>
        <li>If money was taken but your booking was not confirmed, it is refunded automatically.</li>
        <li>
          If you paid after your hold expired and the time had already been taken by someone else, the advance is refunded automatically and you
          will see this on your confirmation page.
        </li>
        <li>If you were charged twice, contact us with your booking ID and the duplicate charge is refunded.</li>
      </ul>

      <h2>How refunds are paid</h2>
      <p>
        Refunds go back to the original payment method through the payment gateway. Banks usually take 5–7 working days to show them.
      </p>

      <h2>Contact</h2>
      <p>
        Phone {CLINIC.phoneDisplay} or email <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a> with your booking ID (it starts with LFC).
      </p>
    </PolicyLayout>
  );
}
