import { z } from 'zod';

export const localized = z.object({ en: z.string().min(1), hr: z.string().min(1) });
export type Localized = z.infer<typeof localized>;

const ratio = z.string().regex(/^\d+(\.\d+)?\/\d+(\.\d+)?$/, 'ratio must look like "16/9"');

export const imageSlotSchema = z.object({
  kind: z.enum(['image', 'video']),
  ratio,
  mobileRatio: ratio.optional(),
  tone: z.enum(['sun', 'shade', 'cellar']),
  shot: z.string().min(1),
  light: z.string().min(1),
  alt: localized,
  src: z.string().startsWith('/').nullable(),
  poster: z.string().startsWith('/').nullable().optional(),
});
export type ImageSlotDef = z.infer<typeof imageSlotSchema>;
