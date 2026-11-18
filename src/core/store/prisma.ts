import { Prisma, PrismaClient } from '@prisma/client';
import type {
  AppointmentRecord,
  BookingStatus,
  ClinicSettings,
  Doctor,
  DoctorExperience,
  GalleryImage,
  PaymentRecord,
  Service,
  SlotPool,
  Testimonial,
} from '../domain';
import { OCCUPYING_STATUSES, type Gender } from '../domain';
import type { OccupancyMap } from '../booking/slots';
import { canTransition } from '../booking/status';
import type {
  AppointmentFilter,
  ClinicStore,
  ConfirmPaymentInput,
  ConfirmPaymentResult,
  ContactMessageInput,
  ReserveInput,
  ReserveResult,
} from './types';

const g = globalThis as unknown as { __lfcPrisma?: PrismaClient };
export const prisma = () => (g.__lfcPrisma ??= new PrismaClient());

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

const appointmentInclude = {
  patient: true,
  payments: { orderBy: { createdAt: 'asc' } },
  service: true,
  slot: true,
} satisfies Prisma.AppointmentInclude;
type AppointmentRow = Prisma.AppointmentGetPayload<{ include: typeof appointmentInclude }>;

function toRecord(a: AppointmentRow): AppointmentRecord {
  return {
    id: a.id,
    reference: a.reference,
    accessTokenHash: a.accessTokenHash,
    type: a.type,
    status: a.status,
    doctorId: a.doctorId,
    serviceSlug: a.service?.slug,
    visitReason: a.visitReason ?? undefined,
    patient: {
      contactNumber: a.patient.phone,
      patientName: a.patient.name,
      age: a.patient.ageYears,
      gender: (a.patient.gender as Gender | null) ?? undefined,
      email: a.patient.email ?? undefined,
      partnerName: a.patient.partnerName ?? undefined,
    },
    date: isoDay(a.slot.date),
    startTime: a.slot.startTime,
    endTime: a.slot.endTime,
    scheduledStart: a.scheduledStart.toISOString(),
    scheduledEnd: a.scheduledEnd.toISOString(),
    reason: a.reason ?? undefined,
    holdExpiresAt: a.holdExpiresAt?.toISOString(),
    consultationFee: a.consultationFee,
    advanceAmount: a.advanceAmount,
    currency: a.currency,
    idempotencyKey: a.idempotencyKey ?? undefined,
    payments: a.payments.map(
      (p): PaymentRecord => ({
        id: p.id,
        provider: p.provider,
        providerOrderId: p.providerOrderId,
        providerPaymentId: p.providerPaymentId ?? undefined,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        failureReason: p.failureReason ?? undefined,
        refundedAmount: p.refundedAmount,
        paidAt: p.paidAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
      }),
    ),
    confirmedAt: a.confirmedAt?.toISOString(),
    cancelledAt: a.cancelledAt?.toISOString(),
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

/** Prisma `where` for appointments that hold capacity right now. */
const occupyingWhere = (now: Date): Prisma.AppointmentWhereInput => ({
  OR: [{ status: { in: [...OCCUPYING_STATUSES] } }, { status: 'PAYMENT_PENDING', holdExpiresAt: { gt: now } }],
});

export class PrismaStore implements ClinicStore {
  readonly kind = 'prisma' as const;
  private settingsCache?: { at: number; value: ClinicSettings };
  constructor(private readonly db: PrismaClient = prisma()) {}

  async getSettings(): Promise<ClinicSettings> {
    if (this.settingsCache && Date.now() - this.settingsCache.at < 30_000) return this.settingsCache.value;
    const [s, schedules, holidays, emergency] = await Promise.all([
      this.db.siteSettings.findUniqueOrThrow({ where: { id: 1 } }),
      this.db.clinicSchedule.findMany({ where: { isActive: true }, orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] }),
      this.db.holiday.findMany({ where: { date: { gte: day(new Date().toISOString().slice(0, 10)) } } }),
      this.db.emergencySchedule.findFirst(),
    ]);
    const value: ClinicSettings = {
      clinic: {
        name: s.clinicName,
        legalName: s.legalName ?? undefined,
        tagline: s.tagline ?? undefined,
        phone: s.phone,
        phoneDisplay: s.phoneDisplay,
        emergencyPhone: s.emergencyPhone ?? undefined,
        emergencyPhoneDisplay: s.emergencyPhoneDisplay ?? undefined,
        whatsapp: s.whatsapp ?? undefined,
        email: s.email,
        address: {
          line1: s.addressLine1,
          line2: s.addressLine2 ?? undefined,
          city: s.city,
          state: s.state,
          postalCode: s.postalCode,
          country: s.country,
        },
        geo: s.latitude != null && s.longitude != null ? { lat: s.latitude, lng: s.longitude } : undefined,
        mapsUrl: s.mapsUrl ?? undefined,
        mapEmbedUrl: s.mapEmbedUrl ?? undefined,
        timezone: s.timezone,
        currency: s.currency,
        locale: s.locale,
      },
      rules: {
        consultationFee: s.consultationFee,
        emergencyFee: s.emergencyFee,
        advancePayment: s.advancePayment,
        emergencyAdvancePayment: s.emergencyAdvancePayment,
        slotDurationMinutes: s.slotDurationMinutes,
        maxPerSlot: s.maxPerSlot,
        bookingWindowDays: s.bookingWindowDays,
        minLeadMinutes: s.minLeadMinutes,
        deskHours: s.deskOpensAt && s.deskClosesAt ? { start: s.deskOpensAt, end: s.deskClosesAt } : null,
        holdMinutes: s.holdMinutes,
        referencePrefix: s.referencePrefix,
      },
      weekly: [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
        dayOfWeek: dow,
        ranges: schedules.filter((r) => r.dayOfWeek === dow).map((r) => ({ start: r.startTime, end: r.endTime })),
      })),
      exceptions: holidays.map((h) => ({
        date: isoDay(h.date),
        type: h.type,
        label: h.label,
        ranges: h.startTime && h.endTime ? [{ start: h.startTime, end: h.endTime }] : undefined,
      })),
      emergency: emergency
        ? {
            enabled: emergency.isEnabled,
            daysOfWeek: emergency.daysOfWeek,
            window: { start: emergency.startTime, end: emergency.endTime },
            slotDurationMinutes: emergency.slotDurationMinutes,
            capacityPerSlot: emergency.capacityPerSlot,
            maxPerDay: emergency.maxPerDay,
            closedOnHolidays: emergency.closedOnHolidays,
            notice: emergency.notice ?? undefined,
          }
        : {
            enabled: false,
            daysOfWeek: [],
            window: { start: '08:00', end: '10:00' },
            slotDurationMinutes: 15,
            capacityPerSlot: 1,
            maxPerDay: 0,
            closedOnHolidays: true,
          },
    };
    this.settingsCache = { at: Date.now(), value };
    return value;
  }

  async getDoctor(): Promise<Doctor> {
    const d = await this.db.doctor.findFirstOrThrow({ where: { isActive: true }, orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] });
    return {
      id: d.id,
      slug: d.slug,
      honorific: d.honorific,
      name: d.name,
      photoUrl: d.photoUrl ?? undefined,
      specialization: d.specialization,
      qualifications: d.qualifications,
      experienceSince: d.experienceSince,
      registrationNo: d.registrationNo ?? undefined,
      shortBio: d.shortBio,
      biography: d.biography,
      approach: d.approach,
      previousExperience: d.previousExperience as unknown as DoctorExperience[],
      languages: d.languages,
      memberships: d.memberships,
    };
  }

  async listServices(opts?: { includeInactive?: boolean }): Promise<Service[]> {
    const rows = await this.db.service.findMany({ where: opts?.includeInactive ? {} : { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return rows.map((s) => ({
      slug: s.slug,
      title: s.title,
      shortDescription: s.shortDescription,
      description: s.description,
      highlights: s.highlights,
      icon: s.icon,
      imageUrl: s.imageUrl ?? undefined,
      category: s.category ?? undefined,
      appointmentType: s.appointmentType,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    }));
  }

  async listTestimonials(opts?: { includeUnapproved?: boolean }): Promise<Testimonial[]> {
    const rows = await this.db.testimonial.findMany({
      where: opts?.includeUnapproved ? {} : { status: 'APPROVED', isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }],
    });
    return rows.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      relation: t.relation ?? undefined,
      content: t.content,
      rating: t.rating ?? undefined,
      source: t.source,
      sourceUrl: t.sourceUrl ?? undefined,
      avatarUrl: t.avatarUrl ?? undefined,
      publishedAt: t.publishedAt.toISOString(),
      status: t.status,
      isActive: t.isActive,
      sortOrder: t.sortOrder,
    }));
  }

  async listGallery(opts?: { includeInactive?: boolean }): Promise<GalleryImage[]> {
    const rows = await this.db.galleryImage.findMany({ where: opts?.includeInactive ? {} : { isActive: true }, orderBy: { sortOrder: 'asc' } });
    return rows.map((i) => ({
      id: i.id,
      src: i.src,
      alt: i.alt,
      caption: i.caption ?? undefined,
      category: i.category,
      width: i.width,
      height: i.height,
      isActive: i.isActive,
      sortOrder: i.sortOrder,
    }));
  }

  async getOccupancy(date: string, pool: SlotPool, now: Date): Promise<OccupancyMap> {
    const slots = await this.db.appointmentSlot.findMany({
      where: { date: day(date), pool },
      include: { _count: { select: { appointments: { where: occupyingWhere(now) } } } },
    });
    const map: OccupancyMap = {};
    for (const s of slots) map[s.startTime] = { occupied: s._count.appointments, capacity: s.capacity, disabled: s.isDisabled };
    return map;
  }

  /**
   * Race-safe reservation:
   * 1. upsert the slot row (unique on doctor/pool/date/start),
   * 2. SELECT … FOR UPDATE to serialise concurrent bookers on that slot,
   * 3. count live occupancy, compare with capacity, insert the hold.
   */
  async reserve(input: ReserveInput, now: Date): Promise<ReserveResult> {
    const a = input.appointment;
    try {
      return await this.db.$transaction(
        async (tx) => {
          if (a.idempotencyKey) {
            const existing = await tx.appointment.findUnique({ where: { idempotencyKey: a.idempotencyKey }, include: appointmentInclude });
            if (existing) return { ok: false, code: 'DUPLICATE', message: 'Booking already created', existing: toRecord(existing) } as const;
          }
          const slot = await tx.appointmentSlot.upsert({
            where: { doctorId_pool_date_startTime: { doctorId: a.doctorId, pool: input.pool, date: day(input.date), startTime: input.startTime } },
            update: {},
            create: {
              doctorId: a.doctorId,
              pool: input.pool,
              date: day(input.date),
              startTime: input.startTime,
              endTime: input.endTime,
              capacity: input.defaultCapacity,
            },
          });
          await tx.$queryRaw`SELECT id FROM "AppointmentSlot" WHERE id = ${slot.id} FOR UPDATE`;
          if (slot.isDisabled) return { ok: false, code: 'SLOT_UNAVAILABLE', message: 'That slot is not available' } as const;

          const occupied = await tx.appointment.count({ where: { slotId: slot.id, ...occupyingWhere(now) } });
          if (occupied >= slot.capacity)
            return { ok: false, code: 'SLOT_FULL', message: 'That slot was just booked. Please pick another time.' } as const;

          if (input.dailyCap !== undefined) {
            const used = await tx.appointment.count({
              where: { slot: { date: day(input.date), pool: input.pool }, ...occupyingWhere(now) },
            });
            if (used >= input.dailyCap) return { ok: false, code: 'SLOT_FULL', message: 'All emergency slots for today are taken.' } as const;
          }

          // Same patient (phone + name), same day, same type, still active → duplicate booking.
          const dup = await tx.appointment.findFirst({
            where: {
              type: a.type,
              slot: { date: day(input.date) },
              patient: { phone: a.patient.contactNumber, name: { equals: a.patient.patientName, mode: 'insensitive' } },
              ...occupyingWhere(now),
            },
          });
          if (dup)
            return {
              ok: false,
              code: 'DUPLICATE',
              message: `${a.patient.patientName} already has a booking on this day (${dup.reference}). Please call the centre to change it.`,
            } as const;

          const patient = await tx.patient.create({
            data: {
              name: a.patient.patientName,
              phone: a.patient.contactNumber,
              email: a.patient.email || null,
              ageYears: a.patient.age,
              gender: a.patient.gender ?? null,
              partnerName: a.patient.partnerName || null,
            },
          });

          const service = a.serviceSlug ? await tx.service.findUnique({ where: { slug: a.serviceSlug } }) : null;

          const created = await tx.appointment.create({
            data: {
              reference: a.reference,
              accessTokenHash: a.accessTokenHash,
              type: a.type,
              status: a.status,
              doctorId: a.doctorId,
              serviceId: service?.id,
              visitReason: a.visitReason ?? null,
              patientId: patient.id,
              slotId: slot.id,
              scheduledStart: new Date(a.scheduledStart),
              scheduledEnd: new Date(a.scheduledEnd),
              reason: a.reason,
              holdExpiresAt: a.holdExpiresAt ? new Date(a.holdExpiresAt) : null,
              consultationFee: a.consultationFee,
              advanceAmount: a.advanceAmount,
              currency: a.currency,
              idempotencyKey: a.idempotencyKey,
              confirmedAt: a.confirmedAt ? new Date(a.confirmedAt) : null,
              events: { create: { toStatus: a.status, actor: 'system', note: 'Created from website' } },
            },
            include: appointmentInclude,
          });
          return { ok: true, appointment: toRecord(created) } as const;
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 10_000 },
      );
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return { ok: false, code: 'DUPLICATE', message: 'This booking was already submitted.' };
      }
      throw err;
    }
  }

  private async findOne(where: Prisma.AppointmentWhereInput) {
    const a = await this.db.appointment.findFirst({ where, include: appointmentInclude });
    return a ? toRecord(a) : null;
  }
  findByIdempotencyKey(key: string) {
    return this.findOne({ idempotencyKey: key });
  }
  findByReference(reference: string) {
    return this.findOne({ reference });
  }
  findByOrderId(orderId: string) {
    return this.findOne({ payments: { some: { providerOrderId: orderId } } });
  }

  async addPayment(appointmentId: string, p: Omit<PaymentRecord, 'id' | 'createdAt' | 'refundedAmount'>): Promise<PaymentRecord> {
    const row = await this.db.payment.create({
      data: {
        appointmentId,
        provider: p.provider,
        providerOrderId: p.providerOrderId,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
      },
    });
    return {
      id: row.id,
      provider: row.provider,
      providerOrderId: row.providerOrderId,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      refundedAmount: 0,
      createdAt: row.createdAt.toISOString(),
    };
  }

  async confirmPayment(input: ConfirmPaymentInput): Promise<ConfirmPaymentResult> {
    return this.db.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { providerOrderId: input.providerOrderId } });
      if (!payment) return { outcome: 'NOT_FOUND' } as const;
      const appt = await tx.appointment.findUniqueOrThrow({ where: { id: payment.appointmentId }, include: appointmentInclude });
      await tx.$queryRaw`SELECT id FROM "AppointmentSlot" WHERE id = ${appt.slotId} FOR UPDATE`;

      if (payment.status === 'PAID' && (appt.status === 'CONFIRMED' || appt.status === 'RESCHEDULED'))
        return { outcome: 'ALREADY_CONFIRMED', appointment: toRecord(appt) } as const;

      await tx.payment.update({
        where: { id: payment.id },
        data: { status: 'PAID', providerPaymentId: input.providerPaymentId, paidAt: input.now },
      });

      let next: BookingStatus = 'CONFIRMED';
      const holdLive = appt.status === 'PAYMENT_PENDING' && !!appt.holdExpiresAt && appt.holdExpiresAt > input.now;
      if (appt.status === 'PAYMENT_PENDING' && !holdLive) {
        const occupied = await tx.appointment.count({
          where: { slotId: appt.slotId, id: { not: appt.id }, ...occupyingWhere(input.now) },
        });
        if (appt.slot.isDisabled || occupied >= appt.slot.capacity) next = 'REFUND_PENDING';
      }

      const updated = await tx.appointment.update({
        where: { id: appt.id },
        data: {
          status: next,
          holdExpiresAt: null,
          confirmedAt: next === 'CONFIRMED' ? input.now : undefined,
          events: {
            create: {
              fromStatus: appt.status,
              toStatus: next,
              actor: 'payment',
              note: next === 'CONFIRMED' ? 'Advance payment verified' : 'Paid after hold expired; slot taken',
            },
          },
        },
        include: appointmentInclude,
      });
      return { outcome: next === 'CONFIRMED' ? 'CONFIRMED' : 'LATE_REFUND_REQUIRED', appointment: toRecord(updated) } as const;
    });
  }

  async markPaymentFailed(providerOrderId: string, reason: string, providerPaymentId?: string) {
    await this.db.payment.updateMany({
      where: { providerOrderId, status: { not: 'PAID' } },
      data: { status: 'FAILED', failureReason: reason.slice(0, 300), providerPaymentId },
    });
  }

  async claimWebhookEvent(provider: string, eventId: string, type: string) {
    try {
      await this.db.webhookEvent.create({ data: { provider, eventId, type } });
      return true;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') return false;
      throw err;
    }
  }

  async updateStatus(id: string, to: BookingStatus, actor: string, note?: string) {
    const current = await this.db.appointment.findUniqueOrThrow({ where: { id } });
    if (!canTransition(current.status, to)) throw new Error(`Cannot change ${current.status} → ${to}`);
    const now = new Date();
    const updated = await this.db.appointment.update({
      where: { id, status: current.status }, // optimistic concurrency
      data: {
        status: to,
        cancelledAt: to === 'CANCELLED' ? now : undefined,
        completedAt: to === 'COMPLETED' ? now : undefined,
        events: { create: { fromStatus: current.status, toStatus: to, actor, note } },
      },
      include: appointmentInclude,
    });
    return toRecord(updated);
  }

  async listAppointments(f: AppointmentFilter) {
    const take = Math.min(f.limit ?? 50, 200);
    const q = f.q?.trim();
    const rows = await this.db.appointment.findMany({
      where: {
        status: f.status?.length ? { in: f.status } : undefined,
        type: f.type,
        slot: f.from || f.to ? { date: { gte: f.from ? day(f.from) : undefined, lte: f.to ? day(f.to) : undefined } } : undefined,
        payments: f.paymentStatus ? { some: { status: f.paymentStatus } } : undefined,
        OR: q
          ? [
              { reference: { contains: q, mode: 'insensitive' } },
              { patient: { name: { contains: q, mode: 'insensitive' } } },
              { patient: { phone: { contains: q } } },
            ]
          : undefined,
      },
      orderBy: [{ scheduledStart: 'asc' }, { id: 'asc' }],
      take: take + 1,
      ...(f.cursor ? { cursor: { id: f.cursor }, skip: 1 } : {}),
      include: appointmentInclude,
    });
    const items = rows.slice(0, take).map(toRecord);
    return { items, nextCursor: rows.length > take ? items.at(-1)?.id : undefined };
  }

  async createContactMessage(input: ContactMessageInput) {
    const row = await this.db.contactMessage.create({ data: { ...input, phone: input.phone || null } });
    return { id: row.id };
  }
}
