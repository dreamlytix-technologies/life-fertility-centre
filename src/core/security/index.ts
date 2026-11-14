import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Human-friendly booking ID: PREFIX-YYMMDD-XXXX (no I/L/O/U to avoid misreading over the phone). */
export function generateReference(prefix: string, dateISO: string) {
  let suffix = '';
  for (let i = 0; i < 5; i++) suffix += CROCKFORD[randomInt(CROCKFORD.length)];
  return `${prefix}-${dateISO.slice(2).replaceAll('-', '')}-${suffix}`;
}

/** Unguessable token embedded in the confirmation link; only its hash is stored. */
export function generateAccessToken() {
  const token = randomBytes(24).toString('base64url');
  return { token, hash: sha256(token) };
}

export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function clientIp(req: Request) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export const hashIp = (ip: string) => sha256(`${process.env.RATE_LIMIT_SALT ?? 'lfc'}:${ip}`).slice(0, 32);

/**
 * Fixed-window rate limiter. In-memory by default (fine for a single region /
 * demo). Swap `RateLimitBackend` for Upstash/Redis in multi-instance deploys.
 */
export interface RateLimitBackend {
  hit(key: string, windowMs: number): Promise<number>;
}

class MemoryRateLimit implements RateLimitBackend {
  private buckets = new Map<string, { count: number; resetAt: number }>();
  async hit(key: string, windowMs: number) {
    const now = Date.now();
    const b = this.buckets.get(key);
    if (!b || b.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      if (this.buckets.size > 10_000) for (const [k, v] of this.buckets) if (v.resetAt <= now) this.buckets.delete(k);
      return 1;
    }
    b.count += 1;
    return b.count;
  }
}

const g = globalThis as unknown as { __lfcRate?: RateLimitBackend };
export const rateLimitBackend = () => (g.__lfcRate ??= new MemoryRateLimit());

export async function rateLimit(req: Request, bucket: string, limit: number, windowMs: number) {
  const count = await rateLimitBackend().hit(`${bucket}:${hashIp(clientIp(req))}`, windowMs);
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSec: Math.ceil(windowMs / 1000) };
}

/** Reject cross-site form posts (CSRF defence for JSON APIs that browsers call). */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser clients / same-origin GET
  try {
    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
