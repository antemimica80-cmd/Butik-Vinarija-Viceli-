import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { absolute } from '@/lib/seo';
import { products } from '@/lib/shop/catalog';

/** Plain file, also in the static export. */
export const dynamic = 'force-static';

type Href = Parameters<typeof absolute>[1];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { href: Href; priority: number }[] = [
    { href: '/', priority: 1 },
    { href: '/experience', priority: 0.95 },
    { href: '/dingac', priority: 0.8 },
    { href: '/wines', priority: 0.8 },
    ...products.map((p) => ({ href: { pathname: '/wines/[slug]', params: { slug: p.slug } } as Href, priority: 0.7 })),
    { href: '/family', priority: 0.6 },
    { href: '/visit', priority: 0.7 },
  ];
  const now = new Date();
  return pages.flatMap(({ href, priority }) =>
    routing.locales.map((locale) => ({
      url: absolute(locale, href),
      lastModified: now,
      priority,
      alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, absolute(l, href)])) },
    })),
  );
}
