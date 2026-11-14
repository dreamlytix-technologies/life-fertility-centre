import { DOCTOR, LINKS, REPUTATION } from '@/content/facts';

/** Full-bleed plum-deep band with the four public figures. Figures, not claims. */
export function StatsBand() {
  const stats = [
    { value: `${REPUTATION.googleRating}★`, label: 'Google rating', href: LINKS.googleReviews },
    { value: REPUTATION.googleReviewCountLabel, label: 'Google reviews', href: LINKS.googleReviews },
    { value: DOCTOR.experienceLabel.replace(' years', ''), label: 'Years in obstetrics & gynaecology' },
    { value: REPUTATION.facebookFollowersLabel, label: 'Facebook followers', href: LINKS.facebook },
  ];
  return (
    <section aria-label="The centre in numbers" className="on-dark relative overflow-hidden bg-plum-deep text-cream">
      <span aria-hidden="true" className="absolute top-1/2 -left-32 size-96 -translate-y-1/2 rounded-full border border-gold/30" />
      <span aria-hidden="true" className="absolute top-1/2 -right-24 size-[30rem] -translate-y-1/2 rounded-full border border-cream/10" />
      <div className="shell relative py-14 lg:py-16">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex flex-col px-2 text-center lg:px-6 ${i > 0 ? 'lg:border-l lg:border-cream/15' : ''}`}>
              <dt className="order-2 mt-2 text-[0.82rem] font-semibold tracking-[0.08em] text-cream/80 uppercase">
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline decoration-cream/30 underline-offset-4 hover:decoration-cream">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  s.label
                )}
              </dt>
              <dd className="numeral text-[3.2rem] leading-none text-gold-pale sm:text-[3.8rem]">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
