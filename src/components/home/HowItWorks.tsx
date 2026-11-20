"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/useInView";
import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";
import Character from "@/components/ui/Character";
import { APP } from "@/lib/site";

const SIDES = {
  buy: {
    label: "I'm buying",
    tone: "bg-[#f6e3b5]",
    mood: "thinking" as const,
    body: "Paper" as const,
    steps: [
      { t: "Browse listings", d: "Curated UAE businesses with asking prices, revenue and profit. Filter by city, industry and price." },
      { t: "Ask us about it", d: "Message or WhatsApp us about any business. No account, no paperwork." },
      { t: "Meet the owner, then agree", d: "We share the details, arrange a visit, and help you through to the SPA." },
    ],
    cta: { label: "Browse businesses for sale", href: APP.listings },
    note: "A person replies within one business day.",
  },
  sell: {
    label: "I'm selling",
    tone: "bg-[#e3dcf2]",
    mood: "happy" as const,
    body: "Coffee" as const,
    steps: [
      { t: "Answer 7 quick questions", d: "About two minutes, no account needed. Nothing goes live when you send it." },
      { t: "We prepare your listing", d: "We call you, check the details and write the listing. Your business name stays private." },
      { t: "We handle the buyers", d: "Every enquiry comes to us. You only meet serious buyers, and pay 5% only when it sells." },
    ],
    cta: { label: "List your business for free", href: APP.sell },
    note: "Free to list. 5% only at the SPA.",
  },
};

/** Three steps each way, behind a simple Buying / Selling switch. */
export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);
  const seen = useInView(root, 0.35);
  const [side, setSide] = useState<keyof typeof SIDES>("buy");
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const s = SIDES[side];

  // plays on its own: step 1, 2, 3, then the other side, until someone clicks
  useEffect(() => {
    if (!seen || !auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (step < 2) setStep(step + 1);
      else {
        setSide((x) => (x === "buy" ? "sell" : "buy"));
        setStep(0);
      }
    }, step === 2 ? 3000 : 2200);
    return () => clearTimeout(t);
  }, [seen, auto, step]);
  const pick = (k: keyof typeof SIDES) => {
    setAuto(false);
    setSide(k);
    setStep(0);
  };

  return (
    <section ref={root} id="how" className="section-y bg-paper-2">
      <div className="container-x">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">How it works</p>
            <h2 className="display mt-4 text-section">Three steps. Whichever side you&apos;re on.</h2>
          </div>
          <div role="tablist" className="relative inline-flex w-fit rounded-full bg-paper p-1 ring-1 ring-rule">
            <span className={clsx("absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-500 ease-out-expo", side === "sell" && "translate-x-full")} />
            {(Object.keys(SIDES) as (keyof typeof SIDES)[]).map((k) => (
              <button key={k} role="tab" aria-selected={side === k} onClick={() => pick(k)} className={clsx("relative z-10 w-36 rounded-full py-2.5 text-[15px] font-semibold transition-colors duration-300", side === k ? "text-paper" : "text-ink")}>
                {SIDES[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:mt-12 lg:grid-cols-[1fr_340px]">
          <ol key={side} className="grid gap-3 md:grid-cols-3 md:gap-4">
            {s.steps.map((st, i) => (
              <li
                key={st.t}
                onClick={() => (setAuto(false), setStep(i))}
                className={clsx("relative flex cursor-pointer flex-col overflow-hidden rounded-[24px] p-6 transition-all duration-500 md:p-7", i === step ? "-translate-y-1 bg-ink text-paper shadow-[0_24px_50px_-28px_rgba(21,19,15,.6)]" : "bg-card ring-1 ring-rule")}
                style={{ animation: `pageIn .6s cubic-bezier(.16,1,.3,1) ${i * 90}ms both` }}
              >
                <span className={clsx("grid size-10 place-items-center rounded-full text-[15px] font-semibold transition-colors duration-500", i === step ? "bg-lime text-ink" : "bg-ink text-lime")}>{i + 1}</span>
                {i === step && auto && seen && <span key={`${side}${step}`} className="absolute inset-x-0 bottom-0 h-1 origin-left bg-lime [animation:grow_2.2s_linear_both]" />}
                <h3 className="mt-6 text-[21px] font-semibold leading-snug">{st.t}</h3>
                <p className={clsx("mt-2 text-[16px] leading-relaxed transition-colors duration-500", i === step ? "text-paper/75" : "text-ink-2")}>{st.d}</p>
              </li>
            ))}
          </ol>
          <div className={clsx("relative flex min-h-[300px] flex-col overflow-hidden rounded-[24px] p-6 transition-colors duration-700 md:p-7", s.tone)}>
            <p className="text-[15px] font-semibold text-ink/70">{s.note}</p>
            <a href={s.cta.href} className="group relative z-10 mt-4 inline-flex h-12 w-fit items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-semibold text-paper transition hover:bg-ink-3">
              {s.cta.label} <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
            </a>
            <Character key={side} who="rashid" mood={s.mood} body={s.body} size={220} className="absolute -bottom-3 right-0 animate-idle" />
          </div>
        </div>
      </div>
    </section>
  );
}
