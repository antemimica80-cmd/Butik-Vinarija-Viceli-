"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="container-x max-w-xl py-24 text-center">
      <h1 className="text-5xl text-forest">{t("genericTitle")}</h1>
      <p className="mt-4 text-stone-700">{t("genericBody")}</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-stone-700">{error.digest}</p>}
      <button type="button" onClick={reset} className="btn btn-primary mt-8">{t("retry")}</button>
    </div>
  );
}
