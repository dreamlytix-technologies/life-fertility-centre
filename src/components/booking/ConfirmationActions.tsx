'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { HoldCountdown } from './Countdown';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="no-print inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-paper px-3.5 text-sm font-semibold hover:border-ink-soft"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          /* clipboard blocked */
        }
      }}
    >
      <Icon name={copied ? 'check' : 'copy'} size={16} />
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="btn btn-plum" onClick={() => window.print()}>
      <Icon name="download" size={19} /> Download confirmation
    </button>
  );
}

export function PendingCountdown({ until }: { until?: string }) {
  const router = useRouter();
  return <HoldCountdown until={until} onExpire={() => router.refresh()} />;
}
