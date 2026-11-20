"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, X } from "lucide-react";
import { useInView } from "@/lib/useInView";

const ROWS = [
  "Every listing reviewed before it goes up",
  "Every enquiry checked by our team first",
  "Your business name kept private",
  "Real figures, with documents to back them",
  "One team handles every buyer for you",
  "Free to list, pay only when it sells",
];

/** The honest comparison: how deals happen today, and how they happen here. */
export default function Compare() {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, 0.15);
  // play once, then keep the ticks: they shouldn't vanish when you scroll away
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);
  return (
    <section ref={root} className="section-y bg-paper">
      <div className="container-x">
        <div className="mx-auto max-w-3xl text-center">
          <p className="label">The difference</p>
          <h2 className="display mt-4 text-section">Not another WhatsApp group.</h2>
          <p className="mt-4 text-[19px] leading-relaxed text-ink-2">Most small businesses in the UAE still change hands through forwarded messages and classified ads. Here&apos;s what changes on SMEmarket.</p>
        </div>
        <div className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-[28px] ring-1 ring-rule">
          <div className="grid grid-cols-[1fr_88px_88px] bg-paper-2 px-5 py-4 text-[14px] font-semibold md:grid-cols-[1fr_180px_180px] md:px-8">
            <span />
            <span className="text-center text-muted">
              <span className="md:hidden">Groups & ads</span>
              <span className="hidden md:inline">WhatsApp groups & classifieds</span>
            </span>
            <span className="text-center">SMEmarket</span>
          </div>
          {ROWS.map((r, i) => (
            <div key={r} className="grid grid-cols-[1fr_88px_88px] items-center border-t border-rule bg-card px-5 py-4 md:grid-cols-[1fr_180px_180px] md:px-8">
              <span className="text-[16px] font-medium md:text-[17px]">{r}</span>
              <span className="flex justify-center">
                <span className={clsx("grid size-8 place-items-center rounded-full bg-paper-2 text-muted transition-opacity duration-500", seen ? "opacity-100" : "opacity-0")} style={{ transitionDelay: `${i * 220}ms` }}>
                  <X className="size-4" />
                </span>
              </span>
              <span className="flex justify-center">
                {/* the tick pops in a beat after the cross, row by row */}
                <span key={String(seen)} className="grid size-8 place-items-center rounded-full bg-lime" style={seen ? { animation: `tickPop .5s cubic-bezier(.34,1.56,.64,1) ${250 + i * 220}ms both` } : { transform: "scale(0)" }}>
                  <Check className="size-4" strokeWidth={3} />
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
