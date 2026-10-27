import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { reviewClaim } from "@/app/actions/admin";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Claims" };

export default async function ClaimsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/claims`);
  const claims = await sql<{ id: string; winery_id: number | null; winery: string | null; website: string | null; proposed_winery_name: string | null; claimant_name: string; claimant_email: string; claimant_phone: string | null; position: string | null; evidence: string; status: string; created_at: string; account: string | null; reviewer_notes: string | null }[]>`
    select c.id, c.winery_id, w.name as winery, w.website, c.proposed_winery_name, c.claimant_name, c.claimant_email, c.claimant_phone, c.position, c.evidence,
      c.status, c.created_at, u.email as account, c.reviewer_notes
    from ownership_claims c left join wineries w on w.id = c.winery_id left join users u on u.id = c.user_id
    order by (c.status in ('pending','needs_info')) desc, c.created_at desc limit 200`;
  const domainMatch = (email: string, website: string | null) => {
    if (!website) return false;
    try { return email.split("@")[1]?.toLowerCase() === new URL(website).hostname.replace(/^www\./, "").toLowerCase(); } catch { return false; }
  };
  return (
    <AdminShell user={user} active="claims" title="Ownership claims & listing requests">
      <p className="mb-6 max-w-3xl text-sm text-stone-700">Verify every claim independently (email on the winery&apos;s official domain, wine-producer register entry, or documents). Approval links only the account that submitted the claim; otherwise add the owner manually on the winery page after they register.</p>
      <div className="space-y-4">
        {claims.map((c) => (
          <article key={c.id} className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{c.winery_id ? <Link href={{ pathname: "/admin/wineries/[id]", params: { id: String(c.winery_id) } }} className="text-forest underline">{c.winery}</Link> : <>New listing: <strong>{c.proposed_winery_name}</strong></>}</p>
              <span className={`chip ${c.status === "pending" ? "chip-wine" : c.status === "approved" ? "chip-forest" : ""}`}>{c.status}</span>
            </div>
            <p className="mt-2 text-sm">{c.claimant_name}{c.position ? ` (${c.position})` : ""} · {c.claimant_email}{c.claimant_phone ? ` · ${c.claimant_phone}` : ""}
              {domainMatch(c.claimant_email, c.website) && <span className="chip chip-forest ml-2">email matches winery domain</span>}
              {c.account ? <span className="ml-2 text-xs text-stone-700">signed in as {c.account}</span> : <span className="ml-2 text-xs text-stone-700">no account</span>}</p>
            <p className="mt-3 whitespace-pre-line rounded-xl bg-ivory p-3 text-sm">{c.evidence}</p>
            {c.reviewer_notes && <p className="mt-2 text-xs text-stone-700">Notes: {c.reviewer_notes}</p>}
            {(c.status === "pending" || c.status === "needs_info") && (
              <form action={reviewClaim} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="notes" placeholder="Notes" className="field !min-h-9 !w-64 text-sm" />
                <button name="decision" value="approved" className="btn btn-primary btn-sm">Approve</button>
                <button name="decision" value="needs_info" className="btn btn-ghost btn-sm">Needs info</button>
                <button name="decision" value="rejected" className="btn btn-ghost btn-sm text-burgundy">Reject</button>
              </form>
            )}
          </article>
        ))}
        {!claims.length && <p className="text-stone-700">No claims yet.</p>}
      </div>
    </AdminShell>
  );
}
