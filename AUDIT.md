# Content audit — facts, sources and open items

**Status: v1, built without direct access to vicelic.hr.**
The build environment's network policy blocked `vicelic.hr`, including archive and cache mirrors. The facts below come from search-engine copies of vicelic.hr pages. Where the only source was third-party, the fact is flagged. Nothing was invented. Anything not found is left as an empty slot in the layout, not filled with placeholder "facts".

Open any page with `?audit` in the URL (e.g. `/en/dingac/?audit`) and every item still marked `verify` gets a dashed orange outline.

## ✅ Taken from vicelic.hr (search-index copy)

| Fact | Used on |
|---|---|
| Located on the slopes of Dingač, Pelješac peninsula | everywhere |
| Wines made exclusively from Plavac Mali, on steep, sun-exposed vineyards | home, story, wines |
| No pesticides, herbicides or artificial fertilizers | home, philosophy, Dingač |
| Spontaneous fermentation, wild (autochthonous) yeasts only, no added enzymes or artificial additives, minimal intervention "allowing the character of Dingač and each vintage to express itself fully" | home, Dingač, story |
| "Certified Organic Wines" (site title) | home, story |
| **Dingač tasting:** black cherry, plum, dried fig, Mediterranean herbs, wild sage, dried lavender; with age dark chocolate, tobacco, sweet spices; mineral notes from rocky, sun-exposed slopes | home flagship, Dingač, product |
| **Opolo rosé:** pale salmon; wild strawberries, rose petals, citrus peel, Mediterranean herbs; crisp, juicy red berries, mineral backbone | Opolo, product |
| **Opolo vineyard:** Plavac Mali, plots selected for rosé; limestone and red soil, well-drained terraces; 0.8 ha; rootstock Richter 110 | Opolo, product |
| **Opolo cellar:** hand-picked and sorted; brief skin contact; wild yeasts in temperature-controlled stainless steel; 4–6 months on fine lees; 2,500 bottles (416 cases) | Opolo, product, philosophy |
| Owner: Obitelj Vicelić · Winemaker: Mateo Vicelić | home, story, contact, legal |
| Pijavičino 33, 20243 Kuna · 095 396 81 14 · mvicelic@gmail.com · OIB 41630406160 | contact, footer, schema |
| A "Private wine tasting experience" is offered | home, experience |

## ⚠️ Needs confirmation (`data-verify`)

| Item | Current value | Why flagged |
|---|---|---|
| Vineyard area | 3.5 ha | third-party (winetourism.com, grapenomad) |
| Dingač rootstock / density / training | Richter 110 · 10,000 vines/ha · en gobelet | on vicelic.hr, but not clearly tied to a specific wine (Opolo is listed at 9,000/ha) |
| Dingač barrels | 225 L French + American oak, 50% new / 50% used | on vicelic.hr, wine attribution unclear |
| Plavac Mali cellar | 225 L used French/American oak · 10–12 months · 3,500 bottles | on vicelic.hr, wine attribution unclear |
| Plavac Mali tasting | "Lots of red fruit and herbal aromas. Minimum tannins. Very easy drinking… served chilled, ideally with tuna steak." | quoted via third party |
| Opolo planting density | 9,000 vines/ha | attribution unclear |
| Hand harvest (Dingač / Plavac) | "by hand" | third-party; Opolo's is confirmed |
| Organic certification year | 2017 | third-party |
| Family history | 1935, great-grandfather, export to Prague, WWII halt, replanting | third-party (winetourism.com) |
| "Most vineyards lie within Dingač" | — | third-party (grapenomad) |
| Dingač serving | 18 °C, Burgundy glass | third-party |
| Experience content | guided tasting in the vineyards, sea views, family story and philosophy | third-party (winedering, winetourism) |
| WhatsApp | same number as the phone | confirm the number is on WhatsApp |
| Map / schema coordinates | 42.945 N, 17.36 E | approximate |

Third-party claims deliberately **not** used: the Berry Bros. & Rudd listing, press mentions (Decanter etc.), total annual production (sources disagree: 10,000 / 10–15,000 / 20,000 bottles).

## ⬜ Missing — slots exist, fill in `src/content.mjs`

- **Prices** (`wines.*.price`). Until they are set, the site shows "Price on request" and the cart sends an order by email or WhatsApp. Product schema adds `offers` automatically once a price exists.
- **Vintages** (`wines.*.vintage`)
- **Dingač:** soil, vineyard area, ageing duration, production quantity, cellaring window, food pairing
- **Plavac Mali:** site, soil, cellaring, serving temperature
- **Opolo:** serving temperature, pairing
- **Experience:** duration, number of wines, group size, price (shown as "To be announced")
- **Terms of sale & privacy policy:** the seller block is filled in; the section wording has to be copied from the current site
- **Stripe:** set `wines.*.stripe` to a Stripe Payment Link and a "Buy now" button appears. A full Stripe Checkout cart needs a small serverless function (the current Stripe setup could not be inspected).
- **Instagram URL** (`site.instagram`)
- **All photography** — see `assets/photos/README.md`. Bottle images are drawn placeholders until packshots are added.
