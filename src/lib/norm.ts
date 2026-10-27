/**
 * Mirror of the SQL `atlas_norm()` function: lower-case, strip diacritics,
 * and fold the "dj" spelling of "đ" so "Djakovo", "Đakovo" and "dakovo" match.
 */
export function norm(input: string | null | undefined): string {
  return (input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/dj/g, "d");
}

/** Split a free-text query into normalised search tokens. */
export function tokenize(q: string | null | undefined, max = 6): string[] {
  return norm(q)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2)
    .slice(0, max);
}

/** URL-safe slug: "Vinarija Pošip & Co." -> "vinarija-posip-co". */
export function slugify(input: string): string {
  return norm(input)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
