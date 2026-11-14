import type { ClinicSeed } from '../domain';
import { MemoryStore } from './memory';
import type { ClinicStore } from './types';

export type { ClinicStore } from './types';

const g = globalThis as unknown as { __lfcStore?: Promise<ClinicStore> };

/**
 * One store per server process.
 * - DATABASE_URL set  → PrismaStore (PostgreSQL)
 * - otherwise         → MemoryStore seeded from the site's content (demo mode)
 */
export function getStore(seed: ClinicSeed): Promise<ClinicStore> {
  g.__lfcStore ??= (async () => {
    if (process.env.DATABASE_URL) {
      const { PrismaStore } = await import('./prisma');
      return new PrismaStore();
    }
    return new MemoryStore(seed);
  })();
  return g.__lfcStore;
}

export const isDemoMode = () => !process.env.DATABASE_URL;
