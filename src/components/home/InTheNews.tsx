import { PRESS } from '@/content/press';
import { SectionHead } from '@/components/ui/bits';
import { NewsSlider } from './NewsSlider';

/** Press coverage, shown as a slider. Add stories in src/content/press.ts; the slider adapts to any number. */
export function InTheNews() {
  if (PRESS.length === 0) return null;

  return (
    <section aria-labelledby="news-title" className="bg-blush-light py-20 lg:py-24">
      <div className="shell">
        <SectionHead
          id="news-title"
          kicker="In the news"
          title={
            <>
              When care <span className="accent">couldn’t wait</span>
            </>
          }
          intro="Moments from Dr. Roy’s work that local newspapers have reported."
        />
        <NewsSlider items={PRESS} />
      </div>
    </section>
  );
}
