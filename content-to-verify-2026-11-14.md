# Content to verify with Dr. Debchandan Roy (14 Nov 2026)

Everything on the site that states a fact about the doctor or the centre comes from
`src/content/facts.ts`, `src/content/treatments.ts`, `src/content/faqs.ts` and
`src/core/content/base-seed.ts`. Each item below needs a yes / correction before launch.

## 1. Qualifications (sources disagree)

| Source | What it says |
|---|---|
| getmy.clinic listing | MBBS, MD |
| YouTube video description (IVF India, https://www.youtube.com/watch?v=6PdMqzMBmdE) | MBBS, DGO, Diploma in Gynecological Endoscopy (Germany) |
| JustOPD listing | MBBS (Cal), MD (Gynaecology), MRCP-II (Ireland), MRCOG-I (UK), Diploma… |
| Practo | MBBS, Calcutta University, 2004 |

**Currently shown:** "MBBS (Calcutta) · MD (Obstetrics & Gynaecology) · Diploma in
Gynaecological Endoscopy (Germany)". Confirm: MD vs DGO (or both); whether MRCP-II / MRCOG-I
(part exams, not memberships) should be shown at all; the exact name of the German diploma.

## 2. Experience and profile

- Years: listings say **18+, 20+ and 22**. Site uses **"20+ years"** everywhere (stats band, about).
- Worked in Kolkata, Mumbai, Malda (shown on about page).
- Languages: Bengali, English, Hindi (utility bar, about).
- Pronouns he/him (copy throughout).
- Role line: "Obstetrician & gynaecologist · Fertility (IVF) specialist · Laparoscopic gynae surgeon".
- **Medical registration no.**: placeholder "Medical registration no.: [to be added]" in footer/about.

## 3. Contact details (from a ~2-year-old YouTube description; may be stale)

- Phone **+91 87598 35989** (call buttons, utility bar, mobile pill, JSON-LD).
- WhatsApp **+91 75869 63412** (wa.me links).
- Email **debchandanroy@gmail.com** (contact page, footer, JSON-LD). Confirm it is fine to publish
  a personal Gmail, or supply a centre address.

## 4. Address and map

- "Thakurdas Babu Lane, near Employment Exchange Office, Singatala, Mokdumpur, Malda (English
  Bazar), West Bengal 732103".
- **Geo is approximate** (25.0057, 88.1413). Replace with the exact Google Maps pin.
- Google Maps / reviews links are **search URLs**, not the place URL. Replace with the real
  Google Business Profile link (and review link) when available.

## 5. Hours, fees, booking rules

- Hours **Mon–Sat 10:00 AM – 2:00 PM**, Sunday closed. JustDial hints at a possible
  **evening session**: confirm; if real, add a second session in the seed.
- Online slots: 5 minutes, 1 patient per slot (configurable to 2), bookable today plus the next 2 days (calendar shows the month; other dates greyed out).
- Consultation fee **₹600**; online advance **₹200**, balance **₹400** at the centre (both configurable
  in `base-seed.ts`).
- Holiday/closure dates were copied from the template app's exception list. Replace with
  this centre's real closures.
- Draft cancellation rules on `/cancellation-refund`: reschedule by phone at least **4 h**
  before; cancel at least **24 h** before for a full refund of the advance; later cancellation
  or no-show forfeits the advance (one reschedule allowed). Confirm or change.
- Online booking is limited to ages **16–70**; others are asked to call.

## 6. Reputation figures (shown in hero rating card, stats band, JSON-LD)

- Google **4.9★ from 1,233 reviews** (as of Nov 2026).
- Facebook **13.8K followers** (https://www.facebook.com/debchandan.roy/).
- These must be refreshed before launch. Note: Google treats `aggregateRating` on a business's
  own site as self-serving and will not show review stars from it; it is kept only because the
  same figure is visible on the page. Remove from `src/core/seo/jsonld.ts` if preferred.
- No testimonials are used anywhere.

## 7. Services

13 treatment pages: infertility evaluation, IVF & ICSI, IUI, fertility preservation, PGT,
PCOS/PCOD, fibroids, laparoscopy & hysteroscopy, abnormal uterine bleeding, vaginal
infections, pregnancy care, delivery, general gynaecology.

- **IUI** is marked `needsConfirmation` (not clearly listed by sources). Confirm offered.
- Confirm which procedures are done **at this centre** vs referred (IVF lab, PGT, egg freezing,
  delivery: which hospital?). Pages currently say "discuss with Dr. Roy" and avoid outcome claims.
- All medical copy on treatment pages is general information written for this build; it
  needs medical review.

## 8. Legal / statutory

- PCPNDT notice (exact text as briefed): footer, pregnancy page, relevant treatment pages.
- **ART clinic registration no.: [to be added]** (ART (Regulation) Act, 2021): footer and
  fertility pages. Supply the National Registry number.
- Privacy policy, terms and cancellation/refund pages are **drafts**, not legal advice.

## 9. Draft "approach" statements (about page)

Written as reasonable defaults, not sourced. Confirm each or delete:
- "Tests are advised only when they will change the plan."
- "Costs are discussed openly before any procedure."
- "Both partners are seen together where possible."

## 10. Links still missing

- JustDial listing URL: unknown (`LINKS.justdial = null`; link hidden until set).
- JustOPD listing URL: unknown (`LINKS.justopd = null`).
- YouTube: only one video known (6PdMqzMBmdE on the "IVF India" channel). Confirm this is
  Dr. Roy's own video and that embedding is fine.

## 11. Photos

- **No photographs** on the site (Unsplash step blocked; see `public/photos/CREDITS.md`).
- Dr. Roy's portrait is a monogram placeholder. Swap: put the photo at
  `public/photos/dr-debchandan-roy.jpg` and set `DOCTOR_PORTRAIT` in `src/content/photos.ts`.

## Team page (/team)

- The 12 team members now on /team are SAMPLE PROFILES (marked `sample: true`, tagged "Sample profile").
  Replace each with a real staff member before launch.
- Supporting doctors, nursing team and clinic & support staff: names, roles, qualifications and
  (optionally) photos, each with the person's consent. Add them in `src/content/team.ts`; until then
  each group shows a "Details to be added" card.

## Source URLs

- https://www.youtube.com/watch?v=6PdMqzMBmdE (video description: qualifications, phone, WhatsApp, email)
- https://www.facebook.com/debchandan.roy/ (follower count)
- Google Maps / Google reviews for "Life Fertility Centre Mokdumpur Malda" (rating, review count, address)
- getmy.clinic, JustOPD, Practo, JustDial listings for Dr. Debchandan Roy (qualifications,
  experience, hours, fee). Exact listing URLs were not supplied with the brief.
