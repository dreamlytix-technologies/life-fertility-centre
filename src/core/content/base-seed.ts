/**
 * Engine defaults that the site seed (src/content/seed.ts) extends. In
 * production this lives in PostgreSQL and is edited from the admin; here it
 * seeds demo mode, the tests and `prisma/seed.ts`.
 */
import type { ClinicSeed, ClinicSettings, Service } from '../domain';

export const rupees = (n: number) => Math.round(n * 100);

export const baseSettings: Omit<ClinicSettings, 'clinic'> = {
  rules: {
    consultationFee: rupees(650),
    emergencyFee: rupees(1000),
    advancePayment: rupees(200), // ADVANCE_PAYMENT_AMOUNT — configurable
    emergencyAdvancePayment: rupees(300),
    slotDurationMinutes: 15,
    maxPerSlot: 1,
    bookingWindowDays: 14,
    minLeadMinutes: 30,
    deskHours: null,
    holdMinutes: 10,
    referencePrefix: 'LFC',
  },
  weekly: [
    { dayOfWeek: 0, ranges: [] },
    ...[1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, ranges: [{ start: '10:00', end: '14:00' }] })),
  ],
  exceptions: [
    { date: '2026-11-28', type: 'SPECIAL_HOURS', label: 'Short day', ranges: [{ start: '10:00', end: '13:00' }] },
    { date: '2026-12-25', type: 'HOLIDAY', label: 'Christmas' },
    { date: '2027-01-26', type: 'HOLIDAY', label: 'Republic Day' },
  ],
  /**
   * The engine's optional time-boxed urgent pool. Configured here so the engine
   * tests can exercise it; the site seed switches it OFF (no emergency booking).
   */
  emergency: {
    enabled: true,
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    window: { start: '08:00', end: '10:00' },
    slotDurationMinutes: 15,
    capacityPerSlot: 1,
    maxPerDay: 8,
    closedOnHolidays: true,
  },
};

export function createSeed(seed: Pick<ClinicSeed, 'doctor' | 'testimonials' | 'gallery'> & {
  clinic: ClinicSettings['clinic'];
  rules?: Partial<ClinicSettings['rules']>;
  emergency?: Partial<ClinicSettings['emergency']>;
  services?: Service[];
}): ClinicSeed {
  return {
    settings: {
      ...baseSettings,
      clinic: seed.clinic,
      rules: { ...baseSettings.rules, ...seed.rules },
      emergency: { ...baseSettings.emergency, ...seed.emergency },
    },
    doctor: seed.doctor,
    services: seed.services ?? [],
    testimonials: seed.testimonials,
    gallery: seed.gallery,
  };
}
