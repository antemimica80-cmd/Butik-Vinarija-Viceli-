import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon, type IconName } from "../Icon";
import type { SessionUser } from "@/lib/auth";

const ITEMS: { key: string; href: "/admin" | "/admin/wineries" | "/admin/geography" | "/admin/grapes" | "/admin/awards" | "/admin/claims" | "/admin/changes" | "/admin/inquiries" | "/admin/reports" | "/admin/users" | "/admin/import" | "/admin/quality" | "/admin/articles" | "/admin/email" | "/admin/audit"; icon: IconName; adminOnly?: boolean }[] = [
  { key: "dashboard", href: "/admin", icon: "home" },
  { key: "wineries", href: "/admin/wineries", icon: "glass" },
  { key: "quality", href: "/admin/quality", icon: "shield" },
  { key: "changes", href: "/admin/changes", icon: "edit" },
  { key: "claims", href: "/admin/claims", icon: "flag" },
  { key: "awards", href: "/admin/awards", icon: "medal" },
  { key: "inquiries", href: "/admin/inquiries", icon: "inbox" },
  { key: "reports", href: "/admin/reports", icon: "info" },
  { key: "geography", href: "/admin/geography", icon: "layers" },
  { key: "grapes", href: "/admin/grapes", icon: "grape" },
  { key: "articles", href: "/admin/articles", icon: "book" },
  { key: "import", href: "/admin/import", icon: "arrowUp" },
  { key: "email", href: "/admin/email", icon: "mail" },
  { key: "users", href: "/admin/users", icon: "users", adminOnly: true },
  { key: "audit", href: "/admin/audit", icon: "clock" },
];

export async function AdminShell({ user, active, title, children, actions }: { user: SessionUser; active: string; title: string; children: ReactNode; actions?: ReactNode }) {
  const t = await getTranslations("admin");
  return (
    <div className="mx-auto grid max-w-[96rem] gap-8 px-4 pb-10 pt-6 md:px-6 lg:grid-cols-[14rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow mb-3">{t("title")}</p>
        <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label={t("title")}>
          {ITEMS.filter((i) => !i.adminOnly || user.role === "admin").map((i) => (
            <Link key={i.key} href={i.href} aria-current={active === i.key ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm ${active === i.key ? "bg-forest text-ivory" : "hover:bg-paper"}`}>
              <Icon name={i.icon} size={16} /> {t(i.key as "dashboard")}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-4xl text-forest">{title}</h1>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-paper">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wider text-stone-700"><tr>{head.map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Stat({ label, value, href, tone }: { label: string; value: number | string; href?: Parameters<typeof Link>[0]["href"]; tone?: "warn" }) {
  const inner = (<><span className={`block font-display text-4xl ${tone === "warn" && Number(value) > 0 ? "text-burgundy" : "text-forest"}`}>{value}</span><span className="text-sm text-stone-700">{label}</span></>);
  return href ? <Link href={href} className="card block p-5 hover:border-forest">{inner}</Link> : <div className="card p-5">{inner}</div>;
}
