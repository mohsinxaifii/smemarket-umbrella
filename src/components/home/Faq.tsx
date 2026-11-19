"use client";
import { useState } from "react";
import clsx from "clsx";
import { Plus } from "lucide-react";
import Character from "@/components/ui/Character";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/site";

/** Questions on the right, open one at a time; the person who answers them on the left. */
export default function Faq({ items, title = "Questions, answered.", tone = "bg-paper" }: { items: { q: string; a: string }[]; title?: string; tone?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <section className={clsx(tone, "section-y")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label">FAQ</p>
          <h2 className="display mt-4 text-section">{title}</h2>
          <div className="mt-8 flex items-end gap-4">
            <div className="overflow-hidden rounded-[22px] bg-lime">
              <Character who="noor" mood="happy" body="Device" size={120} className="translate-y-[8%]" />
            </div>
            <div className="pb-2">
              <p className="text-[16px] font-semibold">Still wondering?</p>
              <p className="text-[15px] text-muted">Noor and the team answer on WhatsApp.</p>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#25D366] px-4 text-[15px] font-semibold text-white transition hover:brightness-95">
                <WhatsAppIcon className="size-4" /> Ask us
              </a>
            </div>
          </div>
        </div>

        <ul className="border-t border-rule-strong">
          {items.map((f, k) => {
            const on = open === k;
            return (
              <li key={f.q} className="border-b border-rule-strong">
                <button onClick={() => setOpen(on ? null : k)} aria-expanded={on} className="group flex w-full items-center justify-between gap-6 py-5 text-left md:py-6">
                  <span className="text-[19px] font-semibold leading-snug md:text-[21px]">{f.q}</span>
                  <span className={clsx("grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-out-expo", on ? "rotate-45 border-ink bg-ink text-lime" : "border-rule-strong group-hover:border-ink")}>
                    <Plus className="size-5" />
                  </span>
                </button>
                <div className={clsx("grid transition-[grid-template-rows] duration-500 ease-out-expo", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-6 pr-12 text-[17px] leading-relaxed text-ink-2">{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
