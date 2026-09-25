/**
 * Validates every content file against its schema. Run: npm run check:content
 * Also runs before `next build` (see package.json "prebuild").
 */
import { z } from 'zod';
import { imageSlots } from '../content/image-slots';
import { historyClaims } from '../content/history-claims';
import { wines } from '../content/wines';
import { experiences } from '../content/experiences';
import { bottlePrice, giftBox, initialStock } from '../content/products';
import { zones } from '../content/shipping';
import { experienceSchema, historyClaimSchema, imageSlotSchema, wineSchema } from '../src/lib/content-schema';

let failed = false;

function fail(msg: string) {
  failed = true;
  console.error(`✗ ${msg}`);
}

function check(name: string, schema: z.ZodType, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    failed = true;
    console.error(`✗ ${name}`);
    for (const issue of result.error.issues) console.error(`   ${issue.path.join('.')}: ${issue.message}`);
  } else {
    console.log(`✓ ${name}`);
  }
}

check('image-slots', z.record(z.string(), imageSlotSchema), imageSlots);
check('history-claims', z.record(z.string(), historyClaimSchema.extend({ yearHr: z.string().optional() })), historyClaims);
check('wines', z.array(wineSchema), wines);
check('experiences', z.array(experienceSchema), experiences);

// Cross-references
const slotIds = new Set(Object.keys(imageSlots));
for (const w of wines) if (!slotIds.has(w.bottleSlot)) fail(`wines.${w.slug}.bottleSlot → unknown slot "${w.bottleSlot}"`);
for (const e of experiences) {
  if (!slotIds.has(e.imageSlot)) fail(`experiences.${e.slug}.imageSlot → unknown slot "${e.imageSlot}"`);
  if (e.wines.length !== e.winesIncluded) fail(`experiences.${e.slug}: winesIncluded (${e.winesIncluded}) ≠ wines listed (${e.wines.length})`);
  if (e.minGuests > e.maxGuests) fail(`experiences.${e.slug}: minGuests > maxGuests`);
}

for (const w of wines) {
  if (!(bottlePrice[w.slug] > 0)) fail(`products: no bottle price for ${w.slug}`);
  if (!(w.slug in initialStock)) fail(`products: no initial stock for ${w.slug}`);
}
for (const wine of Object.keys(giftBox.formats[0].bottles)) if (!wines.some((w) => w.slug === wine)) fail(`gift box → unknown wine ${wine}`);
for (const z of zones) if (z.rate < 0 || z.maxBottles < 1) fail(`shipping zone ${z.id}: bad rate or maxBottles`);
console.log('✓ products & shipping');

const unverified = Object.entries(historyClaims).filter(([, c]) => !c.verified).map(([id]) => id);
if (unverified.length) console.log(`  ${unverified.length} history claims are unverified: ${unverified.join(', ')}`);

const empty = Object.entries(imageSlots).filter(([, s]) => !s.src).map(([id]) => id);
if (empty.length) console.log(`  ${empty.length} image slots still use placeholders: ${empty.join(', ')}`);

if (failed) process.exit(1);
