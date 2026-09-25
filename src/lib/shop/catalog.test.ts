import { describe, expect, it } from 'vitest';
import { priceCart, products } from './catalog';

describe('shop pricing', () => {
  it('has 3 formats per wine plus the gift box', () => {
    expect(products.map((p) => p.formats.length)).toEqual([3, 3, 3, 1]);
  });

  it('prices lines, counts bottles per wine and ignores unknown SKUs', () => {
    const p = priceCart([
      { sku: 'dingac-1', qty: 2 },
      { sku: 'plavac-mali-3', qty: 1 },
      { sku: 'gift-box', qty: 1 },
      { sku: 'nope', qty: 3 },
    ]);
    expect(p.lines).toHaveLength(3);
    expect(p.bottlesByWine).toEqual({ dingac: 3, 'plavac-mali': 4, 'opolo-rose': 1 });
    expect(p.bottles).toBe(8);
    expect(p.subtotal).toBe(55 * 2 + 28 * 3 + 115);
  });

  it('applies zone rates and free Croatian shipping from 6 bottles', () => {
    expect(priceCart([{ sku: 'dingac-1', qty: 2 }], 'HR').shipping).toBe(7);
    expect(priceCart([{ sku: 'dingac-6', qty: 1 }], 'HR').shipping).toBe(0);
    expect(priceCart([{ sku: 'dingac-6', qty: 1 }], 'DE').shipping).toBe(25);
    expect(priceCart([{ sku: 'dingac-1', qty: 1 }], 'PICKUP').shipping).toBe(0);
  });

  it('refuses countries outside the zones (e.g. the US)', () => {
    const p = priceCart([{ sku: 'dingac-1', qty: 1 }], 'US');
    expect(p.zone).toBeUndefined();
  });

  it('extracts the VAT included in the total', () => {
    const p = priceCart([{ sku: 'dingac-1', qty: 1 }], 'HR'); // 62 incl. VAT
    expect(p.total).toBe(62);
    expect(p.vat).toBe(12.4);
  });

  it('flags carts over the zone parcel limit', () => {
    expect(priceCart([{ sku: 'dingac-6', qty: 4 }], 'DE').overZoneLimit).toBe(true);
  });
});
