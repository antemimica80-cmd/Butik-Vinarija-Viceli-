// ─────────────────────────────────────────────────────────────────────────────
// Boutique Winery Vicelić — content & facts
//
// RULE: nothing in this file may be invented. Every factual value carries a
// `verify` flag:
//   verify: false → text taken from vicelic.hr (search-index copy of the page)
//   verify: true  → found only in third-party sources, or attribution between
//                   wines is ambiguous. Rendered with [data-verify] so it can be
//                   highlighted with ?audit in the URL. See AUDIT.md.
// `null` values are unknown and are NOT rendered — the layout keeps a slot for
// them. Fill them in from the current site / the winery.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  url: 'https://vicelic.hr',
  name: 'Boutique Winery Vicelić',
  shortName: 'Vicelić',
  legalName: 'Obitelj Vicelić', // "Owner: Obitelj Vicelić" — vicelic.hr
  winemaker: 'Mateo Vicelić',
  address: { street: 'Pijavičino 33', postalCode: '20243', locality: 'Kuna', region: 'Pelješac', country: 'HR' },
  phone: '+385 95 396 8114',
  phoneHref: '+385953968114',
  whatsapp: '385953968114', // same number as the published phone — confirm it is on WhatsApp
  email: 'mvicelic@gmail.com',
  oib: '41630406160',
  // Approximate location of the Dingač slope, used for map + schema geo (confirm)
  geo: { lat: 42.945, lon: 17.36 },
  facebook: 'https://www.facebook.com/boutiquewineryvicelic/',
  instagram: null,
  currency: 'EUR',
};

// Bilingual helper
const t = (hr, en) => ({ hr, en });

// ─── Wines ───────────────────────────────────────────────────────────────────
export const wines = {
  dingac: {
    slug: 'dingac',
    name: 'Dingač',
    grape: 'Plavac Mali',
    origin: t('Dingač, Pelješac', 'Dingač, Pelješac'),
    type: t('Crveno vino', 'Red wine'),
    vintage: null,
    volume: '0,75 L',
    price: null, // EUR — copy from current shop
    stripe: null, // Stripe Payment Link URL, if used
    bottle: { glass: '#1c1512', wine: '#3b0f18', label: '#efe8dc', ink: '#171717', accent: '#9B4A35' },
    tagline: t('Plavac Mali s legendarnih obronaka Dingača.', 'Plavac Mali from the legendary slopes of Dingač.'),
    short: t(
      'Tamno voće, mediteransko bilje i mineralnost stjenovitih, suncu izloženih obronaka.',
      'Dark fruit, Mediterranean herbs and the minerality of rocky, sun-struck slopes.'
    ),
    aromas: {
      verify: false,
      young: t(
        ['Crna trešnja', 'Šljiva', 'Suha smokva', 'Mediteransko bilje', 'Divlja kadulja', 'Suha lavanda'],
        ['Black cherry', 'Plum', 'Dried fig', 'Mediterranean herbs', 'Wild sage', 'Dried lavender']
      ),
      aged: t(
        ['Tamna čokolada', 'Duhan', 'Slatki začini', 'Mineralnost'],
        ['Dark chocolate', 'Tobacco', 'Sweet spice', 'Minerality']
      ),
    },
    tasting: {
      verify: false,
      text: t(
        'Intenzivan i slojevit aromatski profil kojim dominira zrelo tamno voće — crna trešnja, šljiva i suha smokva — uz mediteransko bilje, divlju kadulju i naznake suhe lavande. Starenjem vino dobiva dubinu: tamna čokolada, duhan i slatki začini, uz suptilnu mineralnost koja odražava stjenovite, suncu izložene obronke Dingača.',
        'An intense, layered nose led by ripe dark fruit — black cherry, plum and dried fig — lifted by Mediterranean herbs, wild sage and a hint of dried lavender. With time in bottle it gains depth: dark chocolate, tobacco and sweet spice, carried by a quiet minerality that speaks of the rocky, sun-exposed slopes of Dingač.'
      ),
    },
    vineyard: [
      { k: t('Sorta', 'Grape'), v: t('Plavac Mali', 'Plavac Mali'), verify: false },
      { k: t('Položaj', 'Site'), v: t('Dingač, Pelješac', 'Dingač, Pelješac'), verify: false },
      { k: t('Podloga', 'Rootstock'), v: t('Richter 110', 'Richter 110'), verify: true },
      { k: t('Gustoća sadnje', 'Planting density'), v: t('10.000 trsova / ha', '10,000 vines / ha'), verify: true },
      { k: t('Uzgoj', 'Training'), v: t('Gobelet (u čašu)', 'En gobelet (bush vine)'), verify: true },
      { k: t('Tlo', 'Soil'), v: null, verify: true },
      { k: t('Površina', 'Area'), v: null, verify: true },
    ],
    cellar: [
      { k: t('Berba', 'Harvest'), v: t('Ručna', 'By hand'), verify: true },
      { k: t('Fermentacija', 'Fermentation'), v: t('Spontana, isključivo divlji (autohtoni) kvasci', 'Spontaneous, wild (indigenous) yeasts only'), verify: false },
      { k: t('Dodaci', 'Additions'), v: t('Bez dodanih enzima i umjetnih aditiva', 'No added enzymes or artificial additives'), verify: false },
      { k: t('Bačve', 'Barrels'), v: t('225 L, francuski i američki hrast — 50 % nove, 50 % rabljene', '225 L, French and American oak — 50% new, 50% used'), verify: true },
      { k: t('Dozrijevanje', 'Ageing'), v: null, verify: true },
      { k: t('Proizvodnja', 'Production'), v: null, verify: true },
    ],
    serving: { v: t('18 °C, u čaši tipa Burgundy', '18 °C, in a Burgundy glass'), verify: true },
    cellaring: { v: null, verify: true },
    pairing: { v: null, verify: true },
  },

  'plavac-mali': {
    slug: 'plavac-mali',
    name: 'Plavac Mali',
    grape: 'Plavac Mali',
    origin: t('Pelješac', 'Pelješac'),
    type: t('Crveno vino', 'Red wine'),
    vintage: null,
    volume: '0,75 L',
    price: null,
    stripe: null,
    bottle: { glass: '#211714', wine: '#4a1520', label: '#9B4A35', ink: '#F1ECE3', accent: '#F1ECE3' },
    tagline: t('Svježe lice Plavca Malog.', 'The easy, open face of Plavac Mali.'),
    short: t(
      'Crveno voće i bilje, nježni tanini. Crno vino za ljeto — i lagano rashlađeno.',
      'Red fruit and herbs, gentle tannins. A summer red that takes a light chill.'
    ),
    tasting: {
      verify: true,
      text: t(
        'Obilje crvenog voća i biljnih aroma, uz minimalno tanina. Pitko i neopterećeno — savršeno ljetno crno vino koje se može poslužiti rashlađeno, idealno uz odrezak od tune.',
        'Plenty of red fruit and herb aromas with the lightest touch of tannin. Very easy to drink — the perfect summer red, happy to be served chilled, ideally alongside a tuna steak.'
      ),
    },
    aromas: {
      verify: true,
      young: t(['Crveno voće', 'Mediteransko bilje'], ['Red fruit', 'Mediterranean herbs']),
      aged: t([], []),
    },
    vineyard: [
      { k: t('Sorta', 'Grape'), v: t('Plavac Mali', 'Plavac Mali'), verify: false },
      { k: t('Položaj', 'Site'), v: null, verify: true },
      { k: t('Tlo', 'Soil'), v: null, verify: true },
    ],
    cellar: [
      { k: t('Fermentacija', 'Fermentation'), v: t('Spontana, divlji kvasci', 'Spontaneous, wild yeasts'), verify: false },
      { k: t('Bačve', 'Barrels'), v: t('225 L, rabljeni francuski i američki hrast', '225 L, used French and American oak'), verify: true },
      { k: t('Dozrijevanje', 'Ageing'), v: t('10–12 mjeseci', '10–12 months'), verify: true },
      { k: t('Proizvodnja', 'Production'), v: t('3.500 boca', '3,500 bottles'), verify: true },
    ],
    serving: { v: t('Lagano rashlađeno', 'Lightly chilled'), verify: true },
    cellaring: { v: null, verify: true },
    pairing: { v: t('Odrezak od tune', 'Tuna steak'), verify: true },
  },

  'opolo-rose': {
    slug: 'opolo-rose',
    name: 'Opolo',
    nameFull: 'Opolo Rosé',
    grape: 'Plavac Mali',
    origin: t('Pelješac', 'Pelješac'),
    type: t('Rosé', 'Rosé'),
    vintage: null,
    volume: '0,75 L',
    price: null,
    stripe: null,
    bottle: { glass: '#e9dfcf', wine: '#e7b49a', label: '#F1ECE3', ink: '#171717', accent: '#9B4A35', clear: true },
    tagline: t('Plavac Mali u ljetnom svjetlu.', 'Plavac Mali in summer light.'),
    short: t(
      'Šumske jagode, latice ruže i korica citrusa. Svjež, hrskav, s mineralnom okosnicom.',
      'Wild strawberry, rose petal, citrus peel. Crisp and bright, with a mineral backbone.'
    ),
    tasting: {
      verify: false,
      text: t(
        'Svijetla, blijedo lososova boja. Nježan miris šumskih jagoda, latica ruže, korice citrusa i daška mediteranskog bilja. U ustima hrskav i osvježavajući, sa sočnim crvenim bobičastim voćem i suptilnom mineralnom okosnicom.',
        'Bright, pale salmon in the glass. A delicate nose of wild strawberries, rose petals, citrus peel and a breath of Mediterranean herbs. Crisp and refreshing on the palate, with juicy red berries and a fine mineral backbone.'
      ),
    },
    aromas: {
      verify: false,
      young: t(['Šumske jagode', 'Latice ruže', 'Korica citrusa', 'Mediteransko bilje'], ['Wild strawberry', 'Rose petal', 'Citrus peel', 'Mediterranean herbs']),
      aged: t([], []),
    },
    colour: { v: t('Svijetla, blijedo lososova', 'Bright, pale salmon'), verify: false },
    vineyard: [
      { k: t('Sorta', 'Grape'), v: t('Plavac Mali — odabrane parcele za rosé', 'Plavac Mali — plots selected for rosé'), verify: false },
      { k: t('Tlo', 'Soil'), v: t('Mješavina vapnenca i crvenice, ocjedite terase', 'Limestone and red soil, well-drained terraces'), verify: false },
      { k: t('Površina', 'Area'), v: t('0,8 ha', '0.8 ha'), verify: false },
      { k: t('Podloga', 'Rootstock'), v: t('Richter 110', 'Richter 110'), verify: false },
      { k: t('Gustoća sadnje', 'Planting density'), v: t('9.000 trsova / ha', '9,000 vines / ha'), verify: true },
    ],
    cellar: [
      { k: t('Berba', 'Harvest'), v: t('Ručno brano i sortirano', 'Hand-picked and sorted'), verify: false },
      { k: t('Maceracija', 'Maceration'), v: t('Kratki kontakt s kožicom — za svježinu i nježnu boju', 'Brief skin contact — for freshness and delicate colour'), verify: false },
      { k: t('Fermentacija', 'Fermentation'), v: t('Divlji kvasci, inox uz kontrolu temperature', 'Wild yeasts, temperature-controlled stainless steel'), verify: false },
      { k: t('Dozrijevanje', 'Ageing'), v: t('4–6 mjeseci na finom talogu, inox', '4–6 months on fine lees, stainless steel'), verify: false },
      { k: t('Proizvodnja', 'Production'), v: t('2.500 boca (416 kartona)', '2,500 bottles (416 cases)'), verify: false },
    ],
    serving: { v: null, verify: true },
    cellaring: { v: null, verify: true },
    pairing: { v: null, verify: true },
  },
};

export const wineOrder = ['dingac', 'plavac-mali', 'opolo-rose'];

// ─── Winery-level facts ──────────────────────────────────────────────────────
export const facts = {
  hectares: { v: '3,5', en: '3.5', verify: true },     // third-party (winetourism, grapenomad)
  density: { v: '10.000', en: '10,000', verify: true },
  organicSince: { v: '2017', verify: true },           // third-party (winetourism, grapenomad)
  history1935: { verify: true },                       // third-party (winetourism)
};

// ─── Photography slots ───────────────────────────────────────────────────────
// Drop a file named <slot>.jpg (or .png/.webp) into assets/photos/ and run
// `npm run images`. Until then an art-directed tonal placeholder is shown.
export const photos = {
  hero:        { tone: 'sea',    alt: t('Strmi vinogradi Dingača iznad Jadranskog mora', 'The steep vineyards of Dingač above the Adriatic Sea') },
  slope:       { tone: 'stone',  alt: t('Terase vinograda na strmim obroncima Dingača', 'Vineyard terraces on the steep slopes of Dingač') },
  stone:       { tone: 'stone',  alt: t('Kamen i crvenica u vinogradu na Pelješcu', 'Stone and red soil in a Pelješac vineyard') },
  vines:       { tone: 'vine',   alt: t('Trsovi Plavca Malog uzgojeni u gobelet', 'Bush-trained Plavac Mali vines') },
  grapes:      { tone: 'wine',   alt: t('Grozdovi Plavca Malog', 'Clusters of Plavac Mali') },
  harvest:     { tone: 'vine',   alt: t('Ručna berba u vinogradu Vicelić', 'Hand harvest in the Vicelić vineyard') },
  cellar:      { tone: 'cellar', alt: t('Hrastove bačve u podrumu vinarije Vicelić', 'Oak barrels in the Vicelić cellar') },
  family:      { tone: 'stone',  alt: t('Vinar Mateo Vicelić u vinogradu', 'Winemaker Mateo Vicelić in the vineyard') },
  tasting:     { tone: 'dusk',   alt: t('Privatna degustacija vina u vinogradu s pogledom na more', 'A private wine tasting in the vineyard, overlooking the sea') },
  table:       { tone: 'dusk',   alt: t('Vino i hrana na stolu u vinogradu', 'Wine and food on a table among the vines') },
  summer:      { tone: 'light',  alt: t('Ljetno svjetlo nad Pelješcem', 'Summer light over Pelješac') },
  finale:      { tone: 'dusk',   alt: t('Sumrak nad Dingačem i Jadranom', 'Dusk over Dingač and the Adriatic') },
  'bottle-dingac':      { tone: 'cellar', alt: t('Boca vina Vicelić Dingač', 'Bottle of Vicelić Dingač') },
  'bottle-plavac-mali': { tone: 'cellar', alt: t('Boca vina Vicelić Plavac Mali', 'Bottle of Vicelić Plavac Mali') },
  'bottle-opolo-rose':  { tone: 'light',  alt: t('Boca vina Vicelić Opolo Rosé', 'Bottle of Vicelić Opolo Rosé') },
};
