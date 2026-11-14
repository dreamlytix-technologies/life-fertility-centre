/**
 * "In the news" — press coverage of Dr. Debchandan Roy.
 *
 * RULES
 * - Only add stories you can link to. Summaries are written in our own words (no copying the article).
 * - Do not name patients, even if the article does.
 * - `date` is YYYY-MM (or YYYY-MM-DD) of publication; `language` is the article's language.
 *
 * Verified 2026-11-14: the toto delivery (Uttarbanga Sambad). The user mentioned 4–5 more stories;
 * add them here once their links are supplied — the home section adapts to any number of items.
 */
export interface PressItem {
  id: string;
  outlet: string;
  date: string;
  language: 'Bengali' | 'English' | 'Hindi';
  /** Our English headline (a translation/paraphrase, not a quote). */
  headline: string;
  summary: string;
  url: string;
  /** Optional step-by-step account shown on the featured story. */
  moments?: string[];
}

export const PRESS: PressItem[] = [
  {
    id: 'toto-delivery-2025',
    outlet: 'Uttarbanga Sambad',
    date: '2025-11',
    language: 'Bengali',
    headline: 'Malda doctor delivers a baby girl inside a toto stuck in traffic',
    summary:
      'A young woman went into labour in a toto caught in a crowded road near Mokdumpur bazar. Dr. Roy left his patients, went out with his staff and delivered the baby in the vehicle, then sent mother and newborn on for hospital care. Both were reported to be doing well.',
    url: 'https://uttarbangasambad.com/malda-delivery-in-toto/',
    moments: [
      'Hears a commotion outside his chamber during consultations',
      'Finds a woman in labour in a toto stuck in traffic',
      'Delivers the baby in the vehicle with his staff and clinic instruments',
      'Mother and baby girl sent on for hospital care, both doing well',
    ],
  },
];

export function formatPressDate(date: string) {
  const [y, m] = date.split('-').map(Number);
  return new Date(Date.UTC(y!, (m ?? 1) - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
