import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Reveal } from '@/components/ui/Reveal';
import { ImageSlot } from '@/components/ui/ImageSlot';
import { ArrowRight } from '@/components/ui/icons';
import { contrast } from '@/lib/contrast';

export const metadata: Metadata = { title: 'Design system', robots: { index: false, follow: false } };

const swatches = [
  { token: 'bone', hex: '#EDE7DC', role: 'Primary light surface — the limestone in sun', on: '#121110' },
  { token: 'limestone', hex: '#F7F4EE', role: 'Raised light surface, cards', on: '#121110' },
  { token: 'stone', hex: '#8C857A', role: 'Hairlines, dividers. Not for text on light.', on: '#121110' },
  { token: 'ink-soft', hex: '#5C564D', role: 'Secondary text on light', on: '#EDE7DC' },
  { token: 'basalt', hex: '#121110', role: 'Dark sections, primary text on light', on: '#EDE7DC' },
  { token: 'charcoal', hex: '#1E1C1A', role: 'Dark raised surface', on: '#EDE7DC' },
  { token: 'stone-light', hex: '#A39C90', role: 'Secondary text on dark', on: '#121110' },
  { token: 'plavac', hex: '#3B0A12', role: 'Brand. Primary buttons, bottle moments', on: '#EDE7DC' },
  { token: 'plavac-deep', hex: '#22060A', role: 'Cellar, tunnel', on: '#D9C49C' },
  { token: 'sun', hex: '#B8975A', role: 'Accent on dark. Lines & ornament on light.', on: '#121110' },
  { token: 'sun-pale', hex: '#D9C49C', role: 'Accent text & buttons on dark', on: '#121110' },
  { token: 'sun-deep', hex: '#7A6130', role: 'Gold as text on light (AA)', on: '#EDE7DC' },
  { token: 'adriatic', hex: '#0E2A3D', role: 'Used almost never — the Sea station', on: '#EDE7DC' },
];

const textPairs = [
  ['Basalt on bone', '#121110', '#EDE7DC'],
  ['Ink-soft on bone', '#5C564D', '#EDE7DC'],
  ['Sun-deep on bone', '#7A6130', '#EDE7DC'],
  ['Bone on basalt', '#EDE7DC', '#121110'],
  ['Stone-light on basalt', '#A39C90', '#121110'],
  ['Sun on basalt', '#B8975A', '#121110'],
  ['Sun-pale on plavac-deep', '#D9C49C', '#22060A'],
  ['Bone on plavac', '#EDE7DC', '#3B0A12'],
  ['Sun on bone ✗ (ornament only)', '#B8975A', '#EDE7DC'],
] as const;

function Section({ n, title, children, className = 'surface-sun' }: { n: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${className} grain py-20 md:py-28`}>
      <div className="container-x">
        <div className="mb-12 flex items-baseline gap-6">
          <span className="font-mono text-xs opacity-60">{n}</span>
          <h2 className="label">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function DesignPage({ params }: PageProps<'/[locale]/design'>) {
  const { locale } = await params;
  setRequestLocale(locale as 'en' | 'hr');

  return (
    <>
      <section data-nav-tone="dark" className="surface-shade grain pt-[calc(var(--nav-h)+4rem)] pb-20 md:pt-[calc(var(--nav-h)+7rem)] md:pb-28">
        <div className="container-x">
          <p className="label text-sun">Stage 1 · Design system</p>
          <h1 className="mt-6 text-display-xl font-light">Stone, sun, silence, weight.</h1>
          <p className="mt-8 max-w-2xl text-lede text-bone/80">
            The palette is taken from the slope: limestone, basalt, the black-red of Plavac, sun-bleached gold. Dark and light sections
            alternate like shade and sun on Dingač.
          </p>
        </div>
      </section>

      <Section n="01" title="Colour">
        <ul className="grid grid-cols-2 gap-px bg-basalt/10 sm:grid-cols-3 lg:grid-cols-4">
          {swatches.map((s) => (
            <li key={s.token} className="bg-bone">
              <div className="flex aspect-[4/3] items-end p-4" style={{ background: s.hex, color: s.on }}>
                <span className="font-display text-3xl">Aa</span>
              </div>
              <div className="p-4">
                <p className="label">{s.token}</p>
                <p className="mt-1 font-mono text-xs text-ink-soft">{s.hex}</p>
                <p className="mt-2 text-sm leading-snug text-ink-soft">{s.role}</p>
              </div>
            </li>
          ))}
        </ul>

        <h3 className="label mt-16 mb-6">Text contrast (WCAG 2.1 — AA needs 4.5, large text 3.0)</h3>
        <table className="w-full max-w-3xl border-collapse font-mono text-sm">
          <tbody>
            {textPairs.map(([name, fg, bg]) => {
              const ratio = contrast(fg, bg);
              return (
                <tr key={name} className="border-b border-basalt/10">
                  <td className="py-3 pr-4">
                    <span className="inline-block px-3 py-1" style={{ color: fg, background: bg }}>
                      {name}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right tabular-nums">{ratio.toFixed(2)}</td>
                  <td className="py-3 text-right">{ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'Large only' : 'Fail'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section n="02" title="Typography" className="surface-limestone">
        <div className="grid gap-16 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-12 overflow-hidden">
            <div>
              <p className="label mb-3 text-ink-soft">Display XL · Newsreader 300 (display optical size)</p>
              <p className="text-display-xl font-light">Certified organic. Grown on Dingač.</p>
            </div>
            <div>
              <p className="label mb-3 text-ink-soft">Display L · 300 italic</p>
              <p className="text-display-l font-light italic">The grand cru of the Adriatic</p>
            </div>
            <div>
              <p className="label mb-3 text-ink-soft">Display M · 400</p>
              <p className="text-display-m">9,500 bottles. Worldwide.</p>
            </div>
            <div>
              <p className="label mb-3 text-ink-soft">Display S · 500</p>
              <p className="text-display-s font-medium">Dingač · Pelješac · Vicelić · Đurđa · Žuljana</p>
            </div>
            <div className="max-w-2xl">
              <p className="label mb-3 text-ink-soft">Lede · Hanken Grotesk 400</p>
              <p className="text-lede">
                On Dingač the vine gets three suns: the sun from the sky, the sun reflected off the sea, and the heat the white stone gives back
                at night.
              </p>
            </div>
            <div className="max-w-2xl">
              <p className="label mb-3 text-ink-soft">Body · 17 / 1.65</p>
              <p>
                Plavac Mali only. Certified organic. Spontaneous fermentation with the yeasts that live on the grapes. No enzymes, no additives,
                nothing corrected. The slope decides; the family keeps.
              </p>
              <p className="mt-4 text-ink-soft">
                Hrvatski: Samo plavac mali. Ekološki certificirano. Spontana fermentacija divljim kvascima — čćđšž ČĆĐŠŽ.
              </p>
            </div>
          </div>

          <aside className="space-y-8 lg:border-l lg:border-basalt/10 lg:pl-10">
            <div>
              <p className="label mb-3 text-ink-soft">Labels · 11 px · 0.26em</p>
              <p className="label">Ridge · Stone · Vine · Cellar · Sea</p>
            </div>
            <div>
              <p className="label mb-3 text-ink-soft">Technical · IBM Plex Mono</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-basalt/15 pt-4 font-mono text-[0.8125rem]">
                <dt className="text-ink-soft">PARCEL</dt>
                <dd>Dingač</dd>
                <dt className="text-ink-soft">SOIL</dt>
                <dd>Red, shallow, stony</dd>
                <dt className="text-ink-soft">DENSITY</dt>
                <dd>10,000 vines/ha</dd>
                <dt className="text-ink-soft">ROOTSTOCK</dt>
                <dd>Richter 110</dd>
                <dt className="text-ink-soft">TRAINING</dt>
                <dd>En gobelet</dd>
                <dt className="text-ink-soft">BOTTLES</dt>
                <dd>9,500</dd>
              </dl>
            </div>
            <div>
              <p className="label mb-3 text-ink-soft">Why this pairing</p>
              <p className="text-sm leading-relaxed text-ink-soft">
                Newsreader at its display optical size is high-contrast and austere, cut like stone at large sizes, and its Croatian carons sit correctly (Cormorant Garamond was tested and rejected: its č, š, ž accents float). Hanken Grotesk is quiet and very
                legible on phones. Plex Mono gives the wine dossiers their archival precision. All three cover Croatian diacritics.
              </p>
            </div>
          </aside>
        </div>
      </Section>

      <Section n="03" title="Surfaces — sun and shade" className="surface-sun">
        <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['surface-sun', 'Sun', 'Bone. Default.'],
            ['surface-shade', 'Shade', 'Basalt. Alternating sections.'],
            ['surface-cellar', 'Cellar', 'Plavac-deep. Tunnel, cellar.'],
            ['surface-plavac', 'Plavac', 'Brand moments, bottle counter.'],
          ].map(([cls, name, note]) => (
            <div key={cls} className={`${cls} grain flex aspect-[4/5] flex-col justify-between p-6 ring-1 ring-basalt/10`}>
              <p className="label">{name}</p>
              <div>
                <p className="text-display-s font-light">Kamen, sunce, tišina.</p>
                <p className="mt-2 text-sm opacity-75">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section n="04" title="Actions" className="surface-limestone">
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" className="btn btn-primary">
            Book a tasting <ArrowRight size={16} />
          </button>
          <button type="button" className="btn btn-ghost">
            Discover Dingač
          </button>
          <button type="button" className="btn-link">
            Read the dossier <ArrowRight size={14} />
          </button>
        </div>
        <div className="surface-shade mt-8 flex flex-wrap items-center gap-4 p-8">
          <button type="button" className="btn btn-sun">
            Book a tasting <ArrowRight size={16} />
          </button>
          <button type="button" className="btn btn-ghost">
            Discover Dingač
          </button>
          <button type="button" className="btn-link text-sun-pale">
            The tunnel, 1973
          </button>
        </div>
      </Section>

      <Section n="05" title="Image slots — real photography only" className="surface-sun">
        <p className="mb-10 max-w-2xl text-ink-soft">
          Every photo is a named slot with art direction, ratio and alt text in both languages (content/image-slots.ts). Until the photographs
          arrive, a neutral tone holds the space. No AI-generated imagery, ever.
        </p>
        <div className="grid gap-6 md:grid-cols-12">
          <ImageSlot id="ridge-view" className="md:col-span-8" sizes="(min-width: 768px) 66vw, 100vw" />
          <ImageSlot id="mateo-portrait" className="md:col-span-4" sizes="(min-width: 768px) 33vw, 100vw" />
          <ImageSlot id="stone-macro" className="md:col-span-4" sizes="(min-width: 768px) 33vw, 100vw" />
          <ImageSlot id="cellar-barrels" className="md:col-span-8" sizes="(min-width: 768px) 66vw, 100vw" />
        </div>
      </Section>

      <Section n="06" title="Motion — slow, weighted" className="surface-shade">
        <p className="mb-12 max-w-2xl text-bone/80">
          Elements rise 40 px and fade in over 1.4–1.6 s on a settling curve. No bounce, no spring. With “reduce motion” switched on, everything
          is simply there.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {['Ridge', 'Stone', 'Vine'].map((s, i) => (
            <Reveal key={s} delay={i * 180} className="border-t border-bone/20 pt-6">
              <p className="label text-sun">{`0${i + 1}`}</p>
              <p className="mt-4 text-display-s font-light">{s}</p>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
