import { quote } from '@/core/booking/pricing';
import { bookableDates } from '@/core/booking/slots';
import { VISIT_REASONS, type VisitReason } from '@/core/domain';
import { BookingFlow } from '@/components/booking/BookingFlow';
import { PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { api } from '@/lib/api';
import { crumbs } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Book a Consultation Online',
  description:
    'Book a gynae, fertility or pregnancy consultation with Dr. Debchandan Roy at Life Fertility Centre, Malda. Choose a time, pay a ₹200 advance online, and pay the balance at the centre.',
  path: '/appointment',
});

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AppointmentPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const site = await api.server.site();
  const reasonParam = one(sp.reason)?.toUpperCase();
  const initialReason = (VISIT_REASONS as readonly string[]).includes(reasonParam ?? '') ? (reasonParam as VisitReason) : undefined;
  const svc = site.services.find((s) => s.slug === one(sp.service));
  const price = quote('CONSULTATION', site.settings.rules, site.settings.clinic.currency);
  return (
    <>
      <JsonLd data={crumbs([{ name: 'Book a consultation', path: '/appointment' }])} />
      <PageHero
        kicker="Online booking"
        title={
          <>
            Book a <span className="accent">consultation</span>
          </>
        }
        intro="Three short steps. Your time is confirmed once the advance is paid."
        crumbs={[{ href: '/appointment', label: 'Book a consultation' }]}
      />
      <section className="py-10 lg:py-14">
        <div className="shell">
          <BookingFlow
            initialDates={bookableDates(site.settings, 'CONSULTATION')}
            feePaise={price.fee}
            advancePaise={price.advance}
            holdMinutes={site.settings.rules.holdMinutes}
            slotMinutes={site.settings.rules.slotDurationMinutes}
            daysShown={site.settings.rules.bookingWindowDays + 1}
            initialReason={initialReason}
            service={svc ? { slug: svc.slug, title: svc.title } : undefined}
          />
        </div>
      </section>
    </>
  );
}
