/**
 * Validates every content file against its schema. Run: npm run check:content
 * Also runs before `next build` (see package.json "prebuild").
 */
import { z } from 'zod';
import { imageSlots } from '../content/image-slots';
import { imageSlotSchema } from '../src/lib/content-schema';

let failed = false;

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

const empty = Object.entries(imageSlots).filter(([, s]) => !s.src).map(([id]) => id);
if (empty.length) console.log(`  ${empty.length} image slots still use placeholders: ${empty.join(', ')}`);

if (failed) process.exit(1);
