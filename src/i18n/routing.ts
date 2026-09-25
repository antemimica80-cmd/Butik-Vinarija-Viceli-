import { defineRouting } from 'next-intl/routing';

export const locales = ['en', 'hr'] as const;
export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
  pathnames: {
    '/': '/',
    '/experience': { en: '/experience', hr: '/degustacije' },
    '/experience/checkout': { en: '/experience/checkout', hr: '/degustacije/placanje' },
    '/experience/booked': { en: '/experience/booked', hr: '/degustacije/potvrda' },
    '/dingac': '/dingac',
    '/family': { en: '/family', hr: '/obitelj' },
    '/wines': { en: '/wines', hr: '/vina' },
    '/wines/[slug]': { en: '/wines/[slug]', hr: '/vina/[slug]' },
    '/shop': { en: '/shop', hr: '/trgovina' },
    '/visit': { en: '/visit', hr: '/posjet' },
    '/legal/[slug]': { en: '/legal/[slug]', hr: '/pravno/[slug]' },
    '/design': '/design',
  },
});

export type AppPathname = keyof typeof routing.pathnames;
