# Confirmation page clean-up (2026-11-18)

File: `src/app/appointment/confirmation/page.tsx`

## Changes
1. **Removed** the "Call the centre" and "Back to home" buttons at the bottom of the page.
2. **Address moved up:** it no longer spans the full width. It now sits in the empty right-hand cell next to "Pay at the centre", so the grid has no gap.
3. **Shorter address:** "Life Fertility Centre," is no longer in front of it.
4. **"West Bengal" → "WB"** on this page only (the printed header too). The full state name stays in SEO data, policies and the footer.

Address now reads: "Thakurdas Babu Lane, near Employment Exchange Office, Singatala, Mokdumpur, Malda, WB 732103".

## Checks
- `npx tsc --noEmit`: clean.
- In the browser at 1024px, with a test booking:
  - "Pay at the centre" (left) and "Address" (right) are on the same row.
  - The Call / Back buttons are gone.
  - No sideways scroll.

## Not done
- Not committed or pushed.
- The test bookings made for this check are unpaid holds and will expire on their own.

## Follow-up: "Before your visit" card
- **Old:** "Arrive 10 minutes early. It gives time for a short registration at the desk."
- **Now:** "Your time may shift. Your time may be delayed depending on the situation at the centre."
- The three "Before your visit" cards now show the icon and heading on one line (icon 18px, 8px gap).
- "Bring your reports" text shortened to: "Prescriptions, test or scan reports. For fertility visits, bring both partners’ reports."
- The "Directions" button on the confirmation page now reads "Get Directions".
- Removed the "Booking LFC-…" line above the "Appointment confirmed" heading. The ID still shows (with Copy ID) in the Booking details box.
- "Appointment confirmed" heading made smaller (about 30px max instead of 38px) and the gap to the next line cut from 8px to 4px.
- Added a "Call Clinic" button (phone link) after "Get Directions" in the button row of a confirmed booking.
- The four buttons (Download confirmation, Google Calendar, Get Directions, Call Clinic) now fill the full width in equal columns: 4 across from 640px up, 2×2 on phones. Font is 0.86rem (about 14px) instead of the default button size.
- Button label changed to "Download Confirmation" (capital C).
- "Need to change it?" card: "See the cancellation policy for refunds." replaced with "The advance is non-refundable." (still conflicts with /cancellation-refund; see booking-equal-columns-2026-11-18.md).
- "Need to change it?" card now reads: "Call +91 87598 35989 at least 4 hours before to move your time. The advance is not refunded, but it carries over."
- Phone number removed from that card: "Move your time at least 4 hours before. The advance is not refunded, but it carries over." (The Call Clinic button sits above.)
- Last "Before your visit" card replaced: icon info, title "Advance is non-refundable", text "The ₹200 paid online is not returned if you cancel or miss the visit." (amount comes from the payment).

## Follow-up: "Please note" list replaces the three cards
The three "Before your visit" cards (time may shift, bring your reports, advance is non-refundable) are replaced by one "Please note" box with a numbered list, based on the clinic's own points:
1. The ₹200 registration fee is not refundable. (changed from "advance" on request)
2. Please pay the consultation charges to the doctor at the centre. (amount removed on request)
3. Please bring this confirmation or the SMS to your consultation and for any follow-up.
4. Please arrive on time for your time slot.
5. **(in red, bold)** If the doctor has an emergency, your check-up may be delayed by up to 1 hour from the scheduled time.

The amounts come from the booking. Wording was adapted from the clinic's list: "registration fee" became "advance", which is the term used across the site.

Checked in the browser with a paid test booking (LFC-261119-6491H) at 1024px:
- All 5 points show, and point 5 is red.
- The 4 buttons are 217px each.
- No sideways scroll.

The test booking holds 19 Nov 10:00 in the in-memory store until the server restarts.
- Points 4 and 5 merged into one: "Please arrive on time for your time slot. (If the doctor has an emergency, your check-up may be delayed by up to 1 hour from the scheduled time.)". The bracketed part stays red and bold. The list now has 4 points.
- Point 4 shortened to fit on one line: "Please arrive on time for your time slot. (In case of a doctor’s emergency, it may be delayed by up to 1 hour.)". Measured text width is about 697px against about 828px of room, so it fits on laptop and desktop screens. On phones it still wraps.
- Point 1 amount removed: "Registration fee is not refundable."
- The PCPNDT line under the notes is hidden in the downloaded / printed confirmation (no-print). It still shows on screen.
- Heading now "Appointment Confirmed" (capital C).

## Follow-up: "Download Confirmation" prints an Appointment Acknowledgement slip
The button still uses the browser's print dialog (Save as PDF). What gets printed is now a separate one-page slip, modelled on the clinic's reference, instead of the web page.

**New:** `src/components/booking/Acknowledgement.tsx`. It is hidden on screen and shown only when printing, for confirmed bookings.
1. The Life Fertility Centre logo and wordmark ("Dr. Debchandan Roy") at the top. The old printed address header was removed.
2. Title: APPOINTMENT ACKNOWLEDGEMENT.
3. A tinted patient box with a plum left border: Patient Name, Booking ID, Visit.
4. Two columns:
   - Appointment Date (e.g. 19-Nov-2026), Day and Time
   - Payment Status (green when Paid), Paid Online and Transaction ID
5. Doctor Details: Doctor, Clinic (name + address, WB), Phone.
6. Please note: the same 4 points as the page. Point 4's delay notice is in red.

**Page and CSS changes:**
- `page.tsx`: the whole on-screen content is `no-print`, so only the slip prints. The site header and footer were already hidden in print.
- `globals.css` (print): `.ack` keeps its colours (`print-color-adjust: exact`) and avoids page breaks.

**Not on the slip:** age, gender, mobile number and booking time. The booking record shown to the patient doesn't include them, and they weren't added to keep personal data off the public page.

**Checked** by applying the print styles on screen at A4 content width (673px):
- The slip is 645px tall, inside the ~1000px of one A4 page.
- Nothing else prints.
- Labels don't wrap.

Not tested through the real print dialog.
