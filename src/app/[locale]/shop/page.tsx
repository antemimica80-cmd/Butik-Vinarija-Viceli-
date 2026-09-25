import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { proposalPrices, shopCopy as S } from '@content/products';
import { wines } from '@content/wines';
import type { ImageSlotId } from '@content/image-slots';
import { products } from '@/lib/shop/catalog';
import { formatEur } from '@/lib/format';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';

export async function generateMetadata({ params }: PageProps<'/[locale]/shop'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return { title: l(S.eyebrow), description: l(S.lede) };
}

export default async function ShopPage({ params }: PageProps<'/[locale]/shop'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = (x: { en: string; hr: string }) => x[locale];

  return (
    <>
      <section className="surface-sun grain pt-[calc(var(--nav-h)+4rem)] pb-12 md:pt-[calc(var(--nav-h)+6rem)] md:pb-16">
        <div className="container-x">
          <Reveal>
            <p className="label text-sun-deep">{l(S.eyebrow)}</p>
            <h1 className="mt-6 max-w-4xl text-display-l font-light">{l(S.title)}</h1>
            <p className="mt-6 max-w-xl text-lede text-ink-soft">{l(S.lede)}</p>
          </Reveal>
        </div>
      </section>
      <section className="surface-sun grain pb-20 md:pb-32">
        <div className="container-x">
          <ul className="grid gap-px bg-basalt/15 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p, i) => {
              const wine = wines.find((w) => w.slug === p.slug);
              const from = Math.min(...p.formats.map((f) => f.price));
              return (
                <Reveal as="li" key={p.slug} delay={i * 100} className={p.kind === 'gift' ? 'surface-plavac' : 'bg-limestone'}>
                  <Link href={{ pathname: '/shop/[slug]', params: { slug: p.slug } }} className="group flex h-full flex-col p-6 md:p-8">
                    <div className="mx-auto w-2/5 max-w-36 transition-transform duration-[1.2s] ease-[var(--ease-settle)] group-hover:-translate-y-2">
                      <ImageSlot id={p.bottleSlot as ImageSlotId} compact sizes="144px" />
                    </div>
                    <p className={`label mt-10 ${p.kind === 'gift' ? 'text-sun-pale' : 'text-sun-deep'}`}>{wine ? l(wine.style) : l(S.giftEyebrow)}</p>
                    <h2 className="mt-3 text-display-s font-light">{p.name}</h2>
                    <p className={`mt-3 flex-1 text-sm ${p.kind === 'gift' ? 'text-bone/75' : 'text-ink-soft'}`}>{l(p.summary)}</p>
                    <p className="mt-6 flex items-baseline justify-between border-t border-current/15 pt-4">
                      <span className="font-mono text-sm">
                        {p.formats.length > 1 && <span className="opacity-70">{l(S.from)} </span>}
                        {formatEur(from, locale)}
                      </span>
                      <span aria-hidden>→</span>
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-col justify-between gap-2 text-xs text-ink-soft sm:flex-row">
            <p>{l(S.shipsTo)}</p>
            {proposalPrices && <p>{l(S.proposal)}</p>}
          </div>
        </div>
      </section>
    </>
  );
}
