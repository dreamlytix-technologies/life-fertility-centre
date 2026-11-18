# Download Confirmation: redesigned acknowledgement slip (2026-11-19)

## What was asked
The printed Appointment Acknowledgement looked too plain. Give it a proper design and keep it to one page.

## New design (`src/components/booking/Acknowledgement.tsx`)
All of it sits inside one rounded card.
1. **Header band** (deep plum, thin gold line underneath): the logo, "Life Fertility Centre" and "Dr. Debchandan Roy" on the left. The **Booking ID** sits in a chip on the right.
2. **Title row**: "Appointment Acknowledgement" with "Please show this at the reception desk when you arrive." Beside it is a green **Confirmed** pill (amber "Awaiting payment" if unpaid). A dashed line sits below.
3. **Appointment tiles**:
   - a plum date block (big "21", "NOV 2026")
   - a **Day** tile
   - a **Time** tile (start time, with "until …" below)
4. **Two cards side by side**:
   - **Patient details**: name, age, gender, visit
   - **Payment**: paid online, status, transaction ID, and "Consultation charges: payable to the doctor at the centre"
5. **Doctor & clinic** card: doctor's name and specialty, plus the address and phone with icons.
6. **Please note** (blush box): the 4 points with numbered plum circles. Point 4's delay notice is in red.
7. **Footer strip**: "This is a computer-generated acknowledgement and needs no signature." and the clinic phone.

Colours print as shown, because `.ack` uses `print-color-adjust: exact`.

## Checks
- `npx tsc --noEmit`: clean.
- With a paid test booking (LFC-261121-J1F9V), the print styles were applied on screen at A4 content width (673px).
- The slip is 827px tall, inside the ~1000px of one A4 page. Nothing overflows, and nothing else on the page prints.
- Not run through the real print dialog.

## Not done
- Not committed or pushed.

## Follow-up (same day)
- **Time tile** now shows the full range on one line, e.g. "11:30 AM – 11:35 AM". The text is 161px wide in a 194px tile, so it fits. The separate "until …" line was removed.
- **Footer strip:** the clinic phone number was removed. Only "This is a computer-generated acknowledgement and needs no signature." remains, centred. The phone number still appears in the Doctor & clinic card.
- The slip is now 818px tall, still one page.
