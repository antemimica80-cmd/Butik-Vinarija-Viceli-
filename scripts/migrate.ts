import "./env";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";

const reset = process.argv.includes("--reset");
const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });

async function main() {
  if (reset) {
    if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
      throw new Error("Refusing to reset a production database without --force");
    }
    console.log("Resetting schema public …");
    const exts = await sql`select extname from pg_extension where extname in ('postgis','pg_trgm','unaccent','pgcrypto')`;
    // Drop app objects but keep extensions (which may require superuser to recreate).
    await sql.unsafe(`
      do $$ declare r record; begin
        for r in (select tablename from pg_tables where schemaname='public' and tablename <> 'spatial_ref_sys') loop
          execute 'drop table if exists public.' || quote_ident(r.tablename) || ' cascade';
        end loop;
        for r in (select typname from pg_type t join pg_namespace n on n.oid=t.typnamespace
                  where n.nspname='public' and t.typtype='e') loop
          execute 'drop type if exists public.' || quote_ident(r.typname) || ' cascade';
        end loop;
      end $$;`);
    await sql.unsafe(`drop function if exists atlas_norm(text) cascade;
      drop function if exists refresh_winery_search(int) cascade;
      drop function if exists refresh_grape_search(int) cascade;
      drop function if exists wine_awards_check_winery() cascade;`);
    console.log(`Kept extensions: ${exts.map((e) => e.extname).join(", ")}`);
  }
  await sql`create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())`;
  const dir = path.resolve("db/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const done = new Set((await sql`select name from schema_migrations`).map((r) => r.name as string));
  for (const f of files) {
    if (done.has(f)) continue;
    console.log(`Applying ${f}`);
    await sql.begin(async (tx) => {
      await tx.unsafe(readFileSync(path.join(dir, f), "utf8"));
      await tx`insert into schema_migrations (name) values (${f})`;
    });
  }
  console.log("Migrations up to date.");
}

main().then(() => sql.end()).catch(async (e) => { console.error(e); await sql.end(); process.exit(1); });
