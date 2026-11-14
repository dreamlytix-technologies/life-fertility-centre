import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export default function NotFound() {
  return (
    <section className="shell grid min-h-[60vh] place-items-center py-20 text-center">
      <div className="max-w-xl">
        <p className="numeral text-[6rem] leading-none text-gold-ink">404</p>
        <h1 className="t-1 mt-4">
          This page <span className="accent">isn’t here</span>
        </h1>
        <p className="intro mt-4">The link may be old or mistyped. These pages may help instead.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-plum">
            Home
          </Link>
          <Link href="/treatments" className="btn btn-line">
            Treatments
          </Link>
          <Link href="/appointment" className="btn btn-line">
            Book a consultation <Icon name="arrow" size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
