/**
 * Check winery websites and source URLs (HEAD, falling back to GET). Records results as
 * data_verifications with method "website_check" — it never edits winery data automatically.
 *   npm run links:check
 */
import "./env";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });

async function check(url: string): Promise<{ ok: boolean; status: number | string }> {
  for (const method of ["HEAD", "GET"]) {
    try {
      const res = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(10000), headers: { "User-Agent": "CroatianWineAtlas-LinkCheck/1.0 (+contact via site)" } });
      if (res.ok || (method === "GET" && res.status < 500)) return { ok: res.ok, status: res.status };
    } catch (e) { if (method === "GET") return { ok: false, status: (e as Error).message }; }
  }
  return { ok: false, status: "unknown" };
}

(async () => {
  const rows = await sql<{ id: number; name: string; website: string }[]>`select id, name, website from wineries where website is not null order by name`;
  let broken = 0;
  for (const w of rows) {
    const r = await check(w.website);
    if (!r.ok) broken++;
    console.log(`${r.ok ? "OK  " : "FAIL"} ${r.status}\t${w.name}\t${w.website}`);
    await sql`insert into data_verifications (entity_type, entity_id, field, state, method, notes)
      values ('winery', ${String(w.id)}, 'website', 'unverified', 'website_check', ${`${r.ok ? "reachable" : "UNREACHABLE"}: HTTP ${r.status} (automated check, does not verify content)`})`;
    await new Promise((res) => setTimeout(res, 500)); // be polite
  }
  console.log(`${rows.length - broken}/${rows.length} reachable.`);
})().finally(() => sql.end());
