"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login, register } from "@/app/actions/auth";

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(mode === "login" ? login : register, null);
  const err = state?.error ? { invalid: t("invalid"), exists: t("exists"), rate_limited: t("rateLimited"), weak: t("weakPassword") }[state.error] : null;
  return (
    <form action={action} className="space-y-5">
      {err && <p role="alert" className="rounded-xl bg-burgundy-100 p-3 text-sm text-burgundy">{err}</p>}
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "register" && (
        <div><label className="field-label" htmlFor="name">{t("name")}</label><input id="name" name="name" required autoComplete="name" className="field" /></div>
      )}
      <div><label className="field-label" htmlFor="email">{t("email")}</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div>
        <label className="field-label" htmlFor="password">{t("password")}</label>
        <input id="password" name="password" type="password" required minLength={mode === "register" ? 10 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} className="field" />
        {mode === "register" && <p className="field-hint">{t("passwordHint")}</p>}
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>{mode === "login" ? t("login") : t("register")}</button>
    </form>
  );
}
