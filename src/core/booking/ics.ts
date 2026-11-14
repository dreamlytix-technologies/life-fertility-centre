import type { PublicBooking } from '../domain';
import { APPOINTMENT_TYPE_LABELS } from './pricing';

const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, '\\n');

/** RFC 5545 calendar file for "Add to calendar". */
export function buildIcs(b: PublicBooking, siteUrl: string): string {
  const title = `${b.visitReasonLabel ?? APPOINTMENT_TYPE_LABELS[b.type]} — ${b.doctorName}`;
  const description = [
    `Booking ID: ${b.reference}`,
    `Doctor: ${b.doctorName}`,
    `Patient: ${b.patientName}`,
    `Clinic: ${b.clinic.name} (${b.clinic.phoneDisplay})`,
    'Please arrive 10 minutes early and bring previous prescriptions, test reports and ultrasound films.',
  ]
    .filter(Boolean)
    .join('\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//life-fertility-centre//booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.reference}@${new URL(siteUrl).host}`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(b.scheduledStart)}`,
    `DTEND:${stamp(b.scheduledEnd)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(`${b.clinic.name}, ${b.clinic.address}`)}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

/** Google Calendar template link (no file download needed on mobile). */
export function googleCalendarUrl(b: PublicBooking) {
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${b.visitReasonLabel ?? APPOINTMENT_TYPE_LABELS[b.type]} — ${b.doctorName}`,
    dates: `${stamp(b.scheduledStart)}/${stamp(b.scheduledEnd)}`,
    details: `Booking ID ${b.reference} with ${b.doctorName}`,
    location: `${b.clinic.name}, ${b.clinic.address}`,
  });
  return `https://calendar.google.com/calendar/render?${p}`;
}
