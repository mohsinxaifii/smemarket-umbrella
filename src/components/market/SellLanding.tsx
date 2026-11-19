"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import clsx from "clsx";
import { ArrowRight, BadgeCheck, Check, Eye, EyeOff, FileSignature, FileText, Lock, MapPin, MessagesSquare, PenLine, ShieldCheck, Unlock } from "lucide-react";
import Character from "@/components/ui/Character";
import { Reveal } from "@/components/ui/Reveal";
import FeeCalc from "@/components/home/FeeCalc";
import Faq from "@/components/home/Faq";
import { useCycle, useInView } from "@/lib/useInView";

const STEPS = [
  { icon: PenLine, t: "Answer 12 quick questions", d: "About three minutes. Nothing goes live when you send it." },
  { icon: ShieldCheck, t: "We review it with you", d: "We check the business and write the listing together. Your name stays hidden." },
  { icon: FileSignature, t: "Verified buyers ask for more", d: "Every buyer has signed an NDA and passed an ID check before they can ask." },
  { icon: BadgeCheck, t: "You choose who sees what", d: "Approve or decline each buyer. Pay 5% only when the SPA is signed." },
];

const TIMELINE = [
  { icon: PenLine, t: "Business submitted", s: "12 questions, 3 minutes" },
  { icon: ShieldCheck, t: "Reviewed by SMEmarket", s: "Listing goes live, name hidden" },
  { icon: FileSignature, t: "A buyer signed the NDA", s: "ID checked by our team" },
  { icon: BadgeCheck, t: "You approved them", s: "Figures and documents open" },
];

const SELLER_FAQ = [
  { q: "Will people know my business is for sale?", a: "No. Your listing is anonymous: industry, area and figures only. The name, exact location and documents open only to buyers you approve." },
  { q: "What does it cost to sell?", a: "Nothing to list and nothing while it's listed. A 5% success fee on the final sale price, payable when the Sale & Purchase Agreement is signed. If it doesn't sell, you pay nothing." },
  { q: "Who are the buyers?", a: "People and companies with a free SMEmarket account who have signed our NDA and passed an Emirates ID or passport check. You see their name, company, budget and timeline before you decide." },
  { q: "Do I have to answer every question?", a: "Only a few are required. Skip what you don't know; we'll go through the rest with you when we review the listing." },
  { q: "Can I take my listing down?", a: "Yes, at any time, from your account." },
];

/** Everything a seller wants to know before they start, with the form one click away. */
export default function SellLanding({ onStart, resume }: { onStart: () => void; resume: boolean }) {
  return (
    <>
      <Hero onStart={onStart} resume={resume} />
      <HowItWorks />
      <WhatBuyersSee />
      <FeeCalc />
      <Faq items={SELLER_FAQ} title="Selling, answered." tone="bg-paper-2" />
      <section className="bg-paper py-16 md:py-24">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-12 text-paper md:px-14 md:py-16">
            <div className="relative z-10 max-w-xl">
              <h2 className="display text-[clamp(2.2rem,4vw,3.6rem)]">Ready when you are.</h2>
              <p className="mt-3 text-[18px] text-paper/70">Three minutes now. We take it from there.</p>
              <button onClick={onStart} className="group mt-8 flex h-14 items-center gap-2 rounded-[10px] bg-lime px-7 text-[16px] font-semibold text-ink">
                {resume ? "Continue your listing" : "Start your free listing"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
            <Character who="rashid" mood="happy" body="Coffee" size={300} className="absolute -bottom-6 right-6 hidden !h-[280px] !w-[280px] animate-idle md:block" />
          </div>
        </div>
      </section>
    </>
  );
}

function Hero({ onStart, resume }: { onStart: () => void; resume: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, 0.2);
  const [i] = useCycle(TIMELINE.length, 1800, seen);
  return (
    <section ref={ref} className="bg-paper pb-16 pt-[108px] md:pb-24 md:pt-[136px]">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_both]">
          <p className="label">Sell your business</p>
          <h1 className="display mt-3 text-[clamp(2.7rem,min(5.4vw,10vh),5.2rem)]">
            Sell quietly.
            <br />
            <span className="text-ink/45">For a fair price.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[19px] leading-relaxed text-ink-2">List your UAE business for free. We check it, keep your name hidden, and only bring buyers who have signed an NDA and passed an ID check.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button onClick={onStart} className="group flex h-14 items-center justify-center gap-2 rounded-[10px] bg-ink px-7 text-[16px] font-semibold text-paper transition hover:bg-ink-3">
              {resume ? "Continue where you left off" : "Start your free listing"} <ArrowRight className="size-4 text-lime transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-[15px] text-muted">12 questions · about 3 minutes</span>
          </div>
          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Free to list", "5% only when it sells"],
              ["Anonymous", "until you approve a buyer"],
              ["Verified buyers", "NDA and ID checked"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl bg-paper-2 p-4">
                <span className="flex items-center gap-2 text-[16px] font-semibold">
                  <span className="grid size-5 place-items-center rounded-full bg-lime">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {t}
                </span>
                <span className="mt-1 block text-[14px] text-muted">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* photo, Rashid, and the selling journey playing on its own */}
        <div className="relative animate-[pageIn_1s_cubic-bezier(.16,1,.3,1)_.15s_both]">
          <div className="relative aspect-[5/5.2] overflow-hidden rounded-[32px] md:aspect-[5/4.6]">
            <Image src="/images/tailor-owner.jpg" alt="A business owner at work in her studio" fill priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 -left-3 overflow-hidden rounded-[24px] bg-[#e3dcf2] ring-4 ring-paper md:-left-6">
            <Character who="rashid" mood="happy" body="Coffee" size={150} eager className="translate-y-[8%] animate-idle" />
          </div>
          <div className="absolute right-4 top-4 w-[min(300px,72%)] rounded-[20px] bg-paper/95 p-4 shadow-[0_24px_50px_-24px_rgba(21,19,15,.6)] backdrop-blur md:right-6 md:top-6">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-muted">Your listing</p>
            <ol className="mt-3 space-y-2.5">
              {TIMELINE.map((s, k) => {
                const done = k <= i;
                return (
                  <li key={s.t} className="flex items-center gap-3">
                    <span className={clsx("grid size-8 shrink-0 place-items-center rounded-full transition-all duration-500", done ? "bg-ink text-lime" : "bg-paper-2 text-ink/30")}>
                      <s.icon className="size-4" />
                    </span>
                    <span className={clsx("min-w-0 transition-opacity duration-500", done ? "opacity-100" : "opacity-40")}>
                      <span className="block truncate text-[14px] font-semibold">{s.t}</span>
                      <span className="block truncate text-[12px] text-muted">{s.s}</span>
                    </span>
                    {k === i && <span className="ml-auto size-2 shrink-0 animate-pulse rounded-full bg-lime" />}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, 0.35);
  const [i, setI] = useCycle(STEPS.length, 2400, seen);
  return (
    <section ref={ref} className="section-y bg-paper-2">
      <div className="container-x">
        <p className="label">How selling works</p>
        <h2 className="display mt-4 max-w-3xl text-section">Four steps, and you&apos;re in control of every one.</h2>
        <ol className="mt-10 grid gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
          {STEPS.map((s, k) => (
            <li
              key={s.t}
              onClick={() => setI(k)}
              className={clsx("relative cursor-pointer overflow-hidden rounded-[24px] p-6 transition-all duration-500 md:p-7", k === i ? "-translate-y-1 bg-ink text-paper shadow-[0_24px_50px_-28px_rgba(21,19,15,.6)]" : "bg-card ring-1 ring-rule")}
            >
              <span className={clsx("grid size-11 place-items-center rounded-2xl transition-colors duration-500", k === i ? "bg-lime text-ink" : "bg-paper-2")}>
                <s.icon className="size-5" />
              </span>
              <p className={clsx("mt-6 text-[13px] font-semibold", k === i ? "text-paper/50" : "text-muted")}>Step {k + 1}</p>
              <h3 className="mt-1 text-[20px] font-semibold leading-snug">{s.t}</h3>
              <p className={clsx("mt-2 text-[15px] leading-relaxed", k === i ? "text-paper/75" : "text-ink-2")}>{s.d}</p>
              {k === i && seen && <span key={k} className="absolute inset-x-0 bottom-0 h-1 origin-left bg-lime [animation:grow_2.4s_linear_both]" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Flip between what any visitor sees and what an approved buyer sees, using the real barbershop listing. */
function WhatBuyersSee() {
  const [approved, setApproved] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, 0.35);
  const [tick] = useCycle(2, 2600, seen && !approved);
  const open = approved || tick === 1;
  return (
    <section ref={ref} className="section-y bg-paper">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="label">Privacy</p>
          <h2 className="display mt-4 text-section">Buyers see the business. Not you.</h2>
          <p className="mt-5 max-w-lg text-[19px] leading-relaxed text-ink-2">Your listing shows the industry, the area and the headline numbers. Everything that could identify you stays locked until you say yes to a specific buyer.</p>
          <div role="tablist" className="mt-8 inline-flex rounded-full bg-paper-2 p-1">
            {[
              [false, "Public view", Eye],
              [true, "Approved buyer", EyeOff],
            ].map(([v, l, I]) => {
              const Icon = I as typeof Eye;
              const on = open === v;
              return (
                <button key={String(l)} role="tab" aria-selected={on} onClick={() => setApproved(v as boolean)} className={clsx("flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition", on ? "bg-ink text-paper" : "text-ink hover:bg-paper")}>
                  <Icon className="size-4" /> {l as string}
                </button>
              );
            })}
          </div>
        </div>

        <Reveal>
          <div data-reveal className="mx-auto w-full max-w-[460px] overflow-hidden rounded-[28px] bg-card shadow-[0_50px_100px_-50px_rgba(21,19,15,.55)] ring-1 ring-rule">
            <div className="relative aspect-[16/8]">
              <Image src="/images/barber-cut.jpg" alt="A barber at work" fill sizes="460px" className="object-cover" />
              <span className={clsx("absolute right-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors", open ? "bg-lime text-ink" : "bg-ink/80 text-paper")}>
                {open ? <Unlock className="size-3.5" /> : <Lock className="size-3.5" />} {open ? "Approved" : "Locked"}
              </span>
            </div>
            <div className="p-6">
              <p className="text-[13px] text-muted">Business name</p>
              <p className={clsx("text-[22px] font-semibold tracking-tight transition-all duration-700", !open && "select-none blur-[7px]")}>{open ? "JLT Barbershop" : "Hidden until approved"}</p>
              <p className="mt-1 flex items-center gap-1 text-[14px] text-muted">
                <MapPin className="size-3.5" /> JLT, Dubai · Beauty & grooming
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-paper-2 p-4 text-center">
                {[
                  ["400K", "Asking"],
                  ["500K", "Revenue"],
                  ["100K", "Profit"],
                ].map(([v, k]) => (
                  <span key={k}>
                    <span className="block text-[18px] font-semibold">AED {v}</span>
                    <span className="block text-[12px] text-muted">{k}</span>
                  </span>
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  [FileText, "Trade licence and lease"],
                  [FileText, "Bank statements and VAT returns"],
                  [MessagesSquare, "Direct thread with the owner"],
                ].map(([I, t]) => {
                  const Icon = I as typeof FileText;
                  return (
                    <li key={t as string} className={clsx("flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-[14px] transition-all duration-500", open ? "border-ink/20" : "border-rule text-muted")}>
                      <span className="flex items-center gap-2">
                        <Icon className="size-4" /> {t as string}
                      </span>
                      {open ? <Unlock className="size-4" /> : <Lock className="size-4" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
