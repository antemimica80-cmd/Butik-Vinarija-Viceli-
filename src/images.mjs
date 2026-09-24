// Responsive image pipeline.
// assets/photos/<slot>.(jpg|jpeg|png|webp|tif) → public/img/<slot>-<w>.(avif|webp|jpg)
// Writes src/generated/images.json (dimensions, widths, blurred placeholder).
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const root = new URL('..', import.meta.url).pathname;
const srcDir = join(root, 'assets/photos');
const outDir = join(root, 'public/img');
const WIDTHS = [480, 800, 1200, 1600, 2200];
mkdirSync(outDir, { recursive: true });
mkdirSync(join(root, 'src/generated'), { recursive: true });

const manifest = {};
const files = existsSync(srcDir) ? readdirSync(srcDir).filter(f => /\.(jpe?g|png|webp|tiff?)$/i.test(f)) : [];

for (const file of files) {
  const { name } = parse(file);
  const input = join(srcDir, file);
  const img = sharp(input).rotate();
  const meta = await img.metadata();
  const w0 = meta.autoOrient?.width ?? meta.width, h0 = meta.autoOrient?.height ?? meta.height;
  const widths = WIDTHS.filter(w => w < w0).concat(w0 > WIDTHS.at(-1) ? [] : [w0]).filter((w, i, a) => a.indexOf(w) === i);
  const isBottle = name.startsWith('bottle-');
  for (const w of widths) {
    const base = join(outDir, `${name}-${w}`);
    if (existsSync(base + '.avif') && statSync(base + '.avif').mtimeMs > statSync(input).mtimeMs) continue;
    const r = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    await r.clone().avif({ quality: isBottle ? 62 : 55, effort: 5 }).toFile(base + '.avif');
    await r.clone().webp({ quality: isBottle ? 82 : 76 }).toFile(base + '.webp');
    if (isBottle) await r.clone().png({ compressionLevel: 9 }).toFile(base + '.png');
    else await r.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(base + '.jpg');
  }
  const lqip = await sharp(input).rotate().resize(24).blur(1.2).webp({ quality: 40 }).toBuffer();
  manifest[name] = { width: w0, height: h0, widths, fallback: isBottle ? 'png' : 'jpg', lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
  console.log('✓', name, `${w0}×${h0}`, widths.join(','));
}

writeFileSync(join(root, 'src/generated/images.json'), JSON.stringify(manifest, null, 1));
console.log(`${Object.keys(manifest).length} photo(s) processed.`);
