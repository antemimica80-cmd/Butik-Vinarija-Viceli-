import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "../Icon";
import { logout } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";

export async function AccountShell({ user, active, children }: { user: SessionUser; active: "overview" | "saved" | "routes" | "passport"; children: ReactNode }) {
  const [t, nav] = await Promise.all([getTranslations("account"), getTranslations("nav")]);
  const items = [
    { key: "overview", href: "/account" as const, label: t("title"), icon: "user" as const },
    { key: "saved", href: "/account/saved" as const, label: t("saved"), icon: "heart" as const },
    { key: "routes", href: "/account/routes" as const, label: t("routes"), icon: "route" as const },
    { key: "passport", href: "/account/passport" as const, label: t("passport"), icon: "book" as const },
  ];
  return (
    <div className="container-x grid gap-10 pb-10 pt-10 lg:grid-cols-[16rem_1fr]">
      <aside>
        <p className="eyebrow">{t("welcome", { name: user.name ?? user.email })}</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:flex-col" aria-label={nav("account")}>
          {items.map((i) => (
            <Link key={i.key} href={i.href} aria-current={active === i.key ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm ${active === i.key ? "bg-forest text-ivory" : "hover:bg-paper"}`}>
              <Icon name={i.icon} size={17} /> {i.label}
            </Link>
          ))}
          {(user.role === "owner" || user.role === "admin" || user.role === "editor") && (
            <Link href="/owner" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-paper"><Icon name="glass" size={17} /> {nav("owner")}</Link>
          )}
          {(user.role === "admin" || user.role === "editor") && (
            <Link href="/admin" className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-paper"><Icon name="shield" size={17} /> {nav("admin")}</Link>
          )}
        </nav>
        <form action={logout} className="mt-4"><button className="btn btn-ghost btn-sm">{nav("logout")}</button></form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
