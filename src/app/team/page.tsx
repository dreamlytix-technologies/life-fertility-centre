import Image from 'next/image';
import Link from 'next/link';
import { CLINIC } from '@/content/facts';
import { LEAD, TEAM_GROUPS, initials, type TeamMember } from '@/content/team';
import { Icon, type IconName } from '@/components/ui/Icon';
import { PageHero, SectionHead } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Our team',
  description: `Meet the doctors, nurses and staff who work with Dr. Debchandan Roy at ${CLINIC.name}, Malda.`,
  path: '/team',
});

const GROUP_ICON: Record<(typeof TEAM_GROUPS)[number]['id'], IconName> = {
  doctors: 'scope',
  nursing: 'heart',
  support: 'user',
};

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="relative flex h-full flex-col items-center rounded-[var(--radius-card)] bg-paper p-7 pt-11 text-center ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]">
      {member.sample && (
        <span className="absolute top-3 right-3 rounded-full bg-blush px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.12em] text-plum uppercase">
          Sample profile
        </span>
      )}
      <div className="relative size-28 shrink-0 overflow-hidden rounded-full bg-blush shadow-[var(--shadow-card)] ring-4 ring-paper">
        {member.photo ? (
          <Image src={member.photo.src} alt={member.photo.alt} fill sizes="7rem" className="object-cover object-[50%_25%]" />
        ) : (
          <span aria-hidden="true" className="grid size-full place-items-center text-[1.6rem] font-bold tracking-[-0.03em] text-plum-deep">
            {initials(member.name)}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-[1.15rem] font-bold text-plum-deep">{member.name}</h3>
      <p className="mt-1 text-[0.9rem] font-semibold text-plum">{member.role}</p>
      {member.qualifications && <p className="mt-2 text-[0.85rem] text-muted">{member.qualifications}</p>}
      {member.bio && <p className="mt-4 text-[0.92rem] leading-relaxed text-ink-soft">{member.bio}</p>}
      {member.languages && member.languages.length > 0 && (
        <p className="mt-auto pt-4 text-[0.8rem] text-muted">Speaks {member.languages.join(', ')}</p>
      )}
    </article>
  );
}

export default function TeamPage() {
  return (
    <>
      <JsonLd data={crumbs([{ name: 'Our team', path: '/team' }])} />
      <PageHero
        kicker="Our team"
        title={
          <>
            The people who <span className="accent">look after you</span>
          </>
        }
        intro="Dr. Roy leads every treatment plan, supported by doctors, nurses and staff who know the centre and its patients well."
        crumbs={[{ href: '/team', label: 'Our team' }]}
      />

      {/* Lead consultant */}
      <section aria-labelledby="lead-title" className="py-16 lg:py-20">
        <div className="shell">
          <article className="on-dark relative isolate grid overflow-hidden rounded-[var(--radius-card)] bg-plum-deep text-cream md:grid-cols-[0.8fr_1.2fr]">
            <svg aria-hidden="true" className="absolute -right-40 -bottom-40 -z-10 size-[30rem] text-gold" viewBox="0 0 400 400" fill="none">
              {[70, 110, 150, 190].map((r, i) => (
                <circle key={r} cx="200" cy="200" r={r} stroke="currentColor" strokeOpacity={0.18 - i * 0.035} />
              ))}
            </svg>
            <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[26rem]">
              {LEAD.photo && (
                <Image
                  src={LEAD.photo.src}
                  alt={LEAD.photo.alt}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover object-[50%_25%]"
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="kicker">Lead consultant</p>
              <h2 id="lead-title" className="t-2 mt-3 text-cream">
                {LEAD.name}
              </h2>
              <p className="mt-3 font-semibold text-gold-pale">{LEAD.role}</p>
              <p className="mt-2 text-[0.92rem] text-cream/70">{LEAD.qualifications}</p>
              <p className="mt-5 max-w-xl leading-relaxed text-cream/85">{LEAD.bio}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" className="btn btn-cream">
                  About Dr. Roy <Icon name="arrow" size={18} />
                </Link>
                <Link href="/appointment" className="btn btn-outline-cream">
                  Book a consultation
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      {TEAM_GROUPS.map((g, gi) => (
        <section key={g.id} aria-labelledby={`${g.id}-title`} className={`py-16 lg:py-20 ${gi % 2 === 0 ? 'bg-blush-light' : ''}`}>
          <div className="shell">
            <SectionHead id={`${g.id}-title`} kicker={`Team · 0${gi + 1}`} title={g.title} intro={g.intro} />
            {g.members.length > 0 ? (
              <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {g.members.map((m) => (
                  <li key={m.id}>
                    <MemberCard member={m} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-10 flex flex-col items-start gap-4 rounded-[var(--radius-card)] border-2 border-dashed border-gold/50 bg-paper/70 p-7 sm:flex-row sm:items-center">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-blush text-plum">
                  <Icon name={GROUP_ICON[g.id]} size={24} />
                </span>
                <p className="text-ink-soft">
                  <span className="font-semibold text-plum-deep">Details to be added.</span> Names and photos of our{' '}
                  {g.title.toLowerCase()} will appear here once the centre shares them.
                </p>
              </div>
            )}
          </div>
        </section>
      ))}
    </>
  );
}
