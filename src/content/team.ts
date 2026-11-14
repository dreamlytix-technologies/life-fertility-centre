import { DOCTOR } from './facts';
import { DOCTOR_PORTRAIT, type PhotoAsset } from './photos';

/**
 * "Our team" page content.
 *
 * RULES
 * - Only real people who work at the centre, with their consent to be shown.
 * - Never use stock photographs of people here. Leave `photo` out and initials are shown.
 * - Qualifications exactly as on their registration; no superlatives.
 * - A group with no members shows a "details to be added" card instead.
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  qualifications?: string;
  /** One or two plain sentences. */
  bio?: string;
  languages?: readonly string[];
  photo?: PhotoAsset | null;
  /**
   * TEMPORARY sample profile, not a real person. Shown with a "Sample profile" tag.
   * Replace with the real staff member's details and delete this flag.
   */
  sample?: true;
}

/** Shorthand for the temporary sample profiles below. */
const sample = (m: Omit<TeamMember, 'sample'>): TeamMember => ({ ...m, sample: true });

export interface TeamGroup {
  id: 'doctors' | 'nursing' | 'support';
  title: string;
  intro: string;
  members: TeamMember[];
}

export const LEAD: TeamMember = {
  id: 'debchandan-roy',
  name: `${DOCTOR.honorific} ${DOCTOR.name}`,
  role: 'Obstetrician, gynaecologist & fertility specialist',
  qualifications: DOCTOR.qualificationsLine,
  bio: 'Sees every patient at the centre himself and leads each treatment plan, from the first fertility consultation to care through pregnancy.',
  languages: DOCTOR.languages,
  photo: DOCTOR_PORTRAIT,
};

export const TEAM_GROUPS: TeamGroup[] = [
  {
    id: 'doctors',
    title: 'Supporting doctors',
    intro: 'Consultants who work alongside Dr. Roy, such as anaesthesia, sonography, embryology and paediatrics.',
    // SAMPLE PROFILES — replace every entry below with real staff before launch.
    members: [
      sample({
        id: 'sample-anaesthetist',
        name: 'Dr. Arindam Sen',
        role: 'Consultant anaesthetist',
        qualifications: 'MBBS, MD (Anaesthesiology)',
        bio: 'Looks after anaesthesia and pain relief for laparoscopic and hysteroscopic procedures and egg collection.',
        languages: ['Bengali', 'English'],
      }),
      sample({
        id: 'sample-sonologist',
        name: 'Dr. Moumita Ghosh',
        role: 'Consultant sonologist',
        qualifications: 'MBBS, DMRD',
        bio: 'Performs follicle-tracking scans and pregnancy ultrasounds, and explains each report to you.',
        languages: ['Bengali', 'English', 'Hindi'],
      }),
      sample({
        id: 'sample-embryologist',
        name: 'Dr. Sayantan Das',
        role: 'Clinical embryologist',
        qualifications: 'M.Sc., Ph.D. (Clinical Embryology)',
        bio: 'Handles laboratory work for IUI and IVF cycles, from sperm preparation to embryo culture.',
        languages: ['Bengali', 'English'],
      }),
      sample({
        id: 'sample-paediatrician',
        name: 'Dr. Priyanka Saha',
        role: 'Consultant paediatrician',
        qualifications: 'MBBS, MD (Paediatrics)',
        bio: 'Examines newborns after delivery and advises parents on early care and vaccinations.',
        languages: ['Bengali', 'Hindi'],
      }),
    ],
  },
  {
    id: 'nursing',
    title: 'Nursing team',
    intro: 'The nurses who prepare you for procedures, look after you on the day and answer your questions afterwards.',
    members: [
      sample({
        id: 'sample-nurse-in-charge',
        name: 'Sr. Rina Mondal',
        role: 'Nurse in charge',
        qualifications: 'B.Sc. Nursing',
        bio: 'Co-ordinates the nursing team and prepares patients for procedures.',
        languages: ['Bengali', 'Hindi'],
      }),
      sample({
        id: 'sample-ivf-nurse',
        name: 'Sr. Puja Sarkar',
        role: 'IVF co-ordinator nurse',
        qualifications: 'GNM',
        bio: 'Guides couples through injection schedules, scan dates and each step of a treatment cycle.',
        languages: ['Bengali', 'English'],
      }),
      sample({
        id: 'sample-ot-nurse',
        name: 'Sr. Mampi Biswas',
        role: 'Operation theatre nurse',
        qualifications: 'GNM',
        bio: 'Assists during keyhole surgery and looks after patients in recovery.',
        languages: ['Bengali'],
      }),
      sample({
        id: 'sample-staff-nurse',
        name: 'Sr. Ananya Roy Chowdhury',
        role: 'Staff nurse',
        qualifications: 'ANM',
        bio: 'Takes vitals before your consultation and helps with dressings and injections.',
        languages: ['Bengali', 'Hindi'],
      }),
    ],
  },
  {
    id: 'support',
    title: 'Clinic & support staff',
    intro: 'Reception, appointments, laboratory and billing: the people you speak to before and after your consultation.',
    members: [
      sample({
        id: 'sample-front-desk',
        name: 'Subhajit Paul',
        role: 'Front desk & appointments',
        bio: 'Books and reschedules appointments and answers calls and WhatsApp messages.',
        languages: ['Bengali', 'English', 'Hindi'],
      }),
      sample({
        id: 'sample-lab-tech',
        name: 'Rakesh Mahato',
        role: 'Laboratory technician',
        qualifications: 'DMLT',
        bio: 'Collects samples and runs routine blood and semen tests.',
        languages: ['Bengali', 'Hindi'],
      }),
      sample({
        id: 'sample-counsellor',
        name: 'Tanushree Basak',
        role: 'Patient counsellor',
        qualifications: 'M.A. (Psychology)',
        bio: 'Talks couples through treatment options, costs and the emotional side of fertility care.',
        languages: ['Bengali', 'English'],
      }),
      sample({
        id: 'sample-billing',
        name: 'Abhijit Kundu',
        role: 'Billing & records',
        bio: 'Prepares bills and estimates and keeps your reports and records in order.',
        languages: ['Bengali', 'Hindi'],
      }),
    ],
  },
];

export const initials = (name: string) =>
  name
    .replace(/^(Dr|Mr|Mrs|Ms|Sr)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join('');
