/**
 * Shop catalogue. Prices are VAT-inclusive EUR. PROPOSAL VALUES (proposalPrices: true)
 * chosen for the pitch — the owner confirms them (see CONTENT_TODO.md).
 * A "case" is n bottles of one wine; the gift box holds one of each wine.
 */
type L = { en: string; hr: string };

export const proposalPrices = true;

/** Price of one bottle, per wine. */
export const bottlePrice: Record<string, number> = {
  dingac: 55,
  'plavac-mali': 28,
  'opolo-rose': 22,
};

/** Bottles in stock at launch, per wine. TODO: owner to supply real counts. */
export const initialStock: Record<string, number> = {
  dingac: 600,
  'plavac-mali': 300,
  'opolo-rose': 240,
};

export type Format = { sku: string; label: L; bottles: Record<string, number>; price: number };
export type Product = {
  slug: string;
  name: string;
  kind: 'wine' | 'gift';
  bottleSlot: string;
  /** Optional extra images on the product page. */
  detailSlots?: string[];
  summary: L;
  formats: Format[];
};

export const caseOf = (wine: string, n: 1 | 3 | 6): Format => ({
  sku: `${wine}-${n}`,
  label: n === 1 ? { en: 'Bottle, 0.75 L', hr: 'Boca, 0,75 L' } : { en: `Case of ${n}`, hr: `Kutija od ${n} boca` }, // REVIEW
  bottles: { [wine]: n },
  price: bottlePrice[wine] * n,
});

export const giftBox: Product = {
  slug: 'gift-box',
  name: 'The Three Suns Box', // REVIEW — name to confirm with the owner
  kind: 'gift',
  bottleSlot: 'gift-box',
  summary: {
    en: 'All three wines — Dingač, Plavac Mali and Opolo Rosé — in a wooden box.',
    hr: 'Sva tri vina — Dingač, Plavac mali i Opolo rosé — u drvenoj kutiji.', // REVIEW
  },
  formats: [
    {
      sku: 'gift-box',
      label: { en: 'Wooden box, 3 × 0.75 L', hr: 'Drvena kutija, 3 × 0,75 L' },
      bottles: { dingac: 1, 'plavac-mali': 1, 'opolo-rose': 1 },
      price: 115, // proposal: three bottles (105) + the box
    },
  ],
};

export const shopCopy = {
  eyebrow: { en: 'Shop', hr: 'Trgovina' },
  title: { en: 'From the cellar, to your table.', hr: 'Iz podruma, na vaš stol.' }, // REVIEW
  lede: {
    en: 'Bottles, cases and the gift box, shipped from the estate across Croatia and the EU.',
    hr: 'Boce, kutije i poklon kutija, šaljemo s imanja diljem Hrvatske i EU.', // REVIEW
  },
  proposal: { en: 'Proposal prices — to be confirmed by the estate.', hr: 'Predložene cijene — potvrđuje vinarija.' },
  from: { en: 'from', hr: 'od' },
  vatIncl: { en: 'incl. VAT', hr: 's PDV-om' },
  format: { en: 'Format', hr: 'Pakiranje' },
  quantity: { en: 'Quantity', hr: 'Količina' },
  add: { en: 'Add to cart', hr: 'Dodaj u košaricu' },
  added: { en: 'Added', hr: 'Dodano' },
  viewCart: { en: 'View cart', hr: 'Pogledaj košaricu' },
  soldOut: { en: 'Sold out', hr: 'Rasprodano' },
  left: { en: 'Only {n} left', hr: 'Još samo {n}' }, // REVIEW
  dossier: { en: 'Read the dossier', hr: 'Pročitajte dosje' },
  giftEyebrow: { en: 'Gift', hr: 'Poklon' },
  shipsTo: { en: 'Ships to Croatia and the EU. Not available to the United States.', hr: 'Dostava u Hrvatsku i EU. Nije dostupno za SAD.' }, // REVIEW
  cart: {
    title: { en: 'Your cart', hr: 'Vaša košarica' },
    empty: { en: 'Your cart is empty.', hr: 'Vaša je košarica prazna.' },
    browse: { en: 'Browse the wines', hr: 'Pogledajte vina' }, // REVIEW
    remove: { en: 'Remove', hr: 'Ukloni' },
    subtotal: { en: 'Subtotal', hr: 'Međuzbroj' },
    shipping: { en: 'Shipping', hr: 'Dostava' },
    free: { en: 'Free', hr: 'Besplatno' },
    total: { en: 'Total', hr: 'Ukupno' },
    vatNote: { en: 'Includes {vat} VAT (25%)', hr: 'Uključuje {vat} PDV-a (25 %)' },
    freeFrom: { en: 'Free shipping in Croatia from {n} bottles.', hr: 'Besplatna dostava u Hrvatskoj od {n} boca.' }, // REVIEW
    bottles: { en: '{n} bottles', hr: 'boca: {n}' },
  },
  checkout: {
    delivery: { en: 'Delivery', hr: 'Dostava' },
    country: { en: 'Country', hr: 'Država' },
    pickup: { en: 'Collect at the estate (free)', hr: 'Preuzimanje na imanju (besplatno)' }, // REVIEW
    name: { en: 'Full name', hr: 'Ime i prezime' },
    email: { en: 'Email', hr: 'E-pošta' },
    phone: { en: 'Phone', hr: 'Telefon' },
    phoneHint: { en: 'For the courier.', hr: 'Za dostavljača.' },
    street: { en: 'Street and number', hr: 'Ulica i broj' },
    postal: { en: 'Postal code', hr: 'Poštanski broj' },
    city: { en: 'City', hr: 'Grad' },
    notes: { en: 'Delivery notes', hr: 'Napomena za dostavu' },
    terms: {
      en: 'I am 18 or older and accept the {terms}. An adult must sign for the delivery.',
      hr: 'Imam 18 ili više godina i prihvaćam {terms}. Pošiljku mora preuzeti punoljetna osoba.', // REVIEW
    },
    termsLink: { en: 'terms of purchase', hr: 'uvjete kupnje' },
    pay: { en: 'Pay {total} securely', hr: 'Platite {total} sigurno' },
    paying: { en: 'Opening secure payment…', hr: 'Otvaramo sigurno plaćanje…' },
    notAvailable: {
      en: 'We cannot ship wine to the United States or outside the EU. Visit us on Pelješac, or ask about export through an importer.',
      hr: 'Vino ne možemo slati u SAD ni izvan EU. Posjetite nas na Pelješcu ili pitajte za izvoz preko uvoznika.', // REVIEW
    },
    other: { en: 'Other country (not available)', hr: 'Druga država (nije dostupno)' },
    errors: {
      out_of_stock: { en: 'Some bottles just sold out. Please check your cart.', hr: 'Dio boca upravo je rasprodan. Provjerite košaricu.' }, // REVIEW
      zone: { en: 'We cannot ship to that country.', hr: 'U tu državu ne možemo slati.' },
      invalid: { en: 'Please check the highlighted fields.', hr: 'Provjerite označena polja.' },
      generic: { en: 'Something went wrong. Please try again.', hr: 'Nešto nije u redu. Pokušajte ponovno.' },
    },
  },
  ordered: {
    eyebrow: { en: 'Order confirmed', hr: 'Narudžba potvrđena' },
    title: { en: 'The bottles are on their way.', hr: 'Boce su na putu.' }, // REVIEW
    pickupTitle: { en: 'Your bottles are waiting at the estate.', hr: 'Vaše boce čekaju na imanju.' }, // REVIEW
    sentTo: { en: 'A confirmation has been sent to {email}.', hr: 'Potvrda je poslana na {email}.' },
    reference: { en: 'Order', hr: 'Narudžba' },
    pendingTitle: { en: 'Confirming your payment…', hr: 'Potvrđujemo vaše plaćanje…' },
    failedTitle: { en: 'This order was not completed.', hr: 'Ova narudžba nije dovršena.' },
    failedBody: { en: 'No payment was taken.', hr: 'Ništa nije naplaćeno.' },
    deliverTo: { en: 'Delivery to', hr: 'Dostava na' },
    pickup: { en: 'Collect at the estate', hr: 'Preuzimanje na imanju' },
  },
};
