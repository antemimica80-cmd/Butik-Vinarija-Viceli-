import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Shared Open Graph image: 1200×630, basalt, gold label, Newsreader display type. */
export const ogSize = { width: 1200, height: 630 };

export async function ogFonts() {
  const dir = join(process.cwd(), 'src/assets/og');
  const [latin, ext, mono, monoExt] = await Promise.all([
    readFile(join(dir, 'newsreader-latin-300-normal.woff')),
    readFile(join(dir, 'newsreader-latin-ext-300-normal.woff')),
    readFile(join(dir, 'ibm-plex-mono-latin-400-normal.woff')),
    readFile(join(dir, 'ibm-plex-mono-latin-ext-400-normal.woff')),
  ]);
  return [
    { name: 'Newsreader', data: latin, weight: 300 as const, style: 'normal' as const },
    { name: 'NewsreaderExt', data: ext, weight: 300 as const, style: 'normal' as const },
    { name: 'Plex', data: mono, weight: 400 as const, style: 'normal' as const },
    { name: 'PlexExt', data: monoExt, weight: 400 as const, style: 'normal' as const },
  ];
}

export function OgCard({ label, title, footer }: { label: string; title: string; footer: string }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#121110', color: '#EDE7DC', padding: '64px 72px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Plex, PlexExt', fontSize: 20, letterSpacing: 6, color: '#B8975A' }}>
        <span>{label.toUpperCase()}</span>
        <span>VICELIĆ</span>
      </div>
      <div style={{ display: 'flex', fontFamily: 'Newsreader, NewsreaderExt', fontSize: title.length > 24 ? 104 : 140, lineHeight: 0.95, letterSpacing: -2 }}>{title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'Plex, PlexExt', fontSize: 18, letterSpacing: 4, color: '#A39C90' }}>
        <span>{footer.toUpperCase()}</span>
        <div style={{ display: 'flex', width: 120, height: 2, background: '#B8975A' }} />
      </div>
    </div>
  );
}
