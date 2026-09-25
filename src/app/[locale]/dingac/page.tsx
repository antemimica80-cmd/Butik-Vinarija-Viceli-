import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { dingacPage as D } from '@content/dingac';
import { historyClaims, type ClaimId } from '@content/history-claims';
import { home } from '@content/home';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { Reveal } from '@/components/ui/Reveal';
import { ArrowRight } from '@/components/ui/icons';
import { ThreeSuns } from '@/components/signature/ThreeSuns';
import { alternates } from '@/lib/seo';

export async function generateMetadata({ params }: PageProps<'/[locale]/dingac'>): Promise<Metadata> {
  const { locale } = await params;
  const l = (x: { en: string; hr: string }) => x[locale as Locale];
  return { title: `Dingač — ${l(D.hero.eyebrow)}`, description: l(D.meta.description), alternates: alternates(locale as Locale, '/dingac') };
}

/** Claims in the order they appear on the page → footnote numbers. */
const cited: ClaimId[] = [D.protected.claim, D.tunnel.claim, ...D.science.claims];

function Note({ id, dark }: { id: ClaimId; dark?: boolean }) {
  const n = cited.indexOf(id) + 1;
  return (
    <sup className="ml-1 font-mono text-[0.55em] tracking-normal not-italic">
      <a href={`#source-${n}`} aria-label={`Source ${n}`} className={`${dark ? 'text-sun' : 'text-sun-deep'} hover:underline`}>
        {n}
      </a>
    </sup>
  );
}

function Label({ children, dark }: { children: string; dark?: boolean }) {
  return <p className={`label ${dark ? 'text-sun' : 'text-sun-deep'}`}>{children}</p>;
}

export default async function DingacPage({ params }: PageProps<'/[locale]/dingac'>) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const l = (x: { en: string; hr: string }) => x[locale];
  const year = (id: ClaimId) => {
    const c = historyClaims[id];
    return locale === 'hr' && 'yearHr' in c ? c.yearHr : c.year;
  };

  return (
    <>
      {/* ── Hero ── */}
      <section data-nav-tone="dark" className="surface-shade relative flex min-h-[92svh] items-end overflow-hidden">
        <ImageSlot id="dingac-slope" fill priority labelTop className="opacity-80" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-basalt via-basalt/50 to-basalt/10" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-basalt/70 to-transparent md:h-56" />
        <div className="container-x relative pt-[var(--nav-h)] pb-20 md:pb-28">
          <p className="label gate-in text-sun-pale">{l(D.hero.eyebrow)}</p>
          <h1 className="gate-in mt-6 text-[clamp(5rem,2rem+16vw,16rem)] leading-[0.85] font-light tracking-[-0.03em]">{l(D.hero.title)}</h1>
          <p className="gate-in mt-8 max-w-2xl text-lede text-bone/85">{l(D.hero.lede)}</p>
        </div>
      </section>

      {/* ── I · The slope ── */}
      <section className="surface-sun grain py-24 md:py-40">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <Label>{l(D.slope.label)}</Label>
            <h2 className="mt-6 text-display-l font-light">{l(D.slope.title)}</h2>
            <p className="mt-8 max-w-xl text-lede text-ink-soft">{l(D.slope.body)}</p>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-5 lg:col-start-8">
            <ImageSlot id="vine-gobelet" sizes="(min-width: 1024px) 40vw, 100vw" />
          </Reveal>
        </div>
      </section>

      {/* ── II · The stone ── */}
      <section className="surface-limestone grain py-24 md:py-40">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:order-2 lg:col-span-6 lg:col-start-7">
            <Label>{l(D.stone.label)}</Label>
            <h2 className="mt-6 text-display-l font-light">{l(D.stone.title)}</h2>
            <p className="mt-8 max-w-xl text-lede text-ink-soft">{l(D.stone.body)}</p>
          </Reveal>
          <Reveal delay={150} className="lg:order-1 lg:col-span-5">
            <ImageSlot id="stone-macro" sizes="(min-width: 1024px) 40vw, 100vw" />
          </Reveal>
        </div>
      </section>

      {/* ── III · Three suns ── */}
      <section className="surface-sun grain py-24 md:py-40">
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <Label>{l(D.suns.label)}</Label>
              <h2 className="mt-6 text-display-l font-light">{l(D.suns.title)}</h2>
              <p className="mt-8 text-lede text-ink-soft">{l(D.suns.body)}</p>
            </Reveal>
            <Reveal fade delay={150} className="lg:col-span-7">
              <ThreeSuns title={l(D.suns.body)} labels={home.stone.suns.map((s) => l(s.name)) as [string, string, string]} />
            </Reveal>
          </div>
          <ol className="mt-16 grid gap-8 sm:grid-cols-3">
            {home.stone.suns.map((s, i) => (
              <Reveal as="li" key={s.numeral} delay={i * 120} className="border-t border-basalt/20 pt-6">
                <p className="font-mono text-sm text-sun-deep">{s.numeral}</p>
                <h3 className="mt-3 text-display-s font-light">{l(s.name)}</h3>
                <p className="mt-3 text-ink-soft">{l(s.text)}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── IV · Protected since 1961 ── */}
      <section className="surface-shade grain py-24 md:py-40">
        <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-6">
            <Label dark>{l(D.protected.label)}</Label>
            <p className="mt-6 text-[clamp(6rem,3rem+14vw,14rem)] leading-[0.85] font-extralight tracking-[-0.04em] text-sun-pale" style={{ fontFamily: 'var(--font-display)' }}>
              {year(D.protected.claim)}
            </p>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-6 lg:pt-10">
            <h2 className="text-display-m font-light">
              {l(D.protected.title)}
              <Note id={D.protected.claim} dark />
            </h2>
            <p className="mt-6 text-lede text-bone/80">{l(historyClaims[D.protected.claim].text)}</p>
            <p className="mt-8 border-l border-sun/60 pl-5 text-bone/70">{l(D.protected.positioning)}</p>
          </Reveal>
        </div>
      </section>

      {/* ── V · The tunnel ── */}
      <section data-nav-tone="dark" className="relative overflow-hidden bg-black text-bone">
        <div className="absolute inset-0 opacity-60">
          <ImageSlot id="tunnel-interior" fill compact />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,transparent_0%,#000_75%)]" />
        </div>
        <div className="container-x relative py-32 md:py-48">
          <Reveal className="max-w-3xl">
            <Label dark>{l(D.tunnel.label)}</Label>
            <p className="mt-6 font-mono text-sm text-stone-light">{year(D.tunnel.claim)}</p>
            <h2 className="mt-3 text-display-m font-light">
              {l(historyClaims[D.tunnel.claim].text)}
              <Note id={D.tunnel.claim} dark />
            </h2>
            <p className="mt-8 text-display-s font-light text-bone/70 italic">{l(D.tunnel.body)}</p>
          </Reveal>
        </div>
      </section>

      {/* ── VI · The record ── */}
      <section className="surface-sun grain py-24 md:py-40">
        <div className="container-x">
          <Reveal>
            <Label>{l(D.science.label)}</Label>
            <h2 className="mt-6 text-display-l font-light">{l(D.science.title)}</h2>
          </Reveal>
          <ol className="mt-14 grid border-t border-basalt/15 md:grid-cols-2">
            {D.science.claims.map((id, i) => (
              <Reveal as="li" key={id} delay={i * 150} className="border-b border-basalt/15 py-10 md:border-b-0 md:py-12 md:pr-12 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:pl-12">
                <p className="font-mono text-sm text-sun-deep">{year(id)}</p>
                <p className="mt-4 text-display-s font-light">
                  {l(historyClaims[id].text)}
                  <Note id={id} />
                </p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Sources ── */}
      <section className="surface-limestone grain py-16 md:py-20" aria-labelledby="sources-title">
        <div className="container-x">
          <h2 id="sources-title" className="label text-ink-soft">
            {l(D.sources.title)}
          </h2>
          <ol className="mt-6 space-y-3 font-mono text-xs leading-relaxed text-ink-soft">
            {cited.map((id, i) => {
              const c = historyClaims[id];
              const pending = !c.verified || c.source.startsWith('TODO');
              return (
                <li key={id} id={`source-${i + 1}`} className="grid scroll-mt-[calc(var(--nav-h)+1rem)] grid-cols-[1.5rem_1fr] gap-3">
                  <span>{i + 1}.</span>
                  <span>
                    <span className="text-basalt">{year(id)}</span> — {l(c.text)} <br />
                    {pending ? <span className="italic">{l(D.sources.pending)}</span> : c.source}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="surface-plavac grain py-24 md:py-36">
        <div className="container-x flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <Reveal>
            <h2 className="text-display-xl font-light">{l(D.cta.title)}</h2>
            <p className="mt-6 max-w-lg text-lede text-bone/80">{l(D.cta.body)}</p>
          </Reveal>
          <Reveal delay={150} className="flex flex-col gap-3 sm:flex-row">
            <Link href="/experience" className="btn btn-sun">
              {l(D.cta.book)} <ArrowRight size={16} />
            </Link>
            <Link href="/wines" className="btn btn-ghost">
              {l(D.cta.wines)}
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
