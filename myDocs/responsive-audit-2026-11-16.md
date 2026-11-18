# Responsive audit and fixes (2026-11-16)

## What was asked
Make the Life Fertility Centre site fully responsive.

## How it was checked
A browser script loaded each page and listed:
- any element sticking out past the screen edge (sideways scroll)
- any text too wide for its box

It ran at:
- **320px**: small phone
- **375px**: iPhone
- **768px**: tablet
- **1024px**: small laptop
- **1440px**: desktop

**Pages:**
- `/`, `/appointment` (including choosing a date and time), `/about`, `/team`
- `/treatments`, `/treatments/ivf-icsi`, `/fertility`, `/pregnancy`, `/urgent`
- `/contact`, `/faq`, `/privacy-policy`, `/terms`, `/cancellation-refund`, and the 404 page

The phone menu was also tested at 320×568 (iPhone SE size).

## Problems found and fixed
| Problem | Where | Fix |
|---|---|---|
| Contact page scrolled sideways on small phones (338px wide on a 320px screen): the long email and Facebook address couldn't wrap | `src/app/contact/page.tsx` | Grid set to `grid-cols-1` so the column can shrink; the values use `overflow-wrap:anywhere` |
| Stats numbers ("1,233", "13.8K") spilled out of their boxes at 320px | `src/components/sections/StatsBand.tsx` | Numbers scale with screen width (`clamp(2.3rem, 11vw, 3.2rem)`); labels slightly smaller on phones; `min-w-0` on cells |
| Treatment cards on the home page were too narrow on tablets (4 columns at 768px), and "Laparoscopic & hysteroscopic surgery" overflowed | `src/components/home/TreatmentBento.tsx` | 2 columns on tablets, 4 from 1024px; the tall IVF tile only spans 2 rows from 1024px; long titles can wrap |
| Phone menu was pushed down by the notice bar and cut off at the bottom on short phones, hiding Call/WhatsApp | `src/components/layout/SiteHeader.tsx` | Menu rendered at the end of `<body>` (React portal) so it fills the screen from the top; it scrolls if taller than the screen |

## Results
- Every page: no sideways scrolling and no overflowing text at 320, 768, 1024 and 1440px. At 375px only the home page and the phone menu were re-checked.
- Booking at 320px:
  - Calendar dates are 33×33px.
  - Time slots are 83×36px.
  - The calendar and slots stack without overflow.
- Phone menu at 320×568:
  - It opens at the top.
  - The WhatsApp button can be reached.
  - Escape closes it and returns focus to the menu button.
- `npx tsc --noEmit`: clean. `npm test`: 17/17 pass.

## Not changed
- The decorative rings that sit just past the edge of some sections are clipped by their section on purpose and don't cause scrolling.
- Calendar dates on a 320px phone are 33px across. That's below the 44px tap-size guideline, but 7 must fit in a row.

## Not done
- Not committed or pushed to GitHub.
- Not tested on a real phone, only in the browser at those sizes.
