import { getTranslations } from "next-intl/server";
import { SimpleForm } from "./SimpleForm";
import { submitClaim } from "@/app/actions/public-forms";
import { issueFormToken } from "@/lib/security";
import { Icon } from "../Icon";

export async function ClaimForm({ wineries, selected, listing }: { wineries: { id: number; name: string; town: string | null }[]; selected?: number | null; listing: boolean }) {
  const [t, tc] = await Promise.all([getTranslations("claim"), getTranslations("common")]);
  return (
    <SimpleForm action={submitClaim} submitLabel={listing ? t("listSubmit") : t("submit")} successText={t("success")} errorText={t("error")} pendingLabel={tc("loading")}>
      <input type="hidden" name="formToken" value={issueFormToken()} />
      {listing ? (
        <div><label className="field-label" htmlFor="proposedName">{t("wineryName")}</label><input id="proposedName" name="proposedName" required className="field" /></div>
      ) : (
        <div>
          <label className="field-label" htmlFor="wineryId">{t("winery")}</label>
          <select id="wineryId" name="wineryId" required className="field" defaultValue={selected ?? ""}>
            <option value="" disabled>{t("chooseWinery")}</option>
            {wineries.map((w) => <option key={w.id} value={w.id}>{w.name}{w.town ? ` — ${w.town}` : ""}</option>)}
          </select>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label className="field-label" htmlFor="name">{t("name")}</label><input id="name" name="name" required className="field" autoComplete="name" /></div>
        <div><label className="field-label" htmlFor="position">{t("position")}</label><input id="position" name="position" className="field" /></div>
        <div><label className="field-label" htmlFor="email">{t("email")}</label><input id="email" name="email" type="email" required className="field" autoComplete="email" /><p className="field-hint">{t("emailHint")}</p></div>
        <div><label className="field-label" htmlFor="phone">{t("phone")}</label><input id="phone" name="phone" type="tel" className="field" autoComplete="tel" /></div>
      </div>
      <div>
        <label className="field-label" htmlFor="evidence">{t("evidence")}</label>
        <textarea id="evidence" name="evidence" required minLength={10} className="field" />
        <p className="field-hint">{t("evidenceHint")}</p>
      </div>
      <p className="flex items-start gap-2 text-sm text-stone-700"><Icon name="shield" size={16} className="mt-0.5 shrink-0" /> {t("security")}</p>
    </SimpleForm>
  );
}
