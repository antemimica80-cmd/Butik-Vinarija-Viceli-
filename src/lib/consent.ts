/**
 * Age confirmation and cookie consent are stored as first-party cookies
 * (1 year) so the pre-paint script in <head> can read them before rendering.
 */
export const AGE_COOKIE = 'vicelic_age';
export const CONSENT_COOKIE = 'vicelic_consent';
export type ConsentLevel = 'all' | 'necessary';

const YEAR = 60 * 60 * 24 * 365;

export function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; Max-Age=${YEAR}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export function getCookie(name: string) {
  return document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1];
}

export function getConsent(): ConsentLevel | undefined {
  const v = getCookie(CONSENT_COOKIE);
  return v === 'all' || v === 'necessary' ? v : undefined;
}

/** Inline, render-blocking script: marks <html> before first paint. Keep tiny. */
export const prePaintScript = `(function(){var d=document.documentElement,c=document.cookie;d.setAttribute('data-js','');if(/(?:^|; )${AGE_COOKIE}=1/.test(c))d.setAttribute('data-age-ok','');var m=c.match(/(?:^|; )${CONSENT_COOKIE}=(all|necessary)/);if(m)d.setAttribute('data-consent',m[1]);})();`;
