/**
 * Import wineries from CSV. Dry run by default.
 *   npm run import:wineries -- path/to/file.csv            # dry run
 *   npm run import:wineries -- path/to/file.csv --commit   # write
 */
import "./env";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { importWineriesCsvWith } from "../src/lib/importer";

const file = process.argv.find((a) => a.endsWith(".csv"));
if (!file) { console.error("Usage: npm run import:wineries -- file.csv [--commit]"); process.exit(1); }
const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
importWineriesCsvWith(sql, readFileSync(file, "utf8"), { dryRun: !process.argv.includes("--commit"), userId: null, filename: file })
  .then((r) => {
    console.log(`${r.dryRun ? "DRY RUN" : "IMPORTED"} job #${r.jobId}: ${r.total} rows — ${r.create} new, ${r.update} updated, ${r.skip} skipped, ${r.error} errors`);
    for (const row of r.rows) if (row.action === "error" || row.action === "skip") console.log(`  row ${row.row} ${row.action}: ${row.slug ?? ""} ${row.message ?? ""}`);
  })
  .finally(() => sql.end());
