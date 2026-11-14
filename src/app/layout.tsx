import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import { BackToTop } from '@/components/layout/BackToTop';
import { MobileBookPill } from '@/components/layout/MobileBookPill';
import { NoticeMarquee } from '@/components/layout/NoticeMarquee';
import { RevealObserver } from '@/components/layout/RevealObserver';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { api } from '@/lib/api';
import { activeNotices } from '@/lib/notices';
import { isDemo } from '@/lib/server';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import './globals.css';

// One family across the whole site: Figtree (variable weight 300–900).
const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

// Live data (opening status, in-memory demo store): render per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  openGraph: { siteName: SITE_NAME, locale: 'en_IN', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#2E1530',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [site, demo] = await Promise.all([api.server.site(), isDemo()]);
  return (
    <html lang="en-IN" className={`${figtree.variable}`} suppressHydrationWarning>
      <head>
        <script
          // Enables reveal-on-scroll only when JS runs (content stays visible otherwise).
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-plum-deep focus:px-5 focus:py-3 focus:text-cream"
        >
          Skip to main content
        </a>
        <NoticeMarquee notices={activeNotices(site.settings)} />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter settings={site.settings} demo={demo} />
        <MobileBookPill />
        <BackToTop />
        <RevealObserver />
      </body>
    </html>
  );
}
