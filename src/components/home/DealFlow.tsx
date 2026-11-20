"use client";
import { useRef } from "react";
import clsx from "clsx";
import { BadgeCheck, FileSignature, Handshake, Lock, MapPin, MessagesSquare, ShieldCheck, Unlock } from "lucide-react";
import { useInView, useCycle } from "@/lib/useInView";
import { TRUST } from "@/lib/site";

const ICONS = [ShieldCheck, MessagesSquare, BadgeCheck, Handshake];
const STATUS = ["Reviewed · live", "A buyer asked us", "Checked by our team", "Introduced to the owner"];

/**
 * From listing to introduction. Plays by itself when it comes on screen: each step lights up in turn and
 * the listing card moves with it. Tap a step to jump to it.
 */
export default function DealFlow() {
  const root = useRef<HTMLElement>(null);
  const seen = useInView(root, 0.35);
  // plays on its own while on screen: one check every 2.4s, a longer pause once it's all unlocked
  const [step, setStep] = useCycle(4, 2400, seen);

  const open = step >= 2;

  return (
    <section ref={root} className="bg-paper-2">
      <div className="section-y">
        <div className="container-x grid items-center gap-8 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
          <div>
            <p className="label">Trust, built in</p>
            <h2 className="display mt-4 text-section">From listing to handshake.</h2>
            <p className="mt-5 max-w-xl text-[19px] leading-relaxed text-ink-2">Every buyer asks us first. We answer their questions, check they&apos;re serious, and introduce them to the owner. Sellers never deal with time-wasters.</p>

            <ol className="relative mt-7 space-y-1 md:mt-10 md:space-y-2">
              <span className="absolute bottom-6 left-[19px] top-6 w-[2px] bg-ink/10">
                <span className="block origin-top bg-ink transition-[height] duration-700 ease-out-expo" style={{ height: `${(step / 3) * 100}%` }} />
              </span>
              {TRUST.map((t, i) => {
                const I = ICONS[i];
                const on = i <= step;
                return (
                  <li key={t.t} className="relative flex cursor-pointer gap-5" onClick={() => setStep(i)}>
                    <span className={clsx("relative z-10 grid size-10 shrink-0 place-items-center rounded-full transition-all duration-500", on ? "bg-ink text-lime" : "bg-paper-2 text-ink/40 ring-2 ring-ink/10")}>
                      <I className="size-[18px]" />
                    </span>
                    <div className={clsx("pb-5 transition-opacity duration-500", on ? "opacity-100" : "opacity-40")}>
                      <h3 className="text-[19px] font-semibold leading-snug">{t.t}</h3>
                      <p className={clsx("grid text-[16px] leading-relaxed text-ink-2 transition-[grid-template-rows,opacity] duration-500", i === step ? "grid-rows-[1fr]" : "grid-rows-[0fr] opacity-0")}>
                        <span className="overflow-hidden pt-1">{t.d}</span>
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* the listing, unlocking */}
          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="rounded-[24px] bg-card p-5 shadow-[0_50px_100px_-50px_rgba(21,19,15,.55)] ring-1 ring-rule md:rounded-[28px] md:p-7">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-paper-2 px-3 py-1 text-[13px] font-semibold">Beauty & grooming</span>
                <span key={step} className={clsx("flex animate-[viewIn_.5s_ease_both] items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold", open ? "bg-lime" : "bg-paper-2 text-muted")}>
                  {open ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />} {STATUS[step]}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[13px] text-muted">Business name</p>
                <p className={clsx("text-[24px] font-semibold tracking-tight transition-all duration-700", step < 3 && "select-none blur-[7px]")}>{step >= 3 ? "JLT Barbershop" : "Kept private"}</p>
                <p className="mt-1 flex items-center gap-1 text-[14px] text-muted">
                  <MapPin className="size-3.5" /> JLT, Dubai
                </p>
              </div>

              <div className="mt-5 rounded-2xl bg-paper-2 p-4">
                <p className="text-[13px] text-muted">Asking price</p>
                <p className="text-[30px] font-semibold tracking-tight">AED 400,000</p>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  ["Revenue", "500K"],
                  ["Profit", "100K"],
                  ["Multiple", "4x"],
                ].map(([k, v], i) => (
                  <div key={k} className="rounded-2xl border border-rule p-3 text-center">
                    <p className="text-[19px] font-semibold" style={{ transitionDelay: `${i * 90}ms` }}>
                      {v}
                    </p>
                    <p className="text-[12px] text-muted">{k}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 hidden space-y-2 sm:block">
                {["Trade licence", "Lease / Ejari", "Last 12 months' bank statements"].map((d, i) => (
                  <div key={d} className={clsx("flex items-center justify-between rounded-xl border border-rule px-3.5 py-2.5 text-[14px] transition-opacity duration-500", open ? "opacity-100" : "opacity-40")} style={{ transitionDelay: `${i * 90}ms` }}>
                    <span className="flex items-center gap-2">
                      <FileSignature className="size-4 text-muted" /> {d}
                    </span>
                    {open ? <Unlock className="size-4" /> : <Lock className="size-4 text-muted" />}
                  </div>
                ))}
              </div>

              <div className={clsx("mt-4 flex items-center gap-3 rounded-2xl bg-ink p-3.5 text-paper transition-all duration-500", step >= 3 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0")}>
                <MessagesSquare className="size-5 text-lime" />
                <p className="text-[14px]">
                  <span className="font-semibold">Introduced to the owner</span> by SMEmarket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
