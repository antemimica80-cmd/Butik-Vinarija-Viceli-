import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import { Markdown } from "./Markdown";
import { Landscape } from "./Landscape";

export async function loadContent(locale: string, name: "about" | "privacy" | "terms") {
  return readFile(path.join(process.cwd(), "src/content", locale, `${name}.md`), "utf8");
}

export function PageHero({ eyebrow, title, intro, variant = "neutral", children }: { eyebrow?: string; title: string; intro?: string; variant?: "neutral" | "dalmatia" | "istria" | "slavonia" | "uplands"; children?: ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden bg-forest text-ivory">
      <Landscape variant={variant} seed={title.length} className="absolute inset-0 -z-10 h-full w-full opacity-90" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="container-x pb-12 pt-20 md:pb-16 md:pt-28">
        {children}
        {eyebrow && <p className="eyebrow eyebrow-light mt-6">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-5xl md:text-7xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ivory/85">{intro}</p>}
      </div>
    </header>
  );
}

export async function MarkdownPage({ locale, name, title, intro }: { locale: string; name: "about" | "privacy" | "terms"; title: string; intro?: string }) {
  const src = await loadContent(locale, name);
  return (
    <>
      <PageHero title={title} intro={intro} />
      <div className="container-x max-w-3xl py-14"><Markdown source={src} /></div>
    </>
  );
}
