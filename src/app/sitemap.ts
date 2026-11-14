import type { MetadataRoute } from 'next';
import { TREATMENTS } from '@/content/treatments';
import { SITE_URL } from '@/lib/site';

type Freq = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: Freq = 'monthly') => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page('/', 1, 'weekly'),
    page('/appointment', 0.9, 'daily'),
    page('/about', 0.8),
    page('/team', 0.6),
    page('/treatments', 0.8),
    ...TREATMENTS.map((t) => page(`/treatments/${t.slug}`, 0.7)),
    page('/fertility', 0.8),
    page('/pregnancy', 0.8),
    page('/urgent', 0.6),
    page('/contact', 0.7),
    page('/faq', 0.6),
    page('/privacy-policy', 0.2, 'yearly'),
    page('/terms', 0.2, 'yearly'),
    page('/cancellation-refund', 0.2, 'yearly'),
  ];
}
