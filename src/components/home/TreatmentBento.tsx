import Link from 'next/link';
import { treatmentBySlug, type Treatment } from '@/content/treatments';
import { Icon } from '@/components/ui/Icon';
import { SectionHead } from '@/components/ui/bits';

type Tile = { slug: string; span: string; tone: 'deep' | 'blush' | 'paper' | 'gold' };

/** Asymmetric bento: one tall feature tile, a wide tile and smaller ones. */
const TILES: Tile[] = [
  { slug: 'ivf-icsi', span: 'md:col-span-2 lg:row-span-2', tone: 'deep' },
  { slug: 'infertility-evaluation', span: 'md:col-span-2', tone: 'blush' },
  { slug: 'pcos-pcod', span: '', tone: 'paper' },
  { slug: 'laparoscopy-hysteroscopy', span: '', tone: 'gold' },
  { slug: 'pregnancy-care', span: 'md:col-span-2', tone: 'paper' },
  { slug: 'fibroids', span: '', tone: 'blush' },
  { slug: 'fertility-preservation', span: '', tone: 'paper' },
];

const toneClass = {
  deep: 'on-dark bg-plum-deep text-cream',
  blush: 'bg-blush',
  paper: 'bg-paper border border-line',
  gold: 'bg-gold-soft border border-gold/40',
} as const;

function TileCard({ t, tile, index }: { t: Treatment; tile: Tile; index: number }) {
  const dark = tile.tone === 'deep';
  return (
    <Link
      href={`/treatments/${t.slug}`}
      className={`group relative flex min-h-[12rem] flex-col justify-between overflow-hidden rounded-[var(--radius-card)] p-6 transition-shadow hover:shadow-[var(--shadow-card)] ${toneClass[tile.tone]} ${tile.span}`}
    >
      {dark && (
        <>
          <span aria-hidden="true" className="absolute -right-16 -bottom-16 size-72 rounded-full border border-gold/40" />
          <span aria-hidden="true" className="absolute -right-4 -bottom-28 size-72 rounded-full border border-cream/15" />
        </>
      )}
      <div className="relative flex items-start justify-between gap-4">
        <span className={`numeral text-xl ${dark ? 'text-gold-pale' : 'text-gold-ink'}`}>{String(index + 1).padStart(2, '0')}</span>
        <Icon name={t.icon} size={dark ? 34 : 28} className={dark ? 'text-gold-pale' : 'text-plum'} />
      </div>
      <div className="relative mt-8">
        <p className={`text-[0.72rem] font-bold tracking-[0.18em] uppercase ${dark ? 'text-rose' : 'text-muted'}`}>{t.category}</p>
        <h3 className={`mt-1 font-display font-semibold [overflow-wrap:anywhere] hyphens-auto ${dark ? 'text-[1.85rem] leading-[1.1]' : 'text-[1.25rem] leading-tight'}`}>{t.title}</h3>
        {(dark || tile.span.includes('col-span-2')) && (
          <p className={`mt-3 max-w-md text-[0.95rem] ${dark ? 'text-cream/80' : 'text-ink-soft'}`}>{t.summary}</p>
        )}
        <span className={`mt-4 inline-flex items-center gap-1.5 text-[0.88rem] font-semibold ${dark ? 'text-gold-pale' : 'text-plum'}`}>
          Read more <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function TreatmentBento() {
  return (
    <section aria-labelledby="treatments-title" className="py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            id="treatments-title"
            kicker="Treatments"
            title={
              <>
                From a first question to <span className="accent">specialist treatment</span>
              </>
            }
          />
          <Link href="/treatments" className="btn btn-line">
            All 13 treatments
          </Link>
        </div>
        <div className="mt-12 grid auto-rows-[minmax(12rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TILES.map((tile, i) => {
            const t = treatmentBySlug(tile.slug);
            return t ? <TileCard key={t.slug} t={t} tile={tile} index={i} /> : null;
          })}
        </div>
      </div>
    </section>
  );
}
