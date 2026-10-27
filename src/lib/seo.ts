import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { SITE_URL } from "./site";

type Href = Parameters<typeof getPathname>[0]["href"];

/** Absolute, localized path for any typed route. */
export function localizedPath(href: Href, locale: Locale) {
  return getPathname({ href, locale });
}

/** Canonical + hreflang alternates for a page that exists in both languages. */
export function alternates(href: Href, locale: Locale): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = `${SITE_URL}${getPathname({ href, locale: l })}`;
  languages["x-default"] = `${SITE_URL}${getPathname({ href, locale: "hr" })}`;
  return { canonical: `${SITE_URL}${getPathname({ href, locale })}`, languages };
}

export function pageMetadata(opts: {
  title: string; description: string; href: Href; locale: Locale; noindex?: boolean; image?: string; type?: "website" | "article";
}): Metadata {
  const url = `${SITE_URL}${getPathname({ href: opts.href, locale: opts.locale })}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: alternates(opts.href, opts.locale),
    robots: opts.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: opts.type ?? "website",
      locale: opts.locale === "hr" ? "hr_HR" : "en_GB",
      alternateLocale: opts.locale === "hr" ? ["en_GB"] : ["hr_HR"],
      siteName: opts.locale === "hr" ? "Atlas hrvatskih vinarija" : "Croatian Wine Atlas",
      images: opts.image ? [{ url: opts.image }] : undefined,
    },
    twitter: { card: "summary_large_image", title: opts.title, description: opts.description },
  };
}
