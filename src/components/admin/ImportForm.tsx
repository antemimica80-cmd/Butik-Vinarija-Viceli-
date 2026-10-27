"use client";

import { useActionState } from "react";
import { runImport } from "@/app/actions/admin";

type Report = { jobId: number; dryRun: boolean; total: number; create: number; update: number; skip: number; error: number; rows: { row: number; action: string; slug?: string; message?: string }[] };

export function ImportForm() {
  const [state, action, pending] = useActionState(runImport, null);
  const report = (state && state.ok ? state.report : null) as Report | null;
  return (
    <div className="space-y-6">
      <form action={action} className="card space-y-4 p-6">
        <label className="field-label">CSV file (UTF-8, comma or semicolon)<input name="file" type="file" accept=".csv,text/csv" required className="field mt-1" /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="commit" value="1" /> Commit changes (leave unchecked for a dry run)</label>
        <button className="btn btn-primary" disabled={pending}>{pending ? "Processing…" : "Run import"}</button>
        {state && !state.ok && <p className="text-sm text-burgundy">Import failed: {state.error}</p>}
      </form>
      {report && (
        <div className="card p-6">
          <p className="font-medium">{report.dryRun ? "Dry run" : "Import"} #{report.jobId}: {report.total} rows — {report.create} new, {report.update} updates, {report.skip} skipped, {report.error} errors</p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto font-mono text-xs">
            {report.rows.map((r) => (
              <li key={r.row} className={r.action === "error" ? "text-burgundy" : r.action === "skip" ? "text-brass-700" : ""}>row {r.row}: {r.action} {r.slug ?? ""} {r.message ?? ""}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
