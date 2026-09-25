/**
 * Every photograph / video on the site is a named slot.
 * REAL PHOTOGRAPHY ONLY — never AI-generated imagery.
 *
 * To fill a slot: put the file in /public/media/ and set `src` (e.g. '/media/hero-ridge.jpg').
 * Until then a neutral placeholder with the art-direction label is rendered.
 * This file doubles as the photographer's shot list.
 */
import type { ImageSlotDef } from '../src/lib/content-schema';

export const imageSlots = {
  'hero-video': {
    kind: 'video',
    ratio: '16/9',
    mobileRatio: '4/5',
    tone: 'shade',
    shot: 'Dingač slope from the ridge down to the sea, slow drone descent or locked-off wide. Muted, looping, 12–20 s.',
    light: 'First light or last light — long shadows across the white stone.',
    alt: {
      en: 'The Dingač slope falling steeply from the ridge to the Adriatic at dawn.',
      hr: 'Obronak Dingača koji se strmo spušta od grebena do Jadrana u zoru.', // REVIEW
    },
    src: null,
    poster: null,
  },
  'hero-still': {
    kind: 'image',
    ratio: '16/9',
    mobileRatio: '4/5',
    tone: 'shade',
    shot: 'Poster frame / fallback for the hero video. Same composition.',
    light: 'Dawn, low sun from the east.',
    alt: {
      en: 'The Dingač slope from above: terraced vineyards falling from the mountain to the sea.',
      hr: 'Dingač iz zraka: terasasti vinogradi koji se spuštaju od planine do mora.', // REVIEW
    },
    src: '/media/dingac-aerial.jpg',
  },
  'ridge-view': {
    kind: 'image',
    ratio: '3/2',
    tone: 'sun',
    shot: 'From the ridge road looking south: slope, sea, Mljet on the horizon.',
    light: 'Midday haze is acceptable — it tells the truth about the heat.',
    alt: {
      en: 'Vines and the tasting terrace above the sea, an island on the horizon.',
      hr: 'Loza i terasa za degustaciju iznad mora, otok na obzoru.', // REVIEW
    },
    src: '/media/terrace-sea-view.jpg',
  },
  'stone-macro': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'Macro of the white limestone scree between two vine trunks. Texture, not a postcard.',
    light: 'Hard midday sun, bleached, almost overexposed.',
    alt: {
      en: 'White limestone scree around the base of an old gobelet vine.',
      hr: 'Bijelo vapnenačko kamenje oko stabla stare loze uzgojene u gobelet.', // REVIEW
    },
    src: null,
  },
  'vine-gobelet': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'Single en gobelet Plavac Mali vine, full frame, sea behind out of focus.',
    light: 'Late afternoon, warm side light.',
    alt: {
      en: 'A single Plavac Mali vine trained en gobelet on the steep slope.',
      hr: 'Jedan trs plavca malog uzgojen u gobelet na strmom obronku.', // REVIEW
    },
    src: null,
  },
  'tunnel-interior': {
    kind: 'image',
    ratio: '21/9',
    mobileRatio: '3/4',
    tone: 'shade',
    shot: 'Inside the Dingač tunnel looking toward the bright exit. Rough hand-cut walls.',
    light: 'Available light only — black interior, blown-out opening.',
    alt: {
      en: 'The hand-dug Dingač tunnel, dark walls framing the light at its exit.',
      hr: 'Ručno iskopan tunel Dingač, tamni zidovi uokviruju svjetlo na izlazu.', // REVIEW
    },
    src: null,
  },
  'tunnel-exit': {
    kind: 'image',
    ratio: '16/9',
    mobileRatio: '4/5',
    tone: 'sun',
    shot: 'Emerging from the tunnel: the slope and the sea in full light.',
    light: 'Full sun, high key.',
    alt: {
      en: 'The vineyard slope in full sun, running down to the sea.',
      hr: 'Vinogradi na obronku na punom suncu, sve do mora.', // REVIEW
    },
    src: '/media/dingac-slope-sea.jpg',
  },
  'mateo-portrait': {
    kind: 'image',
    ratio: '4/5',
    tone: 'shade',
    shot: 'Mateo Vicelić, environmental portrait in the cellar or vineyard. Unposed, looking away.',
    light: 'Window light or single source, deep shadow side.',
    alt: {
      en: 'Winemaker Mateo Vicelić in the cellar.',
      hr: 'Vinar Mateo Vicelić u podrumu.', // REVIEW
    },
    src: null,
  },
  'hands-harvest': {
    kind: 'image',
    ratio: '3/2',
    tone: 'sun',
    shot: 'Hands cutting a Plavac Mali bunch at harvest. Crate of grapes.',
    light: 'Early morning harvest light.',
    alt: {
      en: 'Hands harvesting a bunch of Plavac Mali grapes.',
      hr: 'Ruke beru grozd plavca malog.', // REVIEW
    },
    src: null,
  },
  'archive-1935': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'Archival document or photograph relating to the 1935 export to Prague (if it exists). Scan, not a reproduction.',
    light: 'Flat scan.',
    alt: {
      en: 'Archival record of Vicelić wine, 1935.',
      hr: 'Arhivski zapis o vinu Vicelić, 1935.', // REVIEW
    },
    src: null,
  },
  'cellar-barrels': {
    kind: 'image',
    ratio: '3/2',
    tone: 'cellar',
    shot: 'Row of 225 L barriques in the cellar.',
    light: 'Low tungsten, deep shadow.',
    alt: {
      en: 'Oak barriques ageing Dingač in the Vicelić cellar.',
      hr: 'Hrastove barrique bačve u kojima dozrijeva Dingač u podrumu Vicelić.', // REVIEW
    },
    src: null,
  },
  'bottle-dingac': {
    kind: 'image',
    ratio: '2/5',
    tone: 'sun',
    shot: 'Dingač bottle, straight-on packshot, no props. Transparent PNG or bone background.',
    light: 'Soft studio light, one clean highlight.',
    alt: {
      en: 'Bottle of Vicelić Dingač.',
      hr: 'Boca vina Vicelić Dingač.', // REVIEW
    },
    src: null,
  },
  'bottle-plavac': {
    kind: 'image',
    ratio: '2/5',
    tone: 'sun',
    shot: 'Plavac Mali bottle packshot, same setup as Dingač.',
    light: 'Soft studio light.',
    alt: {
      en: 'Bottle of Vicelić Plavac Mali.',
      hr: 'Boca vina Vicelić Plavac mali.', // REVIEW
    },
    src: null,
  },
  'bottle-rose': {
    kind: 'image',
    ratio: '2/5',
    tone: 'sun',
    shot: 'Opolo Rosé bottle packshot, same setup.',
    light: 'Soft studio light.',
    alt: {
      en: 'Bottle of Vicelić Opolo Rosé.',
      hr: 'Boca vina Vicelić Opolo rosé.', // REVIEW
    },
    src: null,
  },
  'tasting-table': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'The tasting table set with glasses, sea view behind. Guests optional, hands only.',
    light: 'Golden hour.',
    alt: {
      en: 'Guests raising glasses of red wine at the tasting table.',
      hr: 'Gosti nazdravljaju crnim vinom za stolom za degustaciju.', // REVIEW
    },
    src: '/media/guests-toast-table.jpg',
  },
  'keepers-table-food': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'Overhead: Pelješac cheese, prosciutto, Ston oysters beside a glass of Plavac.',
    light: 'Natural daylight, soft shadows.',
    alt: {
      en: 'Local cheese and prosciutto being served above the vineyards and the sea.',
      hr: 'Posluživanje domaćeg sira i pršuta iznad vinograda i mora.', // REVIEW
    },
    src: '/media/serving-cheese-prosciutto.jpg',
  },
  'road-peljesac': {
    kind: 'image',
    ratio: '16/9',
    tone: 'sun',
    shot: 'The road along Pelješac towards Potomje, from the Dubrovnik direction.',
    light: 'Any clear day.',
    alt: {
      en: 'The coastal road across the Pelješac peninsula.',
      hr: 'Cesta preko poluotoka Pelješca.', // REVIEW
    },
    src: null,
  },
  'dingac-slope': {
    kind: 'image',
    ratio: '3/2',
    tone: 'sun',
    shot: 'The Dingač slope running down to the sea (hero of the Dingač page).',
    light: 'Full sun.',
    alt: {
      en: 'The vineyard slope of Dingač in full sun, running down to the sea.',
      hr: 'Vinogradi Dingača na punom suncu, sve do mora.', // REVIEW
    },
    src: '/media/dingac-slope-sea.jpg',
  },
  'private-pour': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'Wine being poured into a glass during a private tasting.',
    light: 'Soft daylight.',
    alt: {
      en: 'Red wine being poured into a glass.',
      hr: 'Točenje crnog vina u čašu.', // REVIEW
    },
    src: '/media/pouring-wine.jpg',
  },
  'guests-couple': {
    kind: 'image',
    ratio: '4/5',
    tone: 'sun',
    shot: 'Two guests toasting under the wooden roof of the terrace.',
    light: 'Soft daylight.',
    alt: {
      en: 'Two guests toasting with red wine under the terrace roof.',
      hr: 'Dvoje gostiju nazdravlja crnim vinom pod krovom terase.', // REVIEW
    },
    src: '/media/guests-toast-couple.jpg',
  },
} satisfies Record<string, ImageSlotDef>;

export type ImageSlotId = keyof typeof imageSlots;
