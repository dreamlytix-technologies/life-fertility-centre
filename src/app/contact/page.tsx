import { CLINIC, LINKS, whatsappLink } from '@/content/facts';
import { ContactForm } from '@/components/sections/ContactForm';
import { Location } from '@/components/sections/Location';
import { Icon } from '@/components/ui/Icon';
import { PageHero } from '@/components/ui/bits';
import { JsonLd } from '@/components/ui/JsonLd';
import { api } from '@/lib/api';
import { crumbs, practiceJsonLd } from '@/lib/seo';
import { pageMetadata } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Contact & Directions',
  description:
    'Contact Life Fertility Centre, Thakurdas Babu Lane, near Employment Exchange Office, Singatala, Mokdumpur, Malda 732103. Phone +91 87598 35989, WhatsApp +91 75869 63412.',
  path: '/contact',
});

export default async function ContactPage() {
  const site = await api.server.site();
  return (
    <>
      <JsonLd data={practiceJsonLd(site.settings, site.doctor, site.services)} />
      <JsonLd data={crumbs([{ name: 'Contact', path: '/contact' }])} />
      <PageHero
        kicker="Contact"
        title={
          <>
            Talk to <span className="accent">the centre</span>
          </>
        }
        intro="Call or WhatsApp during clinic hours, or send a message below. To book a time, use online booking."
        crumbs={[{ href: '/contact', label: 'Contact' }]}
      />
      <section className="py-14 lg:py-20">
        <div className="shell grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <ul className="grid content-start gap-3">
            {[
              { icon: 'phone' as const, label: 'Phone', value: CLINIC.phoneDisplay, href: `tel:${CLINIC.phone}` },
              { icon: 'whatsapp' as const, label: 'WhatsApp', value: CLINIC.whatsappDisplay, href: whatsappLink(), external: true },
              { icon: 'mail' as const, label: 'Email', value: CLINIC.email, href: `mailto:${CLINIC.email}` },
              { icon: 'facebook' as const, label: 'Facebook', value: 'facebook.com/debchandan.roy', href: LINKS.facebook, external: true },
            ].map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="panel group flex items-center gap-4 p-4 hover:border-plum"
                >
                  <span className="flex size-11 flex-none items-center justify-center rounded-lg bg-blush-light text-plum">
                    <Icon name={c.icon} size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.78rem] font-semibold tracking-wide text-muted uppercase">{c.label}</span>
                    <span className="block font-semibold [overflow-wrap:anywhere]">{c.value}</span>
                  </span>
                </a>
              </li>
            ))}
            <li className="mt-2 rounded-lg border border-danger/40 bg-blush-light p-4 text-[0.92rem]">
              <strong className="font-semibold">Bleeding or severe pain in pregnancy?</strong> Don’t send a message; go to the nearest hospital.
            </li>
          </ul>
          <div>
            <h2 className="t-2 mb-6">Send a message</h2>
            <ContactForm />
          </div>
        </div>
      </section>
      <div className="border-t border-line">
        <Location settings={site.settings} headingId="contact-visit-title" />
      </div>
    </>
  );
}
