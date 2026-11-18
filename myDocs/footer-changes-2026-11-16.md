# Footer changes (2026-11-16)

## What was asked
1. Remove "Contact us" from the footer.
2. Remove "Life Fertility Centre" from the footer address.

## What changed
All in `src/components/layout/SiteFooter.tsx`:
- **Quick Links:** "Contact us" (`/contact`) was taken out of `QUICK_LINKS`. The list now reads About Dr. Roy, Our team, Treatments, Fertility & IVF, Pregnancy care, Urgent help, FAQ.
- **Address:** it no longer starts with the clinic name. It now reads "Thakurdas Babu Lane, Singatala, Mokdumpur, Malda" and still links to Google Maps directions.

## Not changed
- **Contact page:** `/contact` still exists and is still in the header menu.
- **Clinic name:** still shown in the footer logo and wordmark.

## Checks
- `npx tsc --noEmit`: clean.
- Footer read in the browser: no "Contact us" link, and the address starts with "Thakurdas Babu Lane".
- No screenshot: the browser pane was hidden.

## Follow-up: compact contact details
This changes `ContactItem` and the Contact Details list in `SiteFooter.tsx`:

| Part | Before | After |
|---|---|---|
| Icon circle | 40px | 32px |
| Icon | 17px | 15px |
| Gap between rows | 16px | 10px |
| Gap between icon and text | 14px | 12px |
| Line height | relaxed | snug |

- The icon now sits centred against its text.
- The social icons (Facebook / YouTube / Maps) under the intro text are unchanged.
- Checked in the browser.

## Follow-up: PCPNDT notice on one line
The two registration badges used to sit to the right of the notice and squeeze it onto 3 lines. Now:
- **Notice:** has its own full-width row, with the shield icon centred.
- **Badges:** moved to a row underneath, lined up with the notice text.
- **Result:** checked in the browser, the notice is one line (820px of text) at both 1024px and 1440px.
- **Phones and tablets:** it still wraps, because the sentence is too long for those screens.

## Follow-up: notice and both badges on one line
The PCPNDT notice and the two registration badges now share a single row:
- The notice bar is slightly wider than the other footer content: up to 86rem (1376px), compared with 76rem for the rest of the footer (`.shell`). Its left and right edges therefore sit about 20–30px outside the footer columns.
- Notice text is 12px and badge text is about 11px.
- On narrower screens the badges wrap onto the next row.
- **Checked:** at 1280px and 1440px, the notice and both badges are on one line, using 1195px of the bar.

## Follow-up: smaller footer text (about 1.5px)
| Part | Before | After |
|---|---|---|
| Column titles | 18.4px | 16.8px |
| Wordmark | 20px | 18px |
| Intro paragraphs and contact details | 15.2px | 13.8px |
| Quick Links and schedule | 15.5px | 14.1px |
| "Book a consultation" button | 15.2px | 14.1px |
| PCPNDT notice | 12.8px | 12px |
| Registration badges | 11.2px | 10.9px |
| Bottom bar (copyright, policies) | 13.4px | 12.5px |

- The tiny "Dr. Debchandan Roy" label under the wordmark (about 10px) was left as it was.
- Checked in the browser at 1280px.

## Follow-up: narrower PCPNDT box
The notice bar is back inside the footer's normal width (`.shell`), so its edges line up with the footer columns.

- **Box size:** the box only takes the width its content needs (`w-fit`), up to the footer width, and is centred.
- **Spacing:** padding is now 12px top and bottom, 20px on the left and 12px on the right.
- **Text sizes:** notice text is 11.5px, the shield icon is 16px, and the badges are 10.6px with tighter pill padding and spacing. This keeps everything on one line in the narrower box.

**Checked:**
- At 1440px the box is 1146px wide inside a 1152px footer area, on one line.
- At 1280px it is also on one line.
- On smaller screens the badges move to a second line.

## Not done
- Not committed or pushed to GitHub.
