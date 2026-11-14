'use client';
import type { AppointmentType, PatientDetails } from '@/core/domain';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  clearHeld,
  createBooking,
  loadHeld,
  loadScriptOnce,
  mockCheckout,
  newKey,
  saveHeld,
  verifyPayment,
  type HeldBooking,
} from './client';

export type PayPhase = 'idle' | 'creating' | 'held' | 'processing' | 'failed' | 'paid' | 'expired';

export interface SubmitArgs {
  patient: PatientDetails;
  appointment: Record<string, unknown> & { type: AppointmentType; date: string; slot: string };
  website: string;
  summary: HeldBooking['summary'];
}

export type SubmitOutcome =
  | { ok: true }
  | { ok: false; kind: 'slot' | 'patient' | 'appointment' | 'general'; error: ApiError };

const SLOT_CODES = ['SLOT_FULL', 'SLOT_PAST', 'DAY_CLOSED', 'SLOT_UNAVAILABLE', 'SLOT_NOT_FOUND'];

/**
 * Booking + payment state machine for the consultation flow:
 * POST /api/bookings → hold → checkout → verify → confirmation.
 */
export function useBooking(type: AppointmentType) {
  const router = useRouter();
  const [phase, setPhase] = useState<PayPhase>('idle');
  const [held, setHeld] = useState<HeldBooking | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [resumable, setResumable] = useState<HeldBooking | null>(null);
  const keyRef = useRef<string>('');

  useEffect(() => {
    keyRef.current = newKey();
    const h = loadHeld();
    if (h && h.type === type && h.checkout) setResumable(h);
  }, [type]);

  const goToConfirmation = useCallback(
    (ref: string, token: string) => {
      clearHeld();
      setPhase('paid');
      router.push(`/appointment/confirmation?ref=${encodeURIComponent(ref)}&token=${encodeURIComponent(token)}`);
    },
    [router],
  );

  const openCheckout = useCallback(
    async (h: HeldBooking) => {
      setMessage(null);
      const c = h.checkout;
      if (!c) return;
      if (h.holdExpiresAt && new Date(h.holdExpiresAt).getTime() <= Date.now()) {
        setPhase('expired');
        return;
      }
      if (c.provider === 'razorpay' && c.scriptUrl && c.publicKey) {
        try {
          await loadScriptOnce(c.scriptUrl);
          const Rzp = window.Razorpay;
          if (!Rzp) throw new ApiError(0, 'SCRIPT', 'The payment window could not be opened.');
          const rzp = new Rzp({
            key: c.publicKey,
            order_id: c.orderId,
            amount: c.amount,
            currency: c.currency,
            name: 'Life Fertility Centre',
            description: `Advance for booking ${h.reference}`,
            prefill: c.prefill,
            theme: { color: '#4A2545' },
            handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
              setPhase('processing');
              try {
                await verifyPayment({
                  reference: h.reference,
                  token: h.token,
                  orderId: resp.razorpay_order_id,
                  paymentId: resp.razorpay_payment_id,
                  signature: resp.razorpay_signature,
                });
                goToConfirmation(h.reference, h.token);
              } catch (e) {
                setPhase('failed');
                setMessage(e instanceof ApiError ? e.message : 'We could not verify the payment. Please contact the clinic.');
              }
            },
            modal: {
              ondismiss: () => {
                setPhase((p) => (p === 'processing' ? p : 'held'));
                setMessage('The payment window was closed. Your time is still held — you can pay when ready.');
              },
            },
          });
          rzp.on('payment.failed', (resp) => {
            setPhase('failed');
            setMessage(resp.error?.description ?? 'The payment did not go through.');
          });
          setPhase('held');
          rzp.open();
        } catch (e) {
          setPhase('failed');
          setMessage(e instanceof ApiError ? e.message : 'The payment window could not be opened.');
        }
        return;
      }
      setSheetOpen(true);
    },
    [goToConfirmation],
  );

  const submit = useCallback(
    async (args: SubmitArgs): Promise<SubmitOutcome> => {
      setPhase('creating');
      setMessage(null);
      try {
        const res = await createBooking({
          patient: args.patient,
          appointment: args.appointment,
          consent: true,
          idempotencyKey: keyRef.current,
          website: args.website,
        });
        const h: HeldBooking = {
          reference: res.reference,
          token: res.token,
          holdExpiresAt: res.holdExpiresAt,
          amountDue: res.amountDue,
          checkout: res.checkout,
          type,
          summary: args.summary,
        };
        keyRef.current = newKey(); // this attempt is consumed
        if (!res.checkout || res.status === 'CONFIRMED') {
          goToConfirmation(res.reference, res.token);
          return { ok: true };
        }
        saveHeld(h);
        setHeld(h);
        setResumable(null);
        setPhase('held');
        void openCheckout(h);
        return { ok: true };
      } catch (e) {
        const err = e instanceof ApiError ? e : new ApiError(0, 'UNKNOWN', 'Something went wrong. Please try again.');
        // Keep the idempotency key for network / server errors (safe retry of the same attempt).
        if (err.status >= 400 && err.status < 500) keyRef.current = newKey();
        setPhase('idle');
        if (SLOT_CODES.includes(err.code)) return { ok: false, kind: 'slot', error: err };
        if (err.code === 'VALIDATION' && err.fields) {
          const keys = Object.keys(err.fields);
          if (keys.some((k) => k.startsWith('patient.'))) return { ok: false, kind: 'patient', error: err };
          if (keys.some((k) => k.startsWith('appointment.'))) return { ok: false, kind: 'appointment', error: err };
        }
        if (err.code === 'SERVICE_UNKNOWN')
          return { ok: false, kind: 'appointment', error: err };
        setMessage(err.message);
        return { ok: false, kind: 'general', error: err };
      }
    },
    [goToConfirmation, openCheckout, type],
  );

  const payMock = useCallback(
    async (outcome: 'success' | 'failure') => {
      const h = held ?? resumable;
      if (!h?.checkout) return;
      setPhase('processing');
      setMessage(null);
      try {
        const r = await mockCheckout(h.checkout.orderId, outcome);
        if (!r.ok) {
          setPhase('failed');
          setMessage(`${r.reason}. No money has been taken.`);
          return;
        }
        await verifyPayment({ reference: h.reference, token: h.token, orderId: r.orderId, paymentId: r.paymentId, signature: r.signature });
        setSheetOpen(false);
        goToConfirmation(h.reference, h.token);
      } catch (e) {
        setPhase('failed');
        setMessage(e instanceof ApiError ? e.message : 'The payment could not be completed.');
      }
    },
    [held, resumable, goToConfirmation],
  );

  const resume = useCallback(() => {
    if (!resumable) return;
    setHeld(resumable);
    setPhase('held');
    void openCheckout(resumable);
  }, [resumable, openCheckout]);

  const expire = useCallback(() => {
    clearHeld();
    setSheetOpen(false);
    setHeld(null);
    setResumable(null);
    setPhase('expired');
    keyRef.current = newKey();
  }, []);

  const reset = useCallback(() => {
    setPhase('idle');
    setMessage(null);
  }, []);

  const dismissResume = useCallback(() => {
    clearHeld();
    setResumable(null);
  }, []);

  return {
    phase,
    held,
    message,
    setMessage,
    sheetOpen,
    setSheetOpen,
    resumable,
    submit,
    payMock,
    openCheckout,
    resume,
    expire,
    reset,
    dismissResume,
  };
}

export type BookingEngine = ReturnType<typeof useBooking>;
