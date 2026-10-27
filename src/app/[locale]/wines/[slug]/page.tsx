import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/ContentPage";
import { Breadcrumbs, DraftNotice, Fact, JsonLd, SourceList, VerificationBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { getWine } from "@/lib/queries/catalog";
import { sql } from "@/lib/db";
import { field, grapeName, pick } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = await getWine(slug);
  if (!w) return {};
  const tw = await getTranslations({ locale, namespace: "wineType" });
  return pageMetadata({ title: `${w.name} — ${w.winery.name}`, description: `${tw(w.type as "red")} · ${w.grapes.map((g) => grapeName(g, locale)).join(", ")} · ${w.winery.name}`, href: { pathname: "/wines/[slug]", params: { slug } }, locale });
}

export default async function WinePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const w = await getWine(slug);
  if (!w) notFound();
  const [t, tw, ts, tm, tv, nav, fmt, others] = await Promise.all([
    getTranslations("wines"), getTranslations("wineType"), getTranslations("wineStyle"), getTranslations("medal"), getTranslations("winery"),
    getTranslations("nav"), getFormatter(),
    sql<{ id: number; slug: string; name: string; type: string }[]>`select id, slug, name, type from wines where winery_id = (select winery_id from wines where slug = ${slug}) and slug <> ${slug} and status = 'published' order by name`,
  ]);
  const more = others;
  const baseGrapes = w.grapes.filter((g) => g.vintage_year == null);
  const textBlocks = (["description", "tasting_notes", "vinification", "pairing"] as const).map((k) => ({ k, f: field(w.content, k, locale) })).filter((b) => b.f.text);
  const label = { description: t("description"), tasting_notes: t("tasting"), vinification: t("vinification"), pairing: t("pairing") };
  // Product structured data without offers or ratings: we never fabricate them.
  const ld = {
    "@context": "https://schema.org", "@type": "Product", name: w.name, category: "Wine",
    brand: { "@type": "Brand", name: w.winery.name },
    url: `${SITE_URL}${localizedPath({ pathname: "/wines/[slug]", params: { slug } }, locale)}`,
    image: w.bottle_path ? `${SITE_URL}${mediaUrl(w.bottle_path)}` : undefined,
    award: w.awards.map((a) => `${a.competition_name} ${a.year} — ${tm(a.medal as "gold")}`),
  };
  return (
    <>
      <JsonLd data={ld} />
      <PageHero title={w.name} eyebrow={`${tw(w.type as "red")} · ${w.winery.name}`} variant={w.region?.slug === "dalmacija" ? "dalmatia" : w.region?.slug === "hrvatska-istra-i-kvarner" ? "istria" : w.region?.slug === "slavonija-i-hrvatsko-podunavlje" ? "slavonia" : "uplands"}>
        <Breadcrumbs light items={[
          { label: nav("wines"), href: "/wines", url: localizedPath("/wines", locale) },
          { label: w.winery.name, href: { pathname: "/wineries/[slug]", params: { slug: w.winery.slug } } },
          { label: w.name },
        ]} />
      </PageHero>
      <div className="container-x grid gap-12 py-14 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          {textBlocks.length ? textBlocks.map(({ k, f }) => (
            <section key={k}><h2 className="text-3xl text-forest">{label[k]}</h2><p className="mt-3 whitespace-pre-line leading-relaxed">{f.text}</p><DraftNotice status={f.status} fallback={f.fallback} /></section>
          )) : <p className="text-stone-700">{t("noTechnical")}</p>}

          <section>
            <h2 className="text-3xl text-forest">{t("vintages")}</h2>
            {w.vintages.length ? (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="bg-paper text-xs uppercase tracking-wider text-stone-700"><tr><th className="p-3">{t("vintages")}</th><th className="p-3">{t("alcohol")}</th><th className="p-3">{t("residualSugar")}</th><th className="p-3">{t("acidity")}</th><th className="p-3">{t("barrel")}</th><th className="p-3">{t("price")}</th><th className="p-3">{t("techSheet")}</th></tr></thead>
                  <tbody className="divide-y divide-line">
                    {w.vintages.map((v) => (
                      <tr key={v.id}>
                        <td className="p-3 font-medium">{v.year ?? tv("nonVintage")}</td>
                        <td className="p-3">{v.alcohol_pct ? `${fmt.number(Number(v.alcohol_pct))} %` : "—"}</td>
                        <td className="p-3">{v.residual_sugar_gl ? `${fmt.number(Number(v.residual_sugar_gl))} g/L` : "—"}</td>
                        <td className="p-3">{v.total_acidity_gl ? `${fmt.number(Number(v.total_acidity_gl))} g/L` : "—"}</td>
                        <td className="p-3">{v.barrel ?? "—"}</td>
                        <td className="p-3">{v.price_eur ? fmt.number(Number(v.price_eur), { style: "currency", currency: "EUR" }) : "—"}</td>
                        <td className="p-3">{v.tech_sheet_path ? <a className="text-forest underline" href={mediaUrl(v.tech_sheet_path)!}>PDF</a> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="mt-3 text-stone-700">{t("noTechnical")}</p>}
            {w.vintages.some((v) => v.price_eur) && <p className="mt-2 text-xs text-stone-700">{t("priceNote")}</p>}
          </section>

          <section>
            <h2 className="text-3xl text-forest">{t("awards")}</h2>
            {w.awards.length ? (
              <ul className="mt-4 space-y-2">
                {w.awards.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper p-4">
                    <Icon name="medal" className="text-brass-700" />
                    <span className="font-medium">{tm(a.medal as "gold")}{a.score ? ` · ${a.score}` : ""}</span>
                    <span className="text-sm text-stone-700">{a.competition_name} {a.year} · {a.vintage_year ? tv("vintage", { year: a.vintage_year }) : tv("nonVintage")}</span>
                    {a.source_url && <a href={a.source_url} target="_blank" rel="noopener noreferrer nofollow" className="ml-auto text-sm text-forest underline">{tv("officialResults")}</a>}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-stone-700">{tv("awardsEmpty")}</p>}
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <dl>
              <Fact label={t("producer")}><Link href={{ pathname: "/wineries/[slug]", params: { slug: w.winery.slug } }} className="text-forest underline underline-offset-4">{w.winery.name}</Link>{w.winery.town ? `, ${w.winery.town}` : ""}</Fact>
              <Fact label={t("type")}>{tw(w.type as "red")}{w.styles.length ? ` · ${w.styles.map((s) => (ts.has(s as "amphora") ? ts(s as "amphora") : s)).join(", ")}` : ""}</Fact>
              {baseGrapes.length > 0 && <Fact label={t("composition")}>{baseGrapes.map((g, i) => <span key={g.slug}>{i > 0 && ", "}<Link href={{ pathname: "/grapes/[slug]", params: { slug: g.slug } }} className="underline decoration-line underline-offset-4 hover:decoration-forest">{grapeName(g, locale)}</Link>{g.percentage && baseGrapes.length > 1 ? ` ${fmt.number(Number(g.percentage))}%` : ""}</span>)}</Fact>}
              {w.site && <Fact label={t("site")}><Link href={{ pathname: "/sites/[slug]", params: { slug: w.site.slug } }} className="underline decoration-line underline-offset-4">{pick(w.site.name, locale)}</Link></Fact>}
              {w.appellation && <Fact label={t("appellation")}>{pick(w.appellation.name, locale)}</Fact>}
              {w.serving_temp && <Fact label={t("serving")}>{w.serving_temp}</Fact>}
              {w.aging_potential && <Fact label={t("aging")}>{w.aging_potential}</Fact>}
              {w.bottle_formats.length > 0 && <Fact label={t("formats")}>{w.bottle_formats.join(", ")}</Fact>}
            </dl>
            {w.purchase_url && <a href={w.purchase_url} target="_blank" rel="noopener noreferrer sponsored" className="btn btn-ghost mt-4 w-full">{t("buy")} <Icon name="external" size={16} /></a>}
            <div className="mt-5 space-y-2 text-sm">
              <VerificationBadge state={w.verification} compact />
              {w.source && <SourceList sources={[{ id: 0, name: w.source.name, url: w.source.url, kind: w.source.kind, accessed_at: null }]} />}
            </div>
          </div>
          {more.length > 0 && (
            <div className="card p-6">
              <h2 className="font-display text-2xl">{t("otherWines", { winery: w.winery.name })}</h2>
              <ul className="mt-3 divide-y divide-line">
                {more.map((o) => <li key={o.id}><Link href={{ pathname: "/wines/[slug]", params: { slug: o.slug } }} className="flex justify-between py-2.5 hover:text-forest"><span>{o.name}</span><span className="text-xs text-stone-700">{tw(o.type as "red")}</span></Link></li>)}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
