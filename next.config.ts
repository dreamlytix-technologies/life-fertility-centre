import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * CSP note: Next.js inline bootstrap scripts and our inline JSON-LD need
 * 'unsafe-inline' for script-src. Hardening TODO (see DESIGN.md): move to
 * per-request nonces via proxy.ts + 'strict-dynamic'. No YouTube/Google request is made
 * until the visitor clicks a facade; only youtube-nocookie.com may be framed for video.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://checkout.razorpay.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.razorpay.com https://i.ytimg.com",
  "font-src 'self' data:",
  `connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com${isDev ? ' ws: wss:' : ''}`,
  // YouTube (privacy-enhanced host only) and Google Maps iframes are inserted only after a click (facades).
  'frame-src https://api.razorpay.com https://checkout.razorpay.com https://www.youtube-nocookie.com https://www.google.com https://maps.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
