import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { StubPage } from '@/components/sections/StubPage';

const slugs = ['terms', 'privacy', 'cookies', 'imprint'];

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function Page({ params }: PageProps<'/[locale]/legal/[slug]'>) {
  const { locale, slug } = await params;
  if (!slugs.includes(slug)) notFound();
  setRequestLocale(locale as 'en' | 'hr');
  return <StubPage page="legal" stage={8} />;
}
