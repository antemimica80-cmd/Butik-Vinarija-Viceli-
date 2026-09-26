import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { products } from '@/lib/shop/catalog';

export const dynamicParams = false;
export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

/** Product pages merged into the wine pages — keep old links working. */
export default async function ProductRedirect({ params }: PageProps<'/[locale]/shop/[slug]'>) {
  const { locale, slug } = await params;
  permanentRedirect(getPathname({ locale: locale as Locale, href: { pathname: '/wines/[slug]', params: { slug } } }));
}
