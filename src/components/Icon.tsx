import type { SVGProps } from "react";

const paths = {
  search: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm9 16-4.35-4.35",
  map: "M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Zm0 0v13m6-10.5v13",
  pin: "M12 21s-6.5-6.1-6.5-11.2A6.5 6.5 0 0 1 12 3.3a6.5 6.5 0 0 1 6.5 6.5C18.5 14.9 12 21 12 21Zm0-8.7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  locate: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v3m0 14v3M2 12h3m14 0h3",
  glass: "M7 3h10l-1 6a4 4 0 0 1-8 0L7 3Zm5 10v7m-4 0h8",
  grape: "M12 3v3m0 0c2-2 5-2 6 0M9 9a2 2 0 1 0 0 .01M15 9a2 2 0 1 0 0 .01M12 12a2 2 0 1 0 0 .01M9 15a2 2 0 1 0 0 .01M15 15a2 2 0 1 0 0 .01M12 18a2 2 0 1 0 0 .01",
  medal: "M8 3h8l-2 5h-4L8 3Zm4 5a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 3 1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 17l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4L12 11Z",
  compass: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm3.5 5.5-2 5-5 2 2-5 5-2Z",
  route: "M6 19a2 2 0 1 0 0-.01M18 5a2 2 0 1 0 0 .01M6 17V9a3 3 0 0 1 3-3h4m5 1v8a3 3 0 0 1-3 3h-4",
  heart: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  share: "M12 4v11m0-11-4 4m4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z",
  calendar: "M5 6h14v14H5V6Zm0 4h14M9 3v4m6-4v4",
  clock: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 4v5l3 2",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm-6 9a6 6 0 0 1 12 0m1-9a3 3 0 1 0 0-6m2 15a5 5 0 0 0-3-4.6",
  check: "m5 12.5 4.5 4.5L19 7.5",
  x: "M6 6l12 12M18 6 6 18",
  chevronDown: "m6 9 6 6 6-6",
  chevronRight: "m9 6 6 6-6 6",
  chevronLeft: "m15 6-6 6 6 6",
  arrowRight: "M5 12h14m-5-5 5 5-5 5",
  arrowUp: "M12 19V5m-5 5 5-5 5 5",
  arrowDown: "M12 5v14m-5-5 5 5 5-5",
  filter: "M4 6h16M7 12h10m-7 6h4",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  expand: "M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5",
  info: "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 8v5m0-8.5v.5",
  shield: "M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  external: "M14 4h6v6m0-6-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5",
  menu: "M4 7h16M4 12h16M4 17h16",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  plus: "M12 5v14M5 12h14",
  trash: "M5 7h14m-9 0V4h4v3m-7 0 1 13h8l1-13",
  bottle: "M10 3h4v4l1.5 2.5V20a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V9.5L10 7V3Zm-1.5 9h7",
  book: "M5 4h9a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Zm0 13a3 3 0 0 1 3-3h9",
  sparkle: "M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M6 18l2.5-2.5m7-7L18 6",
  home: "M4 11 12 4l8 7v9H4v-9Zm6 9v-5h4v5",
  inbox: "M4 13h4l1.5 3h5l1.5-3h4M4 13l2-8h12l2 8v6H4v-6Z",
  image: "M4 5h16v14H4V5Zm0 11 4.5-4.5 4 4L15 13l5 5M15 9.5a1.5 1.5 0 1 0 0-.01",
  edit: "M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4",
  instagram: "M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5v.01",
  facebook: "M14 21v-8h3l.5-3.5H14V7.5c0-1 .4-1.7 1.8-1.7H18V2.7A22 22 0 0 0 15.4 2.5C12.8 2.5 11 4 11 7v2.5H8V13h3v8",
  youtube: "M3.5 7.5c.2-1.5 1.3-2.5 2.8-2.6C8 4.8 10 4.7 12 4.7s4 .1 5.7.2c1.5.1 2.6 1.1 2.8 2.6.2 1.5.2 3 .2 4.5s0 3-.2 4.5c-.2 1.5-1.3 2.5-2.8 2.6-1.7.1-3.7.2-5.7.2s-4-.1-5.7-.2c-1.5-.1-2.6-1.1-2.8-2.6C3.3 15 3.3 13.5 3.3 12s0-3 .2-4.5ZM10 9v6l5-3-5-3Z",
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>
      <path d={paths[name]} />
    </svg>
  );
}
