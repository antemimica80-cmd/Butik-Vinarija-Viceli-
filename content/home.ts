/**
 * Home page copy — "the descent", from the ridge to the sea.
 * Historical facts are NOT written here: they come from history-claims.ts by id.
 * Altitudes are illustrative (see CONTENT_TODO.md).
 */
import type { ClaimId } from './history-claims';

type L = { en: string; hr: string };

export const stations = [
  { id: 'ridge', altitude: 350, name: { en: 'Ridge', hr: 'Greben' } },
  { id: 'stone', altitude: 250, name: { en: 'Stone', hr: 'Kamen' } },
  { id: 'vine', altitude: 150, name: { en: 'Vine', hr: 'Loza' } },
  { id: 'cellar', altitude: 50, name: { en: 'Cellar', hr: 'Podrum' } },
  { id: 'sea', altitude: 0, name: { en: 'Sea', hr: 'More' } },
] as const satisfies ReadonlyArray<{ id: string; altitude: number; name: L }>;

export type StationId = (typeof stations)[number]['id'];

export const organic = {
  claim: 'only-organic-dingac' as ClaimId,
  badge: { en: 'The only certified organic Dingač', hr: 'Jedini ekološki certificirani Dingač' }, // REVIEW
  title: { en: ['The only Dingač', 'grown organically.'], hr: ['Jedini Dingač', 'uzgojen ekološki.'] }, // REVIEW
  body: {
    en: 'On a slope where every vine is tended by hand, we went one step further: no synthetic pesticides, no herbicides, no artificial fertilisers — certified and inspected. Of all the wines that carry the name Dingač, ours is the only one with organic certification.',
    hr: 'Na obronku gdje se svaki trs njeguje rukama, otišli smo korak dalje: bez sintetičkih pesticida, bez herbicida, bez umjetnih gnojiva — certificirano i nadzirano. Od svih vina koja nose ime Dingač, naše je jedino s ekološkim certifikatom.', // REVIEW
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
  ridge: {
    title: { en: 'The grand cru of the Adriatic.', hr: 'Grand cru Jadrana.' }, // REVIEW
    body: {
      en: 'Dingač is one slope on the Pelješac peninsula, falling steeply from the ridge to the sea. Croatia has no official classification of great vineyards. Dingač has never needed one.',
      hr: 'Dingač je jedan obronak na poluotoku Pelješcu koji se strmo spušta od grebena do mora. Hrvatska nema službenu klasifikaciju velikih vinograda. Dingaču nikad nije ni trebala.', // REVIEW
    },
    claims: ['pdo-1961', 'bordeaux-19c', 'mirosevic-research'] as ClaimId[],
    cta: { en: 'Discover Dingač', hr: 'Otkrijte Dingač' }, // REVIEW
  },
  tunnel: {
    eyebrow: { en: 'The tunnel', hr: 'Tunel' },
    claim: 'tunnel-1973' as ClaimId,
    lines: [
      { en: 'On one side, the world.', hr: 'S jedne strane, svijet.' }, // REVIEW
      { en: 'On the other, the slope.', hr: 'S druge strane, obronak.' }, // REVIEW
    ],
    emerge: { en: 'Dingač.', hr: 'Dingač.' },
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
  vine: {
    title: { en: 'The Keeper.', hr: 'Čuvar.' }, // REVIEW
    lede: {
      en: 'Some families make wine. This one keeps a place.',
      hr: 'Neke obitelji rade vino. Ova čuva mjesto.', // REVIEW
    },
    // Story beats — the owner verifies each one. `claim` beats come from history-claims.ts.
    beats: [
      { claim: 'prague-1935' as ClaimId },
      {
        year: { en: 'The silence', hr: 'Tišina' }, // REVIEW
        text: { en: 'Decades of war and collectivisation. The vineyards wait.', hr: 'Desetljeća rata i kolektivizacije. Vinogradi čekaju.' }, // REVIEW — owner to confirm
      },
      {
        year: { en: 'The return', hr: 'Povratak' }, // REVIEW — add the year when known
        text: { en: 'Mateo Vicelić replants the family vineyards and brings them back.', hr: 'Mateo Vicelić ponovno sadi obiteljske vinograde i vraća ih u život.' }, // REVIEW
      },
      {
        year: { en: 'Today', hr: 'Danas' },
        text: { en: 'Certified organic. Wild yeast. Nothing added. Very little of it.', hr: 'Ekološki certificirano. Divlji kvasci. Ništa dodano. I vrlo malo toga.' }, // REVIEW
      },
    ],
    cta: { en: 'The family', hr: 'Obitelj' },
  },
  cellar: {
    title: { en: 'Three wines. One grape.', hr: 'Tri vina. Jedna sorta.' }, // REVIEW
    lede: { en: 'Plavac Mali, and nothing else.', hr: 'Plavac mali i ništa drugo.' }, // REVIEW
    bottlesLabel: { en: 'bottles', hr: 'boca' },
    dossier: { en: 'Read the dossier', hr: 'Pročitajte dosje' }, // REVIEW
    counter: {
      unit: { en: 'bottles.', hr: 'boca.' },
      tail: { en: 'Worldwide.', hr: 'Na cijelom svijetu.' }, // REVIEW
      note: { en: 'One vintage of Dingač. That is all there is.', hr: 'Jedna berba Dingača. To je sve što postoji.' }, // REVIEW
    },
  },
  sea: {
    title: { en: 'Taste it where it grows.', hr: 'Kušajte ga ondje gdje raste.' }, // REVIEW
    lede: {
      en: 'Three ways to taste the slope, from a glass on the terrace to a morning in the vineyard with the winemaker.',
      hr: 'Tri načina da kušate obronak, od čaše na terasi do jutra u vinogradu s vinarom.', // REVIEW
    },
    from: { en: 'From', hr: 'Od' },
    perPerson: { en: 'per person', hr: 'po osobi' },
    wines: { en: 'wines', hr: 'vina' },
    guests: { en: 'guests', hr: 'gostiju' }, // REVIEW
    minutes: { en: 'min', hr: 'min' },
    hours: { en: 'h', hr: 'h' },
    allTastings: { en: 'See all tastings', hr: 'Sve degustacije' }, // REVIEW
    book: { en: 'Book', hr: 'Rezerviraj' },
    proposalNote: { en: 'Proposal prices — to be confirmed.', hr: 'Predložene cijene — za potvrdu.' },
  },
  reviews: {
    eyebrow: { en: 'Guests', hr: 'Gosti' },
    title: { en: 'What they said on the way down.', hr: 'Što su rekli na putu dolje.' }, // REVIEW
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
    title: { en: 'The slope is open.', hr: 'Obronak je otvoren.' }, // REVIEW
    body: {
      en: 'Tastings all year. In summer, every day. In winter, by appointment.',
      hr: 'Degustacije tijekom cijele godine. Ljeti svaki dan. Zimi uz najavu.', // REVIEW
    },
    cta: { en: 'Book a tasting', hr: 'Rezerviraj degustaciju' }, // REVIEW
    whatsapp: { en: 'Or write to us on WhatsApp', hr: 'Ili nam pišite na WhatsApp' }, // REVIEW
  },
} as const;
