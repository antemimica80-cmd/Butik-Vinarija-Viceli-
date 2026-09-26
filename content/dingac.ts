/**
 * The Dingač page — the authority page. Historical and scientific statements come
 * ONLY from history-claims.ts (by id) and are footnoted to their source.
 * Wording rule: "grand cru" is a positioning, never a legal classification.
 */
import type { ClaimId } from './history-claims';

export const dingacPage = {
  meta: {
    description: {
      en: 'Dingač: a singular terroir on Pelješac, Croatia’s first protected wine origin. Three suns, white stone, a tunnel dug by hand.',
      hr: 'Dingač: jedinstven terroir na Pelješcu, prvo zaštićeno podrijetlo vina u Hrvatskoj. Tri sunca, bijeli kamen, tunel iskopan rukama.', // REVIEW
    },
  },
  hero: {
    eyebrow: { en: 'The grand cru of the Adriatic', hr: 'Grand cru Jadrana' }, // REVIEW
    title: { en: 'Dingač.', hr: 'Dingač.' },
    lede: {
      en: 'One slope on the Pelješac peninsula, falling from the ridge straight into the sea. It has been known for its wine for longer than anyone here can remember.',
      hr: 'Jedan obronak na poluotoku Pelješcu koji pada s grebena ravno u more. Po vinu je poznat dulje nego što se itko ovdje može sjetiti.', // REVIEW
    },
  },
  slope: {
    label: { en: 'I · The terroir', hr: 'I · Terroir' },
    title: { en: 'Too steep for machines. Just right for the vine.', hr: 'Prestrmo za strojeve. Taman za lozu.' }, // REVIEW
    body: {
      en: 'The vines stand alone, each one trained low as a bush — en gobelet — so the wind cannot take them and the stone can warm them. Everything is done by hand: pruning, tending, harvest. The terroir decides how much it will give.',
      hr: 'Trsovi stoje sami, svaki uzgojen nisko kao grm — u gobelet — da ih vjetar ne odnese, a kamen ugrije. Sve se radi rukama: rezidba, njega, berba. Terroir odlučuje koliko će dati.', // REVIEW
    },
  },
  stone: {
    label: { en: 'II · The stone', hr: 'II · Kamen' },
    title: { en: 'White limestone, red earth, very little of either.', hr: 'Bijeli vapnenac, crvena zemlja, vrlo malo i jednog i drugog.' }, // REVIEW
    body: {
      en: 'The soil is shallow, red and stony. Roots go down into the rock looking for water. The stone holds the day’s heat and gives it back to the vines after the sun has gone.',
      hr: 'Tlo je plitko, crveno i kamenito. Korijenje ide duboko u stijenu tražeći vodu. Kamen zadržava dnevnu toplinu i vraća je lozi kad sunce zađe.', // REVIEW
    },
  },
  suns: {
    label: { en: 'III · Three suns', hr: 'III · Tri sunca' },
    title: { en: 'Sky, sea, stone.', hr: 'Nebo, more, kamen.' }, // REVIEW
    body: {
      en: 'On Dingač the vine gets three suns: the sun from the sky, the sun thrown back off the sea, and the heat stored in the white stone. It is why the grapes ripen as they do here, and nowhere else quite the same way.',
      hr: 'Na Dingaču loza dobiva tri sunca: sunce s neba, sunce koje se odbija od mora i toplinu pohranjenu u bijelom kamenu. Zato grožđe ovdje sazrijeva onako kako sazrijeva, i nigdje drugdje baš tako.', // REVIEW
    },
  },
  protected: {
    label: { en: 'IV · Protected', hr: 'IV · Zaštićeno' },
    claim: 'pdo-1961' as ClaimId,
    title: { en: 'Croatia’s first protected wine origin.', hr: 'Prvo zaštićeno podrijetlo vina u Hrvatskoj.' }, // REVIEW
    positioning: {
      en: 'Croatia has no legal classification of great vineyards, and we do not pretend otherwise. When we call Dingač the grand cru of the Adriatic, we mean what the history and the research say about this terroir — not a label on a map.',
      hr: 'Hrvatska nema zakonsku klasifikaciju velikih vinograda i ne pravimo se da je ima. Kad Dingač zovemo grand cru Jadrana, mislimo na ono što o ovom terroiru govore povijest i istraživanja — ne na oznaku na karti.', // REVIEW
    },
  },
  tunnel: {
    label: { en: 'V · The tunnel', hr: 'V · Tunel' },
    claim: 'tunnel-1973' as ClaimId,
    body: {
      en: 'The hill stands between the village and the vines. The growers went through it.',
      hr: 'Brdo stoji između sela i vinograda. Vinogradari su prošli kroz njega.', // REVIEW
    },
  },
  science: {
    label: { en: 'VI · The record', hr: 'VI · Zapis' }, // REVIEW
    title: { en: 'What the record shows.', hr: 'Što pokazuje zapis.' }, // REVIEW
    claims: ['bordeaux-19c', 'mirosevic-research'] as ClaimId[],
  },
  sources: {
    title: { en: 'Sources', hr: 'Izvori' },
    pending: { en: 'Source to be added — claim not yet verified.', hr: 'Izvor će biti dodan — tvrdnja još nije provjerena.' },
  },
  cta: {
    title: { en: 'Stand on it.', hr: 'Stanite na njega.' }, // REVIEW
    body: { en: 'The best way to understand Dingač is a glass of it, on its terroir.', hr: 'Dingač se najbolje razumije uz čašu, na njegovom terroiru.' }, // REVIEW
    book: { en: 'Book a tasting', hr: 'Rezerviraj degustaciju' },
    wines: { en: 'The wines', hr: 'Vina' },
  },
};
