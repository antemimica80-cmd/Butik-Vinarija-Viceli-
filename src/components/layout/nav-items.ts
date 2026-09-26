import type { AppPathname } from '@/i18n/routing';

export const navItems = [
  { href: '/experience', key: 'experience' },
  { href: '/dingac', key: 'dingac' },
  { href: '/family', key: 'family' },
  { href: '/wines', key: 'wines' },
  { href: '/visit', key: 'visit' },
] as const satisfies ReadonlyArray<{ href: AppPathname; key: string }>;
