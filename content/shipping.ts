/**
 * Shipping zones. PROPOSAL VALUES — confirm rates with the owner and the courier.
 *
 * ⚠ EU: selling wine to consumers in other EU countries means excise duty is due in
 * the buyer's country, usually through a tax representative. Switch the EU zone off
 * (enabled: false) until that is in place. See CONTENT_TODO.md.
 */
export type Zone = {
  id: 'hr' | 'eu' | 'pickup';
  enabled: boolean;
  name: { en: string; hr: string };
  countries: string[]; // ISO 3166-1 alpha-2
  rate: number; // EUR, VAT incl., per order
  freeFromBottles: number | null;
  maxBottles: number;
};

export const zones: Zone[] = [
  {
    id: 'hr',
    enabled: true,
    name: { en: 'Croatia', hr: 'Hrvatska' },
    countries: ['HR'],
    rate: 7,
    freeFromBottles: 6,
    maxBottles: 36,
  },
  {
    id: 'eu',
    enabled: true,
    name: { en: 'European Union', hr: 'Europska unija' },
    countries: ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'],
    rate: 25,
    freeFromBottles: null,
    maxBottles: 18,
  },
  {
    id: 'pickup',
    enabled: true,
    name: { en: 'Collect at the estate', hr: 'Preuzimanje na imanju' },
    countries: [],
    rate: 0,
    freeFromBottles: null,
    maxBottles: 120,
  },
];

export function zoneFor(country: string): Zone | undefined {
  if (country === 'PICKUP') return zones.find((z) => z.id === 'pickup' && z.enabled);
  return zones.find((z) => z.enabled && z.countries.includes(country));
}

export function shippingCost(zone: Zone, bottles: number) {
  if (zone.freeFromBottles !== null && bottles >= zone.freeFromBottles) return 0;
  return zone.rate;
}
