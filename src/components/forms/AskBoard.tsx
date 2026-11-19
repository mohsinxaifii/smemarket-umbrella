"use client";
import { ArrowDownRight } from "lucide-react";
import { getLenis } from "@/components/layout/SmoothScroll";

/** Common questions as buttons: tap one and it lands in the form below, ready to send. */
export default function AskBoard({ form, items }: { form: "advisory" | "brokerage" | "contact"; items: { q: string; topic?: string }[] }) {
  const pick = (q: string, topic?: string) => {
    window.dispatchEvent(new CustomEvent(`smem:prefill-${form}`, { detail: { text: q, topic } }));
    const el = document.getElementById("ask");
    const l = getLenis();
    if (el && l) l.scrollTo(el, { offset: -90, duration: 1.1 });
    else el?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((it, i) => (
        <button
          key={it.q}
          onClick={() => pick(it.q, it.topic)}
          style={{ animation: `pageIn .6s cubic-bezier(.16,1,.3,1) ${i * 60}ms both` }}
          className="group flex items-center gap-2 rounded-full border border-ink/15 bg-card px-4 py-2.5 text-left text-[15px] font-medium transition hover:-translate-y-0.5 hover:border-ink hover:bg-ink hover:text-paper"
        >
          “{it.q}”
          <ArrowDownRight className="size-4 shrink-0 opacity-40 transition group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}
