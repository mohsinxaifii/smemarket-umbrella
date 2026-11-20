import type { Metadata } from "next";
import { SplitHeading } from "@/components/ui/Reveal";
import POLICY from "@/lib/privacy.json";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How SMEmarket collects, uses and protects your personal data under the UAE PDPL.",
  alternates: { canonical: "/privacy" },
};

type Block = { tag: string; text: string; rows?: string[][] };
type Part = { title: string; id: string; blocks: Block[] };

/** Splits the policy (kept word for word in lib/privacy.json) into numbered sections. */
function parts() {
  const intro: Block[] = [];
  const out: Part[] = [];
  for (const [tag, v] of POLICY as [string, string | string[][]][]) {
    if (tag === "table") {
      (out.length ? out[out.length - 1].blocks : intro).push({ tag, text: "", rows: v as string[][] });
      continue;
    }
    const text = v as string;
    if (tag === "h2") out.push({ title: text, id: text.toLowerCase().replace(/^\d+\.\s*/, "").replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""), blocks: [] });
    else (out.length ? out[out.length - 1].blocks : intro).push({ tag, text });
  }
  return { intro, out };
}

/** Groups runs of list items so they render as one list. */
function render(blocks: Block[]) {
  const nodes: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (k: number) => {
    if (!list.length) return;
    nodes.push(
      <ul key={`l${k}`} className="list-disc space-y-1.5 pl-5 marker:text-faint">
        {list.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  blocks.forEach((b, k) => {
    if (b.tag === "li") return list.push(b.text);
    flush(k);
    if (b.tag === "table" && b.rows) {
      const [head, ...rows] = b.rows;
      nodes.push(
        <div key={k} className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0" data-lenis-prevent>
          <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-b border-ink">
                {head.map((h) => (
                  <th key={h} className="py-2.5 pr-4 font-semibold text-ink">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-rule align-top">
                  {r.map((c, j) => (
                    <td key={j} className={`py-3 pr-4 ${j === 0 ? "font-medium text-ink" : ""}`}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      return;
    }
    nodes.push(
      b.tag === "h3" ? (
        <h3 key={k} className="pt-2 text-[19px] font-semibold text-ink">
          {b.text}
        </h3>
      ) : (
        <p key={k}>{b.text}</p>
      ),
    );
  });
  flush(blocks.length);
  return nodes;
}

export default function PrivacyPage() {
  const { intro, out } = parts();
  return (
    <section className="bg-paper pb-24 pt-[108px] md:pt-[128px]">
      <div className="container-x">
        <p className="label">Privacy policy</p>
        <SplitHeading as="h1" immediate className="display mt-4 max-w-4xl text-[clamp(2.6rem,min(5.6vw,10vh),5rem)]">
          How we look after your data.
        </SplitHeading>
        <p className="mt-5 text-[15px] text-muted">
          Last updated: 20 November 2026 · {SITE.legal} · Meydan Free Zone, Dubai
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[260px_1fr] lg:gap-16">
          <nav aria-label="Contents" className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <p className="text-[14px] font-semibold text-muted">Contents</p>
            <ol className="mt-3 space-y-1.5 border-l border-rule-strong pl-4 text-[15px]">
              {out.map((p) => (
                <li key={p.id}>
                  <a href={`#${p.id}`} className="text-ink-2 hover:text-ink hover:underline">
                    {p.title.replace(/^\d+\.\s*/, "")}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="min-w-0 max-w-3xl space-y-12 text-[17px] leading-relaxed text-ink-2">
            <div className="space-y-4 text-[19px] text-ink">{render(intro)}</div>
            {out.map((p) => (
              <article key={p.id} id={p.id} className="scroll-mt-28 border-t border-rule-strong pt-8">
                <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-tight text-ink">{p.title}</h2>
                <div className="mt-4 space-y-4">{render(p.blocks)}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
