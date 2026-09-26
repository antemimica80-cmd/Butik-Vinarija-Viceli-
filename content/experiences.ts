/**
 * Tasting experiences. ALL values are proposal values for the pitch (proposalValues: true)
 * and must be confirmed by the owner — see CONTENT_TODO.md.
 *
 * days: 0 = Sunday … 6 = Saturday. Seasons are MM-DD ranges and may wrap the new year.
 */
import type { Experience } from '../src/lib/content-schema';

const everyDay = [0, 1, 2, 3, 4, 5, 6];
const winter = { en: 'Winter', hr: 'Zima' };
const summer = { en: 'April – October', hr: 'Travanj – listopad' };

export const experiences = [
  {
    slug: 'the-slope',
    name: 'The Terroir',
    tier: 1,
    tagline: {
      en: 'The estate wines, above the sea.',
      hr: 'Vina imanja, iznad mora.', // REVIEW
    },
    description: {
      en: 'A guided tasting of the estate wines on the terrace, looking down the slope to the Adriatic. The wines, the place and how one explains the other.',
      hr: 'Vođena degustacija vina imanja na terasi s pogledom niz obronak na Jadran. Vina, mjesto i kako jedno objašnjava drugo.', // REVIEW
    },
    durationMinutes: 75,
    winesIncluded: 3,
    wines: ['opolo-rose', 'plavac-mali', 'dingac'],
    food: null,
    includes: [
      { en: 'Three estate wines', hr: 'Tri vina imanja' }, // REVIEW
      { en: 'A guided tasting', hr: 'Vođena degustacija' }, // REVIEW
      { en: 'The view down the slope to the sea', hr: 'Pogled niz obronak na more' }, // REVIEW
    ],
    minGuests: 1,
    maxGuests: 12,
    pricePerPerson: 45,
    childPolicy: {
      en: 'Children welcome. Grape juice for them, free of charge.',
      hr: 'Djeca su dobrodošla. Za njih sok od grožđa, besplatno.', // REVIEW
    },
    depositPercent: 100,
    languages: ['en', 'hr'],
    seasons: [
      { name: summer, from: '04-01', to: '10-31', days: everyDay, slots: ['11:00', '14:00', '17:30'], onRequestOnly: false },
      { name: winter, from: '11-01', to: '03-31', days: everyDay, slots: ['12:00'], onRequestOnly: true },
    ],
    capacityPerSlot: 12,
    schedule: [
      { minute: 0, text: { en: 'Welcome on the terrace. A glass of Opolo Rosé.', hr: 'Dobrodošlica na terasi. Čaša Opolo roséa.' } }, // REVIEW
      { minute: 10, text: { en: 'Dingač in front of you: the terroir, the stone, the three suns.', hr: 'Dingač pred vama: terroir, kamen, tri sunca.' } }, // REVIEW
      { minute: 25, text: { en: 'Plavac Mali, slightly cool. How the grape changes with the soil.', hr: 'Plavac mali, lagano rashlađen. Kako se sorta mijenja s tlom.' } }, // REVIEW
      { minute: 45, text: { en: 'Dingač. The estate wine, and why it ages.', hr: 'Dingač. Vino imanja i zašto može odležati.' } }, // REVIEW
      { minute: 65, text: { en: 'Questions, bottles to take home, the view.', hr: 'Pitanja, boce za ponijeti, pogled.' } }, // REVIEW
    ],
    imageSlot: 'tasting-table',
    proposalValues: true,
  },
  {
    slug: 'the-keepers-table',
    name: "The Keeper's Table",
    tier: 2,
    tagline: {
      en: 'The wines at the table, with the food of Pelješac.',
      hr: 'Vina za stolom, uz hranu Pelješca.', // REVIEW
    },
    description: {
      en: 'A longer, quieter tasting at the family table. Each wine is paired with local food: Pelješac cheese, prosciutto, oysters from Ston.',
      hr: 'Dulja, mirnija degustacija za obiteljskim stolom. Svako vino u paru s domaćom hranom: pelješki sir, pršut, kamenice iz Stona.', // REVIEW
    },
    durationMinutes: 120,
    winesIncluded: 3,
    wines: ['opolo-rose', 'plavac-mali', 'dingac'],
    food: {
      en: 'Pelješac cheese, prosciutto, Ston oysters (in season)',
      hr: 'Pelješki sir, pršut, stonske kamenice (u sezoni)', // REVIEW
    },
    includes: [
      { en: 'Three estate wines', hr: 'Tri vina imanja' }, // REVIEW
      { en: 'A paired plate of local food', hr: 'Tanjur domaće hrane uz vina' }, // REVIEW
      { en: 'At the family table', hr: 'Za obiteljskim stolom' }, // REVIEW
    ],
    minGuests: 2,
    maxGuests: 10,
    pricePerPerson: 95,
    childPolicy: {
      en: 'Children welcome. Grape juice for them, free of charge.',
      hr: 'Djeca su dobrodošla. Za njih sok od grožđa, besplatno.', // REVIEW
    },
    depositPercent: 100,
    languages: ['en', 'hr'],
    seasons: [
      { name: summer, from: '04-01', to: '10-31', days: everyDay, slots: ['12:30', '18:00'], onRequestOnly: false },
      { name: winter, from: '11-01', to: '03-31', days: everyDay, slots: ['13:00'], onRequestOnly: true },
    ],
    capacityPerSlot: 10,
    schedule: [
      { minute: 0, text: { en: 'Welcome. Opolo Rosé with Ston oysters (in season).', hr: 'Dobrodošlica. Opolo rosé uz stonske kamenice (u sezoni).' } }, // REVIEW
      { minute: 20, text: { en: 'To the family table. The story of the estate.', hr: 'Za obiteljski stol. Priča o imanju.' } }, // REVIEW
      { minute: 40, text: { en: 'Plavac Mali with Pelješac cheese.', hr: 'Plavac mali uz pelješki sir.' } }, // REVIEW
      { minute: 70, text: { en: 'Dingač with prosciutto.', hr: 'Dingač uz pršut.' } }, // REVIEW
      { minute: 100, text: { en: 'Slow finish. Coffee, questions, the last of the light.', hr: 'Polagani završetak. Kava, pitanja, posljednje svjetlo.' } }, // REVIEW
    ],
    imageSlot: 'keepers-table-food',
    proposalValues: true,
  },
  {
    slug: 'dingac-private',
    name: 'Dingač Private',
    tier: 3,
    tagline: {
      en: 'Into the vineyard with the winemaker.',
      hr: 'U vinograd s vinarom.', // REVIEW
    },
    description: {
      en: 'A private walk into the Dingač vineyard with Mateo Vicelić, then the cellar: a barrel tasting and the full flight. For small groups only.',
      hr: 'Privatna šetnja vinogradom Dingač s Mateom Vicelićem, zatim podrum: kušanje iz bačve i cijeli niz vina. Samo za male grupe.', // REVIEW
    },
    durationMinutes: 180,
    winesIncluded: 4,
    wines: ['barrel-sample', 'opolo-rose', 'plavac-mali', 'dingac'],
    food: null,
    includes: [
      { en: 'Walk in the Dingač vineyard', hr: 'Šetnja vinogradom Dingač' }, // REVIEW
      { en: 'Barrel tasting in the cellar', hr: 'Kušanje iz bačve u podrumu' }, // REVIEW
      { en: 'The full flight, four wines', hr: 'Cijeli niz, četiri vina' }, // REVIEW
      { en: 'With the winemaker', hr: 'S vinarom' }, // REVIEW
    ],
    minGuests: 2,
    maxGuests: 6,
    pricePerPerson: 220,
    childPolicy: {
      en: 'Children welcome on the walk. Sturdy shoes needed for everyone.',
      hr: 'Djeca su dobrodošla u šetnji. Za sve je potrebna čvrsta obuća.', // REVIEW
    },
    depositPercent: 100,
    languages: ['en', 'hr'],
    seasons: [
      { name: summer, from: '04-01', to: '10-31', days: everyDay, slots: ['09:30', '16:30'], onRequestOnly: false },
      { name: winter, from: '11-01', to: '03-31', days: everyDay, slots: ['11:00'], onRequestOnly: true },
    ],
    capacityPerSlot: 6,
    schedule: [
      { minute: 0, text: { en: 'Meet the winemaker. Into the Dingač vineyard.', hr: 'Susret s vinarom. Odlazak u vinograd Dingač.' } }, // REVIEW
      { minute: 20, text: { en: 'Walk among the gobelet vines on the slope. Stone, soil, sea.', hr: 'Šetnja među trsovima u gobeletu. Kamen, tlo, more.' } }, // REVIEW
      { minute: 75, text: { en: 'The cellar. Barrel tasting of the vintage to come.', hr: 'Podrum. Kušanje iz bačve buduće berbe.' } }, // REVIEW
      { minute: 110, text: { en: 'The full flight: Opolo Rosé, Plavac Mali, Dingač.', hr: 'Cijeli niz: Opolo rosé, Plavac mali, Dingač.' } }, // REVIEW
      { minute: 160, text: { en: 'Time with the family. Nothing rushed.', hr: 'Vrijeme s obitelji. Bez žurbe.' } }, // REVIEW
    ],
    imageSlot: 'private-pour',
    proposalValues: true,
  },
] satisfies Experience[];

export const lowestPrice = Math.min(...experiences.map((e) => (typeof e.pricePerPerson === 'number' ? e.pricePerPerson : Infinity)));
