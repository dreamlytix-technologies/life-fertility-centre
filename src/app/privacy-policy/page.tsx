import { CLINIC } from '@/content/facts';
import { PolicyLayout } from '@/components/sections/PolicyLayout';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How Life Fertility Centre, Malda collects, uses and protects the limited personal information needed to book a consultation.',
  path: '/privacy-policy',
});

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy policy"
      path="/privacy-policy"
      updated="14 November 2026"
      intro="Health information is sensitive. This site collects only what is needed to book and run your consultation, and nothing more."
    >
      <h2>Who we are</h2>
      <p>
        {CLINIC.name} ({CLINIC.line1}, {CLINIC.line2}, {CLINIC.city}, {CLINIC.state} {CLINIC.postalCode}) is the data fiduciary for
        information collected through this website, under the Digital Personal Data Protection Act, 2023.
      </p>

      <h2>What we collect when you book</h2>
      <ul>
        <li>
          <strong>Patient’s name</strong>, <strong>age in years</strong> (online booking is for ages 16–70) and <strong>gender</strong>
        </li>
        <li>
          <strong>Mobile number</strong>, to confirm and, if needed, change your appointment
        </li>
        <li>
          <strong>Email address</strong> (optional), to send your confirmation
        </li>
        <li>
          <strong>Reason for visit</strong>, chosen from a short list (gynae consultation, fertility consultation, pregnancy check-up, follow-up,
          second opinion)
        </li>
        <li>
          <strong>Partner’s name</strong> (optional), for fertility consultations attended as a couple
        </li>
        <li>
          <strong>A short note</strong> (optional, up to 300 characters)
        </li>
        <li>The date, time and payment status of your booking</li>
      </ul>
      <p>
        We do <strong>not</strong> ask for your date of birth, address, medical history, reports or images online, and there is no way to upload
        them. Please bring reports to your consultation instead, and avoid writing medical details in the optional note or the contact form.
      </p>

      <h2>Contact form</h2>
      <p>Your name, email, optional phone number, subject and message, so that we can reply.</p>

      <h2>Payments</h2>
      <p>
        The advance is paid through our payment gateway (Razorpay). Card, UPI and bank details are entered on the gateway’s secure page and are
        never seen or stored by this website. We keep the payment reference, amount and status.
      </p>

      <h2>How we use your information</h2>
      <ul>
        <li>To hold, confirm, reschedule or cancel your appointment</li>
        <li>To contact you about that appointment</li>
        <li>To process refunds under our cancellation policy</li>
        <li>To meet legal record-keeping duties, for example under the ART (Regulation) Act, 2021 and the PCPNDT Act, 1994, where they apply</li>
      </ul>
      <p>We do not sell your information, use it for advertising or share it with anyone except the service providers listed below and where the law requires.</p>

      <h2>Service providers</h2>
      <p>
        Hosting, the database, the payment gateway and (if used) an email delivery service process data on our behalf under contract. YouTube
        and Google Maps load only if you press play or ask for the map; until then no request is made to them.
      </p>

      <h2>Cookies and tracking</h2>
      <p>
        This site uses no advertising or analytics cookies. Your browser’s session storage briefly remembers an unfinished booking so you can
        resume payment; it is cleared when the booking completes or the tab is closed.
      </p>

      <h2>Security and retention</h2>
      <p>
        Data is sent over HTTPS and access is limited to the centre’s staff. Your confirmation page is protected by a private link. Booking
        records are kept for as long as needed for your care and for legal and accounting requirements, then deleted.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your information, or withdraw consent, subject to any legal duty to keep records. Contact{' '}
        <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a> or call {CLINIC.phoneDisplay}. You may also complain to the Data Protection Board
        of India.
      </p>
    </PolicyLayout>
  );
}
