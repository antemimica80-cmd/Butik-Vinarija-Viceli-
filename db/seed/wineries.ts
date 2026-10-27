/**
 * Launch dataset: real Croatian wine producers.
 *
 * Rules applied when compiling this file (October 2026):
 *  - Only producers whose existence and home settlement are well documented are included.
 *  - Coordinates are SETTLEMENT-LEVEL approximations (precision "settlement"/"approximate"),
 *    never presented as exact addresses. They must be geocoded from a verified address.
 *  - Websites are included only where the producer's official domain is widely published.
 *    The build environment had no direct web access, so links were not re-checked live:
 *    every record is seeded as `unverified` (or `third_party_sourced` where a cited source
 *    supports a specific fact).
 *  - No vineyard statistics, prices or awards are seeded. Founding years and people are
 *    included only when widely documented.
 *  - Descriptions are short factual drafts (content status "draft"), not invented stories.
 */

export type SeedLocation = {
  kind?: "winery" | "tasting_room" | "shop" | "vineyard";
  town: string; municipality?: string; county: string; address?: string; postal?: string;
  lat: number; lng: number; precision: "address" | "settlement" | "approximate";
  label?: { hr: string; en: string }; primary?: boolean; source?: string;
};
export type SeedWine = {
  name: string; type: "red" | "white" | "rose" | "sparkling" | "dessert" | "orange";
  grapes?: string[]; site?: string; styles?: string[]; source?: string;
};
export type SeedWinery = {
  slug: string; name: string; alt?: string[];
  region: string; subregion: string; district?: string; island?: string;
  locations: SeedLocation[];
  website?: string;
  founded?: number; founder?: string; owner?: string; winemaker?: string;
  size?: "boutique" | "family" | "medium" | "large" | "cooperative";
  family?: boolean;
  grapes: { slug: string; signature?: boolean }[];
  wines?: SeedWine[];
  facilities?: { facility: string; source: string }[];
  experiences?: { kind: string; name: { hr: string; en: string }; source: string }[];
  sources?: string[];
  featured?: number;
  en: string; hr: string;
};

const D = "dalmacija", I = "hrvatska-istra-i-kvarner", S = "slavonija-i-hrvatsko-podunavlje", C = "sredisnja-bregovita-hrvatska";
const DNC = "Dubrovačko-neretvanska", SD = "Splitsko-dalmatinska", SK = "Šibensko-kninska", ZD = "Zadarska";
const IS = "Istarska", PG = "Primorsko-goranska", PS = "Požeško-slavonska", OB = "Osječko-baranjska", VS = "Vukovarsko-srijemska";

export const THIRD_PARTY = {
  tcnBolfan: { name: "Total Croatia News — Bolfan Vinski Vrh Winery in Hraščina", url: "https://total-croatia-news.com/wine/croatian-wine-producers/bolfan-vinski-vrh-winery-hrascina/", kind: "press" },
  gmBolfan: { name: "Gault&Millau Croatia — Bolfan Vinski Vrh", url: "https://hr.gaultmillau.com/en/restaurants/bolfan-vinski-vrh", kind: "directory" },
  wdBolfan: { name: "Winedering — Ecological wine tasting at the Bolfan wine house", url: "https://www.winedering.com/es/ecological-wine-tasting-at-the-bolfan-wine-house_d3617_travel", kind: "directory" },
  tcnBodren: { name: "Total Croatia News — Bodren Winery in Hum na Sutli", url: "https://total-croatia-news.com/wine/croatian-wine-producers/bodren-winery-in-hum-na-sutli/", kind: "press" },
  pearlBodren: { name: "Pearl — Bodren, Hum na Sutli", url: "https://joinpearl.co/wineries/hum-na-sutli/bodren", kind: "directory" },
  falstaffJakopic: { name: "Falstaff — Jakopić Winery 2022 Sauvignon", url: "https://www.falstaff.com/en/wines/jakopic-winery-2022-jakopic-sauvignon", kind: "press" },
  tcnSkaramuca: { name: "Total Croatia News — Croatian Winemakers: Skaramuča on Pelješac", url: "https://total-croatia-news.com/wine/croatian-wine-producers/croatian-winemakers-skaramuca-peljesac/", kind: "press" },
  falstaffSkaramuca: { name: "Falstaff — Vina Skaramuča 2020 Dingač Elegance", url: "https://www.falstaff.com/en/wines/vina-skaramuca-2020-dingac-elegance-1", kind: "press" },
  falstaffSkaramucaPosip: { name: "Falstaff — Vina Skaramuča 2023 Pošip Elegance", url: "https://www.falstaff.com/en/wines/vina-skaramuca-2023-posip-elegance", kind: "press" },
  tcnBire: { name: "Total Croatia News — Bire Winery in Lumbarda, Korčula Island", url: "https://total-croatia-news.com/wine/croatian-wine-producers/bire-winery-in-lumbarda-korcula-island/", kind: "press" },
  tcBire: { name: "Thomas Cook — Farm-to-table service at Agroturizam Bire", url: "https://www.thomascook.com/holidays/croatia/southern-dalmatia/korcula/things-to-do/enjoy-farm-to-table-service-at-agroturizam-bire", kind: "directory" },
  falstaffToreta: { name: "Falstaff — Vinarija Toreta 2022 Pošip Sur Lie", url: "https://www.falstaff.com/en/wines/vinarija-toreta-2022-posip-sur-lie", kind: "press" },
  tcToreta: { name: "Thomas Cook — Sip wine at Toreta Winery", url: "https://www.thomascook.com/holidays/croatia/southern-dalmatia/korcula/things-to-do/sip-wine-at-toreta-winery", kind: "directory" },
  tcnToreta: { name: "Total Croatia News — Meet the People of Korčula: Frano Baničević, Toreta Winery", url: "https://www.total-croatia-news.com/destination-korcula/meet-the-people-of-korcula", kind: "press" },
  wdKatunar: { name: "Winedering — Kuća vina Ivan Katunar", url: "https://www.winedering.com/winery-kuca-vina-ivan-katunar_d5392", kind: "directory" },
  wdKatunarTour: { name: "Winedering — Wine tasting & cellar tour at Kuća vina Ivan Katunar", url: "https://www.winedering.com/es/wine-tasting-cellar-tour-at-kuca-vina-ivan-katunar_d2805_travel", kind: "directory" },
  tasteFlorijanovic: { name: "Taste of Adriatic — Florijanović winery: praised wines of Moslavina", url: "https://tasteofadriatic.com/post/2018/08/02/florijanovi-c4-87-winery-praised-wines-of-moslavina", kind: "press" },
  hrtSkrlet: { name: "HRturizam — Seven largest Moslavina producers present a joint Škrlet", url: "https://hrturizam.hr/en/sedam-najvecih-proizvodaca-vina-u-moslavini-predstavilo-zajednicno-vino-skrlet/", kind: "press" },
  zelinaBodren: { name: "Karlobag.eu — 57th Zelina wine exhibition: Bodren ice-harvest Chardonnay named champion", url: "https://karlobag.eu/en/events/saint-john-zelina-hosted-the-57th-wine-exhibitions-chardonnay-of-the-bodren-ice-52xtb/", kind: "press" },
  wamBolfan: { name: "Wine & More — Bolfan Rosé", url: "https://www.wineandmore.com/wines/bolfan-rose/feed/", kind: "directory" },
  decanterBire: { name: "Decanter — Bire, Grk, Lumbarda, Dalmatia, Croatia, 2023 (review)", url: "https://www.decanter.com/wine-reviews/croatia/dalmatia/bire-grk-lumbarda-dalmatia-croatia-2023-91510", kind: "press" },
} as const;

export const WINERIES: SeedWinery[] = [
  // ───────────────────────────── DALMACIJA ─────────────────────────────
  {
    slug: "korta-katarina", name: "Korta Katarina", region: D, subregion: "srednja-i-juzna-dalmacija", district: "peljesac",
    locations: [{ town: "Orebić", municipality: "Orebić", county: DNC, lat: 42.9745, lng: 17.1786, precision: "settlement" }],
    website: "https://www.kortakatarina.com", featured: 2,
    grapes: [{ slug: "plavac-mali", signature: true }, { slug: "posip" }],
    wines: [{ name: "Plavac Mali", type: "red", grapes: ["plavac-mali"] }, { name: "Pošip", type: "white", grapes: ["posip"] }],
    en: "Winery in Orebić on the Pelješac peninsula, focused on Plavac Mali and Pošip.",
    hr: "Vinarija u Orebiću na poluotoku Pelješcu, usmjerena na plavac mali i pošip.",
  },
  {
    slug: "saints-hills", name: "Saints Hills", region: D, subregion: "srednja-i-juzna-dalmacija", district: "peljesac",
    locations: [{ town: "Oskorušno", municipality: "Orebić", county: DNC, lat: 42.9505, lng: 17.262, precision: "approximate" }],
    website: "https://www.saintshills.com", owner: "Ernest Tolj",
    grapes: [{ slug: "plavac-mali", signature: true }],
    wines: [{ name: "Dingač", type: "red", grapes: ["plavac-mali"], site: "dingac" }],
    en: "Producer with a Dalmatian winery on Pelješac making Plavac Mali, including wine from the Dingač site. The company also farms vineyards in Istria.",
    hr: "Proizvođač s dalmatinskom vinarijom na Pelješcu koji proizvodi plavac mali, uključujući vino s položaja Dingač. Tvrtka obrađuje i vinograde u Istri.",
  },
  {
    slug: "matusko", name: "Matuško", alt: ["Vinarija Matuško"], region: D, subregion: "srednja-i-juzna-dalmacija", district: "peljesac",
    locations: [{ town: "Potomje", municipality: "Orebić", county: DNC, lat: 42.928, lng: 17.33, precision: "settlement" }],
    family: true,
    grapes: [{ slug: "plavac-mali", signature: true }],
    wines: [{ name: "Dingač", type: "red", grapes: ["plavac-mali"], site: "dingac" }],
    en: "Family winery in Potomje, the village behind the Dingač slopes, producing Plavac Mali including Dingač.",
    hr: "Obiteljska vinarija u Potomju, selu iza padina Dingača, koja proizvodi plavac mali, uključujući dingač.",
  },
  {
    slug: "grgic-vina", name: "Grgić Vina", alt: ["Grgić"], region: D, subregion: "srednja-i-juzna-dalmacija", district: "peljesac",
    locations: [{ town: "Trstenik", municipality: "Orebić", county: DNC, lat: 42.915, lng: 17.4, precision: "settlement" }],
    website: "https://www.grgic-vina.com", founded: 1996, founder: "Miljenko (Mike) Grgić", featured: 4,
    grapes: [{ slug: "plavac-mali", signature: true }, { slug: "posip" }],
    wines: [{ name: "Plavac Mali", type: "red", grapes: ["plavac-mali"] }, { name: "Pošip", type: "white", grapes: ["posip"] }],
    en: "Winery in Trstenik on Pelješac founded in 1996 by Miljenko 'Mike' Grgić, the Croatian-born Napa Valley winemaker, on his return to his homeland.",
    hr: "Vinarija u Trsteniku na Pelješcu koju je 1996. osnovao Miljenko Grgić, vinar rođen u Hrvatskoj i poznat iz kalifornijske doline Napa, po povratku u domovinu.",
  },
  {
    slug: "skaramuca", name: "Vina Skaramuča", alt: ["Skaramuča", "Dingač – Skaramuča d.o.o."], region: D, subregion: "srednja-i-juzna-dalmacija", district: "peljesac",
    locations: [
      { town: "Pijavičino", municipality: "Orebić", county: DNC, lat: 42.94, lng: 17.308, precision: "approximate", primary: true, label: { hr: "Vinarija i vinoteka", en: "Winery & wine shop" }, source: "tcnSkaramuca" },
      { kind: "shop", town: "Viganj", municipality: "Orebić", county: DNC, lat: 42.981, lng: 17.105, precision: "approximate", label: { hr: "Vinoteka Viganj", en: "Viganj wine shop" }, source: "tcnSkaramuca" },
    ],
    family: true,
    grapes: [{ slug: "plavac-mali", signature: true }],
    wines: [
      { name: "Dingač Elegance", type: "red", grapes: ["plavac-mali"], site: "dingac", source: "falstaffSkaramuca" },
      { name: "Pošip Elegance", type: "white", grapes: ["posip"], source: "falstaffSkaramucaPosip" },
    ],
    facilities: [{ facility: "shop", source: "tcnSkaramuca" }],
    sources: ["tcnSkaramuca"],
    en: "Family producer known for Plavac Mali, with vineyards in the Dingač area. Wine shops operate in Pijavičino and on the seafront in Viganj.",
    hr: "Obiteljski proizvođač poznat po plavcu malom, s vinogradima na području Dingača. Vinoteke rade u Pijavičinu i na rivi u Viganju.",
  },
  {
    slug: "bire", name: "Bire", alt: ["Vinarija Bire", "Agroturizam Bire"], region: D, subregion: "srednja-i-juzna-dalmacija", district: "korcula", island: "Korčula",
    locations: [{ town: "Lumbarda", municipality: "Lumbarda", county: DNC, lat: 42.9231, lng: 17.1694, precision: "settlement" }],
    family: true, owner: "Frano Milina Bire", size: "boutique",
    grapes: [{ slug: "grk", signature: true }, { slug: "plavac-mali" }],
    wines: [{ name: "Grk", type: "white", grapes: ["grk"], source: "decanterBire" }],
    facilities: [{ facility: "restaurant", source: "tcBire" }],
    sources: ["tcnBire"], featured: 6,
    en: "Small family estate in Lumbarda on Korčula built around Grk, the island's rare indigenous white. The family also runs an agritourism offering their own farm produce.",
    hr: "Malo obiteljsko imanje u Lumbardi na Korčuli posvećeno grku, rijetkoj autohtonoj bijeloj sorti otoka. Obitelj vodi i agroturizam s vlastitim proizvodima.",
  },
  {
    slug: "toreta", name: "Vinarija Toreta", alt: ["Toreta"], region: D, subregion: "srednja-i-juzna-dalmacija", district: "korcula", island: "Korčula",
    locations: [{ town: "Smokvica", municipality: "Smokvica", county: DNC, address: "Smokvica 163", postal: "20272", lat: 42.9296, lng: 16.8925, precision: "settlement", source: "tcnToreta" }],
    family: true, owner: "Baničević family",
    grapes: [{ slug: "posip", signature: true }, { slug: "marastina" }],
    wines: [{ name: "Pošip Sur Lie", type: "white", grapes: ["posip"], source: "falstaffToreta" }],
    facilities: [{ facility: "tasting", source: "tcToreta" }],
    experiences: [{ kind: "tasting", name: { hr: "Degustacija vina", en: "Wine tasting" }, source: "tcToreta" }],
    sources: ["tcnToreta"],
    en: "Baničević family winery in Smokvica, in the heart of Korčula's Pošip country. Rukatac (Maraština) is also part of its range.",
    hr: "Obiteljska vinarija Baničević u Smokvici, u srcu korčulanskog kraja pošipa. U ponudi je i rukatac (maraština).",
  },
  {
    slug: "stina", name: "Stina", alt: ["Vinarija Stina", "Jako Vino"], region: D, subregion: "srednja-i-juzna-dalmacija", island: "Brač",
    locations: [{ town: "Bol", municipality: "Bol", county: SD, lat: 43.2617, lng: 16.655, precision: "settlement" }],
    website: "https://www.stina-vino.hr", featured: 3,
    grapes: [{ slug: "posip", signature: true }, { slug: "plavac-mali" }, { slug: "tribidrag" }, { slug: "vugava" }],
    wines: [{ name: "Pošip", type: "white", grapes: ["posip"] }, { name: "Tribidrag", type: "red", grapes: ["tribidrag"] }, { name: "Plavac Mali", type: "red", grapes: ["plavac-mali"] }],
    en: "Winery on the seafront in Bol on the island of Brač, working with vineyards on the island's steep southern slopes.",
    hr: "Vinarija na rivi u Bolu na otoku Braču, s vinogradima na strmim južnim padinama otoka.",
  },
  {
    slug: "tomic", name: "Vinarija Tomić", alt: ["Tomić", "Bastijana"], region: D, subregion: "srednja-i-juzna-dalmacija", district: "hvar", island: "Hvar",
    locations: [{ town: "Jelsa", municipality: "Jelsa", county: SD, lat: 43.1614, lng: 16.6936, precision: "settlement" }],
    winemaker: "Andro Tomić",
    grapes: [{ slug: "plavac-mali", signature: true }, { slug: "bogdanusa" }],
    en: "Winery in Jelsa on the island of Hvar, led by winemaker Andro Tomić.",
    hr: "Vinarija u Jelsi na otoku Hvaru koju vodi vinar Andro Tomić.",
  },
  {
    slug: "zlatan-otok", name: "Zlatan Otok", region: D, subregion: "srednja-i-juzna-dalmacija", district: "hvar", island: "Hvar",
    locations: [{ town: "Sveta Nedjelja", municipality: "Hvar", county: SD, lat: 43.1425, lng: 16.594, precision: "settlement" }],
    website: "https://www.zlatan-otok.hr", founder: "Zlatan Plenković",
    grapes: [{ slug: "plavac-mali", signature: true }, { slug: "posip" }, { slug: "bogdanusa" }],
    wines: [{ name: "Zlatan Plavac Grand Cru", type: "red", grapes: ["plavac-mali"] }],
    en: "Producer founded by Zlatan Plenković, with vineyards on the steep south-facing slopes of Sveta Nedjelja on Hvar.",
    hr: "Proizvođač koji je osnovao Zlatan Plenković, s vinogradima na strmim južnim padinama Svete Nedjelje na Hvaru.",
  },
  {
    slug: "rokis", name: "Roki's", alt: ["Vinarija Roki's"], region: D, subregion: "srednja-i-juzna-dalmacija", district: "vis", island: "Vis",
    locations: [{ town: "Plisko Polje", municipality: "Komiža", county: SD, lat: 43.028, lng: 16.156, precision: "approximate" }],
    family: true,
    grapes: [{ slug: "vugava", signature: true }, { slug: "plavac-mali" }],
    en: "Family winery in the interior of the island of Vis, known for Vugava, the island's signature white.",
    hr: "Obiteljska vinarija u unutrašnjosti otoka Visa, poznata po vugavi, zaštitnoj bijeloj sorti otoka.",
  },
  {
    slug: "bibich", name: "Bibich", alt: ["Bibić", "Vinarija Bibich"], region: D, subregion: "sjeverna-dalmacija",
    locations: [{ town: "Plastovo", municipality: "Skradin", county: SK, lat: 43.88, lng: 15.95, precision: "approximate" }],
    website: "https://www.bibich.co", winemaker: "Alen Bibić", family: true, featured: 5,
    grapes: [{ slug: "debit", signature: true }, { slug: "babic", signature: true }, { slug: "lasin" }, { slug: "plavina" }],
    wines: [{ name: "Debit", type: "white", grapes: ["debit"] }, { name: "Babić", type: "red", grapes: ["babic"] }],
    en: "Family winery near Skradin, in the hinterland of Šibenik, championing northern Dalmatian varieties such as Debit and Babić.",
    hr: "Obiteljska vinarija kraj Skradina, u šibenskom zaleđu, koja promiče sjevernodalmatinske sorte poput debita i babića.",
  },
  {
    slug: "testament", name: "Testament", alt: ["Vinarija Testament"], region: D, subregion: "sjeverna-dalmacija",
    locations: [{ town: "Dragišić", municipality: "Šibenik", county: SK, lat: 43.76, lng: 15.96, precision: "approximate" }],
    grapes: [{ slug: "babic", signature: true }, { slug: "debit" }],
    en: "Winery in the Šibenik hinterland working with the local varieties Babić and Debit.",
    hr: "Vinarija u šibenskom zaleđu koja radi s lokalnim sortama babićem i debitom.",
  },
  {
    slug: "gracin", name: "Gracin", alt: ["Vina Gracin"], region: D, subregion: "sjeverna-dalmacija",
    locations: [{ town: "Primošten", municipality: "Primošten", county: SK, lat: 43.5862, lng: 15.9236, precision: "settlement" }],
    winemaker: "Leo Gracin", size: "boutique",
    grapes: [{ slug: "babic", signature: true }],
    wines: [{ name: "Babić", type: "red", grapes: ["babic"] }],
    en: "Small producer from Primošten devoted to Babić, the red variety of the area's famous stone-walled vineyards.",
    hr: "Mali proizvođač iz Primoštena posvećen babiću, crnoj sorti poznatih primoštenskih vinograda u kamenim gromačama.",
  },
  {
    slug: "badel-1862-korlat", name: "Badel 1862 – Vinarija Korlat", alt: ["Korlat", "Badel 1862"], region: D, subregion: "sjeverna-dalmacija",
    locations: [{ town: "Korlat", municipality: "Benkovac", county: ZD, lat: 44.035, lng: 15.59, precision: "approximate" }],
    website: "https://www.badel1862.hr", size: "large",
    grapes: [{ slug: "syrah", signature: true }, { slug: "cabernet-sauvignon" }, { slug: "merlot" }],
    wines: [{ name: "Korlat Syrah", type: "red", grapes: ["syrah"] }, { name: "Korlat Cabernet Sauvignon", type: "red", grapes: ["cabernet-sauvignon"] }],
    en: "The Korlat estate near Benkovac in the Zadar hinterland, part of the Badel 1862 group, known for Syrah and Bordeaux varieties.",
    hr: "Imanje Korlat kraj Benkovca u zadarskom zaleđu, dio grupe Badel 1862, poznato po syrahu i bordoškim sortama.",
  },
  {
    slug: "grabovac", name: "Vinarija Grabovac", alt: ["Grabovac"], region: D, subregion: "dalmatinska-zagora",
    locations: [{ town: "Prološac", municipality: "Proložac", county: SD, lat: 43.462, lng: 17.135, precision: "approximate" }],
    family: true,
    grapes: [{ slug: "kujundzusa", signature: true }],
    wines: [{ name: "Kujundžuša", type: "white", grapes: ["kujundzusa"] }],
    en: "Family winery in the Imotski area of the Dalmatian hinterland, home of the white Kujundžuša.",
    hr: "Obiteljska vinarija u imotskom kraju Dalmatinske zagore, domu bijele kujundžuše.",
  },

  // ─────────────────────── HRVATSKA ISTRA I KVARNER ───────────────────────
  {
    slug: "kozlovic", name: "Kozlović", alt: ["Vinarija Kozlović"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Momjan", municipality: "Buje", county: IS, lat: 45.433, lng: 13.698, precision: "approximate" }],
    website: "https://www.kozlovic.hr", winemaker: "Gianfranco Kozlović", family: true, featured: 1,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }, { slug: "muskat-momjanski" }],
    wines: [
      { name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] },
      { name: "Santa Lucia Malvazija", type: "white", grapes: ["malvazija-istarska"] },
      { name: "Teran", type: "red", grapes: ["teran"] },
      { name: "Muškat Momjanski", type: "white", grapes: ["muskat-momjanski"] },
    ],
    en: "Family winery in the Momjan hills of north-western Istria, best known for Malvazija Istarska and Muškat Momjanski.",
    hr: "Obiteljska vinarija na momjanskim brežuljcima sjeverozapadne Istre, najpoznatija po malvaziji istarskoj i momjanskom muškatu.",
  },
  {
    slug: "kabola", name: "Kabola", alt: ["Vinarija Kabola"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Kremenje", municipality: "Buje", county: IS, lat: 45.43, lng: 13.72, precision: "approximate" }],
    website: "https://www.kabola.hr",
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "muskat-momjanski" }, { slug: "teran" }],
    wines: [{ name: "Malvazija Amfora", type: "white", grapes: ["malvazija-istarska"], styles: ["amphora"] }, { name: "Muškat Momjanski", type: "white", grapes: ["muskat-momjanski"] }],
    en: "Winery near Momjan in north-western Istria, known among other wines for Malvazija aged in amphorae.",
    hr: "Vinarija kraj Momjana u sjeverozapadnoj Istri, poznata među ostalim po malvaziji odležanoj u amforama.",
  },
  {
    slug: "clai", name: "Clai", alt: ["Clai Bijele Zemlje", "Vina Clai"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Krasica", municipality: "Buje", county: IS, lat: 45.414, lng: 13.713, precision: "approximate" }],
    winemaker: "Giorgio Clai", family: true,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }],
    wines: [{ name: "Sveti Jakov Malvazija", type: "orange", grapes: ["malvazija-istarska"], styles: ["skin_contact"] }],
    en: "Giorgio Clai's winery near Krasica in north-western Istria, a reference for long-macerated Malvazija.",
    hr: "Vinarija Giorgija Claija kraj Krasice u sjeverozapadnoj Istri, referentna za dugo maceriranu malvaziju.",
  },
  {
    slug: "coronica", name: "Coronica", alt: ["Vinarija Coronica"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Koreniki", municipality: "Umag", county: IS, lat: 45.421, lng: 13.556, precision: "approximate" }],
    website: "https://www.coronica.hr", winemaker: "Moreno Coronica", family: true,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran", signature: true }],
    wines: [{ name: "Gran Teran", type: "red", grapes: ["teran"] }, { name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] }],
    en: "Family winery in Koreniki near Umag, known for its Malvazija and Gran Teran.",
    hr: "Obiteljska vinarija u Korenikima kraj Umaga, poznata po malvaziji i Gran Teranu.",
  },
  {
    slug: "degrassi", name: "Degrassi", alt: ["Vina Degrassi"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Bašanija", municipality: "Umag", county: IS, lat: 45.488, lng: 13.507, precision: "settlement" }],
    website: "https://www.degrassi.hr", winemaker: "Moreno Degrassi", family: true,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }],
    wines: [{ name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] }],
    en: "Family winery in Bašanija near Savudrija, at Istria's north-western tip.",
    hr: "Obiteljska vinarija u Bašaniji kraj Savudrije, na sjeverozapadnom vrhu Istre.",
  },
  {
    slug: "cattunar", name: "Cattunar", alt: ["Vinarija Cattunar"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Nova Vas", municipality: "Brtonigla", county: IS, lat: 45.37, lng: 13.617, precision: "approximate" }],
    website: "https://www.cattunar.hr", family: true,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }, { slug: "muskat-momjanski" }],
    wines: [{ name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] }],
    en: "Family winery in Nova Vas near Brtonigla, known for exploring Malvazija from Istria's different soil types.",
    hr: "Obiteljska vinarija u Novoj Vasi kraj Brtonigle, poznata po istraživanju malvazije s različitih istarskih tala.",
  },
  {
    slug: "benvenuti", name: "Benvenuti", alt: ["Benvenuti Vina"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Kaldir", municipality: "Motovun", county: IS, lat: 45.322, lng: 13.85, precision: "approximate" }],
    website: "https://www.benvenutivina.com", family: true,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran", signature: true }, { slug: "muskat-momjanski" }],
    wines: [{ name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] }, { name: "Teran", type: "red", grapes: ["teran"] }],
    en: "Benvenuti family winery in Kaldir, below the hill town of Motovun in central Istria.",
    hr: "Obiteljska vinarija Benvenuti u Kaldiru, podno Motovuna u središnjoj Istri.",
  },
  {
    slug: "arman-franc", name: "Franc Arman", alt: ["Vinarija Arman Franc", "Arman"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Narduči", municipality: "Vižinada", county: IS, lat: 45.324, lng: 13.76, precision: "approximate" }],
    website: "https://www.francarman.hr", family: true,
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }],
    wines: [{ name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] }, { name: "Teran", type: "red", grapes: ["teran"] }],
    en: "Family winery in Narduči near Vižinada, overlooking the Mirna valley in central Istria.",
    hr: "Obiteljska vinarija u Nardučima kraj Vižinade, s pogledom na dolinu Mirne u središnjoj Istri.",
  },
  {
    slug: "roxanich", name: "Roxanich", alt: ["Rožanić"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Nova Vas", municipality: "Poreč", county: IS, lat: 45.26, lng: 13.64, precision: "approximate" }],
    website: "https://www.roxanich.hr", founder: "Mladen Rožanić",
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }],
    wines: [
      { name: "Antica Malvazija", type: "orange", grapes: ["malvazija-istarska"], styles: ["skin_contact"] },
      { name: "Ines u bijelom", type: "orange", styles: ["skin_contact"] },
      { name: "Teran", type: "red", grapes: ["teran"] },
    ],
    en: "Istrian producer founded by Mladen Rožanić, known for long-macerated whites and extended-aged reds.",
    hr: "Istarski proizvođač koji je osnovao Mladen Rožanić, poznat po dugo maceriranim bijelim i dugo odležanim crnim vinima.",
  },
  {
    slug: "matosevic", name: "Matošević", alt: ["Vinarija Matošević"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Krunčići", municipality: "Sveti Lovreč", county: IS, lat: 45.176, lng: 13.772, precision: "approximate" }],
    website: "https://www.matosevic.com", founder: "Ivica Matošević",
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }],
    wines: [{ name: "Alba Malvazija", type: "white", grapes: ["malvazija-istarska"] }, { name: "Alba Robinia", type: "white", grapes: ["malvazija-istarska"], styles: ["acacia_barrel"] }, { name: "Grimalda", type: "red" }],
    en: "Ivica Matošević's winery in Krunčići near Sveti Lovreč, known for Malvazija including versions aged in acacia barrels.",
    hr: "Vinarija Ivice Matoševića u Krunčićima kraj Svetog Lovreča, poznata po malvaziji, uključujući verzije odležane u bačvama od bagrema.",
  },
  {
    slug: "trapan", name: "Trapan", alt: ["Trapan Wine Station"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Šišan", municipality: "Ližnjan", county: IS, lat: 44.866, lng: 13.937, precision: "settlement" }],
    website: "https://www.trapan.hr", founder: "Bruno Trapan",
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran" }],
    wines: [{ name: "Ponente Malvazija", type: "white", grapes: ["malvazija-istarska"] }, { name: "Uroboros", type: "white", grapes: ["malvazija-istarska"] }],
    en: "Bruno Trapan's winery in Šišan near Pula in southern Istria.",
    hr: "Vinarija Brune Trapana u Šišanu kraj Pule u južnoj Istri.",
  },
  {
    slug: "meneghetti", name: "Meneghetti", alt: ["Meneghetti Wine Hotel & Winery"], region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Bale", municipality: "Bale", county: IS, lat: 45.0405, lng: 13.7845, precision: "approximate" }],
    website: "https://www.meneghetti.hr",
    grapes: [{ slug: "malvazija-istarska" }, { slug: "chardonnay" }, { slug: "pinot-crni" }],
    wines: [{ name: "Meneghetti Brut", type: "sparkling", styles: ["traditional_method"] }, { name: "Malvazija", type: "white", grapes: ["malvazija-istarska"] }],
    en: "Estate near Bale in south-western Istria producing still wines and traditional-method sparkling wine.",
    hr: "Imanje kraj Bala u jugozapadnoj Istri koje proizvodi mirna vina i pjenušac klasičnom metodom.",
  },
  {
    slug: "piquentum", name: "Piquentum", region: I, subregion: "hrvatska-istra",
    locations: [{ town: "Buzet", municipality: "Buzet", county: IS, lat: 45.4089, lng: 13.9658, precision: "settlement" }],
    website: "https://www.piquentum.com", winemaker: "Dimitri Brečević", size: "boutique",
    grapes: [{ slug: "malvazija-istarska", signature: true }, { slug: "teran", signature: true }],
    wines: [{ name: "Piquentum Blanc", type: "white", grapes: ["malvazija-istarska"] }, { name: "Piquentum Rouge", type: "red", grapes: ["teran"] }],
    en: "Dimitri Brečević's small winery near Buzet in northern Istria, making minimal-intervention Malvazija and Teran.",
    hr: "Mala vinarija Dimitrija Brečevića kraj Buzeta u sjevernoj Istri, s malvazijom i teranom proizvedenima uz minimalne intervencije.",
  },
  {
    slug: "katunar-ivan", name: "Kuća vina Ivan Katunar", alt: ["Katunar"], region: I, subregion: "kvarner-i-hrvatsko-primorje", island: "Krk",
    locations: [{ town: "Vrbnik", municipality: "Vrbnik", county: PG, lat: 45.0758, lng: 14.6747, precision: "settlement", source: "wdKatunar" }],
    family: true,
    grapes: [{ slug: "zlahtina", signature: true }, { slug: "sansigot" }],
    wines: [{ name: "Žlahtina", type: "white", grapes: ["zlahtina"], source: "wdKatunar" }, { name: "Sansigot", type: "red", grapes: ["sansigot"], source: "wdKatunar" }],
    facilities: [{ facility: "tasting", source: "wdKatunarTour" }, { facility: "guided_tour", source: "wdKatunarTour" }],
    experiences: [{ kind: "cellar_tour", name: { hr: "Degustacija vina i obilazak podruma", en: "Wine tasting & cellar tour" }, source: "wdKatunarTour" }],
    sources: ["wdKatunar"],
    en: "Family winery in Vrbnik on the island of Krk. According to a published listing, its first bottles date from 1989 and its flagship wines are Žlahtina and Sansigot.",
    hr: "Obiteljska vinarija u Vrbniku na otoku Krku. Prema objavljenom opisu, prve boce datiraju iz 1989., a glavna vina su žlahtina i sansigot.",
  },
  {
    slug: "gospoja", name: "Gospoja", alt: ["Vinarija Gospoja", "Toljanić"], region: I, subregion: "kvarner-i-hrvatsko-primorje", island: "Krk",
    locations: [{ town: "Vrbnik", municipality: "Vrbnik", county: PG, lat: 45.072, lng: 14.665, precision: "approximate" }],
    family: true,
    grapes: [{ slug: "zlahtina", signature: true }],
    wines: [{ name: "Žlahtina", type: "white", grapes: ["zlahtina"] }],
    en: "Family winery of the Toljanić family near Vrbnik on Krk, producing Žlahtina from the Vrbnik field.",
    hr: "Obiteljska vinarija obitelji Toljanić kraj Vrbnika na Krku, koja proizvodi žlahtinu iz Vrbničkog polja.",
  },

  // ────────────────── SLAVONIJA I HRVATSKO PODUNAVLJE ──────────────────
  {
    slug: "krauthaker", name: "Krauthaker", alt: ["Vina Krauthaker"], region: S, subregion: "slavonija", district: "kutjevo",
    locations: [{ town: "Kutjevo", municipality: "Kutjevo", county: PS, lat: 45.426, lng: 17.883, precision: "settlement" }],
    website: "https://www.krauthaker.hr", founder: "Vlado Krauthaker", featured: 7,
    grapes: [{ slug: "grasevina", signature: true }, { slug: "chardonnay" }, { slug: "sauvignon" }, { slug: "frankovka" }],
    wines: [{ name: "Graševina Mitrovac", type: "white", grapes: ["grasevina"] }],
    en: "Vlado Krauthaker's winery in Kutjevo, one of the best-known names for Graševina from the Kutjevo hills.",
    hr: "Vinarija Vlade Krauthakera u Kutjevu, jedno od najpoznatijih imena graševine s kutjevačkih brežuljaka.",
  },
  {
    slug: "kutjevo", name: "Kutjevo d.d.", alt: ["Kutjevo", "Kutjevački podrum"], region: S, subregion: "slavonija", district: "kutjevo",
    locations: [{ town: "Kutjevo", municipality: "Kutjevo", county: PS, lat: 45.4245, lng: 17.8795, precision: "approximate" }],
    website: "https://www.kutjevo.com", size: "large",
    grapes: [{ slug: "grasevina", signature: true }, { slug: "traminac" }, { slug: "chardonnay" }],
    wines: [{ name: "Graševina De Gotho", type: "white", grapes: ["grasevina"] }],
    en: "Large producer in the town of Kutjevo, whose historic cellar is associated with the town's medieval Cistercian abbey.",
    hr: "Veliki proizvođač u Kutjevu, čiji je povijesni podrum vezan uz srednjovjekovnu cistercitsku opatiju u gradu.",
  },
  {
    slug: "enjingi", name: "Enjingi", alt: ["Vina Enjingi"], region: S, subregion: "slavonija", district: "kutjevo",
    locations: [{ town: "Hrnjevac", municipality: "Velika", county: PS, lat: 45.437, lng: 17.815, precision: "approximate" }],
    website: "https://www.enjingi.hr", founder: "Ivan Enjingi", family: true,
    grapes: [{ slug: "grasevina", signature: true }, { slug: "traminac" }, { slug: "rizling-rajnski" }],
    wines: [{ name: "Venje", type: "white" }, { name: "Graševina", type: "white", grapes: ["grasevina"] }],
    en: "Family winery founded by Ivan Enjingi in the Kutjevo wine area, known for long-aged whites and the Venje blend.",
    hr: "Obiteljska vinarija koju je osnovao Ivan Enjingi na kutjevačkom području, poznata po dugo odležanim bijelim vinima i kupaži Venje.",
  },
  {
    slug: "galic", name: "Vina Galić", alt: ["Galić"], region: S, subregion: "slavonija", district: "kutjevo",
    locations: [{ town: "Kutjevo", municipality: "Kutjevo", county: PS, lat: 45.43, lng: 17.89, precision: "approximate" }],
    family: true,
    grapes: [{ slug: "grasevina", signature: true }],
    wines: [{ name: "Graševina", type: "white", grapes: ["grasevina"] }],
    en: "Family winery in the Kutjevo wine area of Slavonia.",
    hr: "Obiteljska vinarija na kutjevačkom vinogradarskom području u Slavoniji.",
  },
  {
    slug: "feravino", name: "Feravino", region: S, subregion: "slavonija",
    locations: [{ town: "Feričanci", municipality: "Feričanci", county: OB, lat: 45.529, lng: 18.02, precision: "settlement" }],
    website: "https://www.feravino.hr", size: "large",
    grapes: [{ slug: "grasevina", signature: true }, { slug: "frankovka", signature: true }],
    en: "Winery in Feričanci in western Slavonia.",
    hr: "Vinarija u Feričancima u zapadnoj Slavoniji.",
  },
  {
    slug: "ilocki-podrumi", name: "Iločki podrumi", alt: ["Ilok Cellars"], region: S, subregion: "hrvatsko-podunavlje", district: "srijem",
    locations: [{ town: "Ilok", municipality: "Ilok", county: VS, lat: 45.222, lng: 19.376, precision: "settlement" }],
    website: "https://www.ilocki-podrumi.hr", size: "large", featured: 8,
    grapes: [{ slug: "traminac", signature: true }, { slug: "grasevina", signature: true }, { slug: "frankovka" }],
    wines: [{ name: "Traminac", type: "white", grapes: ["traminac"] }, { name: "Graševina", type: "white", grapes: ["grasevina"] }],
    en: "Historic producer in Ilok, Croatia's easternmost town, on the Danube slopes of Fruška gora. Traminac is its best-known variety.",
    hr: "Povijesni proizvođač u Iloku, najistočnijem hrvatskom gradu, na podunavskim obroncima Fruške gore. Najpoznatija mu je sorta traminac.",
  },
  {
    slug: "belje", name: "Belje", alt: ["Belje vina", "Belje plus"], region: S, subregion: "hrvatsko-podunavlje", district: "baranja",
    locations: [{ town: "Kneževi Vinogradi", municipality: "Kneževi Vinogradi", county: OB, lat: 45.75, lng: 18.733, precision: "approximate" }],
    website: "https://www.belje.hr", size: "large",
    grapes: [{ slug: "grasevina", signature: true }, { slug: "merlot" }, { slug: "frankovka" }],
    wines: [{ name: "Graševina Goldberg", type: "white", grapes: ["grasevina"] }],
    en: "Large producer with vineyards on the Bansko brdo hills of Baranja.",
    hr: "Veliki proizvođač s vinogradima na Banskom brdu u Baranji.",
  },
  {
    slug: "josic", name: "Josić", alt: ["Vinarija Josić"], region: S, subregion: "hrvatsko-podunavlje", district: "baranja",
    locations: [{ town: "Zmajevac", municipality: "Kneževi Vinogradi", county: OB, lat: 45.809, lng: 18.799, precision: "settlement" }],
    website: "https://www.josic.hr", family: true,
    grapes: [{ slug: "grasevina" }, { slug: "frankovka" }],
    en: "Family winery in Zmajevac, a wine village in Baranja known for its traditional hillside cellars (gator).",
    hr: "Obiteljska vinarija u Zmajevcu, baranjskom vinskom selu poznatom po tradicionalnim podrumima u brdu (gatorima).",
  },
  {
    slug: "erdutski-vinogradi", name: "Erdutski vinogradi", region: S, subregion: "hrvatsko-podunavlje", district: "erdut",
    locations: [{ town: "Erdut", municipality: "Erdut", county: OB, lat: 45.524, lng: 19.065, precision: "settlement" }],
    website: "https://www.erdutski-vinogradi.hr", size: "large",
    grapes: [{ slug: "grasevina", signature: true }, { slug: "traminac" }, { slug: "chardonnay" }],
    en: "Producer in Erdut, on the loess plateau above the Danube.",
    hr: "Proizvođač u Erdutu, na lesnom platou iznad Dunava.",
  },

  // ────────────────────── SREDIŠNJA BREGOVITA HRVATSKA ──────────────────────
  {
    slug: "tomac", name: "Tomac", alt: ["Vinarija Tomac"], region: C, subregion: "plesivica",
    locations: [{ town: "Plešivica", municipality: "Jastrebarsko", county: "Zagrebačka", lat: 45.737, lng: 15.667, precision: "approximate" }],
    website: "https://www.tomac.hr", winemaker: "Tomislav Tomac", family: true, featured: 9,
    grapes: [{ slug: "chardonnay" }, { slug: "rizling-rajnski" }, { slug: "pinot-crni" }],
    wines: [{ name: "Amfora", type: "orange", styles: ["amphora", "skin_contact"] }, { name: "Tomac Brut", type: "sparkling", styles: ["traditional_method"] }],
    en: "Family winery at Plešivica, known for amphora-aged wines and traditional-method sparkling wine.",
    hr: "Obiteljska vinarija na Plešivici, poznata po vinima odležanima u amforama i pjenušcima klasične metode.",
  },
  {
    slug: "korak", name: "Korak", alt: ["Vinarija Korak"], region: C, subregion: "plesivica",
    locations: [{ town: "Plešivica", municipality: "Jastrebarsko", county: "Zagrebačka", lat: 45.741, lng: 15.661, precision: "approximate" }],
    family: true,
    grapes: [],
    en: "Family winery at Plešivica, west of Zagreb.",
    hr: "Obiteljska vinarija na Plešivici, zapadno od Zagreba.",
  },
  {
    slug: "bolfan", name: "Bolfan Vinski Vrh", alt: ["Bolfan"], region: C, subregion: "zagorje-medimurje",
    locations: [{ town: "Hraščina", municipality: "Hraščina", county: "Krapinsko-zagorska", lat: 46.081, lng: 15.962, precision: "approximate", source: "gmBolfan" }],
    website: "https://www.bolfan.hr", winemaker: "Tomislav Bolfan",
    grapes: [{ slug: "sauvignon" }, { slug: "rizling-rajnski" }, { slug: "pinot-crni" }],
    wines: [{ name: "Bolfan Rosé", type: "rose", source: "wamBolfan" }],
    facilities: [{ facility: "tasting", source: "wdBolfan" }, { facility: "restaurant", source: "gmBolfan" }],
    experiences: [{ kind: "tasting", name: { hr: "Degustacija ekoloških vina u kući vina Bolfan", en: "Ecological wine tasting at the Bolfan wine house" }, source: "wdBolfan" }],
    sources: ["tcnBolfan"], featured: 10,
    en: "Hillside winery and restaurant in Hraščina in Hrvatsko zagorje, known for ecologically farmed wines. Published addresses differ slightly, so confirm before visiting.",
    hr: "Vinarija i restoran na brežuljku u Hraščini u Hrvatskom zagorju, poznata po ekološki uzgojenim vinima. Objavljene adrese malo se razlikuju pa ih provjerite prije posjeta.",
  },
  {
    slug: "bodren", name: "Bodren", alt: ["Vinarija Bodren"], region: C, subregion: "zagorje-medimurje",
    locations: [{ town: "Hum na Sutli", municipality: "Hum na Sutli", county: "Krapinsko-zagorska", address: "Rusnica 64", postal: "49231", lat: 46.216, lng: 15.688, precision: "settlement", source: "pearlBodren" }],
    grapes: [{ slug: "chardonnay" }, { slug: "rizling-rajnski" }],
    wines: [{ name: "Chardonnay ledena berba", type: "dessert", grapes: ["chardonnay"], styles: ["ice_wine", "predicate"], source: "zelinaBodren" }],
    facilities: [{ facility: "by_appointment", source: "pearlBodren" }],
    sources: ["tcnBodren"],
    en: "Winery in Hum na Sutli in Hrvatsko zagorje, known for sweet predicate wines such as ice wine. Visits by arrangement.",
    hr: "Vinarija u Humu na Sutli u Hrvatskom zagorju, poznata po slatkim predikatnim vinima poput ledene berbe. Posjeti po dogovoru.",
  },
  {
    slug: "jakopic", name: "Vinarija Jakopić", alt: ["Jakopić"], region: C, subregion: "zagorje-medimurje",
    locations: [{ town: "Železna Gora", municipality: "Štrigova", county: "Međimurska", address: "Železna Gora 92", postal: "40312", lat: 46.49, lng: 16.3, precision: "approximate", source: "falstaffJakopic" }],
    family: true,
    grapes: [{ slug: "sauvignon", signature: true }, { slug: "pusipel" }],
    wines: [{ name: "Sauvignon", type: "white", grapes: ["sauvignon"], source: "falstaffJakopic" }],
    sources: ["falstaffJakopic"],
    en: "Family estate in Železna Gora near Štrigova, in the hills of Međimurje.",
    hr: "Obiteljsko imanje u Železnoj Gori kraj Štrigove, u međimurskim goricama.",
  },
  {
    slug: "florijanovic", name: "Florijanović", alt: ["Vinarija Florijanović"], region: C, subregion: "moslavina",
    locations: [{ town: "Potok", municipality: "Popovača", county: "Sisačko-moslavačka", lat: 45.542, lng: 16.675, precision: "approximate", source: "tasteFlorijanovic" }],
    owner: "Ivica Florijanović", family: true,
    grapes: [{ slug: "skrlet", signature: true }],
    wines: [{ name: "Škrlet", type: "white", grapes: ["skrlet"] }],
    sources: ["tasteFlorijanovic", "hrtSkrlet"],
    en: "Family winery with its cellar and vineyards in Potok (Popovača municipality), one of the producers promoting Moslavina's indigenous Škrlet.",
    hr: "Obiteljska vinarija s podrumom i vinogradima u Potoku (općina Popovača), jedan od proizvođača koji promiču moslavački autohtoni škrlet.",
  },
];
