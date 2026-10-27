/**
 * Official viticultural geography of Croatia.
 *
 * Regions and subregions follow "Pravilnik o zemljopisnim područjima uzgoja vinove loze"
 * (NN 76/2019), whose structure is carried into "Pravilnik o vinogradarstvu" (NN 81/2022, with
 * district lists in its annex). Only districts (vinogorja) needed by the launch dataset are
 * seeded, and each is flagged for verification against the current annex. No boundary
 * geometry is seeded: boundaries must come from an authoritative GIS source (see
 * docs/GEOMETRY.md and `npm run import:geometry`).
 */

export type L = { hr: string; en: string };

export const SOURCES = {
  nn2022: {
    name: "Pravilnik o vinogradarstvu (NN 81/2022)",
    url: "https://narodne-novine.nn.hr/clanci/sluzbeni/2022_07_81_1184.html",
    kind: "official_regulation",
    publisher: "Narodne novine / Ministarstvo poljoprivrede",
    notes: "Current rulebook (replaced NN 76/2019). Regions and subregions were confirmed via a secondary summary of NN 76/2019; an editor must confirm them and the vinogorja lists against the official annex.",
  },
  nn2019: {
    name: "Pravilnik o zemljopisnim područjima uzgoja vinove loze (NN 76/2019)",
    url: "https://narodne-novine.nn.hr/clanci/sluzbeni/2019_08_76_1603.html",
    kind: "official_regulation",
    publisher: "Narodne novine / Ministarstvo poljoprivrede",
    notes: "Established the four regions and twelve subregions. Repealed and replaced by NN 81/2022.",
  },
  nn2019b: {
    name: "Narodne novine 32/2019 (referenced in project brief)",
    url: "https://narodne-novine.nn.hr/clanci/sluzbeni/2019_03_32_641.html",
    kind: "official_regulation",
    publisher: "Narodne novine",
    notes: "Referenced by the project brief; content not yet reviewed by an editor.",
  },
} as const;

export const REGIONS: {
  slug: string; official: string; name: L; color: string; sort: number;
  content: Record<"hr" | "en", Record<string, string>>;
}[] = [
  {
    slug: "dalmacija",
    official: "Dalmacija",
    name: { hr: "Dalmacija", en: "Dalmatia" },
    color: "#792E39",
    sort: 1,
    content: {
      en: {
        tagline: "Limestone, sun and sea: the land of Plavac Mali.",
        intro: "Dalmatia stretches along the Adriatic coast from the hinterland of Zadar to Konavle, south of Dubrovnik, and includes islands such as Brač, Hvar, Korčula and Vis. Vineyards climb karst slopes and terraces, often within sight of the sea.",
        climate: "Mediterranean: hot, dry summers and mild, wet winters, with strong sunlight reflected from the sea and the limestone.",
        soil: "Predominantly karst limestone with pockets of red soil (terra rossa); many vineyards are planted on stony, steep or terraced ground.",
        varieties: "Plavac Mali is the leading red variety. Notable whites include Pošip, Grk, Bogdanuša, Vugava, Debit and Maraština; Babić is the signature red of the Šibenik–Primošten coast.",
        styles: "Structured, sun-ripened reds from Plavac Mali; aromatic, textured island whites; traditional dessert wine Prošek.",
      },
      hr: {
        tagline: "Vapnenac, sunce i more: zemlja plavca malog.",
        intro: "Dalmacija se proteže uz jadransku obalu od zadarskog zaleđa do Konavala južno od Dubrovnika, a obuhvaća i otoke poput Brača, Hvara, Korčule i Visa. Vinogradi se penju krškim padinama i terasama, često s pogledom na more.",
        climate: "Mediteranska: vruća i suha ljeta te blage, vlažne zime, uz snažno sunce koje se odbija od mora i kamena.",
        soil: "Pretežno krški vapnenac s džepovima crvenice (terra rossa); mnogi su vinogradi na kamenitim, strmim ili terasiranim položajima.",
        varieties: "Vodeća crna sorta je plavac mali. Među bijelim sortama ističu se pošip, grk, bogdanuša, vugava, debit i maraština, a babić je zaštitni znak šibensko-primoštenskog kraja.",
        styles: "Strukturirana, suncem zrela crna vina od plavca malog; aromatična, punija otočna bijela vina; tradicionalni desertni prošek.",
      },
    },
  },
  {
    slug: "hrvatska-istra-i-kvarner",
    official: "Hrvatska Istra i Kvarner",
    name: { hr: "Hrvatska Istra i Kvarner", en: "Croatian Istria & Kvarner" },
    color: "#2E5E6E",
    sort: 2,
    content: {
      en: {
        tagline: "Red earth, grey flysch and the home of Malvazija.",
        intro: "The Istrian peninsula and the Kvarner coast and islands form Croatia's north-western wine region. Istria is known for Malvazija Istarska and Teran; on the island of Krk, Vrbnik is the home of Žlahtina.",
        climate: "Sub-Mediterranean on the coast, becoming cooler and more continental in the hilly interior, with the bura wind influencing Kvarner.",
        soil: "Istrian growers traditionally distinguish red soil (terra rossa) near the coast, grey flysch and marl in the interior, and white limestone in the north-east.",
        varieties: "Malvazija Istarska is the region's principal white variety, with Teran, Muškat Momjanski, Borgonja and international varieties. Žlahtina dominates around Vrbnik on Krk.",
        styles: "Fresh and aged Malvazija, macerated (skin-contact) whites, Teran reds and sweet Muscats.",
      },
      hr: {
        tagline: "Crvena zemlja, sivi fliš i dom malvazije.",
        intro: "Istarski poluotok te kvarnersko primorje i otoci čine sjeverozapadnu vinogradarsku regiju Hrvatske. Istra je poznata po malvaziji istarskoj i teranu, a na otoku Krku Vrbnik je dom žlahtine.",
        climate: "Submediteranska na obali, a u brdovitoj unutrašnjosti hladnija i kontinentalnija; na Kvarneru snažan utjecaj ima bura.",
        soil: "Istarski vinogradari tradicionalno razlikuju crvenicu uz obalu, sivi fliš i lapor u unutrašnjosti te bijeli vapnenac na sjeveroistoku.",
        varieties: "Malvazija istarska glavna je bijela sorta, uz teran, muškat momjanski, borgonju i međunarodne sorte. Oko Vrbnika na Krku prevladava žlahtina.",
        styles: "Svježe i odležane malvazije, maceracijska bijela vina, teran te slatki muškati.",
      },
    },
  },
  {
    slug: "slavonija-i-hrvatsko-podunavlje",
    official: "Slavonija i hrvatsko Podunavlje",
    name: { hr: "Slavonija i hrvatsko Podunavlje", en: "Slavonia & Croatian Danube" },
    color: "#9A7A45",
    sort: 3,
    content: {
      en: {
        tagline: "Rolling continental hills and the heartland of Graševina.",
        intro: "Eastern Croatia's wine region spans Slavonia's hill ranges and the Danube areas of Srijem, Erdut and Baranja. It is the heartland of Graševina, Croatia's most widely planted variety.",
        climate: "Continental: cold winters and warm to hot summers.",
        soil: "Loess, clay and alluvial soils on gentle slopes; the Kutjevo area lies on the slopes of the Krndija hills.",
        varieties: "Graševina leads, alongside Traminac (notably around Ilok), Frankovka, Chardonnay, Sauvignon Blanc, Pinot varieties, Merlot and Cabernet Sauvignon.",
        styles: "Crisp to rich dry whites, late-harvest and predicate sweet wines, and structured continental reds.",
      },
      hr: {
        tagline: "Valoviti kontinentalni brežuljci i srce graševine.",
        intro: "Vinogradarska regija istočne Hrvatske obuhvaća slavonska gorja te podunavska područja Srijema, Erduta i Baranje. Ovo je srce graševine, najraširenije sorte u Hrvatskoj.",
        climate: "Kontinentalna: hladne zime i topla do vruća ljeta.",
        soil: "Prapor (les), glina i aluvijalna tla na blagim padinama; kutjevačko vinogorje leži na obroncima Krndije.",
        varieties: "Prednjači graševina, uz traminac (posebno oko Iloka), frankovku, chardonnay, sauvignon, pinote, merlot i cabernet sauvignon.",
        styles: "Svježa do puna suha bijela vina, kasne berbe i predikatna slatka vina te strukturirana kontinentalna crna vina.",
      },
    },
  },
  {
    slug: "sredisnja-bregovita-hrvatska",
    official: "Središnja bregovita Hrvatska",
    name: { hr: "Središnja bregovita Hrvatska", en: "Central Croatian Uplands" },
    color: "#4F6B3A",
    sort: 4,
    content: {
      en: {
        tagline: "Hillside vineyards from Zagorje to Moslavina.",
        intro: "The hilly heart of Croatia surrounds Zagreb and reaches north to Zagorje and Međimurje, west to Plešivica and east to Moslavina. Family wineries, wine roads and hillside cellars define the landscape.",
        climate: "Cool continental, with significant day–night temperature differences that favour fresh, aromatic wines.",
        soil: "Varied hill soils including marl, clay and sandstone; Plešivica is known for its limestone-rich slopes.",
        varieties: "Graševina, Sauvignon Blanc, Chardonnay, Pinot varieties, Pušipel (Furmint) in Međimurje, Škrlet in Moslavina, Kraljevina in Prigorje and Portugizac at Plešivica.",
        styles: "Fresh aromatic whites, traditional-method sparkling wines (especially Plešivica), and sweet predicate wines.",
      },
      hr: {
        tagline: "Vinogradi na obroncima od Zagorja do Moslavine.",
        intro: "Brdovito srce Hrvatske okružuje Zagreb i seže na sjever do Zagorja i Međimurja, na zapad do Plešivice i na istok do Moslavine. Krajolik određuju obiteljske vinarije, vinske ceste i klijeti na obroncima.",
        climate: "Hladnija kontinentalna, sa značajnim razlikama dnevnih i noćnih temperatura koje pogoduju svježim, aromatičnim vinima.",
        soil: "Raznolika brdska tla, uključujući lapor, glinu i pješčenjak; Plešivica je poznata po vapnenačkim padinama.",
        varieties: "Graševina, sauvignon, chardonnay, pinoti, pušipel (moslavac/šipon) u Međimurju, škrlet u Moslavini, kraljevina u Prigorju i portugizac na Plešivici.",
        styles: "Svježa aromatična bijela vina, pjenušci proizvedeni klasičnom metodom (osobito na Plešivici) te slatka predikatna vina.",
      },
    },
  },
];

export const SUBREGIONS: { region: string; slug: string; official: string; name: L; sort: number }[] = [
  { region: "slavonija-i-hrvatsko-podunavlje", slug: "hrvatsko-podunavlje", official: "Hrvatsko Podunavlje", name: { hr: "Hrvatsko Podunavlje", en: "Croatian Danube" }, sort: 1 },
  { region: "slavonija-i-hrvatsko-podunavlje", slug: "slavonija", official: "Slavonija", name: { hr: "Slavonija", en: "Slavonia" }, sort: 2 },
  { region: "sredisnja-bregovita-hrvatska", slug: "moslavina", official: "Moslavina", name: { hr: "Moslavina", en: "Moslavina" }, sort: 1 },
  { region: "sredisnja-bregovita-hrvatska", slug: "prigorje-bilogora", official: "Prigorje – Bilogora", name: { hr: "Prigorje – Bilogora", en: "Prigorje – Bilogora" }, sort: 2 },
  { region: "sredisnja-bregovita-hrvatska", slug: "zagorje-medimurje", official: "Zagorje – Međimurje", name: { hr: "Zagorje – Međimurje", en: "Zagorje – Međimurje" }, sort: 3 },
  { region: "sredisnja-bregovita-hrvatska", slug: "plesivica", official: "Plešivica", name: { hr: "Plešivica", en: "Plešivica" }, sort: 4 },
  { region: "sredisnja-bregovita-hrvatska", slug: "pokuplje", official: "Pokuplje", name: { hr: "Pokuplje", en: "Pokuplje" }, sort: 5 },
  { region: "hrvatska-istra-i-kvarner", slug: "hrvatska-istra", official: "Hrvatska Istra", name: { hr: "Hrvatska Istra", en: "Croatian Istria" }, sort: 1 },
  { region: "hrvatska-istra-i-kvarner", slug: "kvarner-i-hrvatsko-primorje", official: "Kvarner i Hrvatsko primorje", name: { hr: "Kvarner i Hrvatsko primorje", en: "Kvarner & Croatian Littoral" }, sort: 2 },
  { region: "dalmacija", slug: "sjeverna-dalmacija", official: "Sjeverna Dalmacija", name: { hr: "Sjeverna Dalmacija", en: "Northern Dalmatia" }, sort: 1 },
  { region: "dalmacija", slug: "dalmatinska-zagora", official: "Dalmatinska zagora", name: { hr: "Dalmatinska zagora", en: "Dalmatian Hinterland" }, sort: 2 },
  { region: "dalmacija", slug: "srednja-i-juzna-dalmacija", official: "Srednja i Južna Dalmacija", name: { hr: "Srednja i Južna Dalmacija", en: "Central & Southern Dalmatia" }, sort: 3 },
];

/** Districts flagged `confirmed: true` were confirmed by a secondary summary of NN 76/2019. */
export const DISTRICTS: { subregion: string; slug: string; official: string; name: L; confirmed: boolean }[] = [
  { subregion: "hrvatsko-podunavlje", slug: "srijem", official: "Srijem", name: { hr: "Srijem", en: "Srijem" }, confirmed: true },
  { subregion: "hrvatsko-podunavlje", slug: "erdut", official: "Erdut", name: { hr: "Erdut", en: "Erdut" }, confirmed: true },
  { subregion: "hrvatsko-podunavlje", slug: "baranja", official: "Baranja", name: { hr: "Baranja", en: "Baranja" }, confirmed: true },
  { subregion: "slavonija", slug: "kutjevo", official: "Kutjevo", name: { hr: "Kutjevo", en: "Kutjevo" }, confirmed: false },
  { subregion: "srednja-i-juzna-dalmacija", slug: "peljesac", official: "Pelješac", name: { hr: "Pelješac", en: "Pelješac" }, confirmed: false },
  { subregion: "srednja-i-juzna-dalmacija", slug: "korcula", official: "Korčula", name: { hr: "Korčula", en: "Korčula" }, confirmed: false },
  { subregion: "srednja-i-juzna-dalmacija", slug: "hvar", official: "Hvar", name: { hr: "Hvar", en: "Hvar" }, confirmed: false },
  { subregion: "srednja-i-juzna-dalmacija", slug: "vis", official: "Vis", name: { hr: "Vis", en: "Vis" }, confirmed: false },
];

export const VINEYARD_SITES: { district: string; slug: string; official: string; name: L; content: Record<"hr" | "en", Record<string, string>> }[] = [
  {
    district: "peljesac",
    slug: "dingac",
    official: "Dingač",
    name: { hr: "Dingač", en: "Dingač" },
    content: {
      en: {
        intro: "Dingač is a steep, south-west-facing stretch of the Pelješac peninsula's coastal slope, planted with Plavac Mali on limestone scree above the sea. It is widely cited as the first Croatian wine origin to receive protected status, in 1961.",
        terroir: "Very steep slopes, intense sunlight reflected from the sea and the stone, and poor, rocky soils produce concentrated, powerful Plavac Mali.",
      },
      hr: {
        intro: "Dingač je strmi, prema jugozapadu okrenuti dio priobalnih padina poluotoka Pelješca, zasađen plavcem malim na vapnenačkom kamenjaru iznad mora. Često se navodi kao prvo hrvatsko vinsko podrijetlo koje je dobilo zaštitu, 1961. godine.",
        terroir: "Vrlo strme padine, snažno sunce koje se odbija od mora i kamena te siromašna, kamenita tla daju koncentriran i snažan plavac mali.",
      },
    },
  },
  {
    district: "peljesac",
    slug: "postup",
    official: "Postup",
    name: { hr: "Postup", en: "Postup" },
    content: {
      en: {
        intro: "Postup is a historic Plavac Mali vineyard site on the seaward slopes of the Pelješac peninsula, west of Dingač, and one of Croatia's earliest protected wine origins.",
        terroir: "Steep coastal slopes with limestone soils and strong maritime exposure.",
      },
      hr: {
        intro: "Postup je povijesni položaj plavca malog na morskim padinama poluotoka Pelješca, zapadno od Dingača, i jedno od najranije zaštićenih vinskih podrijetla u Hrvatskoj.",
        terroir: "Strme priobalne padine s vapnenačkim tlima i snažnom izloženošću moru.",
      },
    },
  },
];
