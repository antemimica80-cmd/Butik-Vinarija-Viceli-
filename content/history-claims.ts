/**
 * Every historical or scientific claim used on the site lives here, once.
 * Pages reference claims by id — never restate them in other copy.
 *
 * `verified: false` until the owner (or a cited source) confirms it.
 * Wording rule: Dingač is presented as "Croatia's grand cru" / "the grand cru of the Adriatic"
 * as a positioning. Croatia has NO legal "Grand Cru" classification — never imply one.
 */
import type { HistoryClaim } from '../src/lib/content-schema';

export const historyClaims = {
  'pdo-1961': {
    year: '1961',
    text: {
      en: 'Dingač became the first Croatian wine with a legally protected designation of origin.',
      hr: 'Dingač je postao prvo hrvatsko vino sa zakonski zaštićenim podrijetlom.', // REVIEW
    },
    source: 'TODO: cite the 1961 protection (e.g. official gazette or a wine authority source)',
    verified: false,
  },
  'bordeaux-19c': {
    year: '19th c.',
    yearHr: '19. st.',
    text: {
      en: 'Dingač wine was traded to Bordeaux, where it was used for blending.',
      hr: 'Vino s Dingača prodavalo se u Bordeaux, gdje se koristilo za kupažu.', // REVIEW
    },
    source: 'TODO: historical source for the Bordeaux trade',
    verified: false,
  },
  'mirosevic-research': {
    year: 'Research',
    yearHr: 'Istraživanje',
    text: {
      en: 'The research of Dr. Nikola Mirošević documents what sets the Dingač site apart.',
      hr: 'Istraživanja dr. Nikole Miroševića dokumentiraju po čemu je položaj Dingač izniman.', // REVIEW
    },
    source: 'TODO: title and year of the Mirošević publication(s); confirm the wording reflects his findings',
    verified: false,
  },
  'tunnel-1973': {
    year: '1973',
    text: {
      en: 'The growers of Dingač dug a tunnel through the hill by hand to reach their vineyards.',
      hr: 'Vinogradari s Dingača ručno su prokopali tunel kroz brdo kako bi došli do svojih vinograda.', // REVIEW
    },
    source: 'TODO: local history source for the Dingač tunnel (year and how it was dug)',
    verified: false,
  },
  'only-organic-dingac': {
    year: 'Organic',
    yearHr: 'Ekološki',
    text: {
      en: 'Vicelić is the only Dingač with organic certification.',
      hr: 'Vicelić je jedini Dingač s ekološkim certifikatom.', // REVIEW
    },
    source: 'Confirmed by the proposal author (25 Sep 2026). TODO: certifying body and certificate number.',
    verified: true,
  },
  'prague-1935': {
    year: '1935',
    text: {
      en: 'Vicelić wine was exported to Prague.',
      hr: 'Vino obitelji Vicelić izvozilo se u Prag.', // REVIEW
    },
    source: 'TODO: family archive document or photograph',
    verified: false,
  },
} satisfies Record<string, HistoryClaim & { yearHr?: string }>;

export type ClaimId = keyof typeof historyClaims;
