import { getPathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { siteUrl } from '@/lib/stripe';

export function bookedUrl(locale: Locale, id: string, token: string, extra = '') {
  return `${siteUrl()}${getPathname({ locale, href: '/experience/booked' })}?b=${id}&t=${token}${extra}`;
}

export function checkoutUrl(locale: Locale, id: string, token: string) {
  return `${siteUrl()}${getPathname({ locale, href: '/experience/checkout' })}?b=${id}&t=${token}`;
}

export function experienceUrl(locale: Locale, hash = '') {
  return `${siteUrl()}${getPathname({ locale, href: '/experience' })}${hash}`;
}
