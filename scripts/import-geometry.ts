/**
 * Import authoritative boundary geometry (GeoJSON, EPSG:4326) for regions, subregions, districts
 * or vineyard sites. Each feature must carry a property identifying the target by slug or official name.
 *
 *   npm run import:geometry -- --level=region --file=regions.geojson --key=slug \
 *     --source-name="Ministarstvo poljoprivrede — vinogradarska područja" --source-url=https://...
 *
 * Use only geometry published by an authoritative body under a licence that permits reuse.
 * Features that match nothing are reported, never guessed.
 */
import "./env";
import { readFileSync } from "node:fs";
import postgres from "postgres";

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
const level = arg("level");
const file = arg("file");
const key = arg("key") ?? "slug";
const sourceName = arg("source-name");
const sourceUrl = arg("source-url");
const tables: Record<string, string> = { region: "wine_regions", subregion: "wine_subregions", district: "wine_districts", site: "vineyard_sites" };
if (!level || !tables[level] || !file || !sourceName) {
  console.error("Usage: --level=region|subregion|district|site --file=x.geojson --key=<property> --source-name=... [--source-url=...] [--dry-run]");
  process.exit(1);
}
const dry = process.argv.includes("--dry-run");
const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });

async function main() {
  const fc = JSON.parse(readFileSync(file!, "utf8")) as { features: { properties: Record<string, unknown>; geometry: unknown }[] };
  const table = tables[level!];
  const [src] = await sql<{ id: number }[]>`insert into data_sources (name, url, kind) values (${sourceName!}, ${sourceUrl ?? null}, 'official_registry')
    on conflict (name, url) do update set kind = excluded.kind returning id`;
  let ok = 0;
  for (const f of fc.features) {
    const value = String(f.properties[key] ?? "");
    const rows = await sql.unsafe(`select id, slug from ${table} where slug = $1 or official_name = $1`, [value]);
    if (rows.length !== 1) { console.warn(`No unique match for ${key}="${value}" — skipped`); continue; }
    const geom = JSON.stringify(f.geometry);
    const valid = await sql`select ST_IsValid(ST_GeomFromGeoJSON(${geom})) as v`;
    if (!valid[0].v) { console.warn(`Invalid geometry for ${value} — skipped`); continue; }
    if (!dry) {
      await sql.unsafe(`update ${table} set geom = ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($1), 4326))${table !== "vineyard_sites" ? ", geom_source_id = $3" : ""} where id = $2`,
        table !== "vineyard_sites" ? [geom, rows[0].id, src.id] : [geom, rows[0].id]);
    }
    ok++;
    console.log(`${dry ? "[dry] " : ""}${level} ${rows[0].slug}: geometry ${dry ? "valid" : "imported"}`);
  }
  console.log(`${ok}/${fc.features.length} features ${dry ? "validated" : "imported"}.`);
}
main().finally(() => sql.end());
