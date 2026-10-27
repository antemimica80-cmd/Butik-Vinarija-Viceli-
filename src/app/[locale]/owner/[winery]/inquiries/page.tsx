import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { ActionForm } from "@/components/forms/ActionForm";
import { EmptyState } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { pageWineryManager } from "@/lib/page-auth";
import { wineryForOwner } from "@/lib/queries/owner";
import { setInquiryStatus, replyInquiry } from "@/app/actions/owner";
import { sql } from "@/lib/db";
import type { LocalizedText } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = { robots: { index: false } };

type Inq = { id: string; public_ref: string; status: string; preferred_date: string | null; preferred_time: string | null; flexible_schedule: boolean; adults: number; children: number; language: string | null; full_name: string; email: string; phone: string | null; country: string | null; message: string | null; owner_reply: string | null; created_at: string; experience: LocalizedText };
const STATUSES = ["new", "seen", "replied", "accepted", "declined", "closed", "spam"] as const;

export default async function OwnerInquiriesPage({ params, searchParams }: { params: Promise<{ locale: Locale; winery: string }>; searchParams: Promise<{ status?: string }> }) {
  const { locale, winery } = await params;
  setRequestLocale(locale);
  const w = await wineryForOwner(winery);
  if (!w) notFound();
  await pageWineryManager(locale, w.id, `/${locale}/owner/${winery}/inquiries`);
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as never) ? sp.status : undefined;
  const [t, ti, tf, fmt, tc] = await Promise.all([getTranslations("owner"), getTranslations("inquiry"), getTranslations("form"), getFormatter(), getTranslations("common")]);
  // Only this winery's inquiries are ever loaded here (authorisation checked above and in every action).
  const items = await sql<Inq[]>`
    select i.id, i.public_ref, i.status, i.preferred_date, i.preferred_time, i.flexible_schedule, i.adults, i.children, i.language,
      i.full_name, i.email, i.phone, i.country, i.message, i.owner_reply, i.created_at, e.name as experience
    from tasting_inquiries i left join tasting_experiences e on e.id = i.experience_id
    where i.winery_id = ${w.id} ${status ? sql`and i.status = ${status}` : sql``}
    order by (i.status = 'new') desc, i.created_at desc limit 200`;
  const msgs = { published: t("replySent"), error: tf("error"), pending: tf("saving") };
  return (
    <OwnerShell winery={w} active="inquiries">
      <nav className="mb-6 flex flex-wrap gap-2">
        {[undefined, ...STATUSES].map((s) => (
          <a key={s ?? "all"} href={`?${s ? `status=${s}` : ""}`} className={`chip ${status === s ? "!bg-forest !text-ivory" : ""}`}>{s ? t(`inquiryStatus.${s}`) : tc("all")}</a>
        ))}
      </nav>
      {items.length ? (
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl">{i.full_name} <span className="text-sm text-stone-700">· {i.public_ref}</span></p>
                  <p className="mt-1 text-sm text-stone-700">
                    {i.preferred_date ? t("requestedFor", { date: fmt.dateTime(new Date(i.preferred_date), { day: "numeric", month: "long", year: "numeric" }) }) : ti("flexible")}
                    {i.preferred_time && i.preferred_time !== "any" ? ` · ${ti(`time${i.preferred_time.charAt(0).toUpperCase()}${i.preferred_time.slice(1)}` as "timeMorning")}` : ""}
                    {" · "}{t("guests", { adults: i.adults, children: i.children })}
                    {i.language ? ` · ${i.language.toUpperCase()}` : ""}{i.experience ? ` · ${i.experience[locale] ?? i.experience.hr}` : ""}
                  </p>
                  <p className="mt-1 text-sm"><a className="text-forest underline" href={`mailto:${i.email}`}>{i.email}</a>{i.phone ? ` · ${i.phone}` : ""}{i.country ? ` · ${i.country}` : ""}</p>
                </div>
                <form action={setInquiryStatus} className="flex items-center gap-2">
                  <input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="id" value={i.id} />
                  <label className="sr-only" htmlFor={`st-${i.id}`}>{t("markAs")}</label>
                  <select id={`st-${i.id}`} name="status" defaultValue={i.status} className="field !min-h-9 !w-auto !py-1 text-sm">{STATUSES.map((s) => <option key={s} value={s}>{t(`inquiryStatus.${s}`)}</option>)}</select>
                  <button className="btn btn-ghost btn-sm">{t("markAs")}</button>
                </form>
              </div>
              {i.message && <p className="mt-4 whitespace-pre-line rounded-xl bg-ivory p-4 text-sm">{i.message}</p>}
              {i.owner_reply && <p className="mt-3 whitespace-pre-line border-l-2 border-forest pl-3 text-sm text-stone-700">{i.owner_reply}</p>}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-forest"><Icon name="mail" size={15} className="inline" /> {t("reply")}</summary>
                <ActionForm action={replyInquiry} submitLabel={t("replySend")} messages={msgs} className="mt-3 space-y-3">
                  <input type="hidden" name="wineryId" value={w.id} /><input type="hidden" name="id" value={i.id} />
                  <textarea name="reply" required minLength={2} maxLength={5000} className="field" aria-label={t("reply")} />
                  <p className="field-hint">{t("replyHint")}</p>
                </ActionForm>
              </details>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="inbox" title={t("noInquiries")} />}
    </OwnerShell>
  );
}
