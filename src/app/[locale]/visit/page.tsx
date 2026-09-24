import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StubPage } from '@/components/sections/StubPage';

export async function generateMetadata({ params }: PageProps<'/[locale]/visit'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as 'en' | 'hr' });
  return { title: t('stub.visit.title') };
}

export default async function Page({ params }: PageProps<'/[locale]/visit'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'en' | 'hr');
  return <StubPage page="visit" stage={8} />;
}
