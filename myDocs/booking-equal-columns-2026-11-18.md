# Booking page: equal-height columns, tried and reverted (2026-11-18)

## What happened
1. **Asked for:** on the "Choose a date and time" step, make the calendar, the time slots and the booking summary the same height.
2. **Built:** on screens 1280px and wider, all three became one row of equal-height cards (518px). The summary moved out of the sidebar into the row, and the times scrolled inside their card.
3. **Feedback:** "not looking good, change it to previous one."
4. **Reverted:** the earlier layout is back.

## Current layout (same as before the change)
- **Calendar:** a card on the left, at its natural height.
- **Times:** a card beside the calendar. The list scrolls inside it on wide screens once it's taller than 27rem (about 432px).
- **Booking summary:** in the sticky sidebar on the right, starting at the top of the page section.

## Files touched and restored
- `src/components/booking/BookingFlow.tsx`: the three-column row, the extra summary copy and the stretch classes were removed. The summary markup is kept as one `summaryCard` piece, used only in the sidebar; the output is the same as before.
- `src/components/booking/CalendarPicker.tsx`: the card, the date grid and the legend are back to their earlier classes.

## Checks
- At 1440px:
  - The row has 2 cards (304px and 460px columns), and the times card is capped with scrolling.
  - The sidebar summary shows on the right.
  - No sideways scrolling.
- `npx tsc --noEmit`: clean.

## Follow-up: fees on 3 lines instead of 6
In the "Your booking" summary card (`summaryCard` in `BookingFlow.tsx`), each fee row now shows its label on the left and the amount on the right, on the same line:
- Consultation fee ............ ₹600
- Pay online now ............... **₹200** (still the large figure, now 24px instead of 30px)
- Pay at the centre ........... ₹400

Checked at 1440px: each label and amount sit on one line, and the card is now 442px tall.

## Follow-up: delay notice in the summary
The note at the bottom of the "Your booking" card changed.
- **Old:** "Your time is held for 10 minutes while you pay. Tests and procedures are charged separately."
- **Then:** "Your consultation may start up to 1 hour late. Tests are charged separately."
- **Now (2026-11-18, latest):** "Check your details before you confirm. The advance is non-refundable."

The 10-minute payment hold still works the same. The payment countdown and the "hold ran out" message still mention it; only this note changed. Checked in the browser.

## Still open
- **Conflict to resolve:** the summary now says the advance is non-refundable, but `/cancellation-refund` (and the Terms and FAQ that point to it) promise a full refund when cancelled 24+ hours ahead or when the centre cancels. They also promise automatic refunds for failed or duplicate payments. Confirm the policy with Dr. Roy and make the two match.

- After 2:00 PM the calendar still selects today, even when no times are left.
