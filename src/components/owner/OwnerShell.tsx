import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "../Icon";

type Tab = "dashboard" | "profile" | "wines" | "experiences" | "inquiries" | "media";

export async function OwnerShell({ winery, active, children }: { winery: { slug: string; name: string }; active: Tab; children: ReactNode }) {
  const t = await getTranslations("owner");
  const tabs: { key: Tab; pathname: "/owner/[winery]" | "/owner/[winery]/profile" | "/owner/[winery]/wines" | "/owner/[winery]/experiences" | "/owner/[winery]/inquiries" | "/owner/[winery]/media"; icon: IconName }[] = [
    { key: "dashboard", pathname: "/owner/[winery]", icon: "home" },
    { key: "profile", pathname: "/owner/[winery]/profile", icon: "edit" },
    { key: "wines", pathname: "/owner/[winery]/wines", icon: "bottle" },
    { key: "experiences", pathname: "/owner/[winery]/experiences", icon: "glass" },
    { key: "inquiries", pathname: "/owner/[winery]/inquiries", icon: "inbox" },
    { key: "media", pathname: "/owner/[winery]/media", icon: "image" },
  ];
  return (
    <div className="container-x pb-10 pt-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/owner" className="eyebrow hover:underline">{t("title")}</Link>
          <h1 className="mt-2 text-4xl text-forest md:text-5xl">{winery.name}</h1>
        </div>
        <Link href={{ pathname: "/wineries/[slug]", params: { slug: winery.slug } }} className="btn btn-ghost btn-sm"><Icon name="external" size={15} /> {t("viewPublic")}</Link>
      </div>
      <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-line" aria-label={t("title")}>
        {tabs.map((tab) => (
          <Link key={tab.key} href={{ pathname: tab.pathname, params: { winery: winery.slug } }} aria-current={active === tab.key ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm ${active === tab.key ? "border-burgundy text-ink" : "border-transparent text-stone-700 hover:text-ink"}`}>
            <Icon name={tab.icon} size={16} /> {t(tab.key)}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
