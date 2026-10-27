import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { pageWineryManager } from "@/lib/page-auth";
import { wineryForOwner } from "@/lib/queries/owner";
import { uploadMedia, setMediaRole, deleteMedia } from "@/app/actions/owner";
import { sql } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };
const KINDS = ["hero", "gallery", "tasting_room", "historic", "logo", "bottle", "tech_sheet"] as const;

export default async function OwnerMediaPage({ params }: { params: Promise<{ locale: Locale; winery: string }> }) {
  const { locale, winery } = await params;
  setRequestLocale(locale);
  const w = await wineryForOwner(winery);
  if (!w) notFound();
  await pageWineryManager(locale, w.id, `/${locale}/owner/${winery}/media`);
  const [t, tf, tc] = await Promise.all([getTranslations("owner"), getTranslations("form"), getTranslations("common")]);
  const items = await sql<{ id: number; kind: string; storage_path: string; mime: string; status: string; credit: string | null }[]>`
    select id, kind, storage_path, mime, status, credit from media where winery_id = ${w.id} order by created_at desc`;
  const [roles] = await sql<{ hero_media_id: number | null; logo_media_id: number | null }[]>`select hero_media_id, logo_media_id from wineries where id = ${w.id}`;
  return (
    <OwnerShell winery={w} active="media">
      <section className="card p-6">
        <h2 className="font-display text-2xl">{t("upload")}</h2>
        <p className="mt-1 text-sm text-stone-700">{t("uploadHint", { mb: Number(process.env.UPLOAD_MAX_MB || 8) })}</p>
        <ActionForm action={uploadMedia} submitLabel={t("upload")} messages={{ published: t("profileSavedDirect"), submitted: t("mediaPending"), error: tf("error"), pending: tf("saving") }} className="mt-4 grid gap-4 md:grid-cols-2">
          <input type="hidden" name="wineryId" value={w.id} />
          <label className="field-label">{tf("file")}<input name="file" type="file" required accept="image/jpeg,image/png,image/webp,application/pdf" className="field mt-1" /></label>
          <label className="field-label">{tf("kind")}<select name="kind" className="field mt-1">{KINDS.map((k) => <option key={k} value={k}>{tf(`mediaKind.${k}`)}</option>)}</select></label>
          <label className="field-label">{tf("altHr")}<input name="alt_hr" maxLength={300} className="field mt-1" /></label>
          <label className="field-label">{tf("altEn")}<input name="alt_en" maxLength={300} className="field mt-1" /></label>
          <label className="field-label">{tf("captionHr")}<input name="caption_hr" maxLength={300} className="field mt-1" /></label>
          <label className="field-label">{tf("captionEn")}<input name="caption_en" maxLength={300} className="field mt-1" /></label>
          <label className="field-label">{tf("credit")}<input name="credit" maxLength={200} className="field mt-1" /></label>
          <label className="flex items-start gap-2 text-sm md:col-span-2"><input type="checkbox" name="rights" required className="mt-0.5 accent-[#193C34]" />{t("rightsConfirm")}</label>
        </ActionForm>
      </section>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((m) => (
          <li key={m.id} className="card overflow-hidden">
            {m.mime.startsWith("image/") ? <img src={mediaUrl(m.storage_path)!} alt="" className="aspect-[4/3] w-full object-cover" /> : <a href={mediaUrl(m.storage_path)!} className="grid aspect-[4/3] place-items-center bg-ivory text-forest underline">PDF</a>}
            <div className="space-y-2 p-3 text-xs">
              <p className="flex justify-between"><span>{tf(`mediaKind.${m.kind as "hero"}`)}</span><span className={`chip !py-0 ${m.status === "approved" ? "chip-forest" : m.status === "rejected" ? "chip-wine" : "chip-brass"}`}>{m.status === "approved" ? t("mediaApproved") : m.status === "rejected" ? t("mediaRejected") : t("mediaPending")}</span></p>
              {m.status === "approved" && m.mime.startsWith("image/") && (
                <div className="flex gap-1">
                  {(["hero", "logo"] as const).map((r) => (
                    <form key={r} action={setMediaRole}><input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="mediaId" value={m.id} /><input type="hidden" name="role" value={r} />
                      <button className="btn btn-ghost btn-sm !min-h-7 !px-2 !text-xs" disabled={(r === "hero" ? roles.hero_media_id : roles.logo_media_id) === m.id}>{r === "hero" ? t("setHero") : t("setLogo")}</button></form>
                  ))}
                </div>
              )}
              <form action={deleteMedia}><input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="mediaId" value={m.id} /><button className="text-burgundy underline">{tc("delete")}</button></form>
            </div>
          </li>
        ))}
      </ul>
    </OwnerShell>
  );
}
