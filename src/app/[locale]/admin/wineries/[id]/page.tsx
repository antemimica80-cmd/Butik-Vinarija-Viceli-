import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { AdminShell, Table } from "@/components/admin/AdminShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { WineryProfileFields, loadProfileDefaults } from "@/components/owner/WineryProfileFields";
import { Link } from "@/i18n/navigation";
import { pageStaff } from "@/lib/page-auth";
import { sql } from "@/lib/db";
import { saveWineryAdmin, addOwner, removeOwner, recordVerification } from "@/app/actions/admin";
import { VERIFICATION_STATES } from "@/lib/constants";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false }, title: "Edit winery" };

type W = { id: number; slug: string; name: string; alt_names: string[]; status: string; island: string | null; is_featured: boolean; is_sponsored: boolean; featured_rank: number | null; verification: string; region: string | null; subregion: string | null; district: string | null };

export default async function EditWinery({ params }: { params: Promise<{ locale: Locale; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await pageStaff(locale, `/${locale}/admin/wineries/${id}`);
  const wid = Number(id);
  if (!Number.isInteger(wid)) notFound();
  const [w] = await sql<W[]>`select w.id, w.slug, w.name, w.alt_names, w.status, w.island, w.is_featured, w.is_sponsored, w.featured_rank, w.verification,
      r.slug as region, s.slug as subregion, d.slug as district
    from wineries w left join wine_regions r on r.id = w.region_id left join wine_subregions s on s.id = w.subregion_id left join wine_districts d on d.id = w.district_id
    where w.id = ${wid}`;
  if (!w) notFound();
  const [defaults, [loc], regions, subs, dists, owners, verifications, sources] = await Promise.all([
    loadProfileDefaults(wid),
    sql<{ address: string | null; postal_code: string | null; town: string | null; municipality: string | null; county: string | null; lat: number | null; lng: number | null; precision: string }[]>`
      select address, postal_code, town, municipality, county, ST_Y(geom::geometry) as lat, ST_X(geom::geometry) as lng, precision from winery_locations where winery_id = ${wid} and is_primary`,
    sql<{ slug: string; official_name: string }[]>`select slug, official_name from wine_regions order by sort`,
    sql<{ slug: string; official_name: string; region: string }[]>`select s.slug, s.official_name, r.slug as region from wine_subregions s join wine_regions r on r.id = s.region_id order by r.sort, s.sort`,
    sql<{ slug: string; official_name: string; subregion: string }[]>`select d.slug, d.official_name, s.slug as subregion from wine_districts d join wine_subregions s on s.id = d.subregion_id order by d.official_name`,
    sql<{ user_id: string; email: string; name: string | null }[]>`select o.user_id, u.email, u.name from winery_owners o join users u on u.id = o.user_id where o.winery_id = ${wid}`,
    sql<{ id: number; field: string | null; state: string; method: string; notes: string | null; verified_at: string; email: string | null }[]>`
      select v.id, v.field, v.state, v.method, v.notes, v.verified_at, u.email from data_verifications v left join users u on u.id = v.verified_by
      where v.entity_type = 'winery' and v.entity_id = ${String(wid)} order by v.verified_at desc limit 50`,
    sql<{ name: string; url: string | null }[]>`select distinct ds.name, ds.url from data_sources ds where ds.id in (select source_id from winery_locations where winery_id = ${wid} union select source_id from winery_grape_varieties where winery_id = ${wid} union select source_id from winery_facilities where winery_id = ${wid} union select source_id from wines where winery_id = ${wid})`,
  ]);
  const msgs = { published: "Saved and published.", error: "Please check the fields:", pending: "Saving…" };
  return (
    <AdminShell user={user} active="wineries" title={w.name} actions={<Link href={{ pathname: "/wineries/[slug]", params: { slug: w.slug } }} className="btn btn-ghost btn-sm">View public page</Link>}>
      <ActionForm action={saveWineryAdmin} submitLabel="Save winery" messages={msgs} className="space-y-8">
        <input type="hidden" name="wineryId" value={w.id} />
        <fieldset className="card grid gap-4 p-6 md:grid-cols-3">
          <legend className="px-1 font-display text-2xl">Identity & classification</legend>
          <label className="field-label">Name<input name="name" required defaultValue={w.name} className="field mt-1" /></label>
          <label className="field-label">Slug<input name="slug" required pattern="[a-z0-9-]+" defaultValue={w.slug} className="field mt-1" /></label>
          <label className="field-label">Alternative names (comma-separated)<input name="alt_names" defaultValue={w.alt_names.join(", ")} className="field mt-1" /></label>
          <label className="field-label">Status<select name="status" defaultValue={w.status} className="field mt-1"><option value="draft">draft</option><option value="published">published</option><option value="archived">archived</option></select></label>
          <label className="field-label">Verification<select name="verification" defaultValue={w.verification} className="field mt-1">{VERIFICATION_STATES.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
          <label className="field-label">Island<input name="island" defaultValue={w.island ?? ""} className="field mt-1" /></label>
          <label className="field-label">Region<select name="region" defaultValue={w.region ?? ""} className="field mt-1"><option value="">—</option>{regions.map((r) => <option key={r.slug} value={r.slug}>{r.official_name}</option>)}</select></label>
          <label className="field-label">Subregion<select name="subregion" defaultValue={w.subregion ?? ""} className="field mt-1"><option value="">—</option>{subs.map((s) => <option key={s.slug} value={s.slug}>{s.official_name} ({s.region})</option>)}</select></label>
          <label className="field-label">Wine district<select name="district" defaultValue={w.district ?? ""} className="field mt-1"><option value="">—</option>{dists.map((d) => <option key={d.slug} value={d.slug}>{d.official_name} ({d.subregion})</option>)}</select></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_featured" defaultChecked={w.is_featured} /> Editor&apos;s pick (never paid)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="is_sponsored" defaultChecked={w.is_sponsored} /> Sponsored (always labelled publicly)</label>
          <label className="field-label">Featured rank<input name="featured_rank" type="number" min={1} max={999} defaultValue={w.featured_rank ?? ""} className="field mt-1" /></label>
        </fieldset>
        <fieldset className="card grid gap-4 p-6 md:grid-cols-4">
          <legend className="px-1 font-display text-2xl">Primary location</legend>
          <label className="field-label md:col-span-2">Address<input name="loc.address" defaultValue={loc?.address ?? ""} className="field mt-1" /></label>
          <label className="field-label">Postal code<input name="loc.postal" defaultValue={loc?.postal_code ?? ""} className="field mt-1" /></label>
          <label className="field-label">Town<input name="loc.town" defaultValue={loc?.town ?? ""} className="field mt-1" /></label>
          <label className="field-label">Municipality<input name="loc.municipality" defaultValue={loc?.municipality ?? ""} className="field mt-1" /></label>
          <label className="field-label">County<input name="loc.county" defaultValue={loc?.county ?? ""} className="field mt-1" /></label>
          <label className="field-label">Latitude<input name="loc.lat" type="number" step="0.000001" min={42} max={47} defaultValue={loc?.lat ?? ""} className="field mt-1" /></label>
          <label className="field-label">Longitude<input name="loc.lng" type="number" step="0.000001" min={13} max={20} defaultValue={loc?.lng ?? ""} className="field mt-1" /></label>
          <label className="field-label">Precision<select name="loc.precision" defaultValue={loc?.precision ?? "approximate"} className="field mt-1"><option value="exact">exact (verified on site/map)</option><option value="address">address (geocoded from verified address)</option><option value="settlement">settlement</option><option value="approximate">approximate</option></select></label>
          <p className="text-xs text-stone-700 md:col-span-4">Only choose “exact” or “address” after confirming the position. Coordinates are published in structured data only at those levels.</p>
        </fieldset>
        <WineryProfileFields d={defaults} />
      </ActionForm>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="font-display text-2xl">Owners & managers</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {owners.map((o) => (
              <li key={o.user_id} className="flex items-center justify-between">{o.name ?? o.email} <span className="text-stone-700">{o.email}</span>
                <form action={removeOwner}><input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="userId" value={o.user_id} /><button className="text-burgundy underline">remove</button></form>
              </li>
            ))}
            {!owners.length && <li className="text-stone-700">No owners linked.</li>}
          </ul>
          <ActionForm action={addOwner} submitLabel="Add owner" messages={{ published: "Owner added.", error: "Could not add owner", pending: "…" }} className="mt-4 flex flex-wrap items-end gap-2">
            <input type="hidden" name="wineryId" value={w.id} />
            <label className="field-label flex-1">Registered user email<input name="email" type="email" required className="field mt-1" /></label>
          </ActionForm>
          <p className="mt-2 text-xs text-stone-700">Only add an owner after verifying the claim (official domain email, registry entry or documents).</p>
        </section>
        <section className="card p-6">
          <h2 className="font-display text-2xl">Record verification</h2>
          <ActionForm action={recordVerification} submitLabel="Record" messages={{ published: "Recorded.", error: "Check fields", pending: "…" }} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="entityType" value="winery" /><input type="hidden" name="entityId" value={w.id} />
            <label className="field-label">Field (empty = whole record)<input name="field" className="field mt-1" placeholder="website, location, wines…" /></label>
            <label className="field-label">State<select name="state" className="field mt-1">{VERIFICATION_STATES.map((v) => <option key={v} value={v}>{v}</option>)}</select></label>
            <label className="field-label">Method<select name="method" className="field mt-1">{["website_check", "official_registry", "official_regulation", "owner_document", "phone_call", "site_visit", "competition_results", "press", "other"].map((m) => <option key={m} value={m}>{m}</option>)}</select></label>
            <label className="field-label">Source URL<input name="sourceUrl" type="url" className="field mt-1" /></label>
            <label className="field-label sm:col-span-2">Notes<textarea name="notes" className="field mt-1 !min-h-16" /></label>
          </ActionForm>
          <h3 className="mt-6 text-sm font-medium">History</h3>
          <ul className="mt-2 space-y-1 text-xs text-stone-700">{verifications.map((v) => <li key={v.id}>{new Date(v.verified_at).toISOString().slice(0, 10)} · {v.field ?? "record"} → {v.state} ({v.method}) {v.email && `· ${v.email}`} {v.notes && `— ${v.notes}`}</li>)}</ul>
          <h3 className="mt-6 text-sm font-medium">Sources</h3>
          <ul className="mt-2 space-y-1 text-xs">{sources.map((s) => <li key={s.name}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.name}</a> : s.name}</li>)}</ul>
        </section>
      </div>
      <section className="mt-6">
        <Table head={["Manage content in the owner tools"]}>
          <tr><td className="p-3 text-sm">
            <Link href={{ pathname: "/owner/[winery]/wines", params: { winery: w.slug } }} className="mr-4 underline">Wines & vintages</Link>
            <Link href={{ pathname: "/owner/[winery]/experiences", params: { winery: w.slug } }} className="mr-4 underline">Experiences</Link>
            <Link href={{ pathname: "/owner/[winery]/media", params: { winery: w.slug } }} className="mr-4 underline">Media</Link>
            <Link href={{ pathname: "/owner/[winery]/inquiries", params: { winery: w.slug } }} className="underline">Inquiries</Link>
          </td></tr>
        </Table>
      </section>
    </AdminShell>
  );
}
