import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { HeroVideo } from '@/components/ui/HeroVideo';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, WhatsAppIcon } from '@/components/ui/icons';
import { home, organic } from '@content/home';
import { Leaf, OrganicBadge } from '@/components/ui/OrganicBadge';
import { site } from '@content/site';
import type { ImageSlotId } from '@content/image-slots';
import type { Metadata } from 'next';
import { absolute, alternates, jsonLd, siteUrl, wineryLd } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: alternates(locale as Locale, '/') };
}

type L = { en: string; hr: string };

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const t = await getTranslations();
  const l = (x: L) => x[locale];
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t('whatsapp.prefill'))}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(wineryLd(locale))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          '@id': `${siteUrl}/#website`,
          name: site.nameEn,
          alternateName: site.nameHr,
          url: absolute(locale, '/'),
          inLanguage: locale === 'hr' ? 'hr-HR' : 'en',
          publisher: { '@id': `${siteUrl}/#winery` },
        })}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section data-nav-tone="dark" className="surface-shade relative flex min-h-[100svh] items-end overflow-hidden">
        <HeroVideo />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/40 to-basalt/10" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-basalt/70 to-transparent md:h-56" />
        <div className="container-x relative pt-[var(--nav-h)] pb-36 md:pb-28">
          <OrganicBadge locale={locale} tone="dark" className="gate-in bg-basalt/30 backdrop-blur-sm" />
          <h1 className="gate-in mt-8 text-display-xl font-light">
            {t('masterLine')
              .split(/(?<=\.) /)
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </h1>
          <p className="gate-in mt-6 max-w-xl text-lede text-bone/80">{l(home.hero.lede)}</p>
          <div className="gate-in mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/experience" className="btn btn-sun">
              {t('home.heroPrimary')} <ArrowRight size={16} />
            </Link>
            <Link href="/wines" className="btn btn-ghost">
              {l(home.hero.secondary)}
            </Link>
          </div>
        </div>
      </section>

      {/* ── How we farm: the only certified organic Dingač ───── */}
      <section className="surface-limestone grain py-24 md:py-36" aria-labelledby="organic-title">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <Reveal className="lg:col-span-6">
            <p className="label text-sun-deep">{l(home.farming.eyebrow)}</p>
            <h2 id="organic-title" className="mt-6 text-display-l font-light">
              <span className="block">{organic.title[locale][0]}</span>
              <span className="block text-sun-deep italic">{organic.title[locale][1]}</span>
            </h2>
            <p className="mt-8 max-w-xl text-lede text-ink-soft">{l(organic.body)}</p>
            <ul className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {organic.points.map((pt) => (
                <li key={pt.en} className="flex items-center gap-3 border-t border-basalt/15 pt-4">
                  <span className="text-sun-deep">
                    <Leaf size={16} />
                  </span>
                  {l(pt)}
                </li>
              ))}
            </ul>
            <Link href={{ pathname: '/family', hash: 'farming' }} className="btn-link mt-10">
              {l(home.farming.cta)} <ArrowRight size={14} />
            </Link>
          </Reveal>
          <Reveal delay={150} className="mx-auto w-full max-w-md lg:col-span-5 lg:col-start-8">
            <ImageSlot id="dingac-organic" sizes="(min-width: 1024px) 36vw, 90vw" />
          </Reveal>
        </div>
      </section>

      {/* ── Three doors: visit, wines, the place ─────────────── */}
      <section className="surface-shade" aria-label={t('nav.primary')}>
        <ul className="grid md:grid-cols-3">
          {home.tiles.map((tile, i) => (
            <Reveal as="li" key={tile.href} delay={i * 120}>
              <Link href={tile.href} className="group relative block aspect-[4/5] overflow-hidden md:aspect-[3/4]">
                <div className="absolute inset-0 transition-transform duration-[1.6s] ease-[var(--ease-settle)] group-hover:scale-[1.04]">
                  <ImageSlot id={tile.slot as ImageSlotId} fill compact sizes="(min-width: 768px) 33vw, 100vw" />
                </div>
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt/90 via-basalt/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-bone md:p-8 lg:p-10">
                  <p className="label text-sun-pale">{l(tile.eyebrow)}</p>
                  <h2 className="mt-3 text-display-m font-light">{l(tile.title)}</h2>
                  <span className="btn-link mt-5 text-bone">
                    {l(tile.cta)} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* ── The place: one terroir, three suns ─────────────────── */}
      <section className="surface-sun grain py-24 md:py-36" aria-labelledby="story-title">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <ImageSlot id="ridge-view" sizes="(min-width: 1024px) 50vw, 100vw" />
          </Reveal>
          <Reveal delay={150} className="lg:col-span-5 lg:col-start-8">
            <p className="label text-sun-deep">{l(home.story.eyebrow)}</p>
            <h2 id="story-title" className="mt-6 text-display-l font-light">
              {l(home.story.title)}
            </h2>
            <p className="mt-8 text-lede text-ink-soft">{l(home.story.body)}</p>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <Link href="/dingac" className="btn-link">
                {l(home.story.dingac)} <ArrowRight size={14} />
              </Link>
              <Link href="/family" className="btn-link">
                {l(home.story.family)} <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final call ───────────────────────────────────────── */}
      <section className="grain bg-adriatic py-24 text-bone md:py-36" aria-labelledby="final-title">
        <div className="container-x">
          <Reveal>
            <h2 id="final-title" className="text-display-xl font-light">
              {l(home.final.title)}
            </h2>
            <p className="mt-8 max-w-lg text-lede text-bone/80">{l(home.final.body)}</p>
          </Reveal>
          <Reveal delay={200} className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <Link href="/experience" className="btn btn-sun">
              {l(home.final.cta)} <ArrowRight size={16} />
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-link text-bone">
              <WhatsAppIcon size={16} /> {l(home.final.whatsapp)}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
