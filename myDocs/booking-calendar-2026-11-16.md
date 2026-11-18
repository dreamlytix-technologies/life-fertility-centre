# Booking page: calendar date picker (2026-11-16)

## What was asked
Redesign the "Choose a date and time" step on `/appointment`: show a calendar, allow booking only for the next 2 days, and show the time slots.

## What changed
| File | Change |
|---|---|
| `src/content/seed.ts` | `bookingWindowDays: 6` → `2`. Online booking is open for **today + the next 2 days** (3 dates). The server rejects anything later. |
| `src/components/booking/CalendarPicker.tsx` (new) | Month calendar (Sunday first). Bookable dates are tinted with a gold ring, the selected date is solid plum, and today has a gold dot. Closed days inside the window (Sundays) are struck through. Every other date is greyed out and can't be clicked. Month arrows only move across months that contain bookable dates. Includes a legend and full-date screen-reader labels. |
| `src/components/booking/BookingFlow.tsx` | The horizontal date strip is replaced by the calendar plus a time-slot card. The card has a date heading, a "N times free" count, and Morning/Midday groups. Times that have already passed today are hidden; booked times stay visible but crossed out. Times show a loading skeleton on first paint. Subtitle now reads "today and the next 2 days". |
| `src/content/site-settings.test.ts` | Window test now expects 3 dates (16–18 Nov from a Monday). |
| `README.md`, `content-to-verify-2026-11-14.md` | Booking window text updated. |

## Layout
- **Wide screens (≥1280px):** calendar on the left (19rem), slots on the right; the slot list scrolls inside its card when long.
- **Smaller screens and mobile:** calendar on top (max 26rem), slots below. No horizontal scrolling at 375px.

## Checks
- `npx tsc --noEmit`: clean
- `npm test`: 17/17 pass
- In the browser on Mon 16 Nov, 11:32 AM IST:
  - The calendar enables 16, 17 and 18 Nov only.
  - Today shows 22 remaining times starting 12:10 PM.
  - Tue 17 shows all 48 times.
  - Selecting a time fills "When" in the summary and enables Continue.

## Follow-up: compact time slots
Slot buttons and the slot card were made smaller:

| Part | Before | After |
|---|---|---|
| Font size | 0.88rem | 0.8rem |
| Button height | 44px | 36px |
| Corners | rounded-lg | rounded-md |
| Gap between buttons | 8px | 6px |
| Card padding | 20px | 16px |
| Columns on wide screens | 4 | 5 |

Checked at 1440px: buttons are 80×36px and 12.8px text, and the card is about the same height as the calendar.

## Follow-up: minimal date cells
The calendar dates in `CalendarPicker.tsx` were made simpler:

| Date | Before | Now |
|---|---|---|
| Bookable | Pink fill with gold ring | Plain bold plum number, light pink only on hover |
| Selected | Plum circle with ring and shadow | Plain plum circle, no ring or shadow |
| Today | Gold dot | Gold dot, which turns cream when today is selected |
| Others | Faint grey | Faint grey (unchanged) |

- Cells are a little smaller: max 40px instead of 44px.
- The legend now shows a bold "16" for "Can book".
- Checked in the browser: selecting 17 Nov highlights it and loads its 48 times.

## To change later
- Number of bookable days: `bookingWindowDays` in `src/content/seed.ts`. Dates shown = this value + 1, because today counts. Restart the dev server after changing it, since the in-memory store is seeded at start-up.
- If "2 days" was meant to exclude today, set `bookingWindowDays: 1`.

## Not done
- Not committed or pushed to GitHub yet.
