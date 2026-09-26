/**
 * Home page copy — short and organic-first: hero, how we farm, three doors
 * (visit, wines, Dingač), the place, and a final call.
 * Historical facts are NOT written here: they come from history-claims.ts by id.
 */
import type { ClaimId } from './history-claims';

type L = { en: string; hr: string };

export const organic = {
  claim: 'only-organic-dingac' as ClaimId,
  badge: { en: 'The only certified organic Dingač', hr: 'Jedini ekološki certificirani Dingač' }, // REVIEW
  title: { en: ['The only Dingač', 'grown organically.'], hr: ['Jedini Dingač', 'uzgojen ekološki.'] }, // REVIEW
  body: {
    en: 'On a terroir where every vine is tended by hand, we went one step further: no synthetic pesticides, no herbicides, no artificial fertilisers — certified and inspected. Of all the wines that carry the name Dingač, ours is the only one with organic certification.',
    hr: 'Na terroiru gdje se svaki trs njeguje rukama, otišli smo korak dalje: bez sintetičkih pesticida, bez herbicida, bez umjetnih gnojiva — certificirano i nadzirano. Od svih vina koja nose ime Dingač, naše je jedino s ekološkim certifikatom.', // REVIEW
  },
  points: [
    { en: 'No synthetic pesticides', hr: 'Bez sintetičkih pesticida' },
    { en: 'No herbicides', hr: 'Bez herbicida' },
    { en: 'Living soil, natural cover crops', hr: 'Živo tlo, prirodni pokrov' }, // REVIEW
    { en: 'Wild yeast, nothing added', hr: 'Divlji kvasci, ništa dodano' },
  ],
  cta: { en: 'Read the Dingač dossier', hr: 'Pročitajte dosje Dingača' }, // REVIEW
};

export const home = {
  hero: {
    lede: {
      en: 'Plavac Mali from our own vines on the Dingač terroir of Pelješac. Certified organic, picked by hand, fermented with wild yeast.',
      hr: 'Plavac mali s vlastitih trsova na terroiru Dingača na Pelješcu. Ekološki certificiran, ručno bran, fermentiran divljim kvascima.', // REVIEW
    },
    secondary: { en: 'Shop the wines', hr: 'Kupite vina' }, // REVIEW
  },
  farming: {
    eyebrow: { en: 'How we farm', hr: 'Kako uzgajamo' }, // REVIEW
    cta: { en: 'Our organic farming', hr: 'Naš ekološki uzgoj' }, // REVIEW
  },
  tiles: [
    {
      href: '/experience',
      slot: 'guests-couple',
      eyebrow: { en: 'Visit', hr: 'Posjet' },
      title: { en: 'Taste it where it grows.', hr: 'Kušajte ga ondje gdje raste.' }, // REVIEW
      cta: { en: 'Book a tasting', hr: 'Rezervirajte degustaciju' }, // REVIEW
    },
    {
      href: '/wines',
      slot: 'three-wines',
      eyebrow: { en: 'Wines', hr: 'Vina' },
      title: { en: 'Three wines. One grape.', hr: 'Tri vina. Jedna sorta.' }, // REVIEW
      cta: { en: 'Shop the wines', hr: 'Kupite vina' }, // REVIEW
    },
    {
      href: '/dingac',
      slot: 'dingac-slope',
      eyebrow: { en: 'The place', hr: 'Mjesto' }, // REVIEW
      title: { en: 'Croatia\'s grand cru.', hr: 'Hrvatski grand cru.' }, // REVIEW
      cta: { en: 'Discover Dingač', hr: 'Otkrijte Dingač' }, // REVIEW
    },
  ],
  story: {
    eyebrow: { en: 'Dingač · Pelješac', hr: 'Dingač · Pelješac' },
    title: { en: 'One terroir. Three suns.', hr: 'Jedan terroir. Tri sunca.' }, // REVIEW
    body: {
      en: 'Dingač falls steeply from the ridge to the sea. The vines get three suns: from the sky, off the sea, and from the white stone that holds the heat. This is where the Vicelić family keeps its vines.',
      hr: 'Dingač se strmo spušta od grebena do mora. Loza dobiva tri sunca: s neba, s mora i iz bijelog kamena koji čuva toplinu. Ovdje obitelj Vicelić čuva svoje vinograde.', // REVIEW
    },
    family: { en: 'The family', hr: 'Obitelj' },
    dingac: { en: 'Discover Dingač', hr: 'Otkrijte Dingač' }, // REVIEW
  },
  stone: {
    title: { en: 'Three suns.', hr: 'Tri sunca.' }, // REVIEW
    body: {
      en: 'On Dingač the vine gets three suns. The first falls from the sky. The second comes back off the sea. The third is the heat the white stone stores all day and gives back to the vines.',
      hr: 'Na Dingaču loza dobiva tri sunca. Prvo pada s neba. Drugo se vraća s mora. Treće je toplina koju bijeli kamen skuplja cijeli dan i vraća lozi.', // REVIEW
    },
    suns: [
      { numeral: 'I', name: { en: 'Sky', hr: 'Nebo' }, text: { en: 'Direct sun on a steep slope that faces the sea.', hr: 'Izravno sunce na strmom obronku okrenutom moru.' } }, // REVIEW
      { numeral: 'II', name: { en: 'Sea', hr: 'More' }, text: { en: 'Light thrown back from the Adriatic below.', hr: 'Svjetlo koje se odbija od Jadrana ispod.' } }, // REVIEW
      { numeral: 'III', name: { en: 'Stone', hr: 'Kamen' }, text: { en: 'Heat held in the white limestone and released into the vines.', hr: 'Toplina koju drži bijeli vapnenac i predaje lozi.' } }, // REVIEW
    ],
  },
  route: {
    eyebrow: { en: 'Getting here', hr: 'Kako doći' },
    title: { en: 'From Dubrovnik, along the coast and onto the peninsula.', hr: 'Iz Dubrovnika, uz obalu i na poluotok.' }, // REVIEW
    legs: [
      {
        from: { en: 'From Dubrovnik', hr: 'Iz Dubrovnika' },
        via: { en: 'North along the coast road to Ston, then along the Pelješac road.', hr: 'Obalnom cestom na sjever do Stona, zatim cestom kroz Pelješac.' }, // REVIEW
        time: { en: '~TODO min by car', hr: '~TODO min automobilom' },
      },
      {
        from: { en: 'From Ston', hr: 'Iz Stona' },
        via: { en: 'Along the Pelješac road towards Orebić.', hr: 'Cestom kroz Pelješac prema Orebiću.' }, // REVIEW
        time: { en: '~TODO min by car', hr: '~TODO min automobilom' },
      },
      {
        from: { en: 'From Split', hr: 'Iz Splita' },
        via: { en: 'South on the motorway, then across the Pelješac Bridge.', hr: 'Autocestom na jug, zatim preko Pelješkog mosta.' }, // REVIEW
        time: { en: '~TODO h by car', hr: '~TODO h automobilom' },
      },
    ],
    transfer: {
      en: 'Not driving? We recommend a trusted transfer partner from Dubrovnik and Ston. Ask when you book.',
      hr: 'Ne vozite? Preporučujemo provjerenog partnera za prijevoz iz Dubrovnika i Stona. Pitajte pri rezervaciji.', // REVIEW
    },
    directions: { en: 'Directions and map', hr: 'Upute i karta' },
  },
  final: {
    title: { en: 'The terroir is open.', hr: 'Terroir je otvoren.' }, // REVIEW
    body: {
      en: 'Tastings all year. In summer, every day. In winter, by appointment.',
      hr: 'Degustacije tijekom cijele godine. Ljeti svaki dan. Zimi uz najavu.', // REVIEW
    },
    cta: { en: 'Book a tasting', hr: 'Rezerviraj degustaciju' }, // REVIEW
    whatsapp: { en: 'Or write to us on WhatsApp', hr: 'Ili nam pišite na WhatsApp' }, // REVIEW
  },
} as const;
