"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "../Icon";
import { inquirySchema, type InquiryInput } from "@/lib/schemas";
import { submitInquiry, type InquiryResult } from "@/app/actions/inquiry";

type Exp = { id: number; name: string };

export function InquiryForm({ wineryId, wineryName, slug, experiences, initialExperience, formToken, languages }: {
  wineryId: number; wineryName: string; slug: string; experiences: Exp[]; initialExperience: number | null; formToken: string; languages: string[];
}) {
  const t = useTranslations("inquiry");
  const tl = useTranslations("language");
  const tc = useTranslations("common");
  const locale = useLocale() as "hr" | "en";
  const [result, setResult] = useState<InquiryResult | null>(null);
  const idempotencyKey = useMemo(() => crypto.randomUUID(), []);
  const minDate = new Date().toISOString().slice(0, 10);

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setError } = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      wineryId, experienceId: initialExperience, preferredDate: "", preferredTime: "any", flexible: false, adults: 2, children: 0,
      language: locale, fullName: "", email: "", phone: "", country: "", message: "", consent: false as unknown as true, marketing: false,
      idempotencyKey, formToken, website: "",
    },
  });
  const flexible = watch("flexible");

  const onSubmit = async (data: InquiryInput) => {
    const r = await submitInquiry(data, locale);
    if (!r.ok && r.error === "validation" && r.fields) {
      for (const [k, v] of Object.entries(r.fields)) setError(k as keyof InquiryInput, { message: v });
    }
    setResult(r);
  };

  const err = (k: keyof InquiryInput) => {
    const m = errors[k]?.message;
    if (!m) return null;
    const known = ["name", "email", "adults", "date", "privacy", "message"].includes(m);
    return <p className="field-error" role="alert">{known ? t(`validation.${m as "name"}`) : t("errorGeneric")}</p>;
  };

  if (result?.ok) {
    return (
      <div className="card p-8 text-center" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-100 text-forest"><Icon name="check" size={28} /></span>
        <h2 className="mt-5 text-4xl text-forest">{t("successTitle")}</h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed">{t("successBody", { ref: result.ref })}</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-700">{result.email === "sent" ? t("successEmailSent") : t("successEmailQueued")}</p>
        <Link href={{ pathname: "/wineries/[slug]", params: { slug } }} className="btn btn-primary mt-8">{t("successBack", { name: wineryName })}</Link>
      </div>
    );
  }

  const errorText = result && !result.ok && result.error !== "validation"
    ? { rate_limit: t("errorRateLimit"), duplicate: t("errorDuplicate"), too_fast: t("errorTooFast"), expired: t("errorExpired"), generic: t("errorGeneric") }[result.error]
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {errorText && <p role="alert" className="rounded-xl bg-burgundy-100 p-4 text-sm text-burgundy">{errorText}</p>}
      {/* Honeypot (hidden from people and assistive technology) */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label>Website<input tabIndex={-1} autoComplete="off" {...register("website")} /></label>
      </div>

      <fieldset className="card space-y-5 p-6">
        <legend className="sr-only">{t("title")}</legend>
        <div>
          <label className="field-label" htmlFor="experienceId">{t("experience")}</label>
          <select id="experienceId" className="field" {...register("experienceId", { setValueAs: (v) => (v === "" || v == null ? null : Number(v)) })}>
            <option value="">{t("anyExperience")}</option>
            {experiences.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="preferredDate">{t("date")}</label>
            <input id="preferredDate" type="date" min={minDate} className="field" aria-invalid={!!errors.preferredDate} disabled={flexible} {...register("preferredDate")} />
            {err("preferredDate")}
          </div>
          <div>
            <label className="field-label" htmlFor="preferredTime">{t("time")}</label>
            <select id="preferredTime" className="field" {...register("preferredTime")}>
              <option value="any">{t("timeAny")}</option>
              <option value="morning">{t("timeMorning")}</option>
              <option value="midday">{t("timeMidday")}</option>
              <option value="afternoon">{t("timeAfternoon")}</option>
              <option value="evening">{t("timeEvening")}</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#193C34]" {...register("flexible")} /> {t("flexible")}</label>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="adults">{t("adults")}</label>
            <input id="adults" type="number" min={1} max={200} inputMode="numeric" className="field" aria-invalid={!!errors.adults} {...register("adults", { valueAsNumber: true })} />
            {err("adults")}
          </div>
          <div>
            <label className="field-label" htmlFor="children">{t("children")}</label>
            <input id="children" type="number" min={0} max={100} inputMode="numeric" className="field" {...register("children", { valueAsNumber: true })} />
          </div>
          <div>
            <label className="field-label" htmlFor="language">{t("language")}</label>
            <select id="language" className="field" {...register("language")}>
              {Array.from(new Set([locale, ...languages, "hr", "en", "de", "it"])).map((l) => <option key={l} value={l}>{tl(l as "hr")}</option>)}
            </select>
          </div>
        </div>
        <p className="flex items-center gap-2 text-xs text-stone-700"><Icon name="info" size={14} /> {t("adultsOnly")}</p>
      </fieldset>

      <fieldset className="card space-y-5 p-6">
        <legend className="sr-only">{t("name")}</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="fullName">{t("name")}</label>
            <input id="fullName" autoComplete="name" className="field" aria-invalid={!!errors.fullName} {...register("fullName")} />
            {err("fullName")}
          </div>
          <div>
            <label className="field-label" htmlFor="email">{t("email")}</label>
            <input id="email" type="email" autoComplete="email" className="field" aria-invalid={!!errors.email} {...register("email")} />
            {err("email")}
          </div>
          <div>
            <label className="field-label" htmlFor="phone">{t("phone")} <span className="font-normal text-stone-700">({tc("optional")})</span></label>
            <input id="phone" type="tel" autoComplete="tel" className="field" {...register("phone")} />
          </div>
          <div>
            <label className="field-label" htmlFor="country">{t("country")} <span className="font-normal text-stone-700">({tc("optional")})</span></label>
            <input id="country" autoComplete="country-name" className="field" {...register("country")} />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="message">{t("message")}</label>
          <textarea id="message" className="field" placeholder={t("messagePlaceholder")} aria-invalid={!!errors.message} {...register("message")} />
          {err("message")}
        </div>
        <label className="flex items-start gap-2.5 text-sm">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#193C34]" aria-invalid={!!errors.consent} {...register("consent")} />
          <span>{t("privacy")} <Link href="/privacy" className="text-forest underline" target="_blank">{t("privacyLink")}</Link></span>
        </label>
        {err("consent")}
        <label className="flex items-start gap-2.5 text-sm text-stone-700">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#193C34]" {...register("marketing")} /> {t("marketing")}
        </label>
      </fieldset>

      <button type="submit" disabled={isSubmitting} className="btn btn-wine w-full sm:w-auto">
        <Icon name="mail" size={18} /> {isSubmitting ? t("sending") : t("submit")}
      </button>
    </form>
  );
}
