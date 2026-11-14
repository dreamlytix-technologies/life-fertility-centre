/**
 * Notice marquee content — admin/CMS-editable (one row per notice).
 *
 * Holiday closures and short days are added automatically from the clinic
 * schedule (settings.exceptions), so they don't need to be typed here.
 *
 * - startsOn / endsOn: YYYY-MM-DD in the clinic timezone (inclusive). Omit for "always".
 * - tone: 'info' (default), 'alert' (important), 'celebrate' (good news).
 * - Keep each message under ~90 characters so it reads well while moving.
 * - No offers, discounts or outcome claims (medical advertising rules).
 */
export type NoticeTone = 'info' | 'alert' | 'celebrate';

export interface NoticeRecord {
  id: string;
  message: string;
  href?: string;
  linkLabel?: string;
  tone?: NoticeTone;
  startsOn?: string;
  endsOn?: string;
  isActive: boolean;
  sortOrder: number;
}

export const notices: NoticeRecord[] = [
  {
    id: 'online-booking',
    message: 'Consultations can now be booked online. Mon–Sat, 10:00 AM – 2:00 PM.',
    href: '/appointment',
    linkLabel: 'Book a time',
    tone: 'celebrate',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'bring-reports',
    message: 'Please bring previous prescriptions, test reports and ultrasound films to your visit.',
    tone: 'info',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'urgent',
    message: 'Heavy bleeding or severe pain in pregnancy? Do not wait: go to the nearest hospital.',
    href: '/urgent',
    linkLabel: 'Urgent help',
    tone: 'alert',
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'fertility-couples',
    message: 'Fertility consultations: both partners are welcome to attend the first visit.',
    href: '/fertility',
    linkLabel: 'The journey',
    tone: 'info',
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'pcpndt',
    message: 'Sex determination of the foetus is not done at this centre (PCPNDT Act, 1994).',
    tone: 'info',
    isActive: true,
    sortOrder: 5,
  },
];
