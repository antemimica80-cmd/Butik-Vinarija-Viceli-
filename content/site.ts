/**
 * Core facts about the estate. Source: vicelic.hr (to be verified by the owner).
 * Anything marked TODO is also listed in CONTENT_TODO.md.
 */
export const site = {
  brand: 'Vicelić',
  nameEn: 'Vicelić Boutique Winery',
  nameHr: 'Butik vinarija Vicelić',
  legalName: 'OPG Mateo Vicelić',
  oib: 'TODO', // TODO: OIB for imprint / invoices
  winemaker: 'Mateo Vicelić',
  address: {
    street: 'Pijavičino 33',
    postalCode: '20243',
    city: 'Kuna',
    region: 'Pelješac',
    country: 'Croatia',
    countryHr: 'Hrvatska',
    countryCode: 'HR',
    // TODO: exact coordinates of the tasting room (for map + schema.org)
    geo: null as { lat: number; lng: number } | null,
  },
  phone: '+385 95 396 8114',
  phoneHref: 'tel:+385953968114',
  whatsapp: '385953968114',
  email: 'mvicelic@gmail.com',
  instagram: { handle: '@butik_vinaria_vicelic', url: 'https://www.instagram.com/butik_vinaria_vicelic/' },
  vatRegistered: true,
  vatRate: 0.25,
  currency: 'EUR',
} as const;

export type Site = typeof site;
