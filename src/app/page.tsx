import { DoctorIntro, PregnancyFeature, VideoSection } from '@/components/home/HomeSections';
import { Hero } from '@/components/home/Hero';
import { InTheNews } from '@/components/home/InTheNews';
import { TreatmentBento } from '@/components/home/TreatmentBento';
import { StatsBand } from '@/components/sections/StatsBand';
import { JsonLd } from '@/components/ui/JsonLd';
import { api } from '@/lib/api';
import { practiceJsonLd } from '@/lib/seo';
import { nextAvailableSlot } from '@/lib/server';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({ path: '/' });

export default async function HomePage() {
  const [site, next] = await Promise.all([api.server.site(), nextAvailableSlot()]);
  return (
    <>
      <JsonLd data={practiceJsonLd(site.settings, site.doctor, site.services, { rating: true })} />
      <Hero next={next} />
      <DoctorIntro />
      <InTheNews />
      <TreatmentBento />
      <StatsBand />
      <PregnancyFeature />
      <VideoSection />
    </>
  );
}
