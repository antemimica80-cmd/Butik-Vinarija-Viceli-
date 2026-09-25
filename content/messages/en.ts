/**
 * English UI strings — the source of truth for message keys.
 * hr.ts must mirror this shape exactly (enforced by TypeScript).
 */
const en = {
  meta: {
    siteName: 'Vicelić Boutique Winery',
    defaultTitle: 'Vicelić — Dingač, Pelješac. Three suns. One family.',
    defaultDescription:
      'The only certified organic Dingač. A family winery on the Dingač slopes of Pelješac, Croatia — guided tastings above the Adriatic, bookable online.',
  },
  masterLine: 'Three suns. One family.',
  nav: {
    experience: 'The Experience',
    dingac: 'Dingač',
    family: 'The Family',
    wines: 'The Wines',
    shop: 'Shop',
    visit: 'Visit',
    book: 'Book a tasting',
    bookShort: 'Book',
    menu: 'Menu',
    close: 'Close',
    cart: 'Cart',
    cartCount: '{count, plural, =0 {Cart, empty} one {Cart, # item} other {Cart, # items}}',
    home: 'Vicelić — home',
    skipToContent: 'Skip to content',
    primary: 'Primary',
  },
  locale: {
    label: 'Language',
    en: 'English',
    hr: 'Hrvatski',
  },
  ageGate: {
    eyebrow: 'Dingač · Pelješac',
    title: 'Before you enter',
    question: 'Are you of legal drinking age in your country?',
    note: 'You must be 18 or older to visit this site.',
    confirm: 'I am 18 or older',
    deny: 'Not yet',
    deniedTitle: 'Come back in a few years.',
    deniedBody: 'The vines will still be here. They have waited longer.',
    back: 'Go back',
  },
  consent: {
    title: 'Cookies',
    body: 'We use only what the site needs to work. With your permission we also load maps and video from third parties.',
    accept: 'Allow all',
    necessary: 'Necessary only',
    policy: 'Cookie policy',
  },
  whatsapp: {
    label: 'Message us on WhatsApp',
    prefill: 'Hello, I would like to ask about a wine tasting at Vicelić.',
  },
  footer: {
    tagline: 'Certified organic. Plavac Mali only. Wild yeast. Nothing added.',
    visit: 'Visit',
    contact: 'Contact',
    explore: 'Explore',
    legal: 'Legal',
    season: 'Tastings all year. Winter by appointment.',
    responsible: 'Please enjoy wine responsibly. Not for sale to persons under 18.',
    rights: 'All rights reserved.',
    terms: 'Terms of purchase',
    privacy: 'Privacy policy',
    cookies: 'Cookie policy',
    imprint: 'Imprint',
    cookieSettings: 'Cookie settings',
  },
  common: {
    placeholder: 'Placeholder',
    comingInStage: 'This page is built in stage {stage}.',
    backHome: 'Back to home',
  },
  stub: {
    experience: { eyebrow: 'Tastings', title: 'The Experience' },
    dingac: { eyebrow: 'The grand cru of the Adriatic', title: 'Dingač' },
    family: { eyebrow: 'The Keeper', title: 'The Family' },
    wines: { eyebrow: 'Three wines', title: 'The Wines' },
    shop: { eyebrow: 'Bottles', title: 'Shop' },
    visit: { eyebrow: 'Pijavičino, Pelješac', title: 'Visit' },
    legal: { eyebrow: 'Legal', title: 'Legal' },
  },
  home: {
    heroEyebrow: 'Dingač · Pelješac · Croatia',
    heroPrimary: 'Book a tasting',
    heroSecondary: 'Discover Dingač',
  },
};

export default en;

type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> };
export type Messages = DeepString<typeof en>;
