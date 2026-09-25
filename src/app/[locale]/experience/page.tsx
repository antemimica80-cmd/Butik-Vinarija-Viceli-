import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { experiencePage as P, faq } from '@content/booking';
import { experiences } from '@content/experiences';
import { wines } from '@content/wines';
import { availability } from '@content/availability';
import { site } from '@content/site';
import type { ImageSlotId } from '@content/image-slots';
import type { Experience } from '@/lib/content-schema';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { MapBlock } from '@/components/ui/MapBlock';
import { ArrowRight } from '@/components/ui/icons';
import { BookingWidget, type WidgetExperience } from '@/components/booking/BookingWidget';
import { TradeForm } from '@/components/booking/TradeForm';
import { fill, formatEur } from '@/lib/format';
import { todayIn } from '@/lib/booking/time';
import { stripeEnabled } from '@/lib/stripe';
import { absolute, alternates, jsonLd, siteUrl } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/experience'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return {
    title: l(P.title),
    description: l(P.heroLede),
    alternates: alternates(locale as Locale, '/experience'),
  };
}

function duration(min: number, locale: Locale) {
  if (min < 90) return `${min} min`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1).replace('.', locale === 'hr' ? ',' : '.')} h`;
}

function clock(minute: number) {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

type L = { en: string; hr: string };

/** "75 MIN · 3 WINES · 1–12 GUESTS" */
function metaLine(e: Experience, locale: Locale) {
  const l = (x: L) => x[locale];
  const parts = [duration(e.durationMinutes, locale), `${e.winesIncluded} ${l(P.metaWines)}`];
  if (e.food) parts.push(l(P.metaFood));
  parts.push(e.tier === 3 ? `${l(P.metaPrivate)} · ${e.minGuests}–${e.maxGuests}` : `${e.minGuests}–${e.maxGuests} ${l(P.metaGuests)}`);
  return parts.join(' · ');
}

/** The detail that used to crowd the page, now behind "View the experience". */
function Details({ e, locale, dark }: { e: Experience; locale: Locale; dark?: boolean }) {
  const l = (x: L) => x[locale];
  const wineName = (slug: string) => wines.find((w) => w.slug === slug)?.name ?? (locale === 'hr' ? 'Uzorak iz bačve' : 'Barrel sample');
  const muted = dark ? 'text-bone/70' : 'text-ink-soft';
  const accent = dark ? 'text-sun' : 'text-sun-deep';
  const rule = dark ? 'border-bone/15' : 'border-basalt/15';
  return (
    <details className="group mt-10">
      <summary className={`btn-link cursor-pointer list-none [&::-webkit-details-marker]:hidden ${dark ? 'text-bone/80' : 'text-ink-soft'}`}>
        <span className="group-open:hidden">{l(P.viewExperience)}</span>
        <span className="hidden group-open:inline">{l(P.hideExperience)}</span>
        <span aria-hidden className="transition-transform duration-500 group-open:rotate-45">+</span>
      </summary>
      <div className={`mt-8 grid gap-10 border-t pt-8 sm:grid-cols-2 ${rule}`}>
        <div>
          <h3 className={`label ${muted}`}>{l(P.expect)}</h3>
          <ol className="mt-4 space-y-3">
            {e.schedule.map((s) => (
              <li key={s.minute} className="grid grid-cols-[3.25rem_1fr] gap-3 text-[0.95rem] leading-snug">
                <span className={`font-mono text-sm ${accent}`}>{clock(s.minute)}</span>
                <span>{l(s.text)}</span>
              </li>
            ))}
          </ol>
        </div>
        <dl className="space-y-5 text-[0.95rem]">
          <div>
            <dt className={`label ${muted}`}>{l(P.wines)}</dt>
            <dd className="mt-1">{e.wines.map(wineName).join(' · ')}</dd>
          </div>
          <div>
            <dt className={`label ${muted}`}>{l(P.food)}</dt>
            <dd className="mt-1">{e.food ? l(e.food) : l(P.noFood)}</dd>
          </div>
          <div>
            <dt className={`label ${muted}`}>{l(P.languages)}</dt>
            <dd className="mt-1">{e.languages.map((x) => P.langNames[locale][x]).join(', ')}</dd>
          </div>
          <div>
            <dt className={`label ${muted}`}>{l(P.children)}</dt>
            <dd className={`mt-1 ${muted}`}>{l(e.childPolicy)}</dd>
          </div>
        </dl>
      </div>
    </details>
  );
}

function Price({ e, locale, dark }: { e: Experience; locale: Locale; dark?: boolean }) {
  return (
    <p className="flex items-baseline gap-3">
      <span className="text-display-m font-light">{typeof e.pricePerPerson === 'number' ? formatEur(e.pricePerPerson, locale) : 'TBD'}</span>
      <span className={`label ${dark ? 'text-bone/60' : 'text-ink-soft'}`}>/ {P.perPerson[locale]}</span>
    </p>
  );
}

export default async function ExperiencePage({ params }: PageProps<'/[locale]/experience'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = <T,>(x: { en: T; hr: T }) => x[locale];

  const widgetExperiences: WidgetExperience[] = experiences.map((e) => ({
    slug: e.slug,
    name: e.name,
    tier: e.tier,
    price: typeof e.pricePerPerson === 'number' ? e.pricePerPerson : 0,
    minGuests: e.minGuests,
    maxGuests: e.maxGuests,
    durationLabel: duration(e.durationMinutes, locale),
    winterSlots: e.seasons.find((s) => s.onRequestOnly)?.slots ?? [],
  }));

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq
      .filter((f) => !l(f.a).startsWith('TODO'))
      .map((f) => ({ '@type': 'Question', name: l(f.q), acceptedAnswer: { '@type': 'Answer', text: l(f.a) } })),
  };

  const faqOrder = ['Can we bring children?', 'Dietary requirements', 'Getting here', 'Cancellation'];
  const faqOrdered = [...faq].sort((a, b) => (faqOrder.indexOf(a.q.en) + 1 || 99) - (faqOrder.indexOf(b.q.en) + 1 || 99));
  const editorial = experiences.filter((e) => e.tier < 3);
  const signature = experiences.find((e) => e.tier === 3);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqLd)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: locale === 'hr' ? `Degustacija vina — ${site.nameHr}` : `Wine tasting — ${site.nameEn}`,
          description: l(P.heroLede),
          url: absolute(locale, '/experience'),
          touristType: ['Wine lovers', 'Visitors to Dubrovnik and Pelješac'],
          isAccessibleForFree: false,
          image: `${siteUrl}/media/terrace-sea-view.jpg`,
          address: { '@type': 'PostalAddress', streetAddress: site.address.street, postalCode: site.address.postalCode, addressLocality: site.address.city, addressCountry: 'HR' },
          provider: { '@id': `${siteUrl}/#winery` },
          makesOffer: experiences
            .filter((e) => typeof e.pricePerPerson === 'number')
            .map((e) => ({ '@type': 'Offer', name: e.name, description: l(e.tagline), price: e.pricePerPerson, priceCurrency: 'EUR', url: `${absolute(locale, '/experience')}#${e.slug}` })),
        })}
      />

      {/* ── Cinematic hero ── */}
      <section data-nav-tone="dark" className="surface-shade relative flex min-h-[88svh] items-end overflow-hidden">
        <ImageSlot id="experience-hero" fill priority labelTop sizes="100vw" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/35 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-basalt/70 to-transparent md:h-56" />
        <div className="container-x relative pt-[var(--nav-h)] pb-20 md:pb-24">
          <p className="label gate-in text-sun-pale">{l(P.eyebrow)}</p>
          <h1 className="gate-in mt-6 text-[clamp(3.25rem,1.5rem+7.5vw,9.5rem)] leading-[0.9] font-light tracking-[-0.02em] uppercase">
            <span className="block">{l(P.heroTitle)[0]}</span>
            <span className="block text-[0.62em] tracking-[0] normal-case italic">{l(P.heroTitle)[1]}</span>
          </h1>
          <div className="gate-in mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-lede text-bone/85">{l(P.heroLede)}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#book" className="btn btn-sun">
                {l(P.heroCta)} <ArrowRight size={16} />
              </a>
              <a href="#tastings" className="btn btn-ghost">
                {l(P.heroSecondary)}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two editorial tastings ── */}
      <section id="tastings" className="surface-sun grain scroll-mt-[var(--nav-h)] py-28 md:py-40" aria-label={l(P.heroSecondary)}>
        <div className="container-x space-y-32 md:space-y-40">
          {editorial.map((e, i) => (
            <article key={e.slug} id={e.slug} className="grid scroll-mt-[calc(var(--nav-h)+2rem)] items-center gap-12 lg:grid-cols-12 lg:gap-20">
              <Reveal className={`lg:col-span-7 ${i % 2 ? 'lg:order-2' : ''}`}>
                <ImageSlot id={e.imageSlot as ImageSlotId} ratio="4/5" sizes="(min-width: 1024px) 58vw, 100vw" />
              </Reveal>
              <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-1' : ''}`}>
                <Reveal>
                  <p className="label text-sun-deep">
                    <span className="font-mono tracking-normal">{['I', 'II'][i]}</span> — {metaLine(e, locale)}
                  </p>
                  <h2 className="mt-6 text-display-l font-light">{e.name}</h2>
                  <p className="mt-5 text-display-s font-light text-ink-soft italic">{l(e.tagline)}</p>
                  <p className="mt-8 max-w-md text-ink-soft">{l(e.description)}</p>
                </Reveal>
                <Reveal delay={120} className="mt-10">
                  <Price e={e} locale={locale} />
                  <a href={`#book=${e.slug}`} className="btn btn-primary mt-6">
                    {fill(l(P.bookNamed), { name: e.name })} <ArrowRight size={16} />
                  </a>
                  <Details e={e} locale={locale} />
                </Reveal>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── The signature experience ── */}
      {signature && (
        <section id={signature.slug} data-nav-tone="dark" className="surface-cellar grain scroll-mt-[var(--nav-h)] py-28 md:py-40">
          <div className="container-x">
            <Reveal className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <p className="label text-sun">{l(P.signature.label)}</p>
              <span aria-hidden className="h-px w-12 bg-sun/60" />
              <p className="label text-bone/60">{fill(l(P.signature.detail), { max: signature.maxGuests })}</p>
            </Reveal>
            <div className="mt-12 grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
              <Reveal className="lg:col-span-7">
                <ImageSlot id="dingac-slope" ratio="4/5" sizes="(min-width: 1024px) 58vw, 100vw" />
              </Reveal>
              <div className="lg:col-span-5">
                <Reveal>
                  <p className="label text-sun-pale">
                    <span className="font-mono tracking-normal">III</span> — {metaLine(signature, locale)}
                  </p>
                  <h2 className="mt-6 text-display-l font-light">{signature.name}</h2>
                  <p className="mt-5 text-display-s font-light text-bone/75 italic">{l(signature.tagline)}</p>
                  <p className="mt-8 max-w-md text-bone/75">{l(signature.description)}</p>
                </Reveal>
                <Reveal delay={120} className="mt-10">
                  <div className="border-t border-bone/15 pt-8">
                    <Price e={signature} locale={locale} dark />
                  </div>
                  <a href={`#book=${signature.slug}`} className="btn btn-sun mt-6">
                    {fill(l(P.bookNamed), { name: signature.name })} <ArrowRight size={16} />
                  </a>
                  <Details e={signature} locale={locale} dark />
                </Reveal>
              </div>
            </div>
            <Reveal delay={150} className="mt-16 grid grid-cols-2 gap-4 sm:gap-6 lg:w-7/12">
              <ImageSlot id="private-pour" ratio="1/1" compact sizes="(min-width: 1024px) 28vw, 50vw" />
              <ImageSlot id="guests-couple" ratio="1/1" compact sizes="(min-width: 1024px) 28vw, 50vw" />
            </Reveal>
          </div>
        </section>
      )}
      {experiences.some((e) => e.proposalValues) && <p className="surface-sun container-x py-4 text-center text-xs text-ink-soft">{l(P.proposal)}</p>}

      {/* ── Booking ── */}
      <section id="book" className="surface-limestone grain scroll-mt-[var(--nav-h)] py-24 md:py-36" aria-labelledby="book-title">
        <div className="container-x">
          <p className="label text-sun-deep">{l(P.bookingEyebrow)}</p>
          <h2 id="book-title" className="mt-5 mb-14 max-w-3xl text-display-l font-light">
            {l(P.bookingTitle)}
          </h2>
          <BookingWidget locale={locale} experiences={widgetExperiences} today={todayIn(availability.timezone)} demo={!stripeEnabled()} />
        </div>
      </section>

      {/* ── Where: travel editorial ── */}
      <section aria-labelledby="where-title">
        <div data-nav-tone="dark" className="surface-shade relative flex min-h-[70svh] items-end overflow-hidden">
          <ImageSlot id="hero-still" fill sizes="100vw" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt/90 via-basalt/30 to-transparent" />
          <div className="container-x relative py-16 md:py-24">
            <Reveal>
              <p className="label text-sun-pale">{l(P.where.eyebrow)}</p>
              <h2 id="where-title" className="mt-6 text-display-l font-light">
                <span className="block">{l(P.whereOverlay)[0]}</span>
                <span className="block text-bone/85 italic">{l(P.whereOverlay)[1]}</span>
              </h2>
            </Reveal>
          </div>
        </div>
        <div className="surface-sun grain py-20 md:py-28">
          <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <ol className="flex items-start justify-between gap-2 sm:gap-4" aria-label={l(P.where.eyebrow)}>
                {P.route.map((stop, i) => (
                  <li key={stop.name.en} className={`flex items-start gap-2 sm:gap-4 ${i < P.route.length - 1 ? 'flex-1' : ''}`}>
                    <div>
                      <p className="label text-basalt">{l(stop.name)}</p>
                      <p className="mt-2 font-mono text-xs text-ink-soft">{l(stop.time)}</p>
                    </div>
                    {i < P.route.length - 1 && (
                      <span aria-hidden className="mt-0.5 flex flex-1 justify-center text-sun-deep">
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-12 text-lede text-ink-soft">{l(P.where.transfer)}</p>
            </div>
            <div className="lg:col-span-7">
              <MapBlock locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ: light accordion ── */}
      <section className="surface-limestone grain py-20 md:py-28" aria-labelledby="faq-title">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 id="faq-title" className="text-display-s font-light lg:col-span-4">
            {l(P.faqTitle)}
          </h2>
          <div className="lg:col-span-7 lg:col-start-6">
            {faqOrdered.map((f) => (
              <details key={f.q.en} className="group border-b border-basalt/10">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span>{l(f.q)}</span>
                  <span aria-hidden className="font-mono text-lg text-sun-deep transition-transform duration-500 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-ink-soft">{l(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trade: slim banner ── */}
      <section className="surface-shade" aria-labelledby="trade-title">
        <details className="group container-x">
          <summary className="flex cursor-pointer list-none flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
            <span>
              <span id="trade-title" className="label block text-sun">
                {l(P.tradeBanner.label)}
              </span>
              <span className="mt-2 block text-bone/75">{l(P.tradeBanner.text)}</span>
            </span>
            <span className="btn-link shrink-0 self-start text-bone sm:self-auto">
              {l(P.tradeBanner.cta)} <ArrowRight size={14} />
            </span>
          </summary>
          <div className="grid gap-10 border-t border-bone/15 py-12 lg:grid-cols-12 lg:gap-16">
            <p className="text-bone/75 lg:col-span-4">{l(P.trade.body)}</p>
            <div className="lg:col-span-8">
              <TradeForm locale={locale} />
            </div>
          </div>
        </details>
      </section>
    </>
  );
}
