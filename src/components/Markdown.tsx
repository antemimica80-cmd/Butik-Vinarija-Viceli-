import { Fragment, type ReactNode } from "react";

/**
 * Minimal, safe Markdown subset for editorial content: headings (##, ###), paragraphs,
 * unordered lists, **bold**, *italic* and [links](https://…). No raw HTML is ever rendered.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyPrefix}-${i++}`;
    if (tok.startsWith("**")) out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith("*")) out.push(<em key={k}>{tok.slice(1, -1)}</em>);
    else {
      const label = tok.slice(1, tok.indexOf("]"));
      const href = tok.slice(tok.indexOf("(") + 1, -1);
      const ext = href.startsWith("http");
      out.push(<a key={k} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{label}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source, className = "prose-atlas" }: { source: string; className?: string }) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className={className}>
      {blocks.map((block, bi) => {
        const b = block.trim();
        if (!b) return null;
        if (b.startsWith("### ")) return <h3 key={bi}>{inline(b.slice(4), `h${bi}`)}</h3>;
        if (b.startsWith("## ")) return <h2 key={bi}>{inline(b.slice(3), `h${bi}`)}</h2>;
        const lines = b.split("\n");
        if (lines.every((l) => /^\s*[-*] /.test(l))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-*] /, ""), `l${bi}-${li}`)}</li>)}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => <Fragment key={li}>{li > 0 && <br />}{inline(l, `p${bi}-${li}`)}</Fragment>)}
          </p>
        );
      })}
    </div>
  );
}
