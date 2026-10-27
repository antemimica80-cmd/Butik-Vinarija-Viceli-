"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useLocalFavorites } from "@/lib/client-store";
import { importLocalFavorites } from "@/app/actions/favorites";

/** Offers to move favourites saved on this device (before signing in) into the account. */
export function LocalFavoritesImport() {
  const t = useTranslations("account");
  const local = useLocalFavorites();
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!local.favs.length) return null;
  return (
    <div className="card mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">{t("savedLocalNote")} <strong>{local.favs.length}</strong></p>
      <button type="button" className="btn btn-primary btn-sm" disabled={pending}
        onClick={() => start(async () => { const r = await importLocalFavorites(local.favs); if (r.ok) { local.clear(); router.refresh(); } })}>
        {t("importLocal")}
      </button>
    </div>
  );
}
