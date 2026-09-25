import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { visitPage as V } from '@content/visit';
import { home } from '@content/home';
import { site } from '@content/site';
import { MapBlock } from '@/components/ui/MapBlock';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, WhatsAppIcon } from '@/components/ui/icons';
import { alternates, jsonLd, wineryLd } from '@/lib/seo';
import { directionsUrl } from '@/lib/format';

export async function generateMetadata({ params }: PageProps<'/[locale]/visit'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return { title: l(V.eyebrow), description: l(V.meta.description), alternates: alternates(locale as Locale, '/visit') };
}

export default async function VisitPage({ params }: PageProps<'/[locale]/visit'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = (x: { en: string; hr: string }) => x[locale];
  const a = site.address;
  const address = `${a.street}, ${a.postalCode} ${a.city}, ${a.country}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(wineryLd(locale))} />
      <section data-nav-tone="dark" className="surface-shade grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+7rem)] md:pb-24">
        <div className="container-x">
          <Reveal immediate>
            <p className="label text-sun">{l(V.eyebrow)}</p>
            <h1 className="mt-6 text-display-xl font-light">{l(V.title)}</h1>
            <p className="mt-8 max-w-2xl text-lede text-bone/80">{l(V.lede)}</p>
          </Reveal>
          <Reveal immediate delay={150} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn btn-sun">
              <WhatsAppIcon size={16} /> {l(V.whatsapp)}
            </a>
            <a href={site.phoneHref} className="btn btn-ghost">
              {l(V.call)} · {site.phone}
            </a>
          </Reveal>
        </div>
      </section>

      <section className="surface-sun grain py-16 md:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-10 lg:col-span-4">
            <div>
              <h2 className="label text-sun-deep">{l(V.address)}</h2>
              <address className="mt-3 text-lede not-italic">
                {locale === 'hr' ? site.nameHr : site.nameEn}
                <br />
                {a.street}
                <br />
                {a.postalCode} {a.city}, {a.region}
                <br />
                {locale === 'hr' ? a.countryHr : a.country}
              </address>
              <a href={directionsUrl(address)} target="_blank" rel="noopener noreferrer" className="btn-link mt-4">
                {home.route.directions[locale]} <ArrowRight size={14} />
              </a>
            </div>
            <div>
              <h2 className="label text-sun-deep">{l(V.contact)}</h2>
              <ul className="mt-3 space-y-1">
                <li>
                  <a className="hover:underline" href={site.phoneHref}>
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a className="break-all hover:underline" href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </li>
                <li>
                  <a className="hover:underline" href={site.instagram.url} target="_blank" rel="noopener noreferrer">
                    Instagram {site.instagram.handle}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="label text-sun-deep">{l(V.season)}</h2>
              <p className="mt-3">{l(V.seasonText)}</p>
              <p className="mt-2 text-sm text-ink-soft">{l(V.hoursNote)}</p>
            </div>
          </div>
          <div className="lg:col-span-8">
            <MapBlock locale={locale} />
          </div>
        </div>
      </section>

      <section className="surface-limestone grain py-16 md:py-28" aria-labelledby="route-title">
        <div className="container-x">
          <p className="label text-sun-deep">{l(V.directions)}</p>
          <h2 id="route-title" className="mt-4 max-w-3xl text-display-m font-light">
            {l(home.route.title)}
          </h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {home.route.legs.map((leg, i) => (
              <Reveal as="li" key={leg.from.en} delay={i * 120} className="border-t border-basalt/20 pt-6">
                <p className="font-mono text-sm text-sun-deep">0{i + 1}</p>
                <h3 className="mt-3 text-display-s font-light">{l(leg.from)}</h3>
                <p className="mt-3 text-ink-soft">{l(leg.via)}</p>
                <p className="mt-2 font-mono text-sm">{l(leg.time)}</p>
              </Reveal>
            ))}
          </ol>
          <p className="mt-12 max-w-2xl text-ink-soft">{l(home.route.transfer)}</p>
          <Link href="/experience" className="btn btn-primary mt-8">
            {l(V.book)} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
