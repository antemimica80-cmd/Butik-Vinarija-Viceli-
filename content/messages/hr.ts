// REVIEW: cijeli hrvatski prijevod treba provjeriti izvorni govornik / vlasnik.
import type { Messages } from './en';

const hr: Messages = {
  meta: {
    siteName: 'Butik vinarija Vicelić', // REVIEW
    defaultTitle: 'Vicelić — Dingač, Pelješac. Tri sunca. Jedna obitelj.', // REVIEW
    defaultDescription:
      'Obiteljska ekološki certificirana vinarija na obroncima Dingača na Pelješcu. Vođene degustacije iznad Jadrana, s rezervacijom online.', // REVIEW
  },
  masterLine: 'Tri sunca. Jedna obitelj.', // REVIEW
  nav: {
    experience: 'Degustacije', // REVIEW
    dingac: 'Dingač',
    family: 'Obitelj', // REVIEW
    wines: 'Vina',
    shop: 'Trgovina', // REVIEW
    visit: 'Posjet', // REVIEW
    book: 'Rezerviraj degustaciju', // REVIEW
    bookShort: 'Rezerviraj',
    menu: 'Izbornik',
    close: 'Zatvori',
    cart: 'Košarica',
    cartCount: '{count, plural, =0 {Košarica, prazna} one {Košarica, # artikl} few {Košarica, # artikla} other {Košarica, # artikala}}', // REVIEW
    home: 'Vicelić — naslovnica',
    skipToContent: 'Preskoči na sadržaj',
    primary: 'Glavni izbornik',
  },
  locale: {
    label: 'Jezik',
    en: 'English',
    hr: 'Hrvatski',
  },
  ageGate: {
    eyebrow: 'Dingač · Pelješac',
    title: 'Prije nego uđete', // REVIEW
    question: 'Jeste li punoljetni prema zakonu svoje zemlje?', // REVIEW
    note: 'Za posjet ovoj stranici morate imati najmanje 18 godina.', // REVIEW
    confirm: 'Imam 18 ili više godina', // REVIEW
    deny: 'Još ne', // REVIEW
    deniedTitle: 'Vratite se za nekoliko godina.', // REVIEW
    deniedBody: 'Loza će i dalje biti ovdje. Čekala je i dulje.', // REVIEW
    back: 'Natrag',
  },
  consent: {
    title: 'Kolačići',
    body: 'Koristimo samo ono što je stranici nužno za rad. Uz vaše dopuštenje učitavamo i karte i video vanjskih pružatelja.', // REVIEW
    accept: 'Dopusti sve',
    necessary: 'Samo nužni',
    policy: 'Politika kolačića',
  },
  whatsapp: {
    label: 'Pišite nam na WhatsApp', // REVIEW
    prefill: 'Dobar dan, zanima me degustacija vina u vinariji Vicelić.', // REVIEW
  },
  footer: {
    tagline: 'Ekološki certificirano. Samo plavac mali. Divlji kvasci. Ništa dodano.', // REVIEW
    visit: 'Posjet',
    contact: 'Kontakt',
    explore: 'Istražite', // REVIEW
    legal: 'Pravne informacije',
    season: 'Degustacije tijekom cijele godine. Zimi uz najavu.', // REVIEW
    responsible: 'Uživajte u vinu odgovorno. Zabranjena prodaja osobama mlađim od 18 godina.', // REVIEW
    rights: 'Sva prava pridržana.',
    terms: 'Uvjeti kupnje',
    privacy: 'Politika privatnosti',
    cookies: 'Politika kolačića',
    imprint: 'Impresum',
    cookieSettings: 'Postavke kolačića',
  },
  common: {
    placeholder: 'Rezervirano mjesto', // REVIEW
    comingInStage: 'Ova se stranica izrađuje u fazi {stage}.',
    backHome: 'Natrag na naslovnicu',
  },
  stub: {
    experience: { eyebrow: 'Degustacije', title: 'Iskustvo' }, // REVIEW
    dingac: { eyebrow: 'Grand cru Jadrana', title: 'Dingač' }, // REVIEW
    family: { eyebrow: 'Čuvar', title: 'Obitelj' }, // REVIEW
    wines: { eyebrow: 'Tri vina', title: 'Vina' },
    shop: { eyebrow: 'Boce', title: 'Trgovina' },
    visit: { eyebrow: 'Pijavičino, Pelješac', title: 'Posjet' },
    legal: { eyebrow: 'Pravno', title: 'Pravne informacije' },
  },
  home: {
    heroEyebrow: 'Dingač · Pelješac · Hrvatska',
    heroPrimary: 'Rezerviraj degustaciju', // REVIEW
    heroSecondary: 'Otkrijte Dingač', // REVIEW
  },
};

export default hr;
