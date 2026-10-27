import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { HeaderBar } from "./HeaderBar";

export async function SiteHeader() {
  const [t, user] = await Promise.all([getTranslations("nav"), getCurrentUser()]);
  const labels = {
    wineries: t("wineries"), map: t("map"), regions: t("regions"), grapes: t("grapes"), wines: t("wines"),
    experiences: t("experiences"), routes: t("routes"), stories: t("stories"), awards: t("awards"),
    account: t("account"), login: t("login"), owner: t("owner"), admin: t("admin"), menu: (await getTranslations("common"))("menu"),
    close: (await getTranslations("common"))("close"), switchTo: t("switchTo"), switchToShort: t("switchToShort"),
    language: t("language"), mainNav: t("mainNav"), listWinery: t("listWinery"), siteName: (await getTranslations("common"))("siteName"),
    planner: t("planner"),
  };
  return <HeaderBar labels={labels} user={user ? { name: user.name ?? user.email, role: user.role } : null} />;
}
