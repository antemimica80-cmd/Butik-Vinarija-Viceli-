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

export const historyClaimSchema = z.object({
  year: z.string().min(1),
  text: localized,
  source: z.string().min(1),
  verified: z.boolean(),
});
export type HistoryClaim = z.infer<typeof historyClaimSchema>;

const tbd = z.union([z.number().positive(), z.literal('TBD')]);

export const wineSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  style: localized,
  vintage: z.union([z.number().int(), z.literal('TBD')]),
  price: tbd,
  bottleSlot: z.string().min(1),
  summary: localized,
  sheet: z.object({
    parcel: localized,
    soil: localized,
    area: z.string(),
    variety: z.string(),
    rootstock: z.string(),
    density: z.string(),
    training: localized,
    harvest: localized,
    fermentation: localized,
    ageing: localized,
    bottles: z.number().int().positive(),
  }),
  tasting: localized,
  serve: z.object({ glass: localized, temperature: z.string(), pairing: localized, ageing: localized }),
});
export type Wine = z.infer<typeof wineSchema>;

const time = z.string().regex(/^\d{2}:\d{2}$/);

export const experienceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  tier: z.number().int().min(1),
  tagline: localized,
  description: localized,
  durationMinutes: z.number().int().positive(),
  winesIncluded: z.number().int().positive(),
  wines: z.array(z.string()),
  food: localized.nullable(),
  includes: z.array(localized),
  minGuests: z.number().int().positive(),
  maxGuests: z.number().int().positive(),
  pricePerPerson: tbd,
  childPolicy: localized,
  depositPercent: z.number().min(0).max(100),
  languages: z.array(z.enum(['en', 'hr'])),
  seasons: z.array(
    z.object({
      name: localized,
      from: z.string().regex(/^\d{2}-\d{2}$/),
      to: z.string().regex(/^\d{2}-\d{2}$/),
      days: z.array(z.number().int().min(0).max(6)),
      slots: z.array(time),
      onRequestOnly: z.boolean(),
    }),
  ),
  capacityPerSlot: z.number().int().positive(),
  imageSlot: z.string().min(1),
  proposalValues: z.boolean(),
});
export type Experience = z.infer<typeof experienceSchema>;
