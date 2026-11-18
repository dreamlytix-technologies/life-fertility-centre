# News card: Bengali headline (2026-11-19)

## What was asked
The "Read in Uttarbanga Sambad (Bengali)" link opens a Bengali article, so the card's heading should be in Bengali too.

## What changed
- `src/content/press.ts`: new optional field `originalHeadline`, the outlet's own headline word for word. For the toto story it is **"টোটোয় প্রসব, নাড়ি কাটলেন ডাক্তার"**. This was copied from the article page on uttarbangasambad.com on 19 Nov 2026; their title is "Malda | টোটোয় প্রসব, নাড়ি কাটলেন ডাক্তার". The English `headline` stays as a fallback.
- `src/components/home/NewsSlider.tsx`:
  - When `originalHeadline` is set, the heading shows it with `lang="bn"`, so screen readers and browsers treat it as Bengali.
  - It uses a looser line height (1.35) and no tight letter-spacing, which suits Bengali script.
  - The summary and the "What happened" steps stay in English.

## Checks
- `npx tsc --noEmit`: clean.
- On the home page, the heading reads "টোটোয় প্রসব, নাড়ি কাটলেন ডাক্তার" with `lang="bn"`.
- The site font (Figtree) has no Bengali letters, so Windows shows them in its built-in Bengali font (Nirmala UI). Not checked visually, because the browser pane wasn't drawing.
