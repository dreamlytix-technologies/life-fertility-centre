# Appointment confirmed page — 2026-11-16

Made `/appointment/confirmation` more compact, as requested: smaller text, less space, and no "Add to calendar (.ics)" button.

## Changes

`src/app/appointment/confirmation/page.tsx`

- **Page and header**
  - Page padding is `py-8 lg:py-10` (was `py-12 lg:py-16`).
  - The status circle is 56 px (was 80 px), with a smaller icon.
  - The title uses the `t-2` size instead of `t-1`.
  - The intro line is 0.95rem instead of the larger `.intro` size.
- **Booking details panel**
  - The panel's top margin is smaller and its header padding is tighter.
  - The title is `text-lg`, and the booking ID chip and status line are smaller.
  - Rows use `py-2.5` (was `py-3.5`), labels are 0.78rem and values 0.93rem.
- **Actions**
  - Removed the "Add to calendar (.ics)" link and its now-unused `icsUrl`.
  - Download confirmation, Google Calendar and Directions remain. The `/api/bookings/ics` route is still in the code but is no longer linked.
- **"Before your visit" cards, legal note and bottom buttons:** smaller padding, gaps and text.

`src/components/booking/ConfirmationActions.tsx`

- The "Copy ID" button is 36 px tall with 0.82rem text (was 44 px tall, `text-sm`).

## Checks

- `npx tsc --noEmit` passes.
- Made a demo booking (LFC-261118-PE4ET, demo payment, in-memory store) and opened its confirmation page at 1280 px and 375 px:
  - the layout is compact
  - no ".ics" control remains
  - no sideways scroll on mobile
