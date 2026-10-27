import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getWineryBySlug, getWineryDetails, nearbyWineries, similarWineries } from "@/lib/queries/profile";
import { getCurrentUser, canManageWinery } from "@/lib/auth";
import { sql } from "@/lib/db";
import { pick, field, grapeName } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { pageMetadata, localizedPath } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import { Landscape, regionVariant } from "@/components/Landscape";
import { Breadcrumbs, DraftNotice, Fact, JsonLd, RegionDot, SourceList, VerificationBadge } from "@/components/ui";
import { Icon } from "@/components/Icon";
import { StickyNav } from "@/components/winery/StickyNav";
import { AddToRouteButton, SaveButton, ShareButton, VisitedButton } from "@/components/winery/ProfileActions";
import { LocationMap } from "@/components/winery/LocationMap";
import { Gallery } from "@/components/winery/Gallery";
import type { Locale } from "@/i18n/routing";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const w = await getWineryBySlug(slug);
  if (!w) return {};
  const t = await getTranslations({ locale, namespace: "winery" });
  const [loc] = await sql<{ town: string | null }[]>`select town from winery_locations where winery_id = ${w.id} and is_primary`;
  const short = field(w.content, "short", locale).text;
  return pageMetadata({
    title: w.name,
    description: short || t("metaDescription", { name: w.name, place: loc?.town ?? "", region: pick(w.region?.name, locale) }),
    href: { pathname: "/wineries/[slug]", params: { slug } },
    locale,
    image: mediaUrl(w.hero_path) ?? undefined,
  });
}

export default async function WineryPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const w = await getWineryBySlug(slug);
  if (!w) notFound();
  const [d, nearby, similar, user, t, tc, tf, tw, tv, tp, nav, fmt, tk, tl, tm, tsz] = await Promise.all([
    getWineryDetails(w), nearbyWineries(w.id), similarWineries(w.id), getCurrentUser(),
    getTranslations("winery"), getTranslations("common"), getTranslations("facility"), getTranslations("wineType"),
    getTranslations("verification"), getTranslations("precision"), getTranslations("nav"), getFormatter(),
    getTranslations("experienceKind"), getTranslations("language"), getTranslations("medal"), getTranslations("size"),
  ]);
  const [savedRow, visitedRow, canManage] = user
    ? await Promise.all([
        sql`select 1 from favorites where user_id = ${user.id} and entity_type = 'winery' and entity_id = ${w.id}`,
        sql`select 1 from winery_visits where user_id = ${user.id} and winery_id = ${w.id}`,
        canManageWinery(user, w.id),
      ])
    : [[], [], false];

  const primary = d.locations.find((l) => l.is_primary) ?? d.locations[0];
  const short = field(w.content, "short", locale);
  const description = field(w.content, "description", locale);
  const story = field(w.content, "story", locale);
  const philosophy = field(w.content, "philosophy", locale);
  const winemakerBio = field(w.content, "winemaker_bio", locale);
  const hero = mediaUrl(w.hero_path);
  const logo = mediaUrl(w.logo_path);
  const color = w.region?.color ?? "#193C34";
  const place = [primary?.town, w.island && w.island !== primary?.town ? w.island : null].filter(Boolean).join(", ");
  const approx = primary && (primary.precision === "settlement" || primary.precision === "approximate");
  const directions = primary?.lat != null
    ? {
        google: approx && primary.town
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${w.name}, ${primary.town}, Croatia`)}`
          : `https://www.google.com/maps/dir/?api=1&destination=${primary.lat},${primary.lng}`,
        apple: approx && primary.town
          ? `https://maps.apple.com/?q=${encodeURIComponent(`${w.name}, ${primary.town}`)}&near=${primary.lat},${primary.lng}`
          : `https://maps.apple.com/?daddr=${primary.lat},${primary.lng}`,
      }
    : null;
  const href = { pathname: "/wineries/[slug]" as const, params: { slug } };
  const date = (s: string | null) => (s ? fmt.dateTime(new Date(s), { day: "numeric", month: "short", year: "numeric" }) : null);

  const sections = [
    { id: "overview", label: t("sections.overview") },
    { id: "visit", label: t("sections.visit") },
    { id: "wines", label: t("sections.wines") },
    { id: "grapes", label: t("sections.grapes") },
    { id: "vineyards", label: t("sections.vineyards") },
    { id: "awards", label: t("sections.awards") },
    ...(d.media.length ? [{ id: "gallery", label: t("sections.gallery") }] : []),
    { id: "location", label: t("sections.location") },
    { id: "sources", label: t("sections.sources") },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Winery",
    name: w.name,
    alternateName: w.alt_names.length ? w.alt_names : undefined,
    url: `${SITE_URL}${localizedPath(href, locale)}`,
    description: short.text || undefined,
    image: hero ? `${SITE_URL}${hero}` : undefined,
    logo: logo ? `${SITE_URL}${logo}` : undefined,
    sameAs: [w.website, w.instagram, w.facebook, w.youtube].filter(Boolean),
    telephone: w.phone ?? undefined,
    email: w.email ?? undefined,
    foundingDate: w.founded_year ? String(w.founded_year) : undefined,
    address: primary ? { "@type": "PostalAddress", streetAddress: primary.address ?? undefined, postalCode: primary.postal_code ?? undefined, addressLocality: primary.town ?? undefined, addressRegion: primary.county ?? undefined, addressCountry: "HR" } : undefined,
    // Coordinates are only published when they are address-accurate.
    geo: primary && !approx && primary.lat != null ? { "@type": "GeoCoordinates", latitude: primary.lat, longitude: primary.lng } : undefined,
  };

  return (
    <article>
      <JsonLd data={ld} />
      {/* Hero */}
      <header className="relative isolate overflow-hidden bg-forest text-ivory">
        {hero ? <img src={hero} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" /> : <Landscape variant={regionVariant(w.region?.slug)} seed={w.id} className="absolute inset-0 -z-10 h-full w-full" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        <div className="container-x pb-10 pt-10 md:pb-14 md:pt-16">
          <Breadcrumbs light items={[
            { label: nav("wineries"), href: "/wineries", url: localizedPath("/wineries", locale) },
            ...(w.region ? [{ label: pick(w.region.name, locale), href: { pathname: "/regions/[region]" as const, params: { region: w.region.slug } }, url: localizedPath({ pathname: "/regions/[region]", params: { region: w.region.slug } }, locale) }] : []),
            { label: w.name, url: localizedPath(href, locale) },
          ]} />
          <div className="mt-24 flex flex-col gap-6 md:mt-36 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow eyebrow-light flex items-center gap-2"><RegionDot color={color} /> {pick(w.region?.name, locale)}{w.subregion ? ` · ${pick(w.subregion.name, locale)}` : ""}</p>
              <div className="mt-3 flex items-center gap-4">
                {logo && <img src={logo} alt={`${w.name} logo`} className="h-16 w-16 rounded-full bg-ivory object-contain p-2" />}
                <h1 className="text-5xl leading-[0.98] md:text-7xl">{w.name}</h1>
              </div>
              {place && <p className="mt-4 flex items-center gap-2 text-lg text-ivory/85"><Icon name="pin" size={18} /> {place}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                {w.is_sponsored && <span className="chip bg-ivory/90">{tc("sponsored")}</span>}
                {w.is_featured && <span className="chip bg-ivory/90 text-forest">{tc("featured")}</span>}
                <VerificationBadge state={w.verification} date={date(w.verified_at)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug } }} className="btn btn-wine"><Icon name="glass" size={18} /> {t("requestTasting")}</Link>
              {w.website && <a href={w.website} target="_blank" rel="noopener noreferrer" className="btn btn-light"><Icon name="globe" size={18} /> {t("visitWebsite")}<span className="sr-only"> ({tc("external")})</span></a>}
            </div>
          </div>
          {!hero && <p className="mt-6 text-right text-[0.65rem] uppercase tracking-widest text-ivory/50">{tc("illustration")}</p>}
        </div>
      </header>

      <StickyNav items={sections} label={w.name} />

      {/* Action bar */}
      <div className="container-x flex flex-wrap gap-2 py-4">
        <SaveButton wineryId={w.id} slug={w.slug} loggedIn={!!user} initialSaved={savedRow.length > 0} />
        <ShareButton title={w.name} />
        <AddToRouteButton stop={{ id: w.id, slug: w.slug, name: w.name, town: primary?.town ?? null, lat: primary?.lat ?? null, lng: primary?.lng ?? null, precision: primary?.precision }} />
        {user && <VisitedButton wineryId={w.id} initial={visitedRow.length > 0} />}
        {directions && <a href={directions.google} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Icon name="compass" size={16} /> {t("openGoogleMaps")}</a>}
        {directions && <a href={directions.apple} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm"><Icon name="map" size={16} /> {t("openAppleMaps")}</a>}
        {canManage && <Link href={{ pathname: "/owner/[winery]", params: { winery: w.slug } }} className="btn btn-primary btn-sm ml-auto"><Icon name="edit" size={16} /> {nav("owner")}</Link>}
      </div>

      <div className="container-x grid gap-12 pb-10 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0 space-y-20">
          {/* Overview */}
          <section id="overview" aria-labelledby="h-overview" className="scroll-mt-36">
            <h2 id="h-overview" className="sr-only">{t("sections.overview")}</h2>
            {short.text ? <p className="font-display text-3xl leading-snug text-forest md:text-[2.1rem]">{short.text}</p> : <p className="text-stone-700">{t("noDescription")}</p>}
            {description.text && <p className="mt-6 whitespace-pre-line text-[1.05rem] leading-relaxed">{description.text}</p>}
            <DraftNotice status={short.status} fallback={short.fallback} />
            {(philosophy.text || story.text || winemakerBio.text) ? (
              <div className="mt-10 grid gap-8 md:grid-cols-2">
                {story.text && <div><h3 className="text-2xl text-forest">{t("sections.story")}</h3><p className="mt-3 whitespace-pre-line leading-relaxed">{story.text}</p></div>}
                {philosophy.text && <div><h3 className="text-2xl text-forest">{t("philosophy")}</h3><p className="mt-3 whitespace-pre-line leading-relaxed">{philosophy.text}</p></div>}
                {winemakerBio.text && <div><h3 className="text-2xl text-forest">{w.winemaker_name ?? t("winemaker")}</h3><p className="mt-3 whitespace-pre-line leading-relaxed">{winemakerBio.text}</p></div>}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-line p-5 text-sm text-stone-700">{t("storyEmpty")}</p>
            )}
          </section>

          {/* Visit */}
          <section id="visit" aria-labelledby="h-visit" className="scroll-mt-36">
            <h2 id="h-visit" className="text-4xl text-forest">{t("visitTitle")}</h2>
            <p className="mt-3 max-w-2xl text-stone-700">{t("visitIntro")}</p>
            {d.experiences.length ? (
              <ul className="mt-6 grid gap-4 md:grid-cols-2">
                {d.experiences.map((e) => (
                  <li key={e.id} className="card flex flex-col p-5">
                    <p className="eyebrow">{tk(e.kind as "tasting")}</p>
                    <h3 className="mt-2 font-display text-2xl leading-tight">{pick(e.name, locale)}</h3>
                    {pick(e.description, locale) && <p className="mt-2 text-sm leading-relaxed text-stone-700">{pick(e.description, locale)}</p>}
                    <ul className="mt-4 flex flex-wrap gap-2 text-xs">
                      {e.wines_included != null && <li className="chip">{t("experienceDetails.wines", { count: e.wines_included })}</li>}
                      {e.duration_min != null && <li className="chip"><Icon name="clock" size={13} /> {t("experienceDetails.duration", { minutes: e.duration_min })}</li>}
                      {e.price_eur != null ? <li className="chip chip-brass">{t("experienceDetails.price", { price: fmt.number(Number(e.price_eur), { minimumFractionDigits: 0, maximumFractionDigits: 2 }) })}</li> : <li className="chip">{t("experienceDetails.priceUnknown")}</li>}
                      {e.max_group != null && <li className="chip"><Icon name="users" size={13} /> {e.min_group ? t("experienceDetails.group", { min: e.min_group, max: e.max_group }) : t("experienceDetails.groupMax", { max: e.max_group })}</li>}
                      {e.food_included && <li className="chip">{t("experienceDetails.food")}</li>}
                      {e.appointment_required && <li className="chip">{t("experienceDetails.appointment")}</li>}
                      {e.languages.map((l) => <li key={l} className="chip">{tl(l as "hr")}</li>)}
                    </ul>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug }, query: { experience: String(e.id) } }} className="btn btn-wine btn-sm">{t("requestTasting")}</Link>
                      <span className="text-[0.7rem] text-stone-700">{tv(e.verification as "unverified")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-line p-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-stone-700">{t("noExperiences")}</p>
                <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug } }} className="btn btn-wine btn-sm shrink-0">{t("contactWinery")}</Link>
              </div>
            )}
            {d.facilities.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl">{t("facilitiesTitle")}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {d.facilities.map((f) => <li key={f.facility} className="chip chip-forest"><Icon name="check" size={13} /> {tf(f.facility as "tasting")}</li>)}
                </ul>
              </div>
            )}
          </section>

          {/* Wines */}
          <section id="wines" aria-labelledby="h-wines" className="scroll-mt-36">
            <h2 id="h-wines" className="text-4xl text-forest">{t("winesTitle")}</h2>
            {d.wines.length ? (
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {d.wines.map((wine) => (
                  <li key={wine.id} className="group relative flex gap-4 rounded-2xl border border-line bg-paper p-4 transition-shadow hover:shadow-soft">
                    <div className="grid h-24 w-14 shrink-0 place-items-center rounded-xl" style={{ background: wine.type === "red" ? "#792E39" : wine.type === "rose" ? "#D9A3A3" : wine.type === "orange" ? "#C98A3E" : wine.type === "sparkling" ? "#E8DDB5" : "#E6D9A8" }}>
                      {wine.bottle_path ? <img src={mediaUrl(wine.bottle_path)!} alt="" className="h-full w-full object-contain" /> : <Icon name="bottle" size={26} className={wine.type === "red" ? "text-ivory" : "text-forest"} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-stone-700">{tw(wine.type as "red")}</p>
                      <h3 className="mt-1 font-display text-xl leading-tight">
                        <Link href={{ pathname: "/wines/[slug]", params: { slug: wine.slug } }} className="after:absolute after:inset-0">{wine.name}</Link>
                      </h3>
                      <p className="mt-1 text-sm text-stone-700">{wine.grapes.map((g) => `${grapeName(g, locale)}${g.percentage && wine.grapes.length > 1 ? ` ${g.percentage}%` : ""}`).join(", ")}</p>
                      {wine.site && <p className="mt-1 text-xs text-brass-700">{pick(wine.site.name, locale)}</p>}
                      {wine.award_count > 0 && <p className="mt-2 chip chip-brass"><Icon name="medal" size={13} /> {wine.award_count}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-stone-700">{t("winesEmpty")}</p>}
          </section>

          {/* Grapes */}
          <section id="grapes" aria-labelledby="h-grapes" className="scroll-mt-36">
            <h2 id="h-grapes" className="text-4xl text-forest">{t("grapesTitle")}</h2>
            {d.grapes.length ? (
              <ul className="mt-6 flex flex-wrap gap-3">
                {d.grapes.map((g) => (
                  <li key={g.slug}>
                    <Link href={{ pathname: "/grapes/[slug]", params: { slug: g.slug } }} className="flex items-center gap-3 rounded-2xl border border-line bg-paper px-4 py-3 hover:border-forest">
                      <span className="h-3 w-3 rounded-full" style={{ background: g.berry_color === "red" ? "#792E39" : g.berry_color === "grey" ? "#B88A8E" : "#C9B26A" }} />
                      <span>
                        <span className="block font-medium">{grapeName(g, locale)}</span>
                        <span className="block text-xs text-stone-700">{g.is_signature ? `${t("signature")} · ` : ""}{t(`relation.${g.relation as "grown"}`)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-stone-700">{t("grapesEmpty")}</p>}
          </section>

          {/* Vineyards */}
          <section id="vineyards" aria-labelledby="h-vineyards" className="scroll-mt-36">
            <h2 id="h-vineyards" className="text-4xl text-forest">{t("vineyardsTitle")}</h2>
            {d.stats.length || d.vineyards.length ? (
              <>
                {d.stats.length > 0 && (
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {d.stats.map((s) => (
                      <div key={`${s.metric}-${s.reference_year}`} className="card p-5">
                        <dt className="text-xs font-medium uppercase tracking-wider text-stone-700">{t(`stats.${s.metric as "vine_count"}`)}</dt>
                        <dd className="mt-2 font-display text-3xl text-forest">{t(`statUnits.${s.metric as "vine_count"}`, { value: fmt.number(Number(s.value)) })}</dd>
                        <dd className="mt-1 text-xs text-stone-700">{s.reference_year ? t("referenceYear", { year: s.reference_year }) : ""} · {tv(s.verification as "unverified")}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {d.vineyards.map((v) => (
                  <div key={v.id} className="card mt-4 p-5">
                    <h3 className="font-display text-2xl">{v.name}</h3>
                    <dl className="mt-3 grid gap-x-6 sm:grid-cols-2">
                      {v.area_ha && <Fact label={t("stats.vineyard_area_ha")}>{t("statUnits.vineyard_area_ha", { value: fmt.number(Number(v.area_ha)) })}</Fact>}
                      {v.altitude_m != null && <Fact label={t("stats.altitude_max_m")}>{v.altitude_m} m</Fact>}
                      {v.aspect && <Fact label={t("aspect")}>{v.aspect}</Fact>}
                      {pick(v.soil, locale) && <Fact label={t("soil")}>{pick(v.soil, locale)}</Fact>}
                      {v.vine_age_years != null && <Fact label={t("stats.average_vine_age_years")}>{v.vine_age_years}</Fact>}
                      {v.planting_density_per_ha != null && <Fact label={t("stats.planting_density_per_ha")}>{v.planting_density_per_ha}</Fact>}
                    </dl>
                  </div>
                ))}
              </>
            ) : <p className="mt-4 max-w-2xl text-stone-700">{t("vineyardsEmpty")}</p>}
          </section>

          {/* Awards */}
          <section id="awards" aria-labelledby="h-awards" className="scroll-mt-36">
            <h2 id="h-awards" className="text-4xl text-forest">{t("awardsTitle")}</h2>
            <p className="mt-2 text-sm text-stone-700">{t("awardsNote")}</p>
            {d.awards.length ? (
              <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-paper">
                {d.awards.map((a) => (
                  <li key={a.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brass-100 text-brass-700"><Icon name="medal" /></span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{tm(a.medal as "gold")}{a.medal_label ? ` — ${a.medal_label}` : ""}{a.score ? ` · ${t("score", { score: a.score })}` : ""}</p>
                      <p className="text-sm text-stone-700">{a.competition.name} {a.year} · <Link href={{ pathname: "/wines/[slug]", params: { slug: a.wine.slug } }} className="underline underline-offset-4">{a.wine.name}</Link> · {a.vintage_year ? t("vintage", { year: a.vintage_year }) : t("nonVintage")}</p>
                    </div>
                    {a.source_url && <a href={a.source_url} target="_blank" rel="noopener noreferrer nofollow" className="text-sm text-forest underline underline-offset-4">{t("officialResults")}</a>}
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-stone-700">{t("awardsEmpty")}</p>}
          </section>

          {d.media.length > 0 && (
            <section id="gallery" aria-labelledby="h-gallery" className="scroll-mt-36">
              <h2 id="h-gallery" className="mb-6 text-4xl text-forest">{t("sections.gallery")}</h2>
              <Gallery images={d.media.map((m) => ({ src: mediaUrl(m.storage_path)!, alt: pick(m.alt, locale) || w.name, caption: pick(m.caption, locale), credit: m.credit }))} />
            </section>
          )}

          {/* Location */}
          <section id="location" aria-labelledby="h-location" className="scroll-mt-36">
            <h2 id="h-location" className="text-4xl text-forest">{t("locationTitle")}</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.3fr]">
              <ul className="space-y-4">
                {d.locations.map((l) => (
                  <li key={l.id} className="card p-5">
                    <p className="eyebrow">{pick(l.label, locale) || t(`locationKind.${l.kind as "winery"}`)}</p>
                    <address className="mt-2 not-italic leading-relaxed">
                      {l.address && <span className="block">{l.address}</span>}
                      <span className="block">{[l.postal_code, l.town].filter(Boolean).join(" ")}</span>
                      <span className="block text-sm text-stone-700">{[l.municipality !== l.town ? l.municipality : null, l.county ? `${l.county} ${locale === "hr" ? "županija" : "County"}` : null].filter(Boolean).join(", ")}</span>
                    </address>
                    <p className="mt-3 flex items-start gap-1.5 text-xs text-stone-700"><Icon name="info" size={13} className="mt-0.5 shrink-0" /> {tp(l.precision as "settlement")}{(l.precision === "settlement" || l.precision === "approximate") && `. ${tp("note")}`}</p>
                  </li>
                ))}
              </ul>
              <div className="h-80 overflow-hidden rounded-2xl border border-line">
                <LocationMap color={color} points={d.locations.filter((l) => l.lat != null).map((l) => ({ id: l.id, slug: w.slug, name: pick(l.label, locale) || w.name, town: l.town, lat: l.lat!, lng: l.lng!, precision: l.precision }))} />
              </div>
            </div>
          </section>

          {/* Related */}
          {(nearby.length > 0 || similar.length > 0) && (
            <section aria-labelledby="h-related">
              <h2 id="h-related" className="text-4xl text-forest">{t("sections.related")}</h2>
              <div className="mt-6 grid gap-8 md:grid-cols-2">
                {[{ title: t("nearbyTitle"), items: nearby.map((n) => ({ ...n, sub: `${n.town ?? ""} · ${tc("km", { value: n.distance_km })}` })) },
                  { title: t("similarTitle"), items: similar.map((n) => ({ ...n, sub: n.shared.join(", ") })) }].map((group) => group.items.length > 0 && (
                  <div key={group.title}>
                    <h3 className="text-xl">{group.title}</h3>
                    <ul className="mt-3 space-y-2">
                      {group.items.map((n) => (
                        <li key={n.slug}>
                          <Link href={{ pathname: "/wineries/[slug]", params: { slug: n.slug } }} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3 hover:border-forest">
                            <RegionDot color={n.region_color} />
                            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{n.name}</span><span className="block truncate text-xs text-stone-700">{n.sub}</span></span>
                            <Icon name="arrowRight" size={16} className="text-stone-700" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources */}
          <section id="sources" aria-labelledby="h-sources" className="scroll-mt-36">
            <h2 id="h-sources" className="text-4xl text-forest">{t("sourcesTitle")}</h2>
            <p className="mt-2 text-sm text-stone-700">{t("sourcesIntro")}</p>
            <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto]">
              <SourceList sources={d.sources} />
              <div className="space-y-2 text-sm">
                <p>{t("status")}: <VerificationBadge state={w.verification} compact /></p>
                <p className="text-xs text-stone-700">{tv(`explain_${w.verification as "unverified"}`)}</p>
                <p className="text-xs text-stone-700">{tc("lastUpdated", { date: date(w.updated_at) ?? "" })}</p>
                <Link href={{ pathname: "/stories/[slug]", params: { slug: "how-the-atlas-verifies-information" } }} className="text-xs text-forest underline underline-offset-4">{tv("howWeVerify")}</Link>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={{ pathname: "/wineries/[slug]/report", params: { slug } }} className="btn btn-ghost btn-sm"><Icon name="flag" size={16} /> {t("reportError")}</Link>
              <Link href={{ pathname: "/claim", query: { winery: slug } }} className="btn btn-ghost btn-sm"><Icon name="shield" size={16} /> {t("claim")}</Link>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="card p-6">
            <h2 className="font-display text-2xl">{t("quickFacts")}</h2>
            <dl className="mt-3">
              {w.region && <Fact label={t("region")}><Link className="underline decoration-line underline-offset-4 hover:decoration-forest" href={{ pathname: "/regions/[region]", params: { region: w.region.slug } }}>{pick(w.region.name, locale)}</Link></Fact>}
              {w.subregion && w.region && <Fact label={t("subregion")}><Link className="underline decoration-line underline-offset-4 hover:decoration-forest" href={{ pathname: "/regions/[region]/[subregion]", params: { region: w.region.slug, subregion: w.subregion.slug } }}>{pick(w.subregion.name, locale)}</Link></Fact>}
              {w.district && <Fact label={t("district")}><Link className="underline decoration-line underline-offset-4 hover:decoration-forest" href={{ pathname: "/districts/[slug]", params: { slug: w.district.slug } }}>{pick(w.district.name, locale)}</Link></Fact>}
              {w.island && <Fact label={t("island")}>{w.island}</Fact>}
              {w.founded_year && <Fact label={t("founded")}>{w.founded_year}</Fact>}
              {w.founder && <Fact label={t("founder")}>{w.founder}</Fact>}
              {w.owner_name && <Fact label={t("owner")}>{w.owner_name}</Fact>}
              {w.winemaker_name && <Fact label={t("winemaker")}>{w.winemaker_name}</Fact>}
              {w.size_category && <Fact label={t("producerType")}>{tsz(w.size_category as "family")}</Fact>}
              {w.family_run && <Fact label={t("familyRun")}>{tc("yes")}</Fact>}
              {w.languages.length > 0 && <Fact label={t("languagesSpoken")}>{w.languages.map((l) => tl(l as "hr")).join(", ")}</Fact>}
              {(w.opening_hours?.[locale] || w.appointment_only) && <Fact label={t("openingHours")}>{w.opening_hours?.[locale] ?? t("byAppointment")}</Fact>}
            </dl>
            <h3 className="mt-6 text-xs font-medium uppercase tracking-wider text-stone-700">{t("contact")}</h3>
            <ul className="mt-2 space-y-2 text-[0.95rem]">
              {w.website && <li><a className="flex items-center gap-2 text-forest hover:underline" href={w.website} target="_blank" rel="noopener noreferrer"><Icon name="globe" size={16} /> {w.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a></li>}
              {w.email && <li><a className="flex items-center gap-2 text-forest hover:underline" href={`mailto:${w.email}`}><Icon name="mail" size={16} /> {w.email}</a></li>}
              {w.phone && <li><a className="flex items-center gap-2 text-forest hover:underline" href={`tel:${w.phone.replace(/\s/g, "")}`}><Icon name="phone" size={16} /> {w.phone}</a></li>}
              {w.whatsapp && <li><a className="flex items-center gap-2 text-forest hover:underline" href={`https://wa.me/${w.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"><Icon name="phone" size={16} /> WhatsApp</a></li>}
              {w.instagram && <li><a className="flex items-center gap-2 text-forest hover:underline" href={w.instagram} target="_blank" rel="noopener noreferrer"><Icon name="instagram" size={16} /> Instagram</a></li>}
              {w.facebook && <li><a className="flex items-center gap-2 text-forest hover:underline" href={w.facebook} target="_blank" rel="noopener noreferrer"><Icon name="facebook" size={16} /> Facebook</a></li>}
              {w.youtube && <li><a className="flex items-center gap-2 text-forest hover:underline" href={w.youtube} target="_blank" rel="noopener noreferrer"><Icon name="youtube" size={16} /> YouTube</a></li>}
              {!w.website && !w.email && !w.phone && <li className="text-sm text-stone-700">{tc("notAvailable")}</li>}
            </ul>
            <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug } }} className="btn btn-wine mt-6 w-full"><Icon name="glass" size={18} /> {t("requestTasting")}</Link>
          </div>
        </aside>
      </div>
      {/* Mobile sticky contact bar */}
      <div className="sticky bottom-0 z-30 border-t border-line bg-ivory/95 p-3 backdrop-blur lg:hidden">
        <div className="flex gap-2">
          <Link href={{ pathname: "/wineries/[slug]/inquiry", params: { slug } }} className="btn btn-wine flex-1"><Icon name="glass" size={18} /> {t("requestTasting")}</Link>
          {directions && <a href={directions.google} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" aria-label={t("directions")}><Icon name="compass" size={18} /></a>}
          {w.phone && <a href={`tel:${w.phone.replace(/\s/g, "")}`} className="btn btn-ghost" aria-label={t("phone")}><Icon name="phone" size={18} /></a>}
        </div>
      </div>
    </article>
  );
}
