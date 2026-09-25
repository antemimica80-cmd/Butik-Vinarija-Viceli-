import { BASE_PATH } from '@/lib/static';

/**
 * Self-hosted @font-face rules, rendered in <head> so the font URLs carry the base
 * path (the site may be served from a sub-folder). Newsreader is instanced at its
 * display optical size (scripts/build-fonts.py); Hanken Grotesk is variable.
 */
const css = [
  `@font-face { font-family: 'Newsreader Display'; font-style: normal; font-weight: 200 500; font-display: swap; src: url('${BASE_PATH}/fonts/newsreader-display-latin-normal.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }`,
  `@font-face { font-family: 'Newsreader Display'; font-style: normal; font-weight: 200 500; font-display: swap; src: url('${BASE_PATH}/fonts/newsreader-display-latin-ext-normal.woff2') format('woff2'); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }`,
  `@font-face { font-family: 'Newsreader Display'; font-style: italic; font-weight: 200 500; font-display: swap; src: url('${BASE_PATH}/fonts/newsreader-display-latin-italic.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }`,
  `@font-face { font-family: 'Newsreader Display'; font-style: italic; font-weight: 200 500; font-display: swap; src: url('${BASE_PATH}/fonts/newsreader-display-latin-ext-italic.woff2') format('woff2'); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }`,
  `@font-face { font-family: 'Hanken Grotesk Variable'; font-style: normal; font-weight: 100 900; font-display: swap; src: url('${BASE_PATH}/fonts/hanken-grotesk-latin-wght-normal.woff2') format('woff2'); unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD; }`,
  `@font-face { font-family: 'Hanken Grotesk Variable'; font-style: normal; font-weight: 100 900; font-display: swap; src: url('${BASE_PATH}/fonts/hanken-grotesk-latin-ext-wght-normal.woff2') format('woff2'); unicode-range: U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF; }`,
].join('\n');

export function FontFaces() {
  return (
    <>
      <link rel="preload" href={`${BASE_PATH}/fonts/newsreader-display-latin-normal.woff2`} as="font" type="font/woff2" crossOrigin="" />
      <link rel="preload" href={`${BASE_PATH}/fonts/hanken-grotesk-latin-wght-normal.woff2`} as="font" type="font/woff2" crossOrigin="" />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
