# Consultation fee changed to ₹600 (2026-11-16)

## What was asked
The doctor's fee is ₹600: ₹200 paid online and ₹400 at the centre.

## What changed
| File | Change |
|---|---|
| `src/content/facts.ts` | `consultationFeeRupees: 650` → `600`. `advanceRupees` stays `200`. |
| `src/content/site-settings.test.ts` | New test: fee ₹600 = ₹200 advance + ₹400 balance. |
| `README.md`, `content-to-verify-2026-11-14.md` | Fee text updated to ₹600 (₹200 online + ₹400 at the centre). |

Every page reads the fee from `facts.ts`, so these all update automatically:
- the booking summary
- the online advance charge
- FAQ (including its search-engine data)
- Terms
- the closing call-to-action
- the cancellation policy

`src/core/content/base-seed.ts` still says ₹650. That's the booking engine's generic default used by its own tests; this site's settings override it.

## Checks
- `npx tsc --noEmit`: clean
- `npm test`: 18/18 pass
- Restarted the dev server, because the in-memory store is seeded at start-up.
- The booking page shows: Consultation fee ₹600, Pay online now ₹200, Pay at the centre ₹400.
- `/api/config` returns a fee of 60000 paise.
- The FAQ says ₹600, and ₹650 / ₹450 no longer appear on it.

## Not done
- Not committed or pushed to GitHub.
- Live payments (Razorpay) aren't set up yet. The amount charged online is still ₹200.
