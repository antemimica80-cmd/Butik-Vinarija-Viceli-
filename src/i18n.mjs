// UI strings + navigation. Page copy lives with each page in pages.mjs.
export const ui = {
  hr: {
    locale: 'hr-HR', ogLocale: 'hr_HR', langName: 'Hrvatski',
    skip: 'Preskoči na sadržaj', menu: 'Izbornik', cart: 'Košarica', close: 'Zatvori',
    nav: { story: 'Vinarija', dingac: 'Dingač', wines: 'Vina', experience: 'Doživljaj', shop: 'Trgovina', contact: 'Kontakt' },
    home: 'Početna', discover: 'Otkrijte', explore: 'Više o vinu', buy: 'Kupi', addToCart: 'Dodaj u košaricu',
    qty: 'Količina', remove: 'Ukloni', total: 'Ukupno', onRequest: 'Cijena na upit', toShop: 'U trgovinu',
    cartEmpty: 'Vaša je košarica prazna.', orderEmail: 'Pošalji narudžbu e-poštom', orderWa: 'Naruči putem WhatsAppa',
    orderSubject: 'Narudžba vina — Vicelić', orderIntro: 'Poštovani, želio/željela bih naručiti:', orderOutro: 'Ime i prezime:\nAdresa za dostavu:\nTelefon:',
    cartNote: 'Narudžbu potvrđujemo osobno — javit ćemo vam se s dostupnošću, cijenom dostave i načinom plaćanja.',
    reserve: 'Rezervirajte degustaciju', whatsapp: 'WhatsApp', email: 'E-pošta',
    footer: { tagline: 'Organski Plavac Mali s obronaka Dingača.', visit: 'Posjet', wines: 'Vina', winery: 'Vinarija', legal: 'Informacije', terms: 'Uvjeti kupnje', privacy: 'Privatnost', rights: 'Sva prava pridržana.' },
    tbc: 'Uskoro',
  },
  en: {
    locale: 'en-GB', ogLocale: 'en_GB', langName: 'English',
    skip: 'Skip to content', menu: 'Menu', cart: 'Cart', close: 'Close',
    nav: { story: 'Winery', dingac: 'Dingač', wines: 'Wines', experience: 'Experience', shop: 'Shop', contact: 'Contact' },
    home: 'Home', discover: 'Discover', explore: 'Explore the wine', buy: 'Buy', addToCart: 'Add to cart',
    qty: 'Quantity', remove: 'Remove', total: 'Total', onRequest: 'Price on request', toShop: 'Visit the shop',
    cartEmpty: 'Your cart is empty.', orderEmail: 'Send order by email', orderWa: 'Order via WhatsApp',
    orderSubject: 'Wine order — Vicelić', orderIntro: 'Hello, I would like to order:', orderOutro: 'Name:\nDelivery address:\nPhone:',
    cartNote: 'We confirm every order personally — we will reply with availability, delivery cost and payment details.',
    reserve: 'Reserve a private tasting', whatsapp: 'WhatsApp', email: 'Email',
    footer: { tagline: 'Organic Plavac Mali from the slopes of Dingač.', visit: 'Visit', wines: 'Wines', winery: 'Winery', legal: 'Information', terms: 'Terms of sale', privacy: 'Privacy', rights: 'All rights reserved.' },
    tbc: 'To be announced',
  },
};

// Same slugs in both languages (mirrors the current site's /en/o-nama/ pattern)
export const routes = {
  home: '', story: 'o-nama/', dingac: 'dingac/', wines: 'vina/',
  'wine-plavac-mali': 'vina/plavac-mali/', 'wine-opolo-rose': 'vina/opolo-rose/',
  experience: 'iskustvo/', shop: 'shop/', contact: 'kontakt/',
  'product-dingac': 'product/dingac/', 'product-plavac-mali': 'product/plavac-mali/', 'product-opolo-rose': 'product/opolo-rose/',
  terms: 'uvjeti-kupnje/', privacy: 'privatnost/',
};
export const href = (L, key) => (L === 'en' ? '/en/' : '/') + routes[key];
export const wineHref = (L, id) => id === 'dingac' ? href(L, 'dingac') : href(L, `wine-${id}`);
export const productHref = (L, id) => href(L, `product-${id}`);
