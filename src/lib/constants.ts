export const WINE_TYPES = ["red", "white", "rose", "sparkling", "dessert", "orange", "fortified", "other"] as const;
export type WineType = (typeof WINE_TYPES)[number];

export const FACILITIES = [
  "tasting", "guided_tour", "vineyard_walk", "food_pairing", "restaurant", "accommodation",
  "family_friendly", "pet_friendly", "wheelchair_accessible", "parking", "groups", "by_appointment",
  "shop", "harvest_experience",
] as const;
export type Facility = (typeof FACILITIES)[number];

export const EXPERIENCE_KINDS = ["tasting", "cellar_tour", "vineyard_walk", "food_pairing", "harvest", "accommodation", "workshop", "other"] as const;
export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number];

export const SIZE_CATEGORIES = ["boutique", "family", "medium", "large", "cooperative"] as const;
export const CERTIFICATIONS = ["organic", "biodynamic", "sustainable", "vegan"] as const;
export const MEDALS = ["best_in_show", "platinum", "trophy", "grand_gold", "gold", "silver", "bronze", "commended", "other"] as const;
export type Medal = (typeof MEDALS)[number];

export const VERIFICATION_STATES = ["unverified", "owner_submitted", "third_party_sourced", "editor_verified", "officially_verified"] as const;
export type VerificationState = (typeof VERIFICATION_STATES)[number];
/** States that count as "verified" for public claims such as awards and certifications. */
export const VERIFIED_STATES: VerificationState[] = ["editor_verified", "officially_verified"];
/** States that may be shown publicly as supported facts (always with their source). */
export const SUPPORTED_STATES: VerificationState[] = ["owner_submitted", "third_party_sourced", "editor_verified", "officially_verified"];

export const VISIT_LANGUAGES = ["hr", "en", "de", "it", "fr", "sl", "hu", "pl", "cs", "es"] as const;

export const REGION_THEME: Record<string, { color: string; variant: "dalmatia" | "istria" | "slavonia" | "uplands" }> = {
  "dalmacija": { color: "#792E39", variant: "dalmatia" },
  "hrvatska-istra-i-kvarner": { color: "#2E5E6E", variant: "istria" },
  "slavonija-i-hrvatsko-podunavlje": { color: "#9A7A45", variant: "slavonia" },
  "sredisnja-bregovita-hrvatska": { color: "#4F6B3A", variant: "uplands" },
};

export const STAT_METRICS = [
  "vineyard_area_ha", "vine_count", "parcel_count", "annual_bottles", "annual_grapes_tonnes",
  "altitude_min_m", "altitude_max_m", "planting_density_per_ha", "average_vine_age_years",
] as const;

export const PAGE_SIZE = 24;
