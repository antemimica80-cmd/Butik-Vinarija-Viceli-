import { ImageResponse } from 'next/og';
import { OgCard, ogFonts, ogSize } from '@/lib/og';
import { routing } from '@/i18n/routing';

export const size = ogSize;
export const contentType = 'image/png';
export const alt = 'Vicelić — certified organic Dingač, Pelješac.';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const hr = locale === 'hr';
  return new ImageResponse(
    <OgCard label={hr ? 'Dingač · Pelješac · Hrvatska' : 'Dingač · Pelješac · Croatia'} title={hr ? 'Ekološki certificirano. Uzgojeno na Dingaču.' : 'Certified organic. Grown on Dingač.'} footer={hr ? 'Jedini ekološki certificirani Dingač' : 'The only certified organic Dingač'} />,
    { ...ogSize, fonts: await ogFonts() },
  );
}
