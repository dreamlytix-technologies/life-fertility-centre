# Architecture

A single Next.js 16 app. The booking core that the pediatric platform keeps in a shared
package is copied in under `src/core` (framework-agnostic, no UI), adapted for adult
consultations.

```
src/
├─ core/
│  ├─ domain.ts          types: CONSULTATION / EMERGENCY, 5 VISIT_REASONS, PatientDetails
│  ├─ validation.ts      Zod schemas (age 16–70, note ≤ 300, optional partner name)
│  ├─ booking/           time · schedule · slots · emergency · pricing · status · service · ics · tests
│  ├─ payments/          PaymentProvider · Razorpay · Mock (server-signed)
│  ├─ store/             ClinicStore port · MemoryStore (demo, mutex) · PrismaStore (SELECT … FOR UPDATE)
│  ├─ api/               Request→Response handlers mounted under src/app/api
│  ├─ notifications/     console / Resend email
│  ├─ security/          booking IDs, access tokens, rate limit, same-origin
│  ├─ seo/jsonld.ts      MedicalClinic + Physician, FAQPage, Breadcrumb
│  └─ content/base-seed.ts  settings, schedule, closures
├─ content/              site facts, treatments, FAQs, notices, photos, seed
├─ components/           layout · home · sections · booking · ui
├─ lib/                  site metadata, SEO helpers, api access
└─ app/                  routes (see README)
prisma/schema.prisma     PostgreSQL model (Patient, Appointment with visitReason, …)
```

## Booking sequence

1. `GET /api/dates` → bookable dates (window, weekly hours, closures).
2. `GET /api/availability` → slots from live holds + confirmed bookings.
3. `POST /api/bookings` → same-origin + rate limit + Zod (again) → slot re-checked →
   price from settings (client amount ignored) → `store.reserve()` holds the seat atomically
   (409 `SLOT_FULL` on a race, 409 `DUPLICATE` for the same patient on the same day,
   idempotency key replay) → `PAYMENT_PENDING` with a hold timer.
4. Payment checkout → `POST /api/payments/verify` verifies the signature server-side →
   `CONFIRMED`. A payment arriving after the hold expired becomes `LATE_REFUND_REQUIRED`.
5. Confirmation page and `.ics` require the booking access token; the public lookup never
   returns phone, email or partner name.

Emergency appointments exist in the engine (tested) but are disabled in this site's seed
(`emergency.enabled: false`); `/urgent` gives phone/hospital guidance instead.
