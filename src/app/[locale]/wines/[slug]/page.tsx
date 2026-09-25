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
import { formatEur } from '@/lib/format';
import { absolute, alternates, jsonLd } from '@/lib/seo';
import { productLd } from '@/lib/shop/ld';

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => wines.map((w) => ({ locale, slug: w.slug })));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/wines/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = wines.find((x) => x.slug === slug);
  if (!w) return {};
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
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
  const index = wines.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
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
              <dl className="mt-12 grid grid-cols-2 gap-px bg-basalt/15 font-mono text-sm">
                <div className="bg-limestone p-4">
                  <dt className="text-xs tracking-[0.14em] text-ink-soft uppercase">{l(W.vintage)}</dt>
                  <dd className="mt-2">{w.vintage === 'TBD' ? tbd : w.vintage}</dd>
                </div>
                <div className="bg-limestone p-4">
                  <dt className="text-xs tracking-[0.14em] text-ink-soft uppercase">{l(W.price)}</dt>
                  <dd className="mt-2">{w.price === 'TBD' ? tbd : formatEur(w.price, locale)}</dd>
                </div>
              </dl>
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
            <Link href="/shop" className="btn btn-sun">
              {l(W.buy)} <ArrowRight size={16} />
            </Link>
            {tastingWith > 0 && (
              <Link href="/experience" className="btn btn-ghost">
                {l(W.taste)}
              </Link>
            )}
            {w.price === 'TBD' && <p className="mt-2 text-sm text-bone/70">{l(W.shopSoon)}</p>}
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
