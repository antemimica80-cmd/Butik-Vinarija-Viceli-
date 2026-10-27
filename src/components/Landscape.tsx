/**
 * Generative, deterministic landscape illustrations in the Atlas palette.
 * Used as art direction where licensed photography is not yet available; they are decorative
 * and never presented as photographs of a particular place.
 */
type Variant = "hero" | "dalmatia" | "istria" | "slavonia" | "uplands" | "neutral";

const W = 1600;
const H = 900;

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function ridgePoints(base: number, amp: number, seed: number, roughness = 1): [number, number][] {
  const r = rand(seed);
  const waves = Array.from({ length: 4 }, (_, i) => ({
    a: amp * (0.55 / (i + 1)) * (0.6 + r()),
    f: ((i + 1) * (0.9 + r() * 0.8) * Math.PI * 2 * roughness) / W,
    p: r() * Math.PI * 2,
  }));
  const pts: [number, number][] = [];
  for (let x = -20; x <= W + 20; x += 16) {
    const y = base + waves.reduce((acc, w) => acc + w.a * Math.sin(x * w.f + w.p), 0);
    pts.push([x, y]);
  }
  return pts;
}

const toPath = (pts: [number, number][], close = true) =>
  `M${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L")}` + (close ? ` L${W + 20},${H + 20} L-20,${H + 20} Z` : "");

const offset = (pts: [number, number][], dy: number, squash = 1) => pts.map(([x, y]) => [x, y * squash + dy] as [number, number]);

const PALETTES: Record<Variant, { sky: [string, string, string]; glow: string; layers: string[]; sea?: string; rows: string }> = {
  hero: { sky: ["#0f2621", "#21463c", "#b48a58"], glow: "#e7c58e", layers: ["#2a5348", "#1f4239", "#173530", "#0f2621"], sea: "#355f5a", rows: "#bd9b65" },
  dalmatia: { sky: ["#3b1f26", "#7a3a3f", "#e0b27c"], glow: "#f3d3a0", layers: ["#8a5a52", "#6e3b3c", "#55292f", "#3f1e24"], sea: "#4c6a72", rows: "#e5cfa3" },
  istria: { sky: ["#163a43", "#2e5e6e", "#d8b489"], glow: "#f0d6a8", layers: ["#4f7a7c", "#3a6064", "#7b3b2f", "#5a2a22"], rows: "#e8cfa0" },
  slavonia: { sky: ["#3a2f1a", "#7b6234", "#ead39f"], glow: "#fbe7b8", layers: ["#a88a4f", "#8b7040", "#6e5631", "#4f3d22"], rows: "#f3e1b5" },
  uplands: { sky: ["#1d2d1d", "#40593a", "#d9c28f"], glow: "#f1e0b0", layers: ["#6c845a", "#566e45", "#435935", "#2f4024"], rows: "#e9d9ac" },
  neutral: { sky: ["#193c34", "#2a5348", "#bd9b65"], glow: "#e9cf9c", layers: ["#3d6458", "#2a5348", "#1f4239", "#163229"], rows: "#d9bf8e" },
};

export function Landscape({ variant = "neutral", className = "", seed = 7, title }: { variant?: Variant; className?: string; seed?: number; title?: string }) {
  const p = PALETTES[variant];
  const id = `ls-${variant}-${seed}`;
  const coastal = variant === "hero" || variant === "dalmatia";
  const bases = coastal ? [470, 540, 610, 700] : [430, 520, 610, 710];
  const amps = variant === "slavonia" ? [30, 26, 22, 18] : variant === "uplands" ? [90, 80, 70, 55] : [70, 60, 55, 50];
  const ridges = bases.map((b, i) => ridgePoints(b, amps[i], seed * 31 + i * 7, variant === "slavonia" ? 0.6 : 1));
  const front = ridges[ridges.length - 1];
  const rowCount = variant === "slavonia" ? 14 : 11;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="0.55" stopColor={p.sky[1]} />
          <stop offset="1" stopColor={p.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-sun`} cx="0.68" cy="0.5" r="0.42">
          <stop offset="0" stopColor={p.glow} stopOpacity="0.85" />
          <stop offset="0.35" stopColor={p.glow} stopOpacity="0.25" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-haze`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      <rect width={W} height={H} fill={`url(#${id}-sun)`} />
      <circle cx={W * 0.68} cy={H * 0.47} r="46" fill={p.glow} opacity="0.9" />
      {coastal && p.sea && (
        <g>
          <rect x="0" y={bases[0] - 40} width={W} height={H} fill={p.sea} opacity="0.9" />
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={W * 0.5 + ((i * 97) % 380) - 190} x2={W * 0.5 + ((i * 97) % 380) - 120 + (i % 3) * 30}
              y1={bases[0] - 30 + i * 6} y2={bases[0] - 30 + i * 6} stroke={p.glow} strokeOpacity={0.5 - i * 0.03} strokeWidth="1.4" />
          ))}
        </g>
      )}
      {ridges.map((pts, i) => (
        <path key={i} d={toPath(pts)} fill={p.layers[i] ?? p.layers[p.layers.length - 1]} opacity={i === 0 && coastal ? 0.85 : 1} />
      ))}
      {ridges.slice(0, 2).map((pts, i) => (
        <path key={`h${i}`} d={toPath(pts)} fill={`url(#${id}-haze)`} />
      ))}
      {/* Vine rows / terraces on the foreground slope */}
      <g fill="none" stroke={p.rows} strokeLinecap="round">
        {Array.from({ length: rowCount }, (_, i) => {
          const dy = 18 + i * (variant === "slavonia" ? 13 : 16);
          const squash = 1 + i * 0.004;
          return (
            <path key={i} d={toPath(offset(front, dy, squash), false)}
              strokeOpacity={0.12 + i * 0.03} strokeWidth={0.8 + i * 0.18}
              strokeDasharray={variant === "dalmatia" ? undefined : `${1.5 + i * 0.4} ${5 + i * 0.6}`} />
          );
        })}
      </g>
      {variant === "istria" && (
        <g fill={p.layers[1]}>
          <rect x="1110" y="402" width="16" height="70" />
          <path d="M1104 404 L1118 372 L1132 404 Z" />
          <rect x="1060" y="440" width="120" height="40" rx="3" />
        </g>
      )}
      {variant === "uplands" && (
        <g fill={p.layers[2]}>
          <path d="M380 452 L410 424 L440 452 L440 488 L380 488 Z" />
          <rect x="404" y="462" width="12" height="26" fill={p.glow} opacity="0.5" />
        </g>
      )}
      <rect width={W} height={H} fill={`url(#${id}-shade)`} />
    </svg>
  );
}

export function regionVariant(slug: string | null | undefined): Variant {
  switch (slug) {
    case "dalmacija": return "dalmatia";
    case "hrvatska-istra-i-kvarner": return "istria";
    case "slavonija-i-hrvatsko-podunavlje": return "slavonia";
    case "sredisnja-bregovita-hrvatska": return "uplands";
    default: return "neutral";
  }
}
