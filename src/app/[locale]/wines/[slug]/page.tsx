import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { wines, winesCopy as W } from '@content/wines';
import { experiences } from '@content/experiences';
import type { ImageSlotId } from '@content/image-slots';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { Seal } from '@/components/wines/Seal';
import { OrganicBadge } from '@/components/ui/OrganicBadge';
import { AddToCart } from '@/components/shop/AddToCart';
import { proposalPrices, shopCopy as S } from '@content/products';
import { products } from '@/lib/shop/catalog';
import { absolute, alternates, jsonLd } from '@/lib/seo';
import { productLd } from '@/lib/shop/ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => products.map((p) => ({ locale, slug: p.slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/wines/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = wines.find((x) => x.slug === slug);
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  if (!w) return { title: p.name, description: l(p.summary), alternates: alternates(locale as Locale, { pathname: '/wines/[slug]', params: { slug } }) };
  return {
    title: `${w.name} — ${l(W.dossier)}`,
    description: `${l(w.summary)} ${l(w.tasting)}`,
    alternates: alternates(locale as Locale, { pathname: '/wines/[slug]', params: { slug } }),
  };
}

type L = { en: string; hr: string };

export default async function Dossier({ params }: PageProps<'/[locale]/wines/[slug]'>) {
  const { locale: raw, slug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const product = products.find((x) => x.slug === slug);
  if (!product) notFound();
  if (product.kind === 'gift') return <GiftPage slug={slug} locale={locale} />;
  const index = wines.findIndex((x) => x.slug === slug);
  const w = wines[index];
  const l = (x: L) => x[locale];
  const n = (x: number) => new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-US').format(x);
  const no = String(index + 1).padStart(2, '0');
  const prev = wines[(index - 1 + wines.length) % wines.length];
  const next = wines[(index + 1) % wines.length];
  const tbd = <span className="text-ink-soft italic">— {l(W.tbd)}</span>;
  const val = (v: string | L) => {
    const s = typeof v === 'string' ? v : l(v);
    return s === 'TBD' ? tbd : s;
  };

  const sheet: [keyof typeof W.fields, string | L][] = [
    ['parcel', w.sheet.parcel],
    ['soil', w.sheet.soil],
    ['area', w.sheet.area],
    ['variety', w.sheet.variety],
    ['rootstock', w.sheet.rootstock],
    ['density', w.sheet.density],
    ['training', w.sheet.training],
    ['harvest', w.sheet.harvest],
    ['fermentation', w.sheet.fermentation],
    ['ageing', w.sheet.ageing],
  ];
  const serve: [keyof typeof W.fields, string | L][] = [
    ['glass', w.serve.glass],
    ['temperature', w.serve.temperature],
    ['pairing', w.serve.pairing],
    ['drink', w.serve.ageing],
  ];
  const tastingWith = experiences.filter((e) => e.wines.includes(w.slug)).length;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd(w.slug, locale, absolute(locale, { pathname: '/wines/[slug]', params: { slug: w.slug } })))} />
      {/* ── File header ── */}
      <section className="surface-limestone grain pt-[calc(var(--nav-h)+2.5rem)] md:pt-[calc(var(--nav-h)+4rem)]">
        <div className="container-x">
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-basalt/20 py-3 font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">
            <span>
              {l(W.estate)} · Vicelić · Dingač, Pelješac
            </span>
            <span>
              {l(W.dossier)} Nº {no} / {String(wines.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </section>

      <article className="surface-limestone grain pb-20 md:pb-32">
        <div className="container-x grid gap-12 pt-10 md:pt-16 lg:grid-cols-12 lg:gap-16">
          {/* Bottle */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+2rem)]">
              <Reveal immediate className="relative mx-auto w-1/2 max-w-64 lg:w-full">
                <ImageSlot id={(("dossierSlot" in w && w.dossierSlot) || w.bottleSlot) as ImageSlotId} priority sizes="(min-width: 1024px) 25vw, 50vw" />
                <Seal text="VICELIĆ · DINGAČ · PELJEŠAC · ORGANIC · " center={no} className="absolute -right-6 -bottom-6 size-24 rotate-[-12deg] text-plavac/70 md:size-28 lg:-right-10" />
              </Reveal>
              <div id="buy" className="mt-12 scroll-mt-[calc(var(--nav-h)+1rem)] border-t-2 border-basalt pt-6">
                <p className="font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">
                  {l(W.vintage)}: {w.vintage === 'TBD' ? tbd : w.vintage}
                </p>
                <div className="mt-6">
                  <AddToCart formats={product.formats} locale={locale} />
                </div>
                <div className="mt-6 space-y-1 text-xs text-ink-soft">
                  <p>{l(S.shipsTo)}</p>
                  {proposalPrices && <p>{l(S.proposal)}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* The file */}
          <div className="lg:col-span-8">
            <Reveal immediate>
              {w.slug === 'dingac' && <OrganicBadge locale={locale} className="mb-6" />}
              <p className="label text-sun-deep">{l(w.style)}</p>
              <h1 className="mt-5 text-display-xl font-light">{w.name}</h1>
              <p className="mt-8 max-w-2xl text-lede text-ink-soft">{l(w.summary)}</p>
              <p className="mt-6 font-mono text-xs tracking-[0.1em] text-ink-soft uppercase">{l(W.method)}</p>
            </Reveal>

            <Reveal delay={100} className="mt-16">
              <h2 className="label flex items-center gap-4 text-basalt">
                <span className="font-mono tracking-normal text-sun-deep">A</span>
                {l(W.tasting)}
              </h2>
              <p className="mt-6 max-w-2xl text-display-s font-light italic">{l(w.tasting)}</p>
            </Reveal>

            <Reveal delay={150} className="mt-16">
              <h2 className="label flex items-center gap-4 text-basalt">
                <span className="font-mono tracking-normal text-sun-deep">B</span>
                {l(W.sheet)}
              </h2>
              <dl className="mt-6 border-t-2 border-basalt font-mono text-sm">
                {sheet.map(([k, v], i) => (
                  <div key={k} className="grid grid-cols-[2rem_1fr] gap-x-4 gap-y-1 border-b border-basalt/15 py-3.5 sm:grid-cols-[3rem_13rem_1fr]">
                    <dt className="contents">
                      <span className="text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[0.75rem] tracking-[0.14em] text-ink-soft uppercase">{l(W.fields[k])}</span>
                    </dt>
                    <dd className="col-start-2 sm:col-start-auto">{val(v)}</dd>
                  </div>
                ))}
                <div className="grid grid-cols-[2rem_1fr] items-baseline gap-x-4 gap-y-1 border-b-2 border-basalt py-5 sm:grid-cols-[3rem_13rem_1fr]">
                  <dt className="contents">
                    <span className="text-ink-soft">{String(sheet.length + 1).padStart(2, '0')}</span>
                    <span className="text-[0.75rem] tracking-[0.14em] text-ink-soft uppercase">{l(W.fields.bottles)}</span>
                  </dt>
                  <dd className="col-start-2 text-display-s font-light sm:col-start-auto" style={{ fontFamily: 'var(--font-display)' }}>
                    {n(w.sheet.bottles)}
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={150} className="mt-16">
              <h2 className="label flex items-center gap-4 text-basalt">
                <span className="font-mono tracking-normal text-sun-deep">C</span>
                {l(W.serve)}
              </h2>
              <dl className="mt-6 grid gap-px bg-basalt/15 sm:grid-cols-2 lg:grid-cols-4">
                {serve.map(([k, v]) => (
                  <div key={k} className="bg-limestone p-5">
                    <dt className="font-mono text-xs tracking-[0.14em] text-ink-soft uppercase">{l(W.fields[k])}</dt>
                    <dd className="mt-3">{val(v)}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {product.detailSlots && product.detailSlots.length > 0 && (
              <Reveal delay={150} className="mt-16">
                <h2 className="label flex items-center gap-4 text-basalt">
                  <span className="font-mono tracking-normal text-sun-deep">D</span>
                  {l(W.gallery)}
                </h2>
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {product.detailSlots.map((id) => (
                    <li key={id}>
                      <ImageSlot id={id as ImageSlotId} compact sizes="(min-width: 1024px) 20vw, 45vw" />
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </article>

      {/* ── Scarcity + actions ── */}
      <section className="surface-plavac grain py-20 md:py-32">
        <div className="container-x grid items-end gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="text-[clamp(4rem,2rem+10vw,11rem)] leading-[0.85] font-extralight tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)' }}>
              {n(w.sheet.bottles)}
            </p>
            <p className="mt-4 text-display-m font-light">
              {l(W.bottlesLine)} <span className="text-sun-pale italic">{l(W.worldwide)}</span>
            </p>
          </Reveal>
          <Reveal delay={150} className="flex flex-col gap-3 lg:col-span-4 lg:col-start-9">
            <a href="#buy" className="btn btn-sun">
              {l(W.buy)} <ArrowRight size={16} />
            </a>
            {tastingWith > 0 && (
              <Link href="/experience" className="btn btn-ghost">
                {l(W.taste)}
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── Other files ── */}
      <nav aria-label={l(W.all)} className="surface-sun grain">
        <div className="container-x grid grid-cols-2 divide-x divide-basalt/15 border-b border-basalt/15">
          {[
            [prev, l(W.prev), 'left'],
            [next, l(W.next), 'right'],
          ].map(([x, label, side]) => {
            const wine = x as (typeof wines)[number];
            const i = wines.indexOf(wine);
            return (
              <Link
                key={String(side)}
                href={{ pathname: '/wines/[slug]', params: { slug: wine.slug } }}
                className={`group py-10 md:py-14 ${side === 'right' ? 'pl-6 text-right md:pl-10' : 'pr-6 md:pr-10'}`}
              >
                <span className="label block text-ink-soft">
                  {label as string} · Nº {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mt-3 block text-display-s font-light transition-colors duration-500 group-hover:text-plavac" style={{ fontFamily: 'var(--font-display)' }}>
                  {wine.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/** The gift box: no dossier of its own — what is inside, and the buy box. */
function GiftPage({ slug, locale }: { slug: string; locale: Locale }) {
  const p = products.find((x) => x.slug === slug)!;
  const l = (x: L) => x[locale];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(productLd(p.slug, locale, absolute(locale, { pathname: '/wines/[slug]', params: { slug: p.slug } })))} />
      <section className="surface-limestone grain pt-[calc(var(--nav-h)+2rem)] pb-20 md:pt-[calc(var(--nav-h)+4rem)] md:pb-32">
        <div className="container-x">
          <Link href="/wines" className="label text-ink-soft hover:text-basalt">
            ← {l(W.all)}
          </Link>
          <div className="mt-8 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <div className="mx-auto w-3/4 max-w-80 md:w-full">
                <ImageSlot id={p.bottleSlot as ImageSlotId} priority sizes="(min-width: 768px) 30vw, 75vw" />
              </div>
            </div>
            <div className="min-w-0 md:col-span-7 lg:col-span-6">
              <p className="label text-sun-deep">{l(S.giftEyebrow)}</p>
              <h1 className="mt-4 text-display-l font-light">{p.name}</h1>
              <p className="mt-6 text-lede text-ink-soft">{l(p.summary)}</p>
              <ul className="mt-8 border-t border-basalt/15">
                {wines.map((w) => (
                  <li key={w.slug} className="border-b border-basalt/15">
                    <Link href={{ pathname: '/wines/[slug]', params: { slug: w.slug } }} className="flex items-baseline justify-between gap-4 py-3 hover:text-plavac">
                      <span className="font-mono text-sm">1 × {w.name}</span>
                      <span className="text-sm text-ink-soft">{l(w.style)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <AddToCart formats={p.formats} locale={locale} />
              </div>
              <div className="mt-10 space-y-2 border-t border-basalt/15 pt-6 text-sm text-ink-soft">
                <p>{l(S.shipsTo)}</p>
                <p>{l(W.method)}</p>
                {proposalPrices && <p>{l(S.proposal)}</p>}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
