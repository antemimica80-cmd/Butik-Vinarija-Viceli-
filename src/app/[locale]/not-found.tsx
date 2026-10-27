import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { EmptyState } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <div className="container-x max-w-2xl py-24">
      <EmptyState icon="compass" title={t("notFoundTitle")} body={t("notFoundBody")} action={<Link href="/" className="btn btn-primary">{t("home")}</Link>} />
      <div className="mt-8"><SearchBox /></div>
    </div>
  );
}
