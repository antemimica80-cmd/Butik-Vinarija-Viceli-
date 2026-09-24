import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { StubPage } from '@/components/sections/StubPage';

const slugs = ['dingac', 'plavac-mali', 'opolo-rose'];

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function Page({ params }: PageProps<'/[locale]/wines/[slug]'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'en' | 'hr');
  return <StubPage page="wines" stage={5} />;
}
