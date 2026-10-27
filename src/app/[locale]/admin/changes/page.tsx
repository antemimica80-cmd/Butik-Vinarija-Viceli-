import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { reviewChange, moderateMedia } from "@/app/actions/admin";
import { mediaUrl } from "@/lib/media";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Moderation" };

type CR = { id: string; winery_id: number; winery: string; slug: string; payload: Record<string, unknown>; created_at: string; email: string | null; current: Record<string, unknown> };

/** Shows only fields whose values differ from the live record. */
function diff(payload: Record<string, unknown>, current: Record<string, unknown>) {
  const out: [string, string, string][] = [];
  const flat = (o: unknown, p = ""): Record<string, string> => {
    if (o == null || typeof o !== "object" || Array.isArray(o)) return { [p]: Array.isArray(o) ? JSON.stringify(o) : String(o ?? "") };
    return Object.entries(o as Record<string, unknown>).reduce((acc, [k, v]) => ({ ...acc, ...flat(v, p ? `${p}.${k}` : k) }), {});
  };
  const a = flat(payload), b = flat(current);
  for (const k of Object.keys(a)) if ((a[k] || "") !== (b[k] || "") && !k.endsWith(".status")) out.push([k, b[k] ?? "", a[k]]);
  return out;
}

export default async function ChangesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/changes`);
  const [changes, media] = await Promise.all([
    sql<CR[]>`select c.id, c.winery_id, w.name as winery, w.slug, c.payload, c.created_at, u.email,
        json_build_object('content', w.content, 'website', w.website, 'email', w.email, 'phone', w.phone, 'whatsapp', w.whatsapp, 'instagram', w.instagram,
          'facebook', w.facebook, 'youtube', w.youtube, 'opening_hours', w.opening_hours, 'appointment_only', w.appointment_only, 'languages', w.languages,
          'founded_year', w.founded_year, 'founder', w.founder, 'owner_name', w.owner_name, 'winemaker_name', w.winemaker_name, 'family_run', w.family_run,
          'size_category', w.size_category) as current
      from change_requests c join wineries w on w.id = c.winery_id left join users u on u.id = c.submitted_by
      where c.status = 'pending' order by c.created_at`,
    sql<{ id: number; storage_path: string; mime: string; kind: string; winery: string; credit: string | null; license: string }[]>`
      select m.id, m.storage_path, m.mime, m.kind, w.name as winery, m.credit, m.license from media m left join wineries w on w.id = m.winery_id
      where m.status = 'pending' order by m.created_at`,
  ]);
  return (
    <AdminShell user={user} active="changes" title="Moderation">
      <h2 className="mb-3 text-xl">Profile change requests ({changes.length})</h2>
      <div className="space-y-4">
        {changes.map((c) => {
          const rows = diff(c.payload, c.current);
          return (
            <article key={c.id} className="card p-5">
              <p className="font-medium"><Link href={{ pathname: "/admin/wineries/[id]", params: { id: String(c.winery_id) } }} className="text-forest underline">{c.winery}</Link> <span className="text-sm text-stone-700">· {c.email} · {new Date(c.created_at).toISOString().slice(0, 16).replace("T", " ")}</span></p>
              <table className="mt-3 w-full text-left text-xs">
                <thead className="text-stone-700"><tr><th className="py-1 pr-3">Field</th><th className="py-1 pr-3">Current</th><th className="py-1">Proposed</th></tr></thead>
                <tbody className="divide-y divide-line align-top">
                  {rows.map(([k, a, b]) => <tr key={k}><td className="py-1.5 pr-3 font-mono">{k}</td><td className="max-w-xs py-1.5 pr-3 text-stone-700">{a.slice(0, 300)}</td><td className="max-w-xs py-1.5">{b.slice(0, 300)}</td></tr>)}
                  {!rows.length && <tr><td colSpan={3} className="py-2 text-stone-700">No differences in profile fields (grapes/facilities may still change).</td></tr>}
                </tbody>
              </table>
              <form action={reviewChange} className="mt-4 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="notes" placeholder="Reviewer notes" className="field !min-h-9 !w-64 text-sm" />
                <button name="decision" value="approve" className="btn btn-primary btn-sm">Approve & publish</button>
                <button name="decision" value="reject" className="btn btn-ghost btn-sm text-burgundy">Reject</button>
              </form>
            </article>
          );
        })}
        {!changes.length && <p className="text-stone-700">No pending changes.</p>}
      </div>
      <h2 className="mb-3 mt-10 text-xl">Media awaiting review ({media.length})</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {media.map((m) => (
          <li key={m.id} className="card overflow-hidden">
            {m.mime.startsWith("image/") ? <img src={mediaUrl(m.storage_path)!} alt="" className="aspect-[4/3] w-full object-cover" /> : <a href={mediaUrl(m.storage_path)!} className="grid aspect-[4/3] place-items-center underline">PDF</a>}
            <div className="p-3 text-xs">
              <p>{m.winery} · {m.kind} · {m.license}{m.credit ? ` · © ${m.credit}` : ""}</p>
              <form action={moderateMedia} className="mt-2 flex gap-2"><input type="hidden" name="id" value={m.id} />
                <button name="status" value="approved" className="btn btn-primary btn-sm">Approve</button>
                <button name="status" value="rejected" className="btn btn-ghost btn-sm">Reject</button></form>
            </div>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
