'use client';
import { formatMoney } from '@/core/domain';
import { useRef } from 'react';
import { Icon, LogoMark } from '@/components/ui/Icon';
import { useDialog } from '@/lib/useDialog';
import { HoldCountdown } from './Countdown';
import type { BookingEngine } from './useBooking';

/** Demo checkout (mock provider). Clearly labelled; the server signs the result. */
export function PaymentSheet({ engine, onExpire }: { engine: BookingEngine; onExpire: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const h = engine.held ?? engine.resumable;
  const processing = engine.phase === 'processing';
  const open = engine.sheetOpen && !!h?.checkout;
  useDialog(open, ref, () => !processing && engine.setSheetOpen(false), { escape: !processing });
  if (!open || !h?.checkout) return null;
  const amount = formatMoney(h.checkout.amount, h.checkout.currency);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-ink/50" aria-hidden="true" onClick={() => !processing && engine.setSheetOpen(false)} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pay-title"
        aria-describedby="pay-desc"
        tabIndex={-1}
        className="animate-rise relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-cream pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[var(--shadow-float)] sm:max-w-md sm:rounded-2xl"
      >
        <div className="on-dark flex items-center justify-between gap-4 bg-plum-deep px-6 py-5 text-cream">
          <div className="flex items-center gap-3">
            <LogoMark size={32} tone="dark" />
            <div>
              <p id="pay-title" className="font-display text-xl leading-tight font-semibold">
                Pay advance
              </p>
              <p className="text-[0.82rem] text-cream/80">Booking {h.reference}</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg border border-cream/30 disabled:opacity-40"
            onClick={() => engine.setSheetOpen(false)}
            disabled={processing}
            aria-label="Close payment window"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="p-6">
          <p id="pay-desc" className="flex items-center gap-2 rounded-lg border border-dashed border-warn/60 bg-gold-soft px-4 py-3 text-[0.88rem] font-semibold text-warn">
            <Icon name="info" size={18} className="flex-none" /> Demo payment: no money is charged
          </p>

          <div className="mt-5 flex items-end justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-[0.85rem] text-muted">Payable now</p>
              <p className="numeral mt-1 text-[3rem] leading-none text-plum-deep">{amount}</p>
            </div>
            <p className="text-right text-[0.85rem] text-ink-soft">
              {h.summary.title}
              <br />
              {h.summary.date}, {h.summary.slotLabel}
            </p>
          </div>

          <div className="mt-4">
            <HoldCountdown until={h.holdExpiresAt} onExpire={onExpire} />
          </div>

          <div aria-live="assertive" className="mt-4 min-h-6 text-[0.9rem]">
            {processing && <p className="font-semibold text-plum">Processing your payment. Please don’t close this page.</p>}
            {engine.phase === 'failed' && engine.message && (
              <p role="alert" className="error mt-0">
                <Icon name="alert" size={16} className="mt-0.5 flex-none" /> {engine.message}
              </p>
            )}
          </div>

          <div className="mt-3 grid gap-3">
            <button type="button" className="btn btn-plum" onClick={() => engine.payMock('success')} disabled={processing} data-autofocus>
              {processing ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Processing…
                </>
              ) : (
                <>
                  <Icon name="lock" size={18} /> {engine.phase === 'failed' ? `Try again · Pay ${amount}` : `Pay ${amount}`}
                </>
              )}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => engine.payMock('failure')} disabled={processing}>
              Simulate a failed payment
            </button>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-[0.78rem] text-muted">
            <Icon name="shield" size={15} /> Payment results are signed and verified on the server.
          </p>
        </div>
      </div>
    </div>
  );
}
