import { weeklyTable } from '@/core/booking/schedule';
import type { ClinicSettings } from '@/core/domain';
import { CLINIC, LINKS, whatsappLink } from '@/content/facts';
import { Icon } from '@/components/ui/Icon';
import { MapFacade } from './MapFacade';

/** Address, hours and a click-to-load map. */
export function Location({ settings, headingId = 'visit-title' }: { settings: ClinicSettings; headingId?: string }) {
  const hours = weeklyTable(settings.weekly);
  return (
    <section aria-labelledby={headingId} className="py-20 lg:py-24">
      <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div>
          <p className="kicker">Visit</p>
          <h2 id={headingId} className="t-2 mt-3">
            Mokdumpur, <span className="accent">Malda</span>
          </h2>
          <address className="intro mt-5 not-italic">
            {CLINIC.name}
            <br />
            {CLINIC.line1},
            <br />
            {CLINIC.line2}, {CLINIC.city}, {CLINIC.state} {CLINIC.postalCode}
          </address>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={LINKS.googleMaps} target="_blank" rel="noopener noreferrer" className="btn btn-plum">
              <Icon name="directions" size={18} /> Directions
              <span className="sr-only">(opens Google Maps in a new tab)</span>
            </a>
            <a href={`tel:${CLINIC.phone}`} className="btn btn-line">
              <Icon name="phone" size={18} /> {CLINIC.phoneDisplay}
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-line">
              <Icon name="whatsapp" size={18} /> WhatsApp
            </a>
          </div>
          <div className="panel mt-8 p-5">
            <p className="kicker">Consultation hours</p>
            <dl className="mt-3 grid gap-1.5">
              {hours.map((h) => (
                <div key={h.dayOfWeek} className="flex justify-between gap-4 border-b border-line pb-1.5 text-[0.95rem] last:border-0">
                  <dt>{h.day}</dt>
                  <dd className={h.open ? 'font-semibold' : 'text-muted'}>{h.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <MapFacade embedUrl={settings.clinic.mapEmbedUrl} mapsUrl={settings.clinic.mapsUrl} />
      </div>
    </section>
  );
}
