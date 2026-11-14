import { createClinicApi } from '@/core/api/index';
import { seed } from '@/content/seed';
import { SITE_URL } from './site';

export const api = createClinicApi({ seed, siteUrl: SITE_URL });
