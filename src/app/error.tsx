'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { CLINIC } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-xl">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border border-gold text-plum">
          <Icon name="info" size={26} />
        </span>
        <h1 className="t-1 mt-6">Something went wrong</h1>
        <p className="intro mt-4">Please try again. If it keeps happening, call the centre on {CLINIC.phoneDisplay}.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-plum" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn btn-line">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
