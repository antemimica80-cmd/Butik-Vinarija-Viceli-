/**
 * The Family page — the Keeper story. Dated history comes from history-claims.ts.
 * Anything the owner has not yet told us is a visible placeholder, never invented.
 */
import type { ClaimId } from './history-claims';

type L = { en: string; hr: string };
export type Beat = { claim: ClaimId } | { year: L; title: L; text: L; placeholder?: boolean };

export const familyPage = {
  meta: {
    description: {
      en: 'The Vicelić family keeps something rare alive on Dingač: organic Plavac Mali, wild yeast, nothing added. The story of the Keeper.',
      hr: 'Obitelj Vicelić čuva nešto rijetko na Dingaču: ekološki plavac mali, divlji kvasci, ništa dodano. Priča o Čuvaru.', // REVIEW
    },
  },
  hero: {
    eyebrow: { en: 'The Family', hr: 'Obitelj' },
    title: { en: 'The Keeper.', hr: 'Čuvar.' }, // REVIEW
    lede: {
      en: 'Some families make wine. This one keeps a place — and the way of working it — alive.',
      hr: 'Neke obitelji rade vino. Ova čuva mjesto — i način na koji se ono obrađuje.', // REVIEW
    },
  },
  mateo: {
    label: { en: 'The winemaker', hr: 'Vinar' },
    name: 'Mateo Vicelić',
    body: {
      en: 'Mateo Vicelić replanted and revived the family’s vineyards on Dingač. He makes the wines himself: Plavac Mali only, certified organic, fermented with the wild yeasts of the vineyard, with nothing added.',
      hr: 'Mateo Vicelić ponovno je zasadio i oživio obiteljske vinograde na Dingaču. Vina radi sam: samo plavac mali, ekološki certificiran, fermentiran divljim kvascima iz vinograda, bez ikakvih dodataka.', // REVIEW
    },
    quote: {
      en: 'Mateo, in his own words — a sentence or two to be added.',
      hr: 'Mateo, njegovim riječima — rečenica ili dvije koje treba dodati.',
    },
    quotePlaceholder: true,
  },
  timeline: {
    label: { en: 'The story', hr: 'Priča' },
    title: { en: 'A long patience.', hr: 'Dugo strpljenje.' }, // REVIEW
    beats: [
      { claim: 'prague-1935' },
      {
        year: { en: 'The silence', hr: 'Tišina' }, // REVIEW
        title: { en: 'War and collectivisation', hr: 'Rat i kolektivizacija' }, // REVIEW
        text: { en: 'For decades the family could not work its vineyards as its own. The vines waited.', hr: 'Desetljećima obitelj nije mogla obrađivati vinograde kao svoje. Loza je čekala.' }, // REVIEW — owner to confirm
      },
      {
        year: { en: 'The return · year TBD', hr: 'Povratak · godina TBD' },
        title: { en: 'Mateo replants', hr: 'Mateo ponovno sadi' }, // REVIEW
        text: { en: 'Mateo Vicelić replants and revives the family’s vineyards on the terroir.', hr: 'Mateo Vicelić ponovno sadi i oživljava obiteljske vinograde na terroiru.' }, // REVIEW
        placeholder: true,
      },
      {
        year: { en: 'Organic · year TBD', hr: 'Ekološki · godina TBD' },
        title: { en: 'Certified organic', hr: 'Ekološki certifikat' },
        text: { en: 'No pesticides, no herbicides, no synthetic fertilisers — certified.', hr: 'Bez pesticida, herbicida i umjetnih gnojiva — certificirano.' }, // REVIEW
        placeholder: true,
      },
      {
        year: { en: 'Today', hr: 'Danas' },
        title: { en: 'Very little, very carefully', hr: 'Vrlo malo, vrlo pažljivo' }, // REVIEW
        text: { en: 'Three wines from one grape. A few thousand bottles of each.', hr: 'Tri vina od jedne sorte. Nekoliko tisuća boca svakoga.' }, // REVIEW
      },
    ] as Beat[],
  },
  philosophy: {
    label: { en: 'How we work', hr: 'Kako radimo' }, // REVIEW
    title: { en: 'Four rules. No exceptions.', hr: 'Četiri pravila. Bez iznimaka.' }, // REVIEW
    rules: [
      {
        name: { en: 'Organic', hr: 'Ekološki' },
        text: { en: 'Certified. No pesticides, no herbicides, no synthetic fertilisers on the terroir.', hr: 'Certificirano. Na terroiru nema pesticida, herbicida ni umjetnih gnojiva.' }, // REVIEW
      },
      {
        name: { en: 'Wild yeast', hr: 'Divlji kvasci' },
        text: { en: 'Spontaneous fermentation with the yeasts that live on the grapes and in the cellar.', hr: 'Spontana fermentacija kvascima koji žive na grožđu i u podrumu.' }, // REVIEW
      },
      {
        name: { en: 'Nothing added', hr: 'Ništa dodano' },
        text: { en: 'No enzymes, no additives. Minimal intervention: the wine is guided, not corrected.', hr: 'Bez enzima i dodataka. Minimalna intervencija: vino se vodi, ne ispravlja.' }, // REVIEW
      },
      {
        name: { en: 'Small batches', hr: 'Male serije' },
        text: { en: 'Each wine is made in small lots, by hand, and there is only so much of it.', hr: 'Svako vino radi se u malim serijama, rukama, i ima ga samo toliko.' }, // REVIEW
      },
    ],
  },
  cta: {
    title: { en: 'Meet the Keeper.', hr: 'Upoznajte Čuvara.' }, // REVIEW
    body: {
      en: 'Dingač Private is a morning in the vineyard and the cellar with Mateo himself.',
      hr: 'Dingač Private je jutro u vinogradu i podrumu s Mateom osobno.', // REVIEW
    },
    book: { en: 'Book Dingač Private', hr: 'Rezervirajte Dingač Private' },
    all: { en: 'All tastings', hr: 'Sve degustacije' },
  },
};
