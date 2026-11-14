/**
 * Framework-agnostic HTTP handlers (Web Request → Response). Each Next.js app
 * mounts them from thin `app/api/** /route.ts` files:
 *
 *   import { api } from '@/lib/api';
 *   export const GET = api.availability;
 *
 * Every write endpoint: same-origin check → rate limit → Zod validation →
 * server-side business rules. Nothing priced or scheduled is trusted from the client.
 */
import type { AppointmentType, BookingStatus, ClinicSeed } from '../domain';
import { BOOKING_STATUSES, formatAddress } from '../domain';
import { getEmergencyStatus } from '../booking/emergency';
import { buildIcs } from '../booking/ics';
import { quote } from '../booking/pricing';
import { BookingError, createBooking, finalizePaid, getPublicBooking, verifyPayment } from '../booking/service';
import { bookableDates, computeDayAvailability } from '../booking/slots';
import { getOpenStatus } from '../booking/schedule';
import { zonedParts } from '../booking/time';
import { getPaymentProvider, MockProvider } from '../payments';
import { clientIp, hashIp, isSameOrigin, rateLimit, safeEqual } from '../security';
import { getStore, isDemoMode } from '../store';
import { availabilityQuerySchema, contactSchema, fieldErrors, mockCheckoutSchema } from '../validation';

type Handler = (req: Request, ctx?: { params: Promise<Record<string, string>> }) => Promise<Response>;

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...init.headers },
  });

const problem = (status: number, code: string, message: string, fields?: Record<string, string>) =>
  json({ error: { code, message, fields } }, { status });

function guard(fn: Handler, opts: { write?: boolean; limit?: [bucket: string, max: number, windowMs: number] } = {}): Handler {
  return async (req, ctx) => {
    try {
      if (opts.write && !isSameOrigin(req)) return problem(403, 'FORBIDDEN', 'Cross-site request blocked');
      if (opts.limit) {
        const [bucket, max, windowMs] = opts.limit;
        const rl = await rateLimit(req, bucket, max, windowMs);
        if (!rl.ok)
          return problem(429, 'RATE_LIMITED', 'Too many attempts. Please wait a minute and try again.');
      }
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof BookingError) return problem(err.status, err.code, err.message, err.fields);
      console.error('[api]', req.method, new URL(req.url).pathname, err);
      return problem(500, 'SERVER_ERROR', 'Something went wrong on our side. Please try again or call the clinic.');
    }
  };
}

async function readJson(req: Request) {
  const text = await req.text();
  if (text.length > 20_000) throw new BookingError('PAYLOAD_TOO_LARGE', 'Request too large', 413);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new BookingError('BAD_JSON', 'Invalid request body', 400);
  }
}

export function createClinicApi(opts: { seed: ClinicSeed; siteUrl: string }) {
  const store = () => getStore(opts.seed);

  /** Public config: fees for display, services, schedule. */
  const config = guard(async () => {
    const s = await store();
    const [settings, services] = await Promise.all([s.getSettings(), s.listServices()]);
    const now = new Date();
    return json({
      demo: isDemoMode(),
      paymentProvider: getPaymentProvider().name,
      today: zonedParts(now, settings.clinic.timezone).date,
      open: getOpenStatus(settings, now),
      quotes: {
        CONSULTATION: quote('CONSULTATION', settings.rules, settings.clinic.currency),
      },
      holdMinutes: settings.rules.holdMinutes,
      services: services.map(({ slug, title, appointmentType }) => ({ slug, title, appointmentType })),
    });
  });

  /** GET ?type=CONSULTATION → bookable dates in the window (open/closed per day). */
  const dates = guard(async (req) => {
    const type = (new URL(req.url).searchParams.get('type') ?? 'CONSULTATION') as AppointmentType;
    if (!['CONSULTATION', 'EMERGENCY'].includes(type)) return problem(400, 'BAD_TYPE', 'Unknown appointment type');
    const settings = await (await store()).getSettings();
    return json({ dates: bookableDates(settings, type) });
  });

  /** GET ?date=YYYY-MM-DD&type=… → live slot availability (server-computed). */
  const availability = guard(
    async (req) => {
      const parsed = availabilityQuerySchema.safeParse(Object.fromEntries(new URL(req.url).searchParams));
      if (!parsed.success) return problem(422, 'VALIDATION', 'Invalid date or type', fieldErrors(parsed.error));
      const s = await store();
      const now = new Date();
      const settings = await s.getSettings();
      const pool = parsed.data.type === 'EMERGENCY' ? 'EMERGENCY' : 'STANDARD';
      const occupancy = await s.getOccupancy(parsed.data.date, pool, now);
      return json(computeDayAvailability({ ...parsed.data, settings, occupancy, now }));
    },
    { limit: ['availability', 120, 60_000] },
  );

  const emergencyStatus = guard(async () => {
    const s = await store();
    const settings = await s.getSettings();
    const now = new Date();
    const today = zonedParts(now, settings.clinic.timezone).date;
    return json(getEmergencyStatus(settings, await s.getOccupancy(today, 'EMERGENCY', now), now));
  });

  /** POST → validate, hold slot, create payment order. */
  const createBookingHandler = guard(
    async (req) => {
      const result = await createBooking(await store(), await readJson(req));
      return json(result, { status: 201 });
    },
    { write: true, limit: ['booking', 8, 10 * 60_000] },
  );

  /** POST → verify gateway signature on the server and confirm. */
  const verifyPaymentHandler = guard(
    async (req) => json(await verifyPayment(await store(), await readJson(req))),
    { write: true, limit: ['verify', 20, 10 * 60_000] },
  );

  /** POST (demo only) → server-side simulated gateway; returns a server-signed result. */
  const mockCheckout = guard(
    async (req) => {
      const provider = getPaymentProvider();
      if (!(provider instanceof MockProvider)) return problem(404, 'NOT_FOUND', 'Not found');
      const parsed = mockCheckoutSchema.safeParse(await readJson(req));
      if (!parsed.success) return problem(422, 'VALIDATION', 'Invalid request');
      const appt = await (await store()).findByOrderId(parsed.data.orderId);
      if (!appt) return problem(404, 'NOT_FOUND', 'Order not found');
      const result = provider.simulate(parsed.data.orderId, parsed.data.outcome);
      if (!result.ok) await (await store()).markPaymentFailed(parsed.data.orderId, result.reason, result.paymentId);
      return json(result);
    },
    { write: true, limit: ['mock', 30, 10 * 60_000] },
  );

  /** POST from the gateway. Signature-verified, replay-safe, idempotent. */
  const paymentWebhook: Handler = async (req) => {
    try {
      const raw = await req.text();
      const provider = getPaymentProvider();
      const event = provider.parseWebhook(raw, req.headers);
      if (!event) return problem(401, 'BAD_SIGNATURE', 'Invalid signature');
      const s = await store();
      if (!(await s.claimWebhookEvent(provider.name, event.eventId, event.kind))) return json({ ok: true, duplicate: true });
      if (event.kind === 'payment.captured') await finalizePaid(s, event.orderId, event.paymentId, new Date());
      if (event.kind === 'payment.failed') await s.markPaymentFailed(event.orderId, event.reason ?? 'Payment failed', event.paymentId);
      return json({ ok: true });
    } catch (err) {
      console.error('[webhook]', err);
      return problem(500, 'SERVER_ERROR', 'Webhook processing failed'); // provider will retry
    }
  };

  /** GET ?ref=&token= → public booking view (token-gated, no enumeration). */
  const bookingLookup = guard(
    async (req) => {
      const sp = new URL(req.url).searchParams;
      const b = await getPublicBooking(await store(), sp.get('ref') ?? '', sp.get('token') ?? '');
      return b ? json(b) : problem(404, 'NOT_FOUND', 'We could not find that booking. Check the link in your confirmation.');
    },
    { limit: ['lookup', 60, 60_000] },
  );

  /** GET ?ref=&token= → .ics file */
  const bookingIcs = guard(async (req) => {
    const sp = new URL(req.url).searchParams;
    const b = await getPublicBooking(await store(), sp.get('ref') ?? '', sp.get('token') ?? '');
    if (!b) return problem(404, 'NOT_FOUND', 'Booking not found');
    return new Response(buildIcs(b, opts.siteUrl), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="appointment-${b.reference}.ics"`,
        'Cache-Control': 'no-store',
      },
    });
  });

  const contact = guard(
    async (req) => {
      const parsed = contactSchema.safeParse(await readJson(req));
      if (!parsed.success) return problem(422, 'VALIDATION', 'Please check the highlighted fields', fieldErrors(parsed.error));
      if (parsed.data.website) return json({ ok: true }); // honeypot: pretend success
      const { website: _hp, ...msg } = parsed.data;
      await (await store()).createContactMessage({ ...msg, phone: msg.phone || undefined, ipHash: hashIp(clientIp(req)) });
      return json({ ok: true }, { status: 201 });
    },
    { write: true, limit: ['contact', 5, 10 * 60_000] },
  );

  // ------------------------------------------------------------- admin ----
  // Demo: static bearer token (ADMIN_API_TOKEN). With a DB: swap requireAdmin
  // for AdminSession lookup (httpOnly cookie, hashed token, role checks).
  const requireAdmin = (req: Request) => {
    const expected = process.env.ADMIN_API_TOKEN;
    const got = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
    if (!expected || expected.length < 24 || !safeEqual(expected, got)) throw new BookingError('UNAUTHORIZED', 'Unauthorized', 401);
  };

  const adminAppointments = guard(
    async (req) => {
      requireAdmin(req);
      const sp = new URL(req.url).searchParams;
      const status = sp.getAll('status').filter((x): x is BookingStatus => (BOOKING_STATUSES as readonly string[]).includes(x));
      const result = await (await store()).listAppointments({
        q: sp.get('q') ?? undefined,
        status,
        type: (sp.get('type') as AppointmentType | null) ?? undefined,
        from: sp.get('from') ?? undefined,
        to: sp.get('to') ?? undefined,
        limit: Number(sp.get('limit') ?? 50),
        cursor: sp.get('cursor') ?? undefined,
      });
      return json({
        ...result,
        items: result.items.map(({ accessTokenHash: _h, ...a }) => a),
      });
    },
    { limit: ['admin', 300, 60_000] },
  );

  const adminUpdateStatus = guard(
    async (req) => {
      requireAdmin(req);
      const body = (await readJson(req)) as { id?: string; status?: BookingStatus; note?: string };
      if (!body.id || !body.status || !(BOOKING_STATUSES as readonly string[]).includes(body.status))
        return problem(422, 'VALIDATION', 'id and a valid status are required');
      try {
        const a = await (await store()).updateStatus(body.id, body.status, 'admin', body.note?.slice(0, 500));
        const { accessTokenHash: _h, ...safe } = a;
        return json(safe);
      } catch (e) {
        return problem(409, 'INVALID_TRANSITION', (e as Error).message);
      }
    },
    { write: true, limit: ['admin', 300, 60_000] },
  );

  /** Helpers for Server Components (no HTTP hop). */
  const server = {
    store,
    async site() {
      const s = await store();
      const [settings, doctor, services, testimonials, gallery] = await Promise.all([
        s.getSettings(),
        s.getDoctor(),
        s.listServices(),
        s.listTestimonials(),
        s.listGallery(),
      ]);
      return { settings, doctor, services, testimonials, gallery, address: formatAddress(settings.clinic.address) };
    },
    async emergency() {
      const s = await store();
      const settings = await s.getSettings();
      const now = new Date();
      return getEmergencyStatus(settings, await s.getOccupancy(zonedParts(now, settings.clinic.timezone).date, 'EMERGENCY', now), now);
    },
    async booking(ref: string, token: string) {
      return getPublicBooking(await store(), ref, token);
    },
  };

  return {
    config,
    dates,
    availability,
    emergencyStatus,
    createBooking: createBookingHandler,
    verifyPayment: verifyPaymentHandler,
    mockCheckout,
    paymentWebhook,
    bookingLookup,
    bookingIcs,
    contact,
    adminAppointments,
    adminUpdateStatus,
    server,
  };
}

export type ClinicApi = ReturnType<typeof createClinicApi>;
