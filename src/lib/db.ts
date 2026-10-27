import postgres from "postgres";

declare global {
  var __atlasSql: postgres.Sql | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Copy .env.example to .env.local.");
  return postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 10),
    idle_timeout: 20,
    prepare: process.env.DATABASE_PREPARE !== "false", // set false behind pgbouncer transaction pooling
    transform: { undefined: null },
  });
}

/** Shared connection pool (reused across hot reloads in development). */
export const sql: postgres.Sql = globalThis.__atlasSql ?? (globalThis.__atlasSql = createClient());

/** Postgres array literal with every element quoted and escaped. */
export function pgArrayLiteral(values: readonly (string | number)[]): string {
  return "{" + values.map((v) => '"' + String(v).replace(/["\\]/g, (c) => "\\" + c) + '"').join(",") + "}";
}

/** Array parameter with an explicit text[] cast (for ANY() and && comparisons). */
export const textArray = (values: readonly string[]) => sql`${pgArrayLiteral(values)}::text[]`;
/** Array parameter with an explicit int[] cast. */
export const intArray = (values: readonly number[]) => sql`${pgArrayLiteral(values.map((n) => Math.trunc(n)))}::int[]`;
