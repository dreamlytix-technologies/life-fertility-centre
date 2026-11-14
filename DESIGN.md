# Life Fertility Centre — Design notes

Next.js 16 App Router, Tailwind v4, port 3103. Clinic data comes from the booking core in
`src/core` through `src/lib/api.ts`; public facts live in `src/content/facts.ts`.

## Concept

**A quiet consulting-room monograph.** Tall arched frames, concentric "cell" rings (two
overlapping circles around a gold nucleus is the logo), Figtree (one family for headlines and body) with
plum colour accents, and squared-off controls. Fertility and pregnancy are emotional subjects,
so the tone is calm and factual: no superlatives, no outcome promises, statutory notices
shown plainly (PCPNDT, ART Act).

### How it differs from LittleBloom (same palette, different design)

| | LittleBloom | Life Fertility Centre |
|---|---|---|
| Type | Playfair Display 400 + Lato | **Figtree only (headings 650–700, body 400–600)** |
| Chrome | Marquee + left-logo header + emergency pill | **Slim plum utility bar** (live open status, phone, WhatsApp, languages) → blush ticker → **centred-wordmark header** (4 links · wordmark · 3 links + Book) |
| Buttons | Pills everywhere | **Squared 0.5rem controls**; the only pill is the mobile booking bar |
| Eyebrows | Uppercase with leading rule | `kicker`: gold-ink uppercase with a **small ring** glyph |
| Hero | Editorial photo collage | **Split hero, tall arch with offset gold keyline**, floating rating card + "next free time" card |
| Services | Card grid | **Asymmetric bento** (tall plum-deep IVF tile, wide tiles, gold-soft tile, bold numerals) |
| Process | Horizontal steps | **Numbered vertical journey timeline** with sticky intro (consultation → tests → plan → procedure → follow-up) |
| Proof | Testimonial cards | **Full-bleed plum-deep stats band** (4.9★, 1,233 reviews, 20+ years, 13.8K followers) + aggregate rating card; no quotes |
| Mobile menu | Drawer | **Full-width plum-deep sheet** with numbered serif links |
| Mobile CTA | Bottom bar | **Floating pill**: cream "Book consultation" + round call button |
| Back to top | Plum circle + progress ring | **Paper tile + gold progress bar** along its bottom edge |
| Notices | Plum-deep marquee, gold gems | **Blush-light ticker**, plum "Notices" tab, ring bullets, red alert items |
| FAQ | — | Native `details` accordion with gold ring +/− |
| Video | — | Click-to-load YouTube facade (youtube-nocookie.com, local poster) |

## Colour tokens (`src/app/globals.css`, `@theme`) — identical hexes to LittleBloom

| Token | Hex | Use |
|---|---|---|
| cream | #FFFBF8 | page background |
| paper | #FFFFFF | panels, form fields |
| blush / blush-light / blush-deep | #F6E3E5 / #FBF1F2 / #EAD2D7 | soft sections, page heroes, ticker, chips |
| line | #ECDFE0 | hairlines |
| ink / ink-soft / muted | #2A1A28 / #4A3947 / #5F4B5C | text hierarchy |
| plum / plum-deep | #4A2545 / #2E1530 | primary action, accents / utility bar, footer, dark bands, `theme-color` |
| rose | #E7C3CB | small labels on plum-deep |
| gold | #C9A25E | **decorative only**: keylines, rings, stars, progress bar |
| gold-ink | #7A5A22 | gold text on light surfaces (kickers, numerals) |
| gold-pale / gold-soft | #EDD9AE / #F8EFDF | gold text on plum / legal-notice background |
| ok / warn / danger | #2D6A47 / #875611 / #A1283B | status |
| field border / placeholder | #A0838D / #7D6A7A | form controls |

## Contrast (WCAG 2.2, relative luminance; AA = 4.5 text, 3.0 large text / UI)

Text tokens on every light surface used:

| Text | cream | paper | blush | blush-light | gold-soft |
|---|---|---|---|---|---|
| ink | 16.0 | 16.4 | 13.3 | 14.9 | 14.4 |
| ink-soft | 10.4 | 10.7 | 8.7 | 9.6 | 9.4 |
| muted | 7.7 | 7.9 | 6.4 | 7.2 | 7.0 |
| plum | 12.4 | 12.8 | 10.4 | 11.6 | 11.2 |
| gold-ink | 6.2 | 6.3 | 5.1 | 5.7 | 5.6 |
| ok | 6.3 | 6.4 | 5.2 | 5.8 | 5.6 |
| warn | 6.1 | 6.2 | 5.1 | 5.6 | 5.5 |
| danger | 7.1 | 7.3 | 5.9 | 6.6 | 6.4 |

Other pairs in use:

| Foreground | Background | Ratio | Where |
|---|---|---|---|
| white | plum | 12.8 | `btn-plum` |
| cream | plum | 12.4 | ticker "Notices" tab, plum panels |
| cream/90, cream/80 | plum | 10.4 / 8.5 | text in plum cards |
| gold-pale | plum | 9.2 | kickers / accents on plum |
| cream | plum-deep | 16.1 | utility bar, footer, stats band, `btn-outline-cream` |
| cream/80 | plum-deep | 10.6 | footer body, utility bar |
| cream/60 | plum-deep | 6.5 | lowest-alpha text (footer fine print) |
| rose | plum-deep | 10.3 | bento tile category |
| gold-pale | plum-deep | 12.0 | stats numerals, kickers on dark |
| gold | plum-deep | 7.0 | (decorative rings only) |
| plum-deep | cream / gold-pale | 16.1 / 12.0 | `btn-cream` / hover |
| #9FD8B4 status dot | plum-deep | 10.2 | "open now" dot (non-text) |
| ink | gold-pale | 11.9 | text selection |
| muted (disabled) | blush-light | 7.2 | closed dates, taken slots (also struck through) |
| ink / muted | paper/95, paper/90 over plum | 15.0 / 6.6 | floating cards, map caption, portrait label |
| placeholder #7D6A7A | white | 5.0 | inputs |
| field border #A0838D | white | 3.4 | inputs (UI, needs 3.0) |
| gold #C9A25E | cream | 2.3 | **fails for text: decorative only** |

Rules: raw gold never carries text; star glyphs always sit inside an element with an
`aria-label` ("4.9 out of 5 stars"). Text never sits directly on artwork without a panel.

## Type

`next/font/google`, `display: swap`, latin subset, variables `--font-cormorant`, `--font-manrope`.

| Class | Font | Size | Line-height |
|---|---|---|---|
| `t-hero` | Figtree 700, -0.03em | clamp(2.35rem, 5.2vw, 4.4rem) | 1.02 |
| `t-1` | Figtree 700, -0.025em | clamp(2rem, 3.9vw, 3.2rem) | 1.08 |
| `t-2` | Figtree 650, -0.02em | clamp(1.65rem, 2.7vw, 2.35rem) | 1.12 |
| `t-3` | Figtree 650 | clamp(1.2rem, 1.6vw, 1.4rem) | 1.25 |
| `accent` | same weight, plum colour (gold-pale on dark), no italics | inherit | |
| `numeral` | Figtree 700, tabular lining figures | per use | |
| `kicker` | Figtree 700, 0.72rem, 0.2em tracking, uppercase, gold-ink | | |
| `intro` | Figtree 400 | clamp(1.05rem, 1.3vw, 1.18rem) | 1.7 |
| body | Figtree 400 | 1rem | 1.65 |
| controls | Figtree 600 | 0.95rem (sm 0.88rem) | 1.2 |

One family throughout: hierarchy comes from size, weight (400 → 700) and tight negative tracking on headings.

## Shape, space, elevation

- `shell`: max 76rem, gutters 1rem (phone, = 16px) / 1.5rem / 2rem. Sections `py-20 lg:py-28`.
- Radii: controls 0.5rem (`--radius-ctl`), cards 0.875rem (`--radius-card`), arch = `999px 999px card card`.
- `arch-keyline`: 1px gold outline offset up-left by 0.75rem behind each arch.
- Shadows: `--shadow-card` (hover), `--shadow-float` (floating cards, mobile pill, dialogs). Mostly hairlines.

## Components

- Layout: `UtilityBar`, `NoticeMarquee` (ticker; pauses on hover/focus/button, static under
  reduced motion), `SiteHeader` (centred wordmark, mobile sheet with focus trap), `SiteFooter`
  (PCPNDT + ART + registration placeholders), `MobileBookPill`, `BackToTop`, `RevealObserver`.
- Home: `Hero`, `DoctorIntro`, `TreatmentBento`, `Journey`, `StatsBand`, `PregnancyFeature`,
  `VideoSection` (`VideoFacade`), FAQ (`FaqList`), `Location` (`MapFacade`), `ClosingCta`.
- UI: `Icon` (own line set) + `LogoMark`, `ArchArt` (decorative rings/botanical SVG), `DoctorPortrait`
  (monogram until the real photo is set), `PageHero`, `SectionHead`, `RatingCard`, `Stars`,
  `LegalNotice`, `CheckList`, `FaqList`.
- Booking: `BookingFlow` (reason → date & time → details & pay, summary ticket aside),
  `PaymentSheet` (demo checkout), `HoldCountdown`, confirmation actions.
- Sections: `ContactForm`, `PolicyLayout`.

States: route `loading.tsx` skeletons (root, appointment, confirmation), `error.tsx`,
`not-found.tsx`, no-slots / closed-day / load-error states in booking,
expired-hold and slot-taken notices, resume-payment banner.

## Imagery

No photography ships yet (see `public/photos/CREDITS.md`): the Unsplash download step was
blocked. Arches use `ArchArt`, an abstract drawing that is clearly not a photograph. Dr. Roy's
portrait is a monogram arch until `DOCTOR_PORTRAIT` in `src/content/photos.ts` is set to his
real photo (`public/photos/dr-debchandan-roy.jpg`). Never use a stock photo as Dr. Roy or as
the centre. The OG/Twitter image is drawn (rings in an arch), no photo.

## Accessibility & motion

Skip link, visible 2px plum focus ring, 44px+ targets, labelled dialogs with focus trap and
focus return, `aria-live` for booking/payment messages, `prefers-reduced-motion` disables
the ticker animation, reveals and transitions. Layout uses fluid widths only; the body clips
horizontal overflow and decorative circles sit inside `overflow-hidden` parents.
