import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { wines, winesCopy as W, totalBottles } from '@content/wines';
import type { ImageSlotId } from '@content/image-slots';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { alternates } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/wines'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return { title: l(W.overview.eyebrow), description: l(W.overview.lede), alternates: alternates(locale as Locale, '/wines') };
}

export default async function WinesPage({ params }: PageProps<'/[locale]/wines'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = (x: { en: string; hr: string }) => x[locale];
  const n = (x: number) => new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-US').format(x);

  return (
    <>
      <section data-nav-tone="dark" className="surface-cellar grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+7rem)] md:pb-24">
        <div className="container-x">
          <Reveal immediate>
            <p className="label text-sun">{l(W.overview.eyebrow)}</p>
            <h1 className="mt-6 max-w-5xl text-display-xl font-light">{l(W.overview.title)}</h1>
          </Reveal>
          <Reveal immediate delay={150} className="mt-10 grid gap-8 md:grid-cols-12">
            <p className="text-lede text-bone/80 md:col-span-7">{l(W.overview.lede)}</p>
            <p className="font-mono text-sm text-sun-pale md:col-span-4 md:col-start-9 md:text-right">
              <span className="block text-display-m font-light" style={{ fontFamily: 'var(--font-display)' }}>
                {n(totalBottles)}
              </span>
              {l(W.overview.total)}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="surface-sun grain py-10 md:py-16">
        <ol className="container-x">
          {wines.map((w, i) => (
            <Reveal as="li" key={w.slug} delay={i * 100} className="border-b border-basalt/15 last:border-b-0">
              <Link
                href={{ pathname: '/wines/[slug]', params: { slug: w.slug } }}
                className="group grid grid-cols-[5.5rem_1fr] items-center gap-6 py-10 sm:grid-cols-[7rem_1fr] md:grid-cols-[3rem_9rem_1fr_auto] md:gap-10 md:py-14"
              >
                <span className="hidden font-mono text-sm text-sun-deep md:block">{String(i + 1).padStart(2, '0')}</span>
                <span className="block transition-transform duration-[1.2s] ease-[var(--ease-settle)] group-hover:-translate-y-2">
                  <ImageSlot id={w.bottleSlot as ImageSlotId} compact sizes="144px" />
                </span>
                <span className="block">
                  <span className="label block text-sun-deep">
                    <span className="md:hidden">{String(i + 1).padStart(2, '0')} · </span>
                    {l(w.style)}
                  </span>
                  <span className="mt-3 block text-display-l font-light" style={{ fontFamily: 'var(--font-display)' }}>
                    {w.name}
                  </span>
                  <span className="mt-4 block max-w-xl text-ink-soft">{l(w.summary)}</span>
                  <span className="mt-5 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-ink-soft">
                    <span>{l(w.sheet.soil)}</span>
                    <span>{w.sheet.area}</span>
                    <span>
                      {n(w.sheet.bottles)} {l(W.bottlesLine).replace('.', '')}
                    </span>
                  </span>
                </span>
                <span className="btn-link col-span-2 justify-self-start md:col-span-1 md:justify-self-end">
                  {l(W.overview.open)} <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
      </section>
    </>
  );
}
