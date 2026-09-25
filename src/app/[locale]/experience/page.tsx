import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { experiencePage as P, faq } from '@content/booking';
import { experiences } from '@content/experiences';
import { wines } from '@content/wines';
import { availability } from '@content/availability';
import type { ImageSlotId } from '@content/image-slots';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { MapBlock } from '@/components/ui/MapBlock';
import { ArrowRight } from '@/components/ui/icons';
import { BookingWidget, type WidgetExperience } from '@/components/booking/BookingWidget';
import { TradeForm } from '@/components/booking/TradeForm';
import { fill, formatEur } from '@/lib/format';
import { todayIn } from '@/lib/booking/time';
import { stripeEnabled } from '@/lib/stripe';

export async function generateMetadata({ params }: PageProps<'/[locale]/experience'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return {
    title: l(P.title),
    description: l(P.lede),
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

export default async function ExperiencePage({ params }: PageProps<'/[locale]/experience'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = <T,>(x: { en: T; hr: T }) => x[locale];
  const wineName = (slug: string) => wines.find((w) => w.slug === slug)?.name ?? (locale === 'hr' ? 'Uzorak iz bačve' : 'Barrel sample');

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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ── Intro ── */}
      <section data-nav-tone="dark" className="surface-shade grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+7rem)] md:pb-24">
        <div className="container-x">
          <Reveal>
            <p className="label text-sun">{l(P.eyebrow)}</p>
            <h1 className="mt-6 text-display-xl font-light">{l(P.title)}</h1>
          </Reveal>
          <Reveal delay={150} className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <p className="max-w-2xl text-lede text-bone/80">{l(P.lede)}</p>
            <a href="#book" className="btn btn-sun shrink-0">
              {l(P.jump)} <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── The three tiers ── */}
      <section className="surface-sun grain py-16 md:py-28" aria-label={l(P.title)}>
        <div className="container-x space-y-20 md:space-y-32">
          {experiences.map((e, i) => (
            <article key={e.slug} id={e.slug} className="grid scroll-mt-[calc(var(--nav-h)+1rem)] gap-10 lg:grid-cols-12 lg:gap-16">
              <Reveal className={`lg:col-span-5 ${i % 2 ? 'lg:order-2 lg:col-start-8' : ''}`}>
                <ImageSlot id={e.imageSlot as ImageSlotId} sizes="(min-width: 1024px) 40vw, 100vw" />
              </Reveal>
              <div className={`lg:col-span-7 ${i % 2 ? 'lg:order-1' : ''}`}>
                <Reveal>
                  <p className="font-mono text-sm text-sun-deep">{['I', 'II', 'III'][e.tier - 1]}</p>
                  <h2 className="mt-3 text-display-l font-light">{e.name}</h2>
                  <p className="mt-4 text-display-s font-light text-ink-soft italic">{l(e.tagline)}</p>
                  <p className="mt-6 max-w-xl text-ink-soft">{l(e.description)}</p>
                </Reveal>

                <Reveal delay={120}>
                  <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-basalt/15 pt-6 sm:grid-cols-3">
                    <div>
                      <dt className="label text-ink-soft">{l(P.duration)}</dt>
                      <dd className="mt-1 font-mono">{duration(e.durationMinutes, locale)}</dd>
                    </div>
                    <div>
                      <dt className="label text-ink-soft">{l(P.group)}</dt>
                      <dd className="mt-1 font-mono">{fill(l(P.guestsRange), { min: e.minGuests, max: e.maxGuests })}</dd>
                    </div>
                    <div>
                      <dt className="label text-ink-soft">{l(P.languages)}</dt>
                      <dd className="mt-1">{e.languages.map((x) => P.langNames[locale][x]).join(', ')}</dd>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <dt className="label text-ink-soft">{l(P.wines)}</dt>
                      <dd className="mt-1">
                        {e.winesIncluded} · {e.wines.map(wineName).join(' · ')}
                      </dd>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <dt className="label text-ink-soft">{l(P.food)}</dt>
                      <dd className="mt-1">{e.food ? l(e.food) : l(P.noFood)}</dd>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <dt className="label text-ink-soft">{l(P.children)}</dt>
                      <dd className="mt-1 text-ink-soft">{l(e.childPolicy)}</dd>
                    </div>
                  </dl>
                </Reveal>

                <Reveal delay={200}>
                  <h3 className="label mt-10 text-ink-soft">{l(P.expect)}</h3>
                  <ol className="mt-4 border-l border-basalt/15">
                    {e.schedule.map((s) => (
                      <li key={s.minute} className="relative grid grid-cols-[3.5rem_1fr] gap-3 py-2 pl-5">
                        <span aria-hidden className="absolute top-[1.05rem] -left-[3px] size-[5px] rounded-full bg-sun-deep" />
                        <span className="font-mono text-sm text-sun-deep">{clock(s.minute)}</span>
                        <span>{l(s.text)}</span>
                      </li>
                    ))}
                  </ol>
                </Reveal>

                <Reveal delay={260} className="mt-10 flex flex-wrap items-center justify-between gap-6 border-t border-basalt/15 pt-6">
                  <p>
                    <span className="text-display-m font-light">{typeof e.pricePerPerson === 'number' ? formatEur(e.pricePerPerson, locale) : 'TBD'}</span>
                    <span className="ml-2 text-ink-soft">{l(P.perPerson)}</span>
                  </p>
                  <a href={`#book=${e.slug}`} className="btn btn-primary">
                    {l(P.book)} <ArrowRight size={16} />
                  </a>
                </Reveal>
              </div>
            </article>
          ))}
          {experiences.some((e) => e.proposalValues) && <p className="text-xs text-ink-soft">{l(P.proposal)}</p>}
        </div>
      </section>

      {/* ── Booking ── */}
      <section id="book" className="surface-limestone grain scroll-mt-[var(--nav-h)] py-16 md:py-28" aria-labelledby="book-title">
        <div className="container-x">
          <p className="label text-sun-deep">{l(P.jump)}</p>
          <h2 id="book-title" className="mt-4 mb-12 text-display-l font-light">
            {locale === 'hr' ? 'Rezervacija' : 'Booking'}
          </h2>
          <BookingWidget locale={locale} experiences={widgetExperiences} today={todayIn(availability.timezone)} demo={!stripeEnabled()} />
        </div>
      </section>

      {/* ── Where ── */}
      <section className="surface-sun grain py-16 md:py-28" aria-labelledby="where-title">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="label text-sun-deep">{l(P.where.eyebrow)}</p>
            <h2 id="where-title" className="mt-4 text-display-m font-light">
              {l(P.where.title)}
            </h2>
            <p className="mt-6 font-mono">{l(P.where.fromDubrovnik)}</p>
            <p className="mt-4 text-ink-soft">{l(P.where.transfer)}</p>
          </div>
          <div className="lg:col-span-7">
            <MapBlock locale={locale} />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="surface-limestone grain py-16 md:py-28" aria-labelledby="faq-title">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <h2 id="faq-title" className="text-display-m font-light lg:col-span-4">
            {l(P.faqTitle)}
          </h2>
          <div className="lg:col-span-8">
            {faq.map((f) => (
              <details key={f.q.en} className="group border-b border-basalt/15 py-5 first:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg [&::-webkit-details-marker]:hidden">
                  <span style={{ fontFamily: 'var(--font-display)' }} className="text-xl">
                    {l(f.q)}
                  </span>
                  <span aria-hidden className="font-mono text-sun-deep transition-transform duration-500 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-ink-soft">{l(f.a)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trade ── */}
      <section className="surface-shade grain py-16 md:py-28" aria-labelledby="trade-title">
        <div className="container-x grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <p className="label text-sun">{l(P.trade.eyebrow)}</p>
            <h2 id="trade-title" className="mt-4 text-display-m font-light">
              {l(P.trade.title)}
            </h2>
            <p className="mt-6 text-bone/75">{l(P.trade.body)}</p>
          </div>
          <div className="lg:col-span-7">
            <TradeForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
