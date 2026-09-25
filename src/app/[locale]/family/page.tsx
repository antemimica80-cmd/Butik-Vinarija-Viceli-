import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { familyPage as F } from '@content/family';
import { historyClaims } from '@content/history-claims';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { alternates } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/family'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return { title: `${l(F.hero.title)} — ${l(F.hero.eyebrow)}`.replace('. —', ' —'), description: l(F.meta.description), alternates: alternates(locale as Locale, '/family') };
}

export default async function FamilyPage({ params }: PageProps<'/[locale]/family'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = (x: { en: string; hr: string }) => x[locale];

  return (
    <>
      {/* ── Hero ── */}
      <section data-nav-tone="dark" className="surface-shade grain pt-[calc(var(--nav-h)+4rem)] pb-16 md:pt-[calc(var(--nav-h)+7rem)] md:pb-28">
        <div className="container-x">
          <Reveal immediate>
            <p className="label text-sun">{l(F.hero.eyebrow)}</p>
            <h1 className="mt-6 text-[clamp(4.5rem,2rem+13vw,14rem)] leading-[0.85] font-light tracking-[-0.03em]">{l(F.hero.title)}</h1>
            <p className="mt-10 max-w-2xl text-display-s font-light text-bone/80 italic">{l(F.hero.lede)}</p>
          </Reveal>
        </div>
      </section>

      {/* ── Mateo ── */}
      <section className="surface-sun grain py-24 md:py-36">
        <div className="container-x grid items-end gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-5">
            <ImageSlot id="mateo-portrait" priority sizes="(min-width: 1024px) 40vw, 100vw" />
          </Reveal>
          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="label text-sun-deep">{l(F.mateo.label)}</p>
              <h2 className="mt-5 text-display-l font-light">{F.mateo.name}</h2>
              <p className="mt-8 text-lede text-ink-soft">{l(F.mateo.body)}</p>
            </Reveal>
            <Reveal delay={150}>
              <figure className="mt-12 border-l-2 border-sun pl-6">
                <blockquote className={`text-display-s font-light italic ${F.mateo.quotePlaceholder ? 'text-ink-soft' : ''}`}>
                  <p>“{l(F.mateo.quote)}”</p>
                </blockquote>
                <figcaption className="label mt-4 text-ink-soft">
                  {F.mateo.name}
                  {F.mateo.quotePlaceholder && ` · ${locale === 'hr' ? 'rezervirano mjesto' : 'placeholder'}`}
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="surface-limestone grain py-24 md:py-36">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
              <p className="label text-sun-deep">{l(F.timeline.label)}</p>
              <h2 className="mt-5 text-display-l font-light">{l(F.timeline.title)}</h2>
              <div className="mt-10 hidden lg:block">
                <ImageSlot id="archive-1935" sizes="30vw" />
              </div>
            </div>
          </Reveal>
          <ol className="relative border-l border-basalt/20 lg:col-span-7 lg:col-start-6">
            {F.timeline.beats.map((b, i) => {
              const claim = 'claim' in b ? historyClaims[b.claim] : null;
              const story = 'claim' in b ? null : b;
              const c = claim as { year: string; yearHr?: string } | null;
              const year = c ? (locale === 'hr' && c.yearHr ? c.yearHr : c.year) : l(story!.year);
              const title = story ? l(story.title) : null;
              const text = claim ? l(claim.text) : l(story!.text);
              const placeholder = Boolean(story?.placeholder);
              return (
                <Reveal as="li" key={i} delay={i * 80} className="relative pb-16 pl-8 last:pb-0 md:pl-12">
                  <span aria-hidden className="absolute top-3 -left-[5px] size-[9px] rounded-full bg-plavac ring-4 ring-limestone" />
                  <p className={`font-mono text-sm ${placeholder ? 'text-ink-soft' : 'text-sun-deep'}`}>{year}</p>
                  {title && <h3 className="mt-3 text-display-s font-light">{title}</h3>}
                  <p className={`mt-3 max-w-xl ${title ? 'text-ink-soft' : 'text-display-s font-light'}`}>{text}</p>
                  {claim && !claim.verified && (
                    <p className="mt-2 font-mono text-xs text-ink-soft">{locale === 'hr' ? 'Izvor će biti dodan' : 'Source to be added'}</p>
                  )}
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── Philosophy ── */}
      <section className="surface-shade grain py-24 md:py-36">
        <div className="container-x">
          <Reveal>
            <p className="label text-sun">{l(F.philosophy.label)}</p>
            <h2 className="mt-5 max-w-3xl text-display-l font-light">{l(F.philosophy.title)}</h2>
          </Reveal>
          <ol className="mt-16 grid gap-px bg-bone/10 sm:grid-cols-2 lg:grid-cols-4">
            {F.philosophy.rules.map((r, i) => (
              <Reveal as="li" key={r.name.en} delay={i * 120} className="bg-basalt p-6 md:p-8">
                <p className="font-mono text-sm text-sun">0{i + 1}</p>
                <h3 className="mt-8 text-display-s font-light">{l(r.name)}</h3>
                <p className="mt-4 text-bone/70">{l(r.text)}</p>
              </Reveal>
            ))}
          </ol>
          <div className="mt-16 grid gap-6 md:grid-cols-12">
            <Reveal className="md:col-span-7">
              <ImageSlot id="dingac-slope" ratio="4/5" sizes="(min-width: 768px) 55vw, 100vw" />
            </Reveal>
            <Reveal delay={150} className="md:col-span-5">
              <ImageSlot id="dingac-organic" sizes="(min-width: 768px) 40vw, 100vw" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="surface-plavac grain py-24 md:py-36">
        <div className="container-x flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <Reveal>
            <h2 className="text-display-xl font-light">{l(F.cta.title)}</h2>
            <p className="mt-6 max-w-lg text-lede text-bone/80">{l(F.cta.body)}</p>
          </Reveal>
          <Reveal delay={150} className="flex flex-col gap-3 sm:flex-row">
            <Link href={{ pathname: '/experience', hash: 'book=dingac-private' }} className="btn btn-sun">
              {l(F.cta.book)} <ArrowRight size={16} />
            </Link>
            <Link href="/experience" className="btn btn-ghost">
              {l(F.cta.all)}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
