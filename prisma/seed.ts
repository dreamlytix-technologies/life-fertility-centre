/**
 * Seed a PostgreSQL database from a site's content module.
 *   DATABASE_URL=... npm run db:seed   (= tsx prisma/seed.ts src/content/seed.ts)
 * Idempotent: upserts by natural keys, replaces schedules.
 */
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { PrismaClient, type Prisma } from '@prisma/client';
import type { ClinicSeed } from '../src/core/domain';

const db = new PrismaClient();

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: tsx prisma/seed.ts <path-to-site-seed.ts>');
  const mod = (await import(pathToFileURL(resolve(file)).href)) as { seed: ClinicSeed };
  const { settings, doctor, services, testimonials, gallery } = mod.seed;
  const c = settings.clinic;
  const r = settings.rules;

  const settingsData = {
    clinicName: c.name, legalName: c.legalName, tagline: c.tagline, phone: c.phone, phoneDisplay: c.phoneDisplay,
    emergencyPhone: c.emergencyPhone, emergencyPhoneDisplay: c.emergencyPhoneDisplay, whatsapp: c.whatsapp, email: c.email,
    addressLine1: c.address.line1, addressLine2: c.address.line2, city: c.address.city, state: c.address.state,
    postalCode: c.address.postalCode, country: c.address.country, latitude: c.geo?.lat, longitude: c.geo?.lng,
    mapsUrl: c.mapsUrl, mapEmbedUrl: c.mapEmbedUrl, timezone: c.timezone, currency: c.currency, locale: c.locale,
    consultationFee: r.consultationFee, emergencyFee: r.emergencyFee,
    advancePayment: r.advancePayment, emergencyAdvancePayment: r.emergencyAdvancePayment,
    slotDurationMinutes: r.slotDurationMinutes, maxPerSlot: r.maxPerSlot, bookingWindowDays: r.bookingWindowDays,
    minLeadMinutes: r.minLeadMinutes, deskOpensAt: r.deskHours?.start ?? null, deskClosesAt: r.deskHours?.end ?? null,
    holdMinutes: r.holdMinutes, referencePrefix: r.referencePrefix,
  } satisfies Omit<Prisma.SiteSettingsCreateInput, 'id'>;
  await db.siteSettings.upsert({ where: { id: 1 }, update: settingsData, create: { id: 1, ...settingsData } });

  const doctorData = {
    slug: doctor.slug, honorific: doctor.honorific, name: doctor.name, photoUrl: doctor.photoUrl,
    specialization: doctor.specialization, qualifications: doctor.qualifications, experienceSince: doctor.experienceSince,
    registrationNo: doctor.registrationNo, shortBio: doctor.shortBio, biography: doctor.biography, approach: doctor.approach,
    previousExperience: doctor.previousExperience as unknown as Prisma.InputJsonValue, languages: doctor.languages,
    memberships: doctor.memberships, isPrimary: true,
  };
  await db.doctor.upsert({ where: { slug: doctor.slug }, update: doctorData, create: doctorData });

  await db.clinicSchedule.deleteMany();
  await db.clinicSchedule.createMany({
    data: settings.weekly.flatMap((w) => w.ranges.map((x) => ({ dayOfWeek: w.dayOfWeek, startTime: x.start, endTime: x.end }))),
  });
  await db.holiday.deleteMany();
  await db.holiday.createMany({
    data: settings.exceptions.flatMap((e): Prisma.HolidayCreateManyInput[] =>
      e.type === 'HOLIDAY'
        ? [{ date: new Date(`${e.date}T00:00:00Z`), type: e.type, label: e.label }]
        : (e.ranges ?? []).map((x) => ({ date: new Date(`${e.date}T00:00:00Z`), type: e.type, label: e.label, startTime: x.start, endTime: x.end })),
    ),
  });
  const e = settings.emergency;
  await db.emergencySchedule.deleteMany();
  await db.emergencySchedule.create({
    data: { isEnabled: e.enabled, daysOfWeek: e.daysOfWeek, startTime: e.window.start, endTime: e.window.end, slotDurationMinutes: e.slotDurationMinutes, capacityPerSlot: e.capacityPerSlot, maxPerDay: e.maxPerDay, closedOnHolidays: e.closedOnHolidays, notice: e.notice },
  });

  for (const s of services) await db.service.upsert({ where: { slug: s.slug }, update: s, create: s });
  await db.testimonial.deleteMany();
  await db.testimonial.createMany({ data: testimonials.map(({ id: _id, publishedAt, ...t }) => ({ ...t, publishedAt: new Date(publishedAt) })) });
  await db.galleryImage.deleteMany();
  await db.galleryImage.createMany({ data: gallery.map(({ id: _id, ...g }) => g) });
  console.log(`Seeded ${c.name}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
