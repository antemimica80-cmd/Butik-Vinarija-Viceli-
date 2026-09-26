import { permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

export const metadata: Metadata = { robots: { index: false } };

/** The shop now lives on the wines page — keep old links working. */
export default async function ShopRedirect({ params }: PageProps<'/[locale]/shop'>) {
  const { locale } = await params;
  permanentRedirect(getPathname({ locale: locale as Locale, href: '/wines' }));
}
