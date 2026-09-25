import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { site } from '@content/site';
import { resolveSiteUrl } from './site-url';

export const siteUrl = resolveSiteUrl();

type Href = Parameters<typeof getPathname>[0]['href'];

export function absolute(locale: Locale, href: Href) {
  return `${siteUrl}${getPathname({ locale, href })}`;
}

/** Canonical + hreflang alternates (en, hr, x-default → en) for a route. */
export function alternates(locale: Locale, href: Href): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absolute(l, href);
  languages['x-default'] = absolute(routing.defaultLocale, href);
  return { canonical: absolute(locale, href), languages };
}

/** schema.org Winery (a LocalBusiness) — the estate. */
export function wineryLd(locale: Locale) {
  const a = site.address;
  return {
    '@context': 'https://schema.org',
    '@type': 'Winery',
    '@id': `${siteUrl}/#winery`,
    name: locale === 'hr' ? site.nameHr : site.nameEn,
    legalName: site.legalName,
    url: absolute(locale, '/'),
    telephone: site.phone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      postalCode: a.postalCode,
      addressLocality: a.city,
      addressRegion: 'Dubrovnik-Neretva County',
      addressCountry: a.countryCode,
    },
    ...(a.geo ? { geo: { '@type': 'GeoCoordinates', latitude: a.geo.lat, longitude: a.geo.lng } } : {}),
    logo: `${siteUrl}/media/logo-seal.png`,
    image: `${siteUrl}/media/dingac-aerial.jpg`,
    sameAs: [site.instagram.url],
    founder: { '@type': 'Person', name: site.winemaker },
    areaServed: ['Dubrovnik', 'Pelješac', 'Ston', 'Korčula'],
    currenciesAccepted: 'EUR',
  };
}

export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, '\\u003c') };
}
