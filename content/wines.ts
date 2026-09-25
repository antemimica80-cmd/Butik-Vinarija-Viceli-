/**
 * The three wines. Technical data from vicelic.hr — the owner should check it against the labels.
 * Prices and vintages are TBD (see CONTENT_TODO.md).
 */
import type { Wine } from '../src/lib/content-schema';

export const wines = [
  {
    slug: 'dingac',
    name: 'Dingač',
    style: { en: 'Red · Dingač PDO', hr: 'Crno · ZOI Dingač' }, // REVIEW
    vintage: 'TBD',
    price: 'TBD',
    bottleSlot: 'bottle-dingac',
    summary: {
      en: 'The estate wine. Old gobelet vines on shallow red soil and white stone, above the sea.',
      hr: 'Vino imanja. Stari trsovi u gobeletu na plitkoj crvenici i bijelom kamenu, iznad mora.', // REVIEW
    },
    sheet: {
      parcel: { en: 'Dingač', hr: 'Dingač' },
      soil: { en: 'Red, shallow, stony', hr: 'Crvenica, plitka, kamenita' }, // REVIEW
      area: '3.5 ha',
      variety: 'Plavac Mali',
      rootstock: 'Richter 110',
      density: '10,000 vines/ha',
      training: { en: 'En gobelet', hr: 'Gobelet' },
      harvest: { en: 'By hand, with selection', hr: 'Ručna berba i selekcija' }, // REVIEW
      fermentation: {
        en: 'Stainless steel, temperature-controlled. Wild yeast.',
        hr: 'Inox, uz kontrolu temperature. Divlji kvasci.', // REVIEW
      },
      ageing: {
        en: '14–18 months in 225 L barriques, French and American oak, 50% new, 50% used',
        hr: '14–18 mjeseci u barrique bačvama od 225 L, francuski i američki hrast, 50 % novih, 50 % korištenih', // REVIEW
      },
      bottles: 9500,
    },
    tasting: {
      en: 'Black cherry, plum, dried fig. Mediterranean herbs, wild sage, dried lavender. With age: dark chocolate, tobacco, sweet spice, a mineral line.',
      hr: 'Crna trešnja, šljiva, suha smokva. Mediteransko bilje, divlja kadulja, suha lavanda. S godinama: tamna čokolada, duhan, slatki začini, mineralnost.', // REVIEW
    },
    serve: {
      glass: { en: 'Burgundy glass', hr: 'Čaša za burgundac' }, // REVIEW
      temperature: '18 °C',
      pairing: { en: 'TBD', hr: 'TBD' }, // TODO: not stated on vicelic.hr — owner to supply
      ageing: { en: 'Drinking now. Will age.', hr: 'Spremno sada. Može odležati.' }, // REVIEW
    },
  },
  {
    slug: 'plavac-mali',
    name: 'Plavac Mali',
    style: { en: 'Red', hr: 'Crno' },
    vintage: 'TBD',
    price: 'TBD',
    bottleSlot: 'bottle-plavac',
    summary: {
      en: 'Light, almost translucent. The slope at its most direct. Serve it slightly cool.',
      hr: 'Lagano, gotovo prozirno. Obronak u najizravnijem obliku. Poslužite lagano rashlađeno.', // REVIEW
    },
    sheet: {
      parcel: { en: 'TBD', hr: 'TBD' }, // TODO: parcel name
      soil: { en: 'Red, deep, little stone', hr: 'Crvenica, duboka, malo kamena' }, // REVIEW
      area: '1 ha',
      variety: 'Plavac Mali',
      rootstock: 'Richter 110',
      density: '10,000 vines/ha',
      training: { en: 'En gobelet', hr: 'Gobelet' },
      harvest: { en: 'By hand', hr: 'Ručna berba' },
      fermentation: { en: 'Wild yeast', hr: 'Divlji kvasci' },
      ageing: {
        en: '10–12 months in used French and American oak',
        hr: '10–12 mjeseci u korištenim bačvama od francuskog i američkog hrasta', // REVIEW
      },
      bottles: 3500,
    },
    tasting: {
      en: 'Light body. Red fruit and herbs. Minimal tannin. Very drinkable.',
      hr: 'Lagano tijelo. Crveno voće i bilje. Minimalni tanini. Vrlo pitko.', // REVIEW
    },
    serve: {
      glass: { en: 'Burgundy glass', hr: 'Čaša za burgundac' }, // REVIEW
      temperature: '15 °C',
      pairing: { en: 'Tuna steak', hr: 'Odrezak tune' }, // REVIEW
      ageing: { en: 'Drink now', hr: 'Za piti sada' }, // REVIEW
    },
  },
  {
    slug: 'opolo-rose',
    name: 'Opolo Rosé',
    style: { en: 'Rosé', hr: 'Rosé' },
    vintage: 'TBD',
    price: 'TBD',
    bottleSlot: 'bottle-rose',
    summary: {
      en: 'Plavac Mali, pale and dry. Limestone terraces, a short time on the skins.',
      hr: 'Plavac mali, blijed i suh. Vapnenačke terase, kratka maceracija.', // REVIEW
    },
    sheet: {
      parcel: { en: 'TBD', hr: 'TBD' }, // TODO: parcel name
      soil: { en: 'Limestone and terra rossa, well drained', hr: 'Vapnenac i crvenica, dobro drenirano' }, // REVIEW
      area: '0.8 ha',
      variety: 'Plavac Mali',
      rootstock: 'Richter 110',
      density: '9,000 vines/ha',
      training: { en: 'En gobelet', hr: 'Gobelet' },
      harvest: { en: 'By hand', hr: 'Ručna berba' },
      fermentation: { en: 'Wild yeast. Short skin contact.', hr: 'Divlji kvasci. Kratka maceracija.' }, // REVIEW
      ageing: { en: '4–6 months on fine lees in steel', hr: '4–6 mjeseci na finom talogu u inoxu' }, // REVIEW
      bottles: 2500,
    },
    tasting: {
      en: 'Pale salmon. Wild strawberry, rose petal, citrus peel, Mediterranean herbs. Crisp, mineral, an elegant finish.',
      hr: 'Blijedo lososova boja. Šumska jagoda, latica ruže, korica citrusa, mediteransko bilje. Svježe, mineralno, elegantan završetak.', // REVIEW
    },
    serve: {
      glass: { en: 'Tulip glass', hr: 'Čaša u obliku tulipana' }, // REVIEW
      temperature: '10–12 °C',
      pairing: {
        en: 'Aperitif, seafood, shellfish, summer salads',
        hr: 'Aperitiv, morski plodovi, školjke, ljetne salate', // REVIEW
      },
      ageing: { en: 'Drink young', hr: 'Piti mlado' }, // REVIEW
    },
  },
] satisfies Wine[];

export const totalBottles = wines.reduce((n, w) => n + w.sheet.bottles, 0);
