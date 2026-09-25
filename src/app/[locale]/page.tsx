import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { HeroVideo } from '@/components/ui/HeroVideo';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight, WhatsAppIcon } from '@/components/ui/icons';
import { AltitudeLine } from '@/components/signature/AltitudeLine';
import { Tunnel } from '@/components/signature/Tunnel';
import { ThreeSuns } from '@/components/signature/ThreeSuns';
import { BottleCounter } from '@/components/signature/BottleCounter';
import { home, stations, type StationId } from '@content/home';
import { historyClaims, type ClaimId } from '@content/history-claims';
import { wines } from '@content/wines';
import { experiences } from '@content/experiences';
import { testimonials } from '@content/testimonials';
import { site } from '@content/site';
import type { ImageSlotId } from '@content/image-slots';

type L = { en: string; hr: string };

function claimYear(id: ClaimId, locale: Locale) {
  const c = historyClaims[id];
  return locale === 'hr' && 'yearHr' in c ? c.yearHr : c.year;
}

function duration(min: number, locale: Locale) {
  if (min < 90) return `${min} ${home.sea.minutes[locale]}`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} ${home.sea.hours[locale]}`;
}

function Station({ id, className, children }: { id: StationId; className: string; children: ReactNode }) {
  const s = stations.find((x) => x.id === id)!;
  return (
    <section data-station={id} data-altitude={s.altitude} aria-labelledby={`st-${id}`} className={`grain ${className}`}>
      {children}
    </section>
  );
}

function StationLabel({ id, locale, tone = 'light' }: { id: StationId; locale: Locale; tone?: 'light' | 'dark' }) {
  const s = stations.find((x) => x.id === id)!;
  return (
    <p className={`label flex items-center gap-4 ${tone === 'dark' ? 'text-sun' : 'text-sun-deep'}`}>
      <span className="font-mono tracking-normal">{s.altitude} m</span>
      <span aria-hidden className="h-px w-10 bg-current opacity-60" />
      <span>{s.name[locale]}</span>
    </p>
  );
}

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const t = await getTranslations();
  const l = (x: L) => x[locale];
  const dingac = wines.find((w) => w.slug === 'dingac')!;
  const wa = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(t('whatsapp.prefill'))}`;

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section data-nav-tone="dark" className="surface-shade relative flex min-h-[100svh] items-end overflow-hidden">
        <HeroVideo />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/40 to-basalt/10" />
        <div className="container-x relative pt-[var(--nav-h)] pb-40 md:pb-28">
          <p className="label gate-in text-sun-pale">{t('home.heroEyebrow')}</p>
          <h1 className="gate-in mt-6 max-w-5xl text-display-xl font-light">{t('masterLine')}</h1>
          <div className="gate-in mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/experience" className="btn btn-sun">
              {t('home.heroPrimary')} <ArrowRight size={16} />
            </Link>
            <Link href="/dingac" className="btn btn-ghost">
              {t('home.heroSecondary')}
            </Link>
          </div>
        </div>
      </section>

      <AltitudeLine stations={stations.map((s) => ({ id: s.id, altitude: s.altitude, name: s.name[locale] }))} label={locale === 'hr' ? 'nadmorska visina' : 'altitude'} />

      <div data-descent>
        {/* ── Ridge: Dingač, the grand cru of the Adriatic ─────────── */}
        <Station id="ridge" className="surface-sun py-24 md:py-40">
          <div className="container-x">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-7">
                <Reveal>
                  <StationLabel id="ridge" locale={locale} />
                  <h2 id="st-ridge" className="mt-8 text-display-l font-light">
                    {l(home.ridge.title)}
                  </h2>
                </Reveal>
                <Reveal delay={150}>
                  <p className="mt-8 max-w-xl text-lede text-ink-soft">{l(home.ridge.body)}</p>
                </Reveal>
              </div>
              <Reveal delay={200} className="lg:col-span-5 lg:pt-24">
                <ImageSlot id="ridge-view" sizes="(min-width: 1024px) 40vw, 100vw" />
              </Reveal>
            </div>

            <ol className="mt-20 grid border-t border-basalt/15 md:mt-28 md:grid-cols-3">
              {home.ridge.claims.map((id, i) => (
                <Reveal as="li" key={id} delay={i * 150} className="border-b border-basalt/15 py-8 md:border-b-0 md:py-10 md:pr-10 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-10">
                  <p className="font-mono text-sm text-sun-deep">{claimYear(id, locale)}</p>
                  <p className="mt-4 text-display-s font-light">{l(historyClaims[id].text)}</p>
                </Reveal>
              ))}
            </ol>

            <div className="mt-14">
              <Link href="/dingac" className="btn-link">
                {l(home.ridge.cta)} <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </Station>

        {/* ── The tunnel: from the world outside into the vineyard ── */}
        <Tunnel
          eyebrow={l(home.tunnel.eyebrow)}
          year={claimYear(home.tunnel.claim, locale)}
          claim={l(historyClaims[home.tunnel.claim].text)}
          lines={home.tunnel.lines.map(l)}
          emerge={l(home.tunnel.emerge)}
          interior={<ImageSlot id="tunnel-interior" fill compact />}
          exit={<ImageSlot id="tunnel-exit" fill compact />}
        />

        {/* ── Stone: three suns ────────────────────────────────── */}
        <Station id="stone" className="surface-sun py-24 md:py-40">
          <div className="container-x">
            <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <Reveal>
                  <StationLabel id="stone" locale={locale} />
                  <h2 id="st-stone" className="mt-8 text-display-xl font-light">
                    {l(home.stone.title)}
                  </h2>
                </Reveal>
                <Reveal delay={150}>
                  <p className="mt-8 max-w-lg text-lede text-ink-soft">{l(home.stone.body)}</p>
                </Reveal>
              </div>
              <Reveal delay={200} fade className="text-basalt lg:col-span-7">
                <ThreeSuns title={`${l(home.stone.title)} ${l(home.stone.body)}`} labels={home.stone.suns.map((s) => l(s.name)) as [string, string, string]} />
              </Reveal>
            </div>

            <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-12">
              <ol className="grid gap-10 sm:grid-cols-3 md:col-span-8 md:gap-8">
                {home.stone.suns.map((s, i) => (
                  <Reveal as="li" key={s.numeral} delay={i * 150} className="border-t border-basalt/20 pt-6">
                    <p className="font-mono text-sm text-sun-deep">{s.numeral}</p>
                    <h3 className="mt-3 text-display-s font-light">{l(s.name)}</h3>
                    <p className="mt-3 text-ink-soft">{l(s.text)}</p>
                  </Reveal>
                ))}
              </ol>
              <Reveal delay={300} className="md:col-span-4">
                <ImageSlot id="stone-macro" sizes="(min-width: 768px) 30vw, 100vw" />
              </Reveal>
            </div>
          </div>
        </Station>

        {/* ── Vine: the family, the Keeper ─────────────────────── */}
        <Station id="vine" className="surface-shade py-24 md:py-40">
          <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <ImageSlot id="mateo-portrait" sizes="(min-width: 1024px) 40vw, 100vw" />
            </Reveal>
            <div className="lg:col-span-6 lg:col-start-7 lg:pt-16">
              <Reveal>
                <StationLabel id="vine" locale={locale} tone="dark" />
                <h2 id="st-vine" className="mt-8 text-display-l font-light">
                  {l(home.vine.title)}
                </h2>
                <p className="mt-6 text-display-s font-light text-bone/75 italic">{l(home.vine.lede)}</p>
              </Reveal>
              <ol className="mt-14 border-l border-bone/20">
                {home.vine.beats.map((b, i) => {
                  const year = 'claim' in b ? claimYear(b.claim, locale) : l(b.year);
                  const text = 'claim' in b ? l(historyClaims[b.claim].text) : l(b.text);
                  return (
                    <Reveal as="li" key={year} delay={i * 120} className="relative pb-10 pl-8 last:pb-0">
                      <span aria-hidden className="absolute top-2 -left-[4px] size-[7px] rounded-full bg-sun" />
                      <p className="font-mono text-sm text-sun">{year}</p>
                      <p className="mt-2 text-lede text-bone/85">{text}</p>
                    </Reveal>
                  );
                })}
              </ol>
              <Reveal className="mt-14">
                <Link href="/family" className="btn-link text-sun-pale">
                  {l(home.vine.cta)} <ArrowRight size={14} />
                </Link>
              </Reveal>
            </div>
          </div>
        </Station>

        {/* ── Cellar: the wines ────────────────────────────────── */}
        <Station id="cellar" className="surface-cellar py-24 md:py-40">
          <div className="container-x">
            <Reveal>
              <StationLabel id="cellar" locale={locale} tone="dark" />
              <h2 id="st-cellar" className="mt-8 text-display-l font-light">
                {l(home.cellar.title)}
              </h2>
              <p className="mt-6 text-lede text-bone/75">{l(home.cellar.lede)}</p>
            </Reveal>
            <ul className="mt-16 grid gap-px bg-bone/10 md:mt-24 md:grid-cols-3">
              {wines.map((w, i) => (
                <Reveal as="li" key={w.slug} delay={i * 150} className="bg-plavac-deep">
                  <Link href={{ pathname: '/wines/[slug]', params: { slug: w.slug } }} className="group flex h-full flex-col p-6 md:p-8">
                    <div className="mx-auto w-2/5 max-w-40 transition-transform duration-[1.2s] ease-[var(--ease-settle)] group-hover:-translate-y-2">
                      <ImageSlot id={w.bottleSlot as ImageSlotId} compact sizes="160px" />
                    </div>
                    <p className="label mt-10 text-sun">{l(w.style)}</p>
                    <h3 className="mt-3 text-display-m font-light">{w.name}</h3>
                    <p className="mt-4 flex-1 text-bone/75">{l(w.summary)}</p>
                    <dl className="mt-8 flex items-baseline justify-between border-t border-bone/15 pt-5 font-mono text-xs text-stone-light">
                      <dt className="sr-only">{l(home.cellar.bottlesLabel)}</dt>
                      <dd>
                        {new Intl.NumberFormat(locale === 'hr' ? 'hr-HR' : 'en-US').format(w.sheet.bottles)} {l(home.cellar.bottlesLabel)}
                      </dd>
                      <dd className="label text-sun-pale">
                        {l(home.cellar.dossier)} <span aria-hidden>→</span>
                      </dd>
                    </dl>
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        </Station>

        <BottleCounter
          count={dingac.sheet.bottles}
          unit={l(home.cellar.counter.unit)}
          tail={l(home.cellar.counter.tail)}
          note={l(home.cellar.counter.note)}
          locale={locale}
        />

        {/* ── Sea: the tasting ─────────────────────────────────── */}
        <Station id="sea" className="surface-limestone py-24 md:py-40">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <Reveal>
                <StationLabel id="sea" locale={locale} />
                <h2 id="st-sea" className="mt-8 max-w-3xl text-display-l font-light">
                  {l(home.sea.title)}
                </h2>
                <p className="mt-6 max-w-xl text-lede text-ink-soft">{l(home.sea.lede)}</p>
              </Reveal>
              <Reveal delay={150}>
                <Link href="/experience" className="btn-link">
                  {l(home.sea.allTastings)} <ArrowRight size={14} />
                </Link>
              </Reveal>
            </div>

            <ul className="mt-16 grid gap-6 md:mt-20 lg:grid-cols-3">
              {experiences.map((e, i) => (
                <Reveal as="li" key={e.slug} delay={i * 150} className={`flex flex-col ${e.tier === 3 ? 'surface-shade' : 'bg-bone'}`}>
                  <ImageSlot id={e.imageSlot as ImageSlotId} compact sizes="(min-width: 1024px) 33vw, 100vw" />
                  <div className="flex flex-1 flex-col p-6 md:p-8">
                    <p className={`font-mono text-xs ${e.tier === 3 ? 'text-sun' : 'text-sun-deep'}`}>{['I', 'II', 'III'][e.tier - 1]}</p>
                    <h3 className="mt-3 text-display-s font-light">{e.name}</h3>
                    <p className={`mt-3 flex-1 ${e.tier === 3 ? 'text-bone/75' : 'text-ink-soft'}`}>{l(e.tagline)}</p>
                    <p className={`mt-6 font-mono text-xs ${e.tier === 3 ? 'text-stone-light' : 'text-ink-soft'}`}>
                      {duration(e.durationMinutes, locale)} · {e.winesIncluded} {l(home.sea.wines)} · {e.minGuests}–{e.maxGuests} {l(home.sea.guests)}
                    </p>
                    <div className={`mt-6 flex items-end justify-between border-t pt-6 ${e.tier === 3 ? 'border-bone/15' : 'border-basalt/15'}`}>
                      <p>
                        <span className="text-display-s font-light">€{e.pricePerPerson}</span>
                        <span className={`ml-2 text-sm ${e.tier === 3 ? 'text-stone-light' : 'text-ink-soft'}`}>{l(home.sea.perPerson)}</span>
                      </p>
                      <Link href={{ pathname: '/experience', hash: `book=${e.slug}` }} className={`btn min-h-11 px-5 ${e.tier === 3 ? 'btn-sun' : 'btn-primary'}`}>
                        {l(home.sea.book)}
                      </Link>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
            {experiences.some((e) => e.proposalValues) && <p className="mt-6 text-xs text-ink-soft">{l(home.sea.proposalNote)}</p>}
          </div>
        </Station>
      </div>

      {/* ── Reviews ──────────────────────────────────────────── */}
      <section className="surface-sun grain py-24 md:py-36" aria-labelledby="reviews-title">
        <div className="container-x">
          <Reveal>
            <p className="label text-sun-deep">{l(home.reviews.eyebrow)}</p>
            <h2 id="reviews-title" className="mt-6 max-w-3xl text-display-m font-light">
              {l(home.reviews.title)}
            </h2>
          </Reveal>
          <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {testimonials.map((r, i) => (
              <Reveal as="li" key={i} delay={i * 150} className="border-t border-basalt/20 pt-8">
                <figure>
                  <blockquote className={`text-display-s font-light ${r.placeholder ? 'text-ink-soft italic' : ''}`}>
                    <p>“{l(r.quote)}”</p>
                  </blockquote>
                  <figcaption className="mt-6 flex items-center justify-between gap-4 text-sm text-ink-soft">
                    <span>
                      {r.author} · {r.origin}
                    </span>
                    <span className="label">{r.placeholder ? t('common.placeholder') : r.platform}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Getting here ─────────────────────────────────────── */}
      <section className="surface-limestone grain py-24 md:py-36" aria-labelledby="route-title">
        <div className="container-x grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="label text-sun-deep">{l(home.route.eyebrow)}</p>
              <h2 id="route-title" className="mt-6 text-display-m font-light">
                {l(home.route.title)}
              </h2>
            </Reveal>
            <ol className="mt-12 space-y-8">
              {home.route.legs.map((leg, i) => (
                <Reveal as="li" key={leg.from.en} delay={i * 120} className="grid grid-cols-[1.5rem_1fr] gap-4">
                  <span className="font-mono text-sm text-sun-deep">0{i + 1}</span>
                  <div>
                    <h3 className="label">{l(leg.from)}</h3>
                    <p className="mt-2 text-ink-soft">{l(leg.via)}</p>
                    <p className="mt-1 font-mono text-sm">{l(leg.time)}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
            <Reveal className="mt-12 border-t border-basalt/15 pt-8">
              <p className="text-ink-soft">{l(home.route.transfer)}</p>
              <Link href="/visit" className="btn-link mt-6">
                {l(home.route.directions)} <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={200} className="lg:col-span-7">
            <ImageSlot id="road-peljesac" sizes="(min-width: 1024px) 55vw, 100vw" />
          </Reveal>
        </div>
      </section>

      {/* ── Final call: at sea level ─────────────────────────── */}
      <section className="grain bg-adriatic py-28 text-bone md:py-44" aria-labelledby="final-title">
        <div className="container-x">
          <Reveal>
            <p className="label text-sun-pale">
              <span className="font-mono tracking-normal">0 m</span> · {stations.at(-1)!.name[locale]}
            </p>
            <h2 id="final-title" className="mt-8 text-display-xl font-light">
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
