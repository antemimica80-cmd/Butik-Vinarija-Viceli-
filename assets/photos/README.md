# Photography slots

Drop a high-resolution file (JPG, PNG, WebP or TIFF; at least 2400 px on the long edge) here, named after its slot, then run `npm run build`. The pipeline creates AVIF, WebP and JPG at 480–2200 px, adds a blurred placeholder, and preloads hero images.

Until a slot has a photo, the page shows an art-directed tonal placeholder with a small caption naming the picture that belongs there.

| File | Where it appears | Ideal subject | Crop |
|---|---|---|---|
| `hero.jpg` | Home hero, Dingač hero, social card | **The strongest picture you have:** Dingač slopes falling to the sea | landscape, full-bleed; keep text space bottom-left |
| `slope.jpg` | Home "Dingač" full screen, Dingač ch. I, experience | Steep terraces, stone walls | landscape |
| `stone.jpg` | Home "Why Dingač", Dingač terroir | Stone / red soil detail, close up | portrait 4:5 |
| `vines.jpg` | Flagship, Dingač viticulture, story | Old bush vines (gobelet) | landscape 3:2 |
| `grapes.jpg` | Wines, story, experience | Plavac Mali clusters | portrait |
| `harvest.jpg` | Dingač cellar chapter, story | Hands picking, crates | landscape |
| `cellar.jpg` | Flagship, Dingač, story quote | Barrels, cellar light | portrait 3:4 |
| `family.jpg` | Home people, story hero | Mateo / the family in the vineyard | portrait (also used full-bleed) |
| `tasting.jpg` | Experience hero, experience banner | A tasting table among the vines, sea behind | landscape |
| `table.jpg` | Experience gallery | Wine and food | portrait |
| `summer.jpg` | Opolo hero | Bright summer light, pale tones | landscape |
| `finale.jpg` | Closing image on long pages | Dusk over Dingač / the Adriatic | landscape |
| `bottle-dingac.png` | Every Dingač bottle position | Packshot on **transparent** background | portrait, bottle upright |
| `bottle-plavac-mali.png` | — | Packshot, transparent | — |
| `bottle-opolo-rose.png` | — | Packshot, transparent | — |

Alt text for each slot lives in `src/content.mjs → photos` (HR + EN). Update it if the picture changes.
