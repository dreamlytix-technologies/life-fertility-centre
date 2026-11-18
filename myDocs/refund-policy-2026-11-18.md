# Advance made non-refundable across the site (2026-11-18)

The booking summary and the confirmation page say "The advance is non-refundable", but the policy pages promised refunds. They now match.

## Changes
| File | Change |
|---|---|
| `src/app/cancellation-refund/page.tsx` | Intro adds "The advance is non-refundable." The two 24-hour rules are replaced by one: cancelled by you at any time, or not attended → no refund; you may reschedule once within 14 days. Meta description and "updated" date (18 November 2026) changed. |
| `src/app/terms/page.tsx` | New line: the advance is non-refundable if you cancel or miss the appointment; exceptions are in the refund policy. |
| `src/content/faqs.ts` | "Can I change or cancel my booking?" now says the advance is non-refundable if you cancel, but is returned if the centre cancels or a payment goes wrong. |

## Kept on purpose (exceptions)
- **Rescheduling:** at least 4 hours ahead, the advance carries over.
- **Centre cancels or moves the booking:** full refund, or a new time.
- **Payment problems:** money taken without a confirmed booking, a payment that arrives after the time was taken, or a double charge are still refunded. The booking system does this automatically (REFUND_PENDING status), and keeping such money would not be fair to patients.

## Checks
- `npx tsc --noEmit`: clean.
- `/cancellation-refund`, `/terms` and `/faq` load (200), show the new wording, and no longer contain the 24-hour refund rule.

## Still to confirm
- Dr. Roy should confirm the final policy, especially the exceptions above.
- Not committed or pushed.
