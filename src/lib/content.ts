import type { Locale } from "@/i18n/routing";

export type LocalizedText = Partial<Record<Locale, string>> | null | undefined;
export type LocalizedContent = Partial<Record<Locale, Record<string, string | undefined>>> | null | undefined;

const other = (l: Locale): Locale => (l === "hr" ? "en" : "hr");

/** Pick a short localized string (e.g. a name) with fallback to the other language. */
export function pick(value: LocalizedText, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value[other(locale)] || "";
}

export type Field = { text: string; fallback: boolean; status: string | null; sourceLocale: Locale | null };

/**
 * Read one field from per-locale content. If the requested language is missing we fall back
 * to the other language and say so, rather than showing an unlabelled machine translation.
 */
export function field(content: LocalizedContent, key: string, locale: Locale): Field {
  const own = content?.[locale];
  if (own?.[key]) return { text: own[key]!, fallback: false, status: own.status ?? null, sourceLocale: locale };
  const alt = content?.[other(locale)];
  if (alt?.[key]) return { text: alt[key]!, fallback: true, status: alt.status ?? null, sourceLocale: other(locale) };
  return { text: "", fallback: false, status: null, sourceLocale: null };
}

export function contentStatus(content: LocalizedContent, locale: Locale): string | null {
  return content?.[locale]?.status ?? content?.[other(locale)]?.status ?? null;
}

export function grapeName(g: { name_hr: string; name_en: string }, locale: Locale) {
  return locale === "hr" ? g.name_hr : g.name_en;
}
