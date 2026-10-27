export const COMPETITIONS = [
  { slug: "dwwa", name: "Decanter World Wine Awards", short: "DWWA", organizer: "Decanter", country: "GB", website: "https://awards.decanter.com", scope: "international", sort: 1 },
  { slug: "iwc", name: "International Wine Challenge", short: "IWC", organizer: "William Reed", country: "GB", website: "https://www.internationalwinechallenge.com", scope: "international", sort: 2 },
  { slug: "iwsc", name: "International Wine & Spirit Competition", short: "IWSC", organizer: "IWSC", country: "GB", website: "https://www.iwsc.net", scope: "international", sort: 3 },
  { slug: "mundus-vini", name: "Mundus Vini", short: "Mundus Vini", organizer: "Meininger Verlag", country: "DE", website: "https://www.mundusvini.com", scope: "international", sort: 4 },
  { slug: "cmb", name: "Concours Mondial de Bruxelles", short: "CMB", organizer: "Vinopres", country: "BE", website: "https://concoursmondial.com", scope: "international", sort: 5 },
  { slug: "vinistra", name: "Vinistra — Festival malvazije i vinska izložba", short: "Vinistra", organizer: "Udruga Vinistra", country: "HR", website: "https://www.vinistra.com", scope: "regional", sort: 10 },
] as const;

export const ROUTES = [
  {
    slug: "peljesac-wine-discovery",
    title: { hr: "Otkrivanje vina Pelješca", en: "Pelješac Wine Discovery" },
    description: {
      hr: "Stanice od Orebića prema istoku poluotoka, kroz kraj plavca malog i položaja Dingač. Redoslijed prati glavnu cestu poluotoka; vremena vožnje prikazuju se samo kada je uključen servis za rutiranje. Posjete unaprijed dogovorite s vinarijama.",
      en: "Stops from Orebić eastwards along the peninsula, through Plavac Mali country and the Dingač site. The order follows the peninsula's main road; driving times are shown only when a routing service is configured. Arrange visits with each winery in advance.",
    },
    stops: ["korta-katarina", "saints-hills", "skaramuca", "matusko", "grgic-vina"],
  },
  {
    slug: "istrian-wine-heritage",
    title: { hr: "Istarska vinska baština", en: "Istrian Wine Heritage" },
    description: {
      hr: "Obiteljske vinarije sjeverozapadne Istre, od Savudrije do momjanskih brežuljaka — kraj malvazije, terana i momjanskog muškata.",
      en: "Family wineries of north-western Istria, from Savudrija to the Momjan hills — the land of Malvazija, Teran and Muškat Momjanski.",
    },
    stops: ["degrassi", "coronica", "cattunar", "clai", "kabola", "kozlovic"],
  },
  {
    slug: "slavonian-wine-traditions",
    title: { hr: "Slavonske vinske tradicije", en: "Slavonian Wine Traditions" },
    description: {
      hr: "Kutjevačko vinogorje, srce graševine, s vinarijama u Kutjevu i okolici.",
      en: "The Kutjevo wine district, heartland of Graševina, with wineries in and around the town of Kutjevo.",
    },
    stops: ["kutjevo", "krauthaker", "galic", "enjingi"],
  },
];

export const ARTICLES = [
  {
    slug: "how-the-atlas-verifies-information",
    category: "methodology",
    author: "Croatian Wine Atlas",
    sources: [
      { label: "Pravilnik o vinogradarstvu (NN 81/2022)", url: "https://narodne-novine.nn.hr/clanci/sluzbeni/2022_07_81_1184.html" },
    ],
    content: {
      en: {
        title: "How the Atlas verifies information",
        excerpt: "Every fact in the Atlas carries its source and verification status. Here is what the badges mean — and what we will never publish.",
        body: `The Croatian Wine Atlas is built on a simple rule: **we would rather show less than show something untrue.**

## Verification levels

- **Unverified** — collected from public information but not yet checked by an editor.
- **Owner submitted** — supplied by the winery's verified owner or manager.
- **Third-party sourced** — taken from a cited publication, directory or tourist board.
- **Editor verified** — checked by an Atlas editor against a primary source.
- **Officially verified** — matched against an official register, regulation or published competition results.

## What we never do

- We never invent vineyard sizes, bottle counts, prices, opening hours or awards.
- We never describe a winery as award-winning unless a specific award is attached to a specific wine and vintage, with a source.
- We never label a winery as organic, accessible or open for tastings without supporting data.
- We never present illustrative artwork as photography of a particular winery.

## Locations

Many launch records use settlement-level coordinates. The map says so on every affected profile. Exact positions are added when an address is verified.

## Coverage

The Atlas does not yet list every Croatian winery. The coverage page shows exactly how many producers are listed in each region. Winery owners can claim their listing or ask to be added.`,
        status: "draft",
      },
      hr: {
        title: "Kako Atlas provjerava podatke",
        excerpt: "Svaki podatak u Atlasu ima izvor i status provjere. Evo što znače oznake — i što nikada nećemo objaviti.",
        body: `Atlas hrvatskih vinarija počiva na jednostavnom pravilu: **radije ćemo prikazati manje nego nešto netočno.**

## Razine provjere

- **Neprovjereno** — prikupljeno iz javnih informacija, ali urednik to još nije provjerio.
- **Unio vlasnik** — podatke je dostavio provjereni vlasnik ili upravitelj vinarije.
- **Iz vanjskog izvora** — preuzeto iz navedene publikacije, imenika ili turističke zajednice.
- **Provjerio urednik** — urednik Atlasa provjerio je podatak prema primarnom izvoru.
- **Službeno potvrđeno** — usklađeno sa službenim registrom, propisom ili objavljenim rezultatima natjecanja.

## Što nikada ne radimo

- Nikada ne izmišljamo površine vinograda, broj boca, cijene, radno vrijeme ili nagrade.
- Vinariju ne nazivamo nagrađivanom ako određena nagrada nije povezana s određenim vinom i berbom te potkrijepljena izvorom.
- Vinariju ne označavamo ekološkom, pristupačnom ili otvorenom za degustacije bez potvrđenih podataka.
- Ilustracije nikada ne predstavljamo kao fotografije određene vinarije.

## Lokacije

Mnogi početni zapisi koriste koordinate na razini naselja. Karta to jasno navodi na svakom takvom profilu. Točne lokacije dodajemo kada se adresa provjeri.

## Pokrivenost

Atlas još ne sadrži sve hrvatske vinarije. Stranica o pokrivenosti točno pokazuje koliko je proizvođača navedeno u svakoj regiji. Vlasnici vinarija mogu preuzeti svoj profil ili zatražiti upis.`,
        status: "draft",
      },
    },
    related: {},
  },
  {
    slug: "croatias-four-wine-regions",
    category: "regions",
    author: "Croatian Wine Atlas",
    sources: [
      { label: "Pravilnik o zemljopisnim područjima uzgoja vinove loze (NN 76/2019)", url: "https://narodne-novine.nn.hr/clanci/sluzbeni/2019_08_76_1603.html" },
      { label: "Pravilnik o vinogradarstvu (NN 81/2022)", url: "https://narodne-novine.nn.hr/clanci/sluzbeni/2022_07_81_1184.html" },
    ],
    content: {
      en: {
        title: "Croatia's four wine regions: a primer",
        excerpt: "Since 2019 Croatian regulations divide the country's vineyards into four regions and twelve subregions. Here is how the map fits together.",
        body: `Croatian wine law organises vineyards into a hierarchy: **regions** (regije), **subregions** (podregije), **wine-growing districts** (vinogorja) and **vineyard sites** (vinogradarski položaji). Protected designations of origin are a separate legal layer and do not always coincide with these administrative areas.

## The four regions

- **Slavonia & Croatian Danube** — subregions Croatian Danube and Slavonia. Continental hills and the home of Graševina.
- **Central Croatian Uplands** — subregions Moslavina, Prigorje–Bilogora, Zagorje–Međimurje, Plešivica and Pokuplje.
- **Croatian Istria & Kvarner** — subregions Croatian Istria and Kvarner & Croatian Littoral. Malvazija, Teran and Žlahtina.
- **Dalmatia** — subregions Northern Dalmatia, Dalmatian Hinterland and Central & Southern Dalmatia. Plavac Mali, Pošip, Babić and many island varieties.

## A note on maps

We do not draw approximate regional boundaries. Official boundary geometry will be added from an authoritative GIS source; until then, the map colours each winery by its official region.`,
        status: "draft",
      },
      hr: {
        title: "Četiri hrvatske vinogradarske regije: uvod",
        excerpt: "Od 2019. hrvatski propisi dijele vinograde u četiri regije i dvanaest podregija. Evo kako se uklapa karta.",
        body: `Hrvatski propisi o vinu vinograde razvrstavaju hijerarhijski: **regije**, **podregije**, **vinogorja** i **vinogradarski položaji**. Zaštićene oznake izvornosti zaseban su pravni sloj i ne poklapaju se uvijek s tim područjima.

## Četiri regije

- **Slavonija i hrvatsko Podunavlje** — podregije Hrvatsko Podunavlje i Slavonija. Kontinentalni brežuljci i dom graševine.
- **Središnja bregovita Hrvatska** — podregije Moslavina, Prigorje – Bilogora, Zagorje – Međimurje, Plešivica i Pokuplje.
- **Hrvatska Istra i Kvarner** — podregije Hrvatska Istra te Kvarner i Hrvatsko primorje. Malvazija, teran i žlahtina.
- **Dalmacija** — podregije Sjeverna Dalmacija, Dalmatinska zagora te Srednja i Južna Dalmacija. Plavac mali, pošip, babić i brojne otočne sorte.

## Napomena o kartama

Ne crtamo približne granice regija. Službene granice dodat ćemo iz mjerodavnog GIS izvora; do tada karta svaku vinariju boji prema njezinoj službenoj regiji.`,
        status: "draft",
      },
    },
    related: { regions: ["dalmacija", "hrvatska-istra-i-kvarner", "slavonija-i-hrvatsko-podunavlje", "sredisnja-bregovita-hrvatska"] },
  },
  {
    slug: "understanding-peljesac-dingac-and-postup",
    category: "regions",
    author: "Croatian Wine Atlas",
    sources: [],
    content: {
      en: {
        title: "Understanding Pelješac: Dingač and Postup",
        excerpt: "Two steep seaward slopes on the Pelješac peninsula have defined Croatian red wine for generations.",
        body: `The Pelješac peninsula, north-west of Dubrovnik, is Croatia's best-known home of **Plavac Mali**.

## Dingač and Postup

On the peninsula's south-western flank, vineyards drop steeply towards the sea. **Dingač** and **Postup** are historic vineyard sites there, widely cited as among the first Croatian wine origins to be legally protected. Sun, reflected light from the sea, poor limestone soils and very steep slopes give powerful, concentrated wines.

## Visiting

Villages such as Potomje sit behind the Dingač slopes, and several producers in this Atlas have cellars or shops along the peninsula's main road. Always arrange tastings in advance.`,
        status: "draft",
      },
      hr: {
        title: "Upoznajte Pelješac: Dingač i Postup",
        excerpt: "Dvije strme padine prema moru na poluotoku Pelješcu generacijama oblikuju hrvatsko crno vino.",
        body: `Poluotok Pelješac, sjeverozapadno od Dubrovnika, najpoznatiji je dom **plavca malog** u Hrvatskoj.

## Dingač i Postup

Na jugozapadnoj strani poluotoka vinogradi se strmo spuštaju prema moru. **Dingač** i **Postup** povijesni su položaji koji se često navode kao među prvim zakonski zaštićenim vinskim podrijetlima u Hrvatskoj. Sunce, svjetlost koja se odbija od mora, siromašna vapnenačka tla i vrlo strme padine daju snažna, koncentrirana vina.

## Posjet

Sela poput Potomja smještena su iza padina Dingača, a nekoliko proizvođača iz Atlasa ima podrume ili vinoteke uz glavnu cestu poluotoka. Degustacije uvijek dogovorite unaprijed.`,
        status: "draft",
      },
    },
    related: { sites: ["dingac", "postup"], grapes: ["plavac-mali"], wineries: ["matusko", "skaramuca", "saints-hills"] },
  },
];
