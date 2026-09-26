import { wines } from '@content/wines';
import { site } from '@content/site';
import { products } from './catalog';
import { absolute, siteUrl } from '@/lib/seo';

/** schema.org Product + offers for a wine or the gift box. Availability is stated as in stock; live stock is checked at checkout. */
export function productLd(slug: string, locale: 'en' | 'hr', url: string) {
  const p = products.find((x) => x.slug === slug);
  const w = wines.find((x) => x.slug === slug);
  if (!p) return {};
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.name} — Vicelić`,
    description: p.summary[locale],
    brand: { '@type': 'Brand', name: site.brand },
    manufacturer: { '@id': `${siteUrl}/#winery` },
    category: 'Wine',
    url,
    ...(w
      ? {
          additionalProperty: [
            { '@type': 'PropertyValue', name: 'Grape', value: w.sheet.variety },
            { '@type': 'PropertyValue', name: 'Bottles produced', value: w.sheet.bottles },
          ],
        }
      : {}),
    offers: p.formats.map((f) => ({
      '@type': 'Offer',
      sku: f.sku,
      name: f.label[locale],
      price: f.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: absolute(locale, { pathname: '/wines/[slug]', params: { slug: p.slug } }),
      eligibleRegion: ['HR', 'EU'],
    })),
  };
}
