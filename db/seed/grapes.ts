/**
 * Grape varieties. Descriptions are concise editorial drafts based on widely published
 * ampelographic knowledge; every entry is seeded as `unverified` with content status "draft"
 * so the UI shows it as awaiting expert review.
 */
type G = {
  slug: string; hr: string; en: string; synonyms?: string[];
  color: "white" | "red" | "grey"; origin: "indigenous" | "regional" | "international";
  parentage?: string; acidity?: number; tannin?: number; featured?: boolean;
  regions: string[];
  en_t: { summary: string; style: string; aroma?: string; pairing?: string };
  hr_t: { summary: string; style: string; aroma?: string; pairing?: string };
};

const D = "dalmacija", I = "hrvatska-istra-i-kvarner", S = "slavonija-i-hrvatsko-podunavlje", C = "sredisnja-bregovita-hrvatska";

export const GRAPES: G[] = [
  {
    slug: "plavac-mali", hr: "Plavac mali", en: "Plavac Mali", synonyms: ["Plavac", "Plavac mali crni"],
    color: "red", origin: "indigenous", parentage: "Tribidrag (Crljenak kaštelanski) × Dobričić — established by DNA profiling",
    acidity: 3, tannin: 5, featured: true, regions: [D],
    en_t: { summary: "Croatia's leading indigenous red variety, grown along the Dalmatian coast and islands. Its best-known sites are the steep seaward slopes of Pelješac, including Dingač and Postup.", style: "Full-bodied, often high in alcohol and tannin, with ripe dark fruit; capable of long ageing from top sites.", aroma: "Dried cherry, fig, carob, Mediterranean herbs and spice.", pairing: "Grilled and roasted meats, pašticada, lamb under the peka, hard cheeses." },
    hr_t: { summary: "Vodeća hrvatska autohtona crna sorta, uzgaja se duž dalmatinske obale i na otocima. Najpoznatiji su joj položaji na strmim morskim padinama Pelješca, uključujući Dingač i Postup.", style: "Puno tijelo, često visok alkohol i tanini, zrelo tamno voće; s vrhunskih položaja ima dug potencijal starenja.", aroma: "Sušena višnja, smokva, rogač, mediteransko bilje i začini.", pairing: "Meso s roštilja i pečeno meso, pašticada, janjetina ispod peke, tvrdi sirevi." },
  },
  {
    slug: "grasevina", hr: "Graševina", en: "Graševina", synonyms: ["Welschriesling", "Riesling Italico", "Olaszrizling", "Laški rizling"],
    color: "white", origin: "regional", acidity: 4, featured: true, regions: [S, C],
    en_t: { summary: "Croatia's most widely planted grape, the signature white of Slavonia and the Danube. It is made in every style from fresh and crisp to late-harvest, ice wine and botrytised sweet wines.", style: "Fresh acidity, medium body; richer and more complex from top sites and in predicate styles.", aroma: "Green apple, citrus, meadow flowers, almond.", pairing: "River fish, fiš paprikaš, poultry, mild cheeses; sweet versions with desserts." },
    hr_t: { summary: "Najraširenija sorta u Hrvatskoj i zaštitni znak Slavonije i Podunavlja. Proizvodi se u svim stilovima, od svježih i lakih do kasnih berbi, ledenih vina i plemenitih slatkih vina.", style: "Svježe kiseline, srednje tijelo; s vrhunskih položaja i u predikatnim stilovima punija i složenija.", aroma: "Zelena jabuka, citrusi, livadno cvijeće, badem.", pairing: "Riječna riba, fiš paprikaš, perad, blagi sirevi; slatke verzije uz deserte." },
  },
  {
    slug: "malvazija-istarska", hr: "Malvazija istarska", en: "Malvazija Istarska", synonyms: ["Istrian Malvasia", "Malvasia Istriana", "Malvazija"],
    color: "white", origin: "indigenous", acidity: 3, featured: true, regions: [I],
    en_t: { summary: "The principal white variety of Istria, made as fresh young wine, as barrel- or acacia-aged wine, and as long-macerated skin-contact wine.", style: "Medium body, gentle acidity, saline finish; gains texture with lees and skin contact.", aroma: "Acacia, apricot, pear, almond, Mediterranean herbs.", pairing: "Seafood, Istrian truffles, fuži and pasta, Kvarner scampi." },
    hr_t: { summary: "Glavna bijela sorta Istre, proizvodi se kao svježe mlado vino, kao vino odležano u bačvama od hrasta ili bagrema te kao dugo macerirano vino.", style: "Srednje tijelo, blage kiseline, slankast završetak; ležanjem na talogu i maceracijom dobiva na teksturi.", aroma: "Bagrem, marelica, kruška, badem, mediteransko bilje.", pairing: "Plodovi mora, istarski tartufi, fuži i tjestenina, kvarnerski škampi." },
  },
  {
    slug: "posip", hr: "Pošip", en: "Pošip", synonyms: ["Pošip bijeli"],
    color: "white", origin: "indigenous", acidity: 3, featured: true, regions: [D],
    en_t: { summary: "An indigenous white from the island of Korčula, especially the Čara–Smokvica area, now planted widely in Dalmatia. It was among the first Croatian white wines to receive protected origin status.", style: "Full-bodied, ripe and textured, with moderate acidity.", aroma: "Ripe apple, apricot, dried fig, citrus peel, almond.", pairing: "Grilled fish, black risotto, shellfish, white meats." },
    hr_t: { summary: "Autohtona bijela sorta s otoka Korčule, osobito s područja Čare i Smokvice, danas raširena po Dalmaciji. Bila je među prvim hrvatskim bijelim vinima zaštićena podrijetla.", style: "Puno tijelo, zrelost i tekstura, umjerene kiseline.", aroma: "Zrela jabuka, marelica, suha smokva, korica citrusa, badem.", pairing: "Riba sa žara, crni rižot, školjke, bijelo meso." },
  },
  {
    slug: "teran", hr: "Teran", en: "Teran", synonyms: ["Terrano"],
    color: "red", origin: "regional", acidity: 5, tannin: 3, featured: true, regions: [I],
    en_t: { summary: "Istria's traditional red variety, grown especially on the red soils of the peninsula.", style: "Deep colour, vivid high acidity and fresh red-to-dark fruit; serious aged versions are increasingly common.", aroma: "Blackberry, sour cherry, violet, pepper.", pairing: "Istrian pršut, game, boškarin beef, mushroom dishes." },
    hr_t: { summary: "Tradicionalna istarska crna sorta, uzgaja se osobito na crvenici poluotoka.", style: "Tamna boja, izražene visoke kiseline i svježe crveno do tamno voće; sve su češća ozbiljna odležana vina.", aroma: "Kupina, višnja, ljubičica, papar.", pairing: "Istarski pršut, divljač, boškarin, jela od gljiva." },
  },
  {
    slug: "babic", hr: "Babić", en: "Babić",
    color: "red", origin: "indigenous", acidity: 3, tannin: 4, featured: true, regions: [D],
    en_t: { summary: "The signature red of the Šibenik and Primošten coast, famous for vineyards planted in stone-walled mosaics on the karst.", style: "Medium to full body, firm tannins, savoury dark fruit.", aroma: "Plum, blackberry, dried herbs, earth.", pairing: "Dalmatian smoked ham, lamb, grilled meats, aged sheep cheese." },
    hr_t: { summary: "Zaštitna sorta šibensko-primoštenskog kraja, poznata po vinogradima u kamenim mozaicima na kršu.", style: "Srednje do puno tijelo, čvrsti tanini, slano tamno voće.", aroma: "Šljiva, kupina, suho bilje, zemlja.", pairing: "Dalmatinski pršut, janjetina, meso sa žara, zreli ovčji sir." },
  },
  {
    slug: "grk", hr: "Grk", en: "Grk",
    color: "white", origin: "indigenous", acidity: 3, featured: true, regions: [D],
    en_t: { summary: "A rare white grown almost exclusively around Lumbarda on Korčula, traditionally on sandy soils. Its flowers are functionally female, so it needs a pollinating variety planted nearby, often Plavac Mali.", style: "Dry, full and mineral, with a gently bitter finish.", aroma: "Citrus, sage, almond, sea salt.", pairing: "Shellfish, Adriatic fish, dishes with Mediterranean herbs." },
    hr_t: { summary: "Rijetka bijela sorta koja se uzgaja gotovo isključivo oko Lumbarde na Korčuli, tradicionalno na pjeskovitim tlima. Cvijet joj je funkcionalno ženski pa joj je potreban oprašivač u blizini, često plavac mali.", style: "Suho, puno i mineralno vino, s blago gorkastim završetkom.", aroma: "Citrusi, kadulja, badem, morska sol.", pairing: "Školjke, jadranska riba, jela s mediteranskim biljem." },
  },
  {
    slug: "skrlet", hr: "Škrlet", en: "Škrlet",
    color: "white", origin: "indigenous", acidity: 4, featured: true, regions: [C],
    en_t: { summary: "An indigenous white of Moslavina, promoted in recent years by an association of local family producers. Its name refers to the speckled appearance of its ripe berries.", style: "Light to medium body, fresh acidity, delicate.", aroma: "Green apple, citrus, white flowers, fresh herbs.", pairing: "Freshwater fish, Moslavina cheeses, light starters." },
    hr_t: { summary: "Autohtona bijela sorta Moslavine, koju posljednjih godina promiče udruga lokalnih obiteljskih proizvođača. Ime se odnosi na pjegav izgled zrelih bobica.", style: "Lagano do srednje tijelo, svježe kiseline, nježno.", aroma: "Zelena jabuka, citrusi, bijelo cvijeće, svježe bilje.", pairing: "Slatkovodna riba, moslavački sirevi, lagana predjela." },
  },
  {
    slug: "zlahtina", hr: "Žlahtina", en: "Žlahtina",
    color: "white", origin: "indigenous", acidity: 3, featured: true, regions: [I],
    en_t: { summary: "The white variety of the island of Krk, centred on the Vrbnik field.", style: "Light, fresh and easy-drinking; also used for sparkling wine.", aroma: "White flowers, green apple, citrus.", pairing: "Kvarner scampi, Krk lamb, šurlice pasta, sheep cheese." },
    hr_t: { summary: "Bijela sorta otoka Krka, sa središtem u Vrbničkom polju.", style: "Lagano, svježe i pitko vino; koristi se i za pjenušce.", aroma: "Bijelo cvijeće, zelena jabuka, citrusi.", pairing: "Kvarnerski škampi, krčka janjetina, šurlice, ovčji sir." },
  },
  {
    slug: "debit", hr: "Debit", en: "Debit", synonyms: ["Puljižanac"],
    color: "white", origin: "indigenous", acidity: 3, featured: true, regions: [D],
    en_t: { summary: "A traditional white of northern Dalmatia and the Dalmatian hinterland, especially around Šibenik, Skradin and Drniš.", style: "Fresh, medium-bodied, subtle; increasingly made with lees or skin contact.", aroma: "Yellow apple, quince, hay, almond.", pairing: "Dalmatian seafood starters, Drniš ham, fresh cheeses." },
    hr_t: { summary: "Tradicionalna bijela sorta sjeverne Dalmacije i Dalmatinske zagore, osobito oko Šibenika, Skradina i Drniša.", style: "Svježe, srednje tijelo, suptilno; sve češće ležanje na talogu ili maceracija.", aroma: "Žuta jabuka, dunja, sijeno, badem.", pairing: "Dalmatinska predjela od plodova mora, drniški pršut, svježi sirevi." },
  },
  {
    slug: "bogdanusa", hr: "Bogdanuša", en: "Bogdanuša",
    color: "white", origin: "indigenous", acidity: 3, featured: true, regions: [D],
    en_t: { summary: "An indigenous white of the island of Hvar, especially the Stari Grad plain. The name is usually explained as 'God-given'.", style: "Light, fresh and delicate.", aroma: "Citrus, white flowers, fresh herbs.", pairing: "Grilled white fish, octopus salad, Hvar gregada." },
    hr_t: { summary: "Autohtona bijela sorta otoka Hvara, osobito Starogradskog polja. Ime se najčešće tumači kao 'od Boga dana'.", style: "Lagano, svježe i nježno.", aroma: "Citrusi, bijelo cvijeće, svježe bilje.", pairing: "Bijela riba sa žara, salata od hobotnice, hvarska gregada." },
  },
  {
    slug: "tribidrag", hr: "Tribidrag", en: "Tribidrag", synonyms: ["Crljenak kaštelanski", "Pribidrag", "Kratošija", "Zinfandel", "Primitivo"],
    color: "red", origin: "indigenous", acidity: 3, tannin: 3, regions: [D],
    en_t: { summary: "A historic Dalmatian variety shown by DNA research to be identical to Zinfandel and Primitivo. The name Tribidrag appears in 15th-century records; it is a parent of Plavac Mali.", style: "Ripe, generous and fruit-forward.", aroma: "Blackberry, raspberry, plum, sweet spice.", pairing: "Barbecue, pasta with meat sauces, roasted vegetables." },
    hr_t: { summary: "Povijesna dalmatinska sorta za koju su DNK istraživanja pokazala da je istovjetna zinfandelu i primitivu. Ime tribidrag spominje se u zapisima iz 15. stoljeća; jedan je od roditelja plavca malog.", style: "Zrelo, izdašno i voćno.", aroma: "Kupina, malina, šljiva, slatki začini.", pairing: "Roštilj, tjestenina s mesnim umacima, pečeno povrće." },
  },
  {
    slug: "dobricic", hr: "Dobričić", en: "Dobričić",
    color: "red", origin: "indigenous", tannin: 4, regions: [D],
    en_t: { summary: "A rare red variety from the island of Šolta, known as one of the parents of Plavac Mali.", style: "Deeply coloured, tannic reds.", aroma: "Dark berries, herbs." },
    hr_t: { summary: "Rijetka crna sorta s otoka Šolte, poznata kao jedan od roditelja plavca malog.", style: "Tamno obojena, taninska crna vina.", aroma: "Tamne bobice, bilje." },
  },
  {
    slug: "muskat-momjanski", hr: "Muškat momjanski", en: "Muškat Momjanski", synonyms: ["Muscat of Momjan", "Muškat bijeli"],
    color: "white", origin: "regional", acidity: 3, regions: [I],
    en_t: { summary: "The traditional Muscat of Momjan in north-western Istria, a local expression of the white Muscat family.", style: "Made dry, off-dry and sweet; intensely aromatic.", aroma: "Rose, sage, orange blossom, grape.", pairing: "Fritule, fruit desserts, aromatic starters; dry versions with asparagus." },
    hr_t: { summary: "Tradicionalni muškat Momjana u sjeverozapadnoj Istri, lokalni izraz obitelji bijelih muškata.", style: "Suh, polusuh i sladak; izrazito aromatičan.", aroma: "Ruža, kadulja, cvijet naranče, grožđe.", pairing: "Fritule, voćni deserti, aromatična predjela; suhe verzije uz šparoge." },
  },
  {
    slug: "kujundzusa", hr: "Kujundžuša", en: "Kujundžuša",
    color: "white", origin: "indigenous", acidity: 3, regions: [D],
    en_t: { summary: "The traditional white of the Imotski area in the Dalmatian hinterland.", style: "Light, fresh and simple, with moderate alcohol.", aroma: "Green apple, citrus, meadow herbs." },
    hr_t: { summary: "Tradicionalna bijela sorta imotskog kraja u Dalmatinskoj zagori.", style: "Lagano, svježe i jednostavno, umjerenog alkohola.", aroma: "Zelena jabuka, citrusi, livadno bilje." },
  },
  {
    slug: "vugava", hr: "Vugava", en: "Vugava",
    color: "white", origin: "indigenous", acidity: 2, regions: [D],
    en_t: { summary: "The signature white of the island of Vis.", style: "Full-bodied and aromatic, with moderate acidity and often high alcohol.", aroma: "Apricot, honey, dried herbs, exotic fruit.", pairing: "Viška pogača, lobster, grilled fish." },
    hr_t: { summary: "Zaštitna bijela sorta otoka Visa.", style: "Puno tijelo i aromatičnost, umjerene kiseline, često visok alkohol.", aroma: "Marelica, med, suho bilje, egzotično voće.", pairing: "Viška pogača, jastog, riba sa žara." },
  },
  {
    slug: "marastina", hr: "Maraština", en: "Maraština", synonyms: ["Rukatac", "Malvasia Bianca Lunga"],
    color: "white", origin: "regional", acidity: 2, regions: [D],
    en_t: { summary: "A widely grown Dalmatian white, known as Rukatac on Korčula and identified by DNA as Malvasia Bianca Lunga.", style: "Medium to full body, soft acidity.", aroma: "Ripe pear, almond, Mediterranean herbs." },
    hr_t: { summary: "Raširena dalmatinska bijela sorta, na Korčuli poznata kao rukatac, a DNK analizom identificirana kao Malvasia bianca lunga.", style: "Srednje do puno tijelo, mekane kiseline.", aroma: "Zrela kruška, badem, mediteransko bilje." },
  },
  {
    slug: "malvasija-dubrovacka", hr: "Malvasija dubrovačka", en: "Malvasija Dubrovačka", synonyms: ["Dubrovnik Malvasia", "Malvasia di Lipari"],
    color: "white", origin: "regional", regions: [D],
    en_t: { summary: "A historic white of the Dubrovnik area and Konavle, revived by local growers. DNA research links it to Malvasia di Lipari.", style: "Dry and sweet styles, aromatic and rich.", aroma: "Apricot, orange peel, honey, flowers." },
    hr_t: { summary: "Povijesna bijela sorta dubrovačkog kraja i Konavala, koju su obnovili lokalni vinogradari. DNK istraživanja povezuju je s Malvasijom di Lipari.", style: "Suhi i slatki stilovi, aromatična i puna.", aroma: "Marelica, kora naranče, med, cvijeće." },
  },
  {
    slug: "lasin", hr: "Lasin", en: "Lasin", color: "red", origin: "indigenous", regions: [D],
    en_t: { summary: "A traditional red of northern Dalmatia.", style: "Light to medium-bodied reds." },
    hr_t: { summary: "Tradicionalna crna sorta sjeverne Dalmacije.", style: "Lagana do srednje puna crna vina." },
  },
  {
    slug: "plavina", hr: "Plavina", en: "Plavina", color: "red", origin: "indigenous", regions: [D],
    en_t: { summary: "A Dalmatian red variety, widely planted in northern Dalmatia and often blended.", style: "Light, fruity reds and rosés." },
    hr_t: { summary: "Dalmatinska crna sorta, raširena u sjevernoj Dalmaciji, često u kupažama.", style: "Lagana, voćna crna vina i rosé." },
  },
  {
    slug: "pusipel", hr: "Pušipel", en: "Pušipel", synonyms: ["Furmint", "Šipon", "Moslavac"],
    color: "white", origin: "regional", acidity: 5, regions: [C],
    en_t: { summary: "The Međimurje name for Furmint, promoted as the region's signature white.", style: "Bright, high-acid whites from fresh to barrel-aged and sweet.", aroma: "Lime, green apple, quince, smoke." },
    hr_t: { summary: "Međimursko ime za furmint, koji se promiče kao zaštitna bijela sorta kraja.", style: "Živahna bijela vina visokih kiselina, od svježih do odležanih u bačvi i slatkih.", aroma: "Limeta, zelena jabuka, dunja, dimnost." },
  },
  {
    slug: "kraljevina", hr: "Kraljevina", en: "Kraljevina", color: "grey", origin: "regional", regions: [C],
    en_t: { summary: "A pink-skinned traditional variety of the hills around Zagreb, especially Prigorje and Zelina.", style: "Light, low-alcohol, refreshing whites." },
    hr_t: { summary: "Tradicionalna sorta ružičaste kožice s brežuljaka oko Zagreba, osobito Prigorja i Zeline.", style: "Lagana, osvježavajuća bijela vina nižeg alkohola." },
  },
  {
    slug: "sansigot", hr: "Sansigot", en: "Sansigot", color: "red", origin: "indigenous", regions: [I],
    en_t: { summary: "A rare red variety of the Kvarner islands, historically associated with Susak.", style: "Light to medium reds." },
    hr_t: { summary: "Rijetka crna sorta kvarnerskih otoka, povijesno vezana uz Susak.", style: "Lagana do srednje puna crna vina." },
  },
  {
    slug: "frankovka", hr: "Frankovka", en: "Frankovka", synonyms: ["Blaufränkisch", "Lemberger", "Kékfrankos"],
    color: "red", origin: "international", acidity: 4, tannin: 3, regions: [S, C],
    en_t: { summary: "A Central European red with a long tradition in continental Croatia.", style: "Fresh acidity, spicy dark fruit, medium body." },
    hr_t: { summary: "Srednjoeuropska crna sorta s dugom tradicijom u kontinentalnoj Hrvatskoj.", style: "Svježe kiseline, začinsko tamno voće, srednje tijelo." },
  },
  {
    slug: "portugizac", hr: "Portugizac", en: "Portugieser", synonyms: ["Portugizac crni", "Blauer Portugieser"],
    color: "red", origin: "international", regions: [C],
    en_t: { summary: "A Central European red traditionally associated with Plešivica, where it is often released young.", style: "Light, fruity reds for early drinking." },
    hr_t: { summary: "Srednjoeuropska crna sorta tradicionalno vezana uz Plešivicu, gdje se često puni kao mlado vino.", style: "Lagana, voćna crna vina za ranu konzumaciju." },
  },
  {
    slug: "traminac", hr: "Traminac", en: "Traminer", synonyms: ["Gewürztraminer", "Traminac mirisavi", "Savagnin rose"],
    color: "grey", origin: "international", regions: [S, C],
    en_t: { summary: "An aromatic variety with a long tradition in continental Croatia, especially Ilok.", style: "Dry to sweet, full and perfumed." },
    hr_t: { summary: "Aromatična sorta s dugom tradicijom u kontinentalnoj Hrvatskoj, osobito u Iloku.", style: "Od suhog do slatkog, puno i mirisno." },
  },
  {
    slug: "chardonnay", hr: "Chardonnay", en: "Chardonnay", color: "white", origin: "international", regions: [S, C, I, D],
    en_t: { summary: "An international white grown throughout Croatia, important for still and sparkling wines.", style: "From crisp and unoaked to rich and barrel-aged." },
    hr_t: { summary: "Međunarodna bijela sorta raširena po cijeloj Hrvatskoj, važna za mirna vina i pjenušce.", style: "Od svježeg i neodležanog do punog i odležanog u bačvi." },
  },
  {
    slug: "sauvignon", hr: "Sauvignon bijeli", en: "Sauvignon Blanc", synonyms: ["Sauvignon"],
    color: "white", origin: "international", acidity: 4, regions: [C, S],
    en_t: { summary: "An aromatic international white that performs well in the cooler hills of continental Croatia.", style: "Crisp, aromatic whites." },
    hr_t: { summary: "Aromatična međunarodna bijela sorta koja se dobro snalazi u hladnijim brežuljcima kontinentalne Hrvatske.", style: "Svježa, aromatična bijela vina." },
  },
  {
    slug: "rizling-rajnski", hr: "Rizling rajnski", en: "Riesling", synonyms: ["Rajnski rizling"], color: "white", origin: "international", acidity: 5, regions: [S, C],
    en_t: { summary: "The noble German variety, grown in continental Croatia.", style: "High-acid whites, dry to sweet." },
    hr_t: { summary: "Plemenita njemačka sorta koja se uzgaja u kontinentalnoj Hrvatskoj.", style: "Bijela vina visokih kiselina, od suhih do slatkih." },
  },
  {
    slug: "pinot-crni", hr: "Pinot crni", en: "Pinot Noir", color: "red", origin: "international", regions: [C, S],
    en_t: { summary: "Grown in continental Croatia for still reds and traditional-method sparkling wines.", style: "Light-bodied, elegant reds; base wine for sparkling." },
    hr_t: { summary: "Uzgaja se u kontinentalnoj Hrvatskoj za mirna crna vina i pjenušce klasične metode.", style: "Lagana, elegantna crna vina; bazno vino za pjenušce." },
  },
  {
    slug: "merlot", hr: "Merlot", en: "Merlot", color: "red", origin: "international", regions: [I, S, D],
    en_t: { summary: "An international red grown across Croatia, often blended with Cabernet Sauvignon or local varieties.", style: "Soft, plummy reds." },
    hr_t: { summary: "Međunarodna crna sorta raširena po Hrvatskoj, često u kupaži s cabernet sauvignonom ili domaćim sortama.", style: "Mekana crna vina s notama šljive." },
  },
  {
    slug: "cabernet-sauvignon", hr: "Cabernet sauvignon", en: "Cabernet Sauvignon", color: "red", origin: "international", tannin: 4, regions: [I, S, D],
    en_t: { summary: "Grown in all four Croatian regions, as a varietal wine and in blends.", style: "Structured, tannic reds." },
    hr_t: { summary: "Uzgaja se u sve četiri hrvatske regije, kao sortno vino i u kupažama.", style: "Strukturirana, taninska crna vina." },
  },
  {
    slug: "syrah", hr: "Syrah", en: "Syrah", synonyms: ["Shiraz"], color: "red", origin: "international", tannin: 4, regions: [D],
    en_t: { summary: "A Rhône variety that has found a home in warm northern Dalmatian vineyards.", style: "Dark, spicy, full-bodied reds." },
    hr_t: { summary: "Sorta iz doline Rhône koja je našla dom u toplim vinogradima sjeverne Dalmacije.", style: "Tamna, začinska crna vina punog tijela." },
  },
];
