/** General questions. Answers are factual and avoid any promise of outcome. */
import { CLINIC } from './facts';

export interface Faq {
  q: string;
  a: string;
}

export const FAQ_GROUPS: { id: string; title: string; items: Faq[] }[] = [
  {
    id: 'booking',
    title: 'Booking & visits',
    items: [
      {
        q: 'How do I book a consultation?',
        a: `Choose a date and time on the Book consultation page and pay a ₹${CLINIC.advanceRupees} advance online to hold it. You can also call ${CLINIC.phoneDisplay} during clinic hours.`,
      },
      {
        q: 'What are the consultation hours?',
        a: `${CLINIC.hoursLabel}. The centre is closed on Sundays and listed holidays.`,
      },
      {
        q: 'How much is the consultation fee?',
        a: `The consultation fee is ₹${CLINIC.consultationFeeRupees}. The ₹${CLINIC.advanceRupees} advance paid online is adjusted against it, and the balance is paid at the centre. Tests and procedures are charged separately.`,
      },
      {
        q: 'What should I bring?',
        a: 'Previous prescriptions, blood test and ultrasound reports, any discharge summaries, and the dates of your last few periods. For fertility visits, both partners’ reports if you have them.',
      },
      {
        q: 'Can I change or cancel my booking?',
        a: 'Yes. Please call the centre as early as possible. The cancellation and refund policy explains when the advance is refunded.',
      },
    ],
  },
  {
    id: 'fertility',
    title: 'Fertility treatment',
    items: [
      {
        q: 'When should we see a fertility specialist?',
        a: 'If you have been trying for a year without a pregnancy, or six months if the woman is 35 or older. Sooner if periods are very irregular or there is a known problem.',
      },
      {
        q: 'Does every couple need IVF?',
        a: 'No. Treatment depends on the cause. Many couples are helped by simpler treatment. Dr. Roy will explain the options that fit your situation.',
      },
      {
        q: 'Can you tell us our chances of success?',
        a: 'Your chances depend on many factors, mainly age and the cause of infertility. Dr. Roy will discuss what is realistic for you. No clinic can guarantee a pregnancy.',
      },
      {
        q: 'Is the centre registered under the ART Act?',
        a: 'Assisted reproduction in India is regulated by the ART (Regulation) Act, 2021. The centre’s registration number will be displayed on this site.',
      },
    ],
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy',
    items: [
      {
        q: 'When should I book my first pregnancy visit?',
        a: 'As soon as you have a positive pregnancy test, ideally before 10 weeks.',
      },
      {
        q: 'Can I find out if my baby is a boy or a girl?',
        a: 'No. Sex determination of the foetus is not done at this centre. It is a punishable offence under the PCPNDT Act, 1994.',
      },
      {
        q: 'What should I do if I have bleeding or severe pain in pregnancy?',
        a: 'Do not wait for an appointment. Call the centre, and if the bleeding is heavy, the pain is severe, or you feel faint, go to the nearest hospital emergency department straight away.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    items: [
      {
        q: 'What information do you collect when I book?',
        a: 'Only the patient’s name, age, phone number, an optional email, the reason for the visit, an optional partner name and an optional short note. No medical history or reports are uploaded online.',
      },
      {
        q: 'Who can see my booking?',
        a: 'Only the centre’s staff. Your confirmation page is protected by a private link that only you receive.',
      },
    ],
  },
];

export const HOME_FAQS: Faq[] = [
  FAQ_GROUPS[0]!.items[0]!,
  FAQ_GROUPS[0]!.items[2]!,
  FAQ_GROUPS[1]!.items[0]!,
  FAQ_GROUPS[1]!.items[1]!,
  FAQ_GROUPS[2]!.items[1]!,
];
