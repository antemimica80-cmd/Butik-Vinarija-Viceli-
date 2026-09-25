'use client';

import { useEffect, useRef } from 'react';

type Props = { labels: [string, string, string]; title: string };

/**
 * The three suns of Dingač, as a minimal line drawing:
 *   I   the sun from the sky, falling straight onto the slope
 *   II  the sun reflected off the sea, thrown back up onto the vines
 *   III the heat stored in the white stone, rising into the vines
 * The rays draw themselves in when the figure enters the viewport, then keep a slow pulse.
 */
export function ThreeSuns({ labels, title }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.visible = 'true';
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg ref={ref} viewBox="0 0 640 440" role="img" aria-label={title} className="three-suns h-auto w-full" fill="none" stroke="currentColor">
      <title>{title}</title>
      {/* Horizon and sea */}
      <line x1="300" y1="300" x2="640" y2="300" strokeWidth="1" className="opacity-60" />
      <g className="ts-sea" strokeWidth="1" strokeLinecap="round">
        {[
          [470, 314, 530],
          [455, 328, 540],
          [478, 342, 522],
          [462, 358, 535],
          [485, 374, 515],
          [470, 392, 528],
        ].map(([x1, y, x2], i) => (
          <line key={y} x1={x1} y1={y} x2={x2} y2={y} className="ts-shimmer" style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
      </g>

      {/* The slope, falling to the sea, with scree beneath */}
      <path d="M0 110 L60 128 L330 300" strokeWidth="1.25" />
      <g strokeWidth="0.75" className="opacity-50" strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => {
          const x = 30 + i * 18;
          const y = x < 60 ? 110 + (x / 60) * 18 : 128 + ((x - 60) / 270) * 172;
          return <line key={x} x1={x} y1={y + 8} x2={x - 6} y2={y + 16} />;
        })}
      </g>

      {/* A vine on the slope */}
      <g className="ts-vine" strokeWidth="1" strokeLinecap="round" transform="translate(200 214)">
        <path d="M0 0 C-2 -10 2 -16 0 -26" />
        <path d="M0 -18 C-8 -22 -12 -30 -10 -36" />
        <path d="M0 -20 C7 -24 12 -30 12 -36" />
        <circle cx="-6" cy="-12" r="2.2" />
        <circle cx="-9" cy="-8" r="2.2" />
      </g>

      {/* Sun */}
      <circle cx="520" cy="86" r="30" strokeWidth="1.25" className="ts-sun" />
      <circle cx="520" cy="86" r="44" strokeWidth="0.75" className="ts-halo opacity-40" />

      {/* I — sky: straight onto the vine */}
      <path d="M494 102 L214 196" pathLength={1} strokeWidth="1" className="ts-ray ts-ray-1" />
      {/* II — sea: down to the water, back up to the vine */}
      <path d="M506 114 L452 300 L220 204" pathLength={1} strokeWidth="1" className="ts-ray ts-ray-2" />
      {/* III — stone: heat rising from the scree */}
      <g strokeWidth="1.1" strokeLinecap="round" className="ts-heat">
        {[
          [150, 188],
          [172, 202],
          [236, 243],
          [258, 257],
        ].map(([x, y]) => (
          <path key={x} d={`M${x} ${y} q-6 -9 0 -18 q6 -9 0 -18 q-6 -9 0 -18`} pathLength={1} className="ts-ray ts-ray-3" />
        ))}
      </g>

      {/* Numerals */}
      <g className="ts-labels" fill="currentColor" stroke="none" fontFamily="var(--font-mono)" fontSize="11" letterSpacing="2">
        <text x="360" y="136">I · {labels[0].toUpperCase()}</text>
        <text x="480" y="276">II · {labels[1].toUpperCase()}</text>
        <text x="150" y="292">III · {labels[2].toUpperCase()}</text>
      </g>
    </svg>
  );
}
