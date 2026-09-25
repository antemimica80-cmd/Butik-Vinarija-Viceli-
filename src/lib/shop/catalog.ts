/** Catalogue + pricing. Pure — used by the cart page (display) and the server (truth). */
import { wines } from '@content/wines';
import { caseOf, giftBox, type Format, type Product } from '@content/products';
import { shippingCost, zoneFor, type Zone } from '@content/shipping';

export const products: Product[] = [
  ...wines.map((w) => ({
    slug: w.slug,
    name: w.name,
    kind: 'wine' as const,
    bottleSlot: w.bottleSlot,
    detailSlots: ({ dingac: ['dingac-trio', 'dingac-features', 'dingac-highlights'], 'plavac-mali': ['plavac-trio'], 'opolo-rose': ['rose-trio'] } as Record<string, string[]>)[w.slug],
    summary: w.summary,
    formats: [caseOf(w.slug, 1), caseOf(w.slug, 3), caseOf(w.slug, 6)],
  })),
  giftBox,
];

export function findFormat(sku: string): { product: Product; format: Format } | undefined {
  for (const product of products) {
    const format = product.formats.find((f) => f.sku === sku);
    if (format) return { product, format };
  }
}

export type CartLine = { sku: string; qty: number };

export type PricedLine = { sku: string; qty: number; product: Product; format: Format; lineTotal: number };

export type Priced = {
  lines: PricedLine[];
  bottlesByWine: Record<string, number>;
  bottles: number;
  subtotal: number;
  zone: Zone | undefined;
  shipping: number;
  total: number;
  vat: number;
  overZoneLimit: boolean;
};

export const VAT_RATE = 0.25;

export function priceCart(cart: CartLine[], country?: string): Priced {
  const lines: PricedLine[] = [];
  const bottlesByWine: Record<string, number> = {};
  for (const { sku, qty } of cart) {
    const found = findFormat(sku);
    if (!found || !Number.isInteger(qty) || qty < 1) continue;
    const q = Math.min(qty, 99);
    lines.push({ sku, qty: q, ...found, lineTotal: found.format.price * q });
    for (const [wine, n] of Object.entries(found.format.bottles)) bottlesByWine[wine] = (bottlesByWine[wine] ?? 0) + n * q;
  }
  const bottles = Object.values(bottlesByWine).reduce((a, b) => a + b, 0);
  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const zone = country ? zoneFor(country) : undefined;
  const shipping = zone ? shippingCost(zone, bottles) : 0;
  const total = subtotal + shipping;
  // Prices include VAT: VAT = total − total / 1.25
  const vat = Math.round((total - total / (1 + VAT_RATE)) * 100) / 100;
  return { lines, bottlesByWine, bottles, subtotal, zone, shipping, total, vat, overZoneLimit: zone ? bottles > zone.maxBottles : false };
}
