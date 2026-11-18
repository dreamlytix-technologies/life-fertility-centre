# Gender added to the booking form (2026-11-18)

## What was asked
The "Your details" step was missing a gender field.

## What changed
| File | Change |
|---|---|
| `src/core/domain.ts` | New `GENDERS` (FEMALE, MALE, OTHER) and `GENDER_LABELS`. `PatientDetails.gender` added. It is optional only so older records still load. `PublicBooking` now carries `patientAge` and `patientGender`. The comment saying "no gender field" was updated. |
| `src/core/validation.ts` | `gender` is required in `patientSchema`. If it's missing, the error is "Choose gender". |
| `src/core/booking/service.ts` | Gender is saved with the booking and passed to the confirmation page. |
| `prisma/schema.prisma`, `src/core/store/prisma.ts` | New nullable `Patient.gender` column, read and written. `prisma generate` was run. **When a real database is used, run `npm run db:migrate` to add the column.** |
| `src/components/booking/BookingFlow.tsx` | A "Gender" dropdown (Select / Female / Male / Other) sits next to Age. Layout: Name, Age and Gender in one row on wider screens. On phones, Name is full width and Age and Gender share the next row. |
| `src/components/booking/Acknowledgement.tsx` | The printed slip now shows Patient Age and Patient Gender under Patient Name. |
| `src/app/privacy-policy/page.tsx`, `src/content/faqs.ts` | The lists of data collected now include gender. |
| `src/core/booking/engine.test.ts` | The test patient has `gender: 'FEMALE'`. |

## Checks
- `npx tsc --noEmit`: clean. `npm test`: 18/18 pass.
- Browser at 1024px: Name (281px), Age (112px) and Gender (144px) sit on one row, and the dropdown lists Female / Male / Other.
- API:
  - A booking without gender returns 422 `{"patient.gender":"Choose gender"}`.
  - With gender, it returns 201. After a mock payment, the acknowledgement slip shows "Patient Gender: Female".

## Not done
- Not committed or pushed.
