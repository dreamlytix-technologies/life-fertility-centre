import { CLINIC, LEGAL } from '@/content/facts';
import { PolicyLayout } from '@/components/sections/PolicyLayout';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Terms of Use',
  description: 'Terms for using the Life Fertility Centre website and online consultation booking.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms of use"
      path="/terms"
      updated="14 November 2026"
      intro="Please read these terms before booking. By booking online you agree to them."
    >
      <h2>Information, not advice</h2>
      <p>
        The information on this website is general and educational. It is not a diagnosis or a substitute for a consultation. Treatment outcomes
        vary from person to person, and no result is guaranteed.
      </p>

      <h2>Not for emergencies</h2>
      <p>
        Online booking is for planned consultations only. If you have heavy bleeding, severe pain or any other emergency, go to the nearest
        hospital. See the Urgent help page.
      </p>

      <h2>Online booking</h2>
      <ul>
        <li>Online booking is for patients aged 16 to 70. For anyone else, please call the centre.</li>
        <li>Your time is held for a short period while you pay the advance. If payment is not completed in time, the time is released.</li>
        <li>The consultation fee is ₹{CLINIC.consultationFeeRupees}. The advance of ₹{CLINIC.advanceRupees} is adjusted against it; the balance is paid at the centre. Tests, scans and procedures are charged separately.</li>
        <li>The advance is non-refundable if you cancel or miss the appointment. See the cancellation and refund policy for the exceptions.</li>
        <li>Please give accurate details. The centre may contact you to confirm or, rarely, to reschedule.</li>
        <li>Consultation times are approximate; occasionally a delivery or urgent case may cause a delay.</li>
      </ul>

      <h2>Statutory notices</h2>
      <p>
        <strong>{LEGAL.pcpndt}</strong>
      </p>
      <p>
        Assisted reproductive procedures are provided in accordance with the Assisted Reproductive Technology (Regulation) Act, 2021.{' '}
        {LEGAL.artRegistration}.
      </p>

      <h2>Acceptable use</h2>
      <p>Do not misuse the booking system, submit false bookings or attempt to interfere with the website’s security.</p>

      <h2>Changes and governing law</h2>
      <p>
        These terms may be updated; the version on this page applies. They are governed by the laws of India, with courts at Malda, West Bengal
        having jurisdiction.
      </p>

      <h2>Contact</h2>
      <p>
        {CLINIC.name}, {CLINIC.city}. Phone {CLINIC.phoneDisplay}, email <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>.
      </p>
    </PolicyLayout>
  );
}
