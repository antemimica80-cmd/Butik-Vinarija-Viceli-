'use client';

import { useRef, type ReactNode } from 'react';
import { range, useScrollProgress } from '@/lib/scroll';

type Props = {
  eyebrow: string;
  year: string;
  claim: string;
  lines: string[];
  emerge: string;
  /** The dark tunnel photo (optional texture) */
  interior: ReactNode;
  /** The slope in full light, revealed at the exit */
  exit: ReactNode;
};

/**
 * The tunnel. A tall section with a sticky, full-black stage. As you scroll,
 * the words arrive in the dark, then a point of light opens in the centre and
 * grows until you step out into the blaze of the slope.
 * Reduced motion: the same content, stacked, no scrubbing.
 */
export function Tunnel({ eyebrow, year, claim, lines, emerge, interior, exit }: Props) {
  const ref = useRef<HTMLElement>(null);

  useScrollProgress(ref, (p) => {
    const el = ref.current;
    if (!el) return;
    const s = el.style;
    s.setProperty('--t-intro', range(p, 0.02, 0.14).toFixed(3));
    s.setProperty('--t-intro-out', range(p, 0.3, 0.38).toFixed(3));
    s.setProperty('--t-l1', range(p, 0.16, 0.24).toFixed(3));
    s.setProperty('--t-l2', range(p, 0.24, 0.32).toFixed(3));
    const open = range(p, 0.38, 0.82);
    const tone = open > 0.6 ? 'light' : 'dark';
    if (el.dataset.navTone !== tone) {
      el.dataset.navTone = tone;
      window.dispatchEvent(new Event('vicelic:navtone'));
    }
    s.setProperty('--t-open', (open * open).toFixed(4));
    s.setProperty('--t-glare', (1 - range(p, 0.7, 0.92)).toFixed(3));
    s.setProperty('--t-emerge', range(p, 0.8, 0.94).toFixed(3));
  });

  return (
    <section ref={ref} data-nav-tone="dark" className="tunnel relative bg-black text-bone" aria-labelledby="tunnel-title">
      <div className="tunnel-stage sticky top-0 h-[100svh] overflow-hidden">
        {/* The dark: rock walls, barely there */}
        <div className="tunnel-walls absolute inset-0">
          {interior}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_70%)]" />
        </div>

        {/* The words, in the dark */}
        <div className="tunnel-words absolute inset-0 flex items-center">
          <div className="container-x">
            <div className="tunnel-intro max-w-3xl">
              <p className="label text-sun">{eyebrow}</p>
              <p className="mt-6 font-mono text-sm text-stone-light">{year}</p>
              <h2 id="tunnel-title" className="mt-3 text-display-m font-light">
                {claim}
              </h2>
            </div>
            <div className="mt-10 space-y-2">
              {lines.map((line, i) => (
                <p key={line} className="tunnel-line text-display-s font-light text-bone/80 italic" style={{ opacity: `calc(var(--t-l${i + 1}, 1) * (1 - var(--t-intro-out, 0)))` }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* The light at the exit */}
        <div className="tunnel-exit absolute inset-0">
          {exit}
          <div className="tunnel-glare absolute inset-0 bg-limestone" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-bone/70 to-transparent" />
          <div className="absolute inset-0 flex items-end">
            <p className="tunnel-emerge container-x pb-16 text-display-xl font-light text-basalt md:pb-24">{emerge}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
