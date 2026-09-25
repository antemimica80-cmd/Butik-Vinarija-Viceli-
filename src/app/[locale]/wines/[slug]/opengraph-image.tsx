import { ImageResponse } from 'next/og';
import { OgCard, ogFonts, ogSize } from '@/lib/og';
import { routing } from '@/i18n/routing';
import { wines } from '@content/wines';

export const size = ogSize;
export const contentType = 'image/png';
export const alt = 'Vicelić wine dossier';

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => wines.map((w) => ({ locale, slug: w.slug })));
}

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const i = wines.findIndex((w) => w.slug === slug);
  const w = wines[i] ?? wines[0];
  const n = new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-US').format(w.sheet.bottles);
  return new ImageResponse(
    <OgCard label={`${locale === 'hr' ? 'Dosje' : 'Dossier'} Nº 0${i + 1} · ${w.style[locale === 'hr' ? 'hr' : 'en']}`} title={w.name} footer={`${n} ${locale === 'hr' ? 'boca' : 'bottles'} · Plavac Mali`} />,
    { ...ogSize, fonts: await ogFonts() },
  );
}
