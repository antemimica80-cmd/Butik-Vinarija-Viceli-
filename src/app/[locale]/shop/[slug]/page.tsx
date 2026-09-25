import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { proposalPrices, shopCopy as S } from '@content/products';
import { wines, winesCopy as W } from '@content/wines';
import type { ImageSlotId } from '@content/image-slots';
import { products } from '@/lib/shop/catalog';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { AddToCart } from '@/components/shop/AddToCart';
import { ArrowRight } from '@/components/ui/icons';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/shop/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: p.name, description: p.summary[locale as Locale] };
}

export default async function ProductPage({ params }: PageProps<'/[locale]/shop/[slug]'>) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const wine = wines.find((w) => w.slug === p.slug);
  const l = (x: { en: string; hr: string }) => x[locale];
  const contents = p.kind === 'gift' ? wines : [];

  return (
    <section className="surface-limestone grain pt-[calc(var(--nav-h)+2rem)] pb-20 md:pt-[calc(var(--nav-h)+4rem)] md:pb-32">
      <div className="container-x">
        <Link href="/shop" className="label text-ink-soft hover:text-basalt">
          ← {l(S.eyebrow)}
        </Link>
        <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <div className="mx-auto w-1/2 max-w-64 md:w-3/4">
              <ImageSlot id={p.bottleSlot as ImageSlotId} priority sizes="(min-width: 768px) 30vw, 50vw" />
            </div>
          </div>
          <div className="min-w-0 md:col-span-7 lg:col-span-6">
            <p className="label text-sun-deep">{wine ? l(wine.style) : l(S.giftEyebrow)}</p>
            <h1 className="mt-4 text-display-l font-light">{p.name}</h1>
            <p className="mt-6 text-lede text-ink-soft">{l(p.summary)}</p>
            {wine && <p className="mt-6 text-display-s font-light italic">{l(wine.tasting)}</p>}
            {contents.length > 0 && (
              <ul className="mt-6 space-y-1 font-mono text-sm">
                {contents.map((w) => (
                  <li key={w.slug}>1 × {w.name}</li>
                ))}
              </ul>
            )}
            <div className="mt-10">
              <AddToCart formats={p.formats} locale={locale} />
            </div>
            <div className="mt-10 space-y-2 border-t border-basalt/15 pt-6 text-sm text-ink-soft">
              <p>{l(S.shipsTo)}</p>
              <p>{l(W.method)}</p>
              {proposalPrices && <p>{l(S.proposal)}</p>}
            </div>
            {wine && (
              <Link href={{ pathname: '/wines/[slug]', params: { slug: wine.slug } }} className="btn-link mt-8">
                {l(S.dossier)} <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
