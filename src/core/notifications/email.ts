import type { AppointmentRecord, ClinicSettings, Doctor } from '../domain';
import { formatAddress, formatMoney, VISIT_REASON_LABELS } from '../domain';
import { APPOINTMENT_TYPE_LABELS } from '../booking/pricing';
import { formatDateLong, formatTime12 } from '../booking/time';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailProvider {
  send(msg: EmailMessage): Promise<void>;
}

class ConsoleEmail implements EmailProvider {
  async send(msg: EmailMessage) {
    console.info(`[email:console] → ${msg.to} · ${msg.subject}`);
  }
}

class ResendEmail implements EmailProvider {
  constructor(
    private readonly apiKey: string,
    private readonly from: string,
  ) {}
  async send(msg: EmailMessage) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, to: msg.to, subject: msg.subject, text: msg.text, html: msg.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`Resend failed (${res.status})`);
  }
}

export function getEmailProvider(): EmailProvider {
  if (process.env.EMAIL_PROVIDER === 'resend' && process.env.RESEND_API_KEY)
    return new ResendEmail(process.env.RESEND_API_KEY, process.env.EMAIL_FROM ?? 'Clinic <no-reply@example.com>');
  return new ConsoleEmail();
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export async function sendBookingConfirmation(args: {
  appointment: AppointmentRecord;
  settings: ClinicSettings;
  doctor: Doctor;
  token: string;
}) {
  const { appointment: a, settings, doctor, token } = args;
  if (!a.patient.email) return; // SMS/WhatsApp provider slots in here later
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const link = `${site}/appointment/confirmation?ref=${encodeURIComponent(a.reference)}&token=${encodeURIComponent(token)}`;
  const rows: [string, string][] = [
    ['Booking ID', a.reference],
    ['Patient', a.patient.patientName],
    ['Visit', a.visitReason ? VISIT_REASON_LABELS[a.visitReason] : APPOINTMENT_TYPE_LABELS[a.type]],
    ['Doctor', `${doctor.honorific} ${doctor.name}`],
    ['When', `${formatDateLong(a.date)}, ${formatTime12(a.startTime)}`],
    ['Paid online', formatMoney(a.advanceAmount, a.currency)],
    ['Pay at clinic', formatMoney(a.consultationFee - a.advanceAmount, a.currency)],
    ['Clinic', `${settings.clinic.name}, ${formatAddress(settings.clinic.address)}`],
  ];
  await getEmailProvider().send({
    to: a.patient.email,
    subject: `Appointment confirmed · ${a.reference} · ${settings.clinic.name}`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nView or download: ${link}`,
    html: `<table cellpadding="6">${rows
      .map(([k, v]) => `<tr><td><strong>${escapeHtml(k)}</strong></td><td>${escapeHtml(v)}</td></tr>`)
      .join('')}</table><p><a href="${escapeHtml(link)}">View your confirmation</a></p>`,
  });
}
