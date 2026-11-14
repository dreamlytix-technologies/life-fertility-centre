'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { contactSchema, type ContactInput } from '@/core/validation';
import { Icon } from '@/components/ui/Icon';

/** Validated contact form (same Zod schema runs on the server). No medical details please. */
export function ContactForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema), defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' } });

  const onSubmit = handleSubmit(async (data) => {
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const body = (await res.json().catch(() => null)) as { error?: { message?: string; fields?: Record<string, string> } } | null;
      if (!res.ok) {
        for (const [k, v] of Object.entries(body?.error?.fields ?? {})) setError(k as keyof ContactInput, { message: v });
        setState('error');
        setMessage(body?.error?.message ?? 'Your message could not be sent. Please call the centre.');
        return;
      }
      reset();
      setState('sent');
    } catch {
      setState('error');
      setMessage('We could not reach the server. Check your connection and try again.');
    }
  });

  if (state === 'sent')
    return (
      <div role="status" className="panel p-8 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-blush-light text-ok">
          <Icon name="check" size={26} strokeWidth={2} />
        </span>
        <h3 className="t-3 mt-4">Thank you, your message has been sent</h3>
        <p className="mt-2 text-ink-soft">The centre will reply during clinic hours. For anything urgent, please call.</p>
        <button type="button" className="btn btn-line mt-6" onClick={() => setState('idle')}>
          Send another message
        </button>
      </div>
    );

  const err = (k: keyof ContactInput) =>
    errors[k]?.message ? (
      <p id={`${k}-error`} className="error">
        <Icon name="alert" size={15} className="mt-0.5 flex-none" /> {errors[k]?.message}
      </p>
    ) : null;
  const a11y = (k: keyof ContactInput) => ({ 'aria-invalid': !!errors[k] || undefined, 'aria-describedby': errors[k] ? `${k}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="panel grid gap-5 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label">
            Your name
          </label>
          <input id="c-name" className="field" autoComplete="name" {...register('name')} {...a11y('name')} />
          {err('name')}
        </div>
        <div>
          <label htmlFor="c-phone" className="label">
            Mobile <span className="font-normal text-muted">(optional)</span>
          </label>
          <input id="c-phone" className="field" type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} {...a11y('phone')} />
          {err('phone')}
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="label">
          Email
        </label>
        <input id="c-email" className="field" type="email" autoComplete="email" {...register('email')} {...a11y('email')} />
        {err('email')}
      </div>
      <div>
        <label htmlFor="c-subject" className="label">
          Subject
        </label>
        <input id="c-subject" className="field" {...register('subject')} {...a11y('subject')} />
        {err('subject')}
      </div>
      <div>
        <label htmlFor="c-message" className="label">
          Message
        </label>
        <textarea id="c-message" className="field" rows={5} {...register('message')} {...a11y('message')} aria-describedby={errors.message ? 'message-error' : 'c-message-hint'} />
        <p id="c-message-hint" className="hint mt-1.5">
          Please don’t include medical history or reports here; bring them to your consultation.
        </p>
        {err('message')}
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>
      <div aria-live="polite">
        {state === 'error' && message && (
          <p className="error mt-0">
            <Icon name="alert" size={15} className="mt-0.5 flex-none" /> {message}
          </p>
        )}
      </div>
      <button type="submit" className="btn btn-plum justify-self-start" disabled={state === 'sending'}>
        {state === 'sending' ? (
          <>
            <span className="spinner" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send message <Icon name="arrow" size={18} />
          </>
        )}
      </button>
    </form>
  );
}
