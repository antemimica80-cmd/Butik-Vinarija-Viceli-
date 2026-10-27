"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../Icon";
import { useLocalFavorites, useRoute, type RouteStopLite } from "@/lib/client-store";
import { toggleFavorite, toggleVisited } from "@/app/actions/favorites";

export function SaveButton({ wineryId, slug, loggedIn, initialSaved, className = "" }: { wineryId: number; slug: string; loggedIn: boolean; initialSaved: boolean; className?: string }) {
  const t = useTranslations("winery");
  const local = useLocalFavorites();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const [hint, setHint] = useState(false);
  const isSaved = loggedIn ? saved : local.has(slug);
  return (
    <span className="relative inline-flex">
      <button type="button" aria-pressed={isSaved} disabled={pending} className={`btn btn-ghost btn-sm ${className}`}
        onClick={() => {
          if (!loggedIn) { local.toggle(slug); setHint(!isSaved); return; }
          start(async () => { const r = await toggleFavorite({ type: "winery", id: wineryId }); if (r.ok) setSaved(r.saved); });
        }}>
        <Icon name="heart" size={16} fill={isSaved ? "currentColor" : "none"} className={isSaved ? "text-burgundy" : ""} />
        {isSaved ? t("saved") : t("save")}
      </button>
      {hint && !loggedIn && <span role="status" className="absolute left-0 top-full z-20 mt-2 w-64 rounded-xl bg-ink p-3 text-xs text-ivory shadow-lift">{t("savedLocal")}</span>}
    </span>
  );
}

export function VisitedButton({ wineryId, initial }: { wineryId: number; initial: boolean }) {
  const t = useTranslations("account");
  const [v, setV] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button type="button" aria-pressed={v} disabled={pending} className="btn btn-ghost btn-sm"
      onClick={() => start(async () => { const r = await toggleVisited(wineryId); if (r.ok) setV(r.visited); })}>
      <Icon name={v ? "check" : "flag"} size={16} /> {v ? t("visited") : t("markVisited")}
    </button>
  );
}

export function ShareButton({ title, className = "" }: { title: string; className?: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" className={`btn btn-ghost btn-sm ${className}`}
      onClick={async () => {
        const url = window.location.href;
        if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { /* cancelled */ } }
        await navigator.clipboard?.writeText(url);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
      }}>
      <Icon name="share" size={16} /> {copied ? t("linkCopied") : t("share")}
    </button>
  );
}

export function AddToRouteButton({ stop, className = "" }: { stop: RouteStopLite; className?: string }) {
  const t = useTranslations("winery");
  const route = useRoute();
  const inRoute = route.has(stop.id);
  return (
    <button type="button" aria-pressed={inRoute} className={`btn btn-ghost btn-sm ${className}`} onClick={() => (inRoute ? route.remove(stop.id) : route.add(stop))}>
      <Icon name={inRoute ? "check" : "route"} size={16} /> {inRoute ? t("inRoute") : t("addToRoute")}
    </button>
  );
}
