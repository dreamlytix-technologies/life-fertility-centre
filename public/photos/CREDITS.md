# Photo credits

**No photographs are included yet (14 Nov 2026).**

The planned source was Unsplash (Unsplash License only, no Unsplash+), searched via
`https://unsplash.com/napi/search/photos?query=…`. From the build machine that endpoint
answered `Authorization required`, so the photo step was stopped rather than substituting
or faking images.

To add photos later:

1. Use an official Unsplash API key (or download manually from unsplash.com), skipping
   premium / Unsplash+ images, anything showing another clinic's branding, and anything that
   could be read as Dr. Roy or this centre.
2. Save as `public/photos/<name>.jpg` (≈1600 px wide, quality ≈80).
3. Register each in `src/content/photos.ts` with exact pixel size and honest alt text.
4. List each one below.

| File | Unsplash URL | Photographer |
|---|---|---|
| — | — | — |

Real photographs of Life Fertility Centre (reception, rooms, building) and Dr. Roy's
portrait (`dr-debchandan-roy.jpg`) should come from the centre itself.

| dr-debchandan-roy-desk.png | Supplied by the user (portrait of Dr. Debchandan Roy) — confirm the doctor consents to its use on the website |
| dr-debchandan-roy-office.png | Supplied by the user (wider crop of the same portrait, used in the home hero) — same consent applies |
