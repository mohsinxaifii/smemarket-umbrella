"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, CornerDownLeft, Loader2, Lock } from "lucide-react";
import { api, refreshMe, useMe } from "@/lib/api";
import { APP, EMIRATES, INDUSTRIES } from "@/lib/site";
import { Field, Notice } from "./AppPage";
import Character from "@/components/ui/Character";

type Q = {
  key: string;
  q: string;
  help?: string;
  kind: "choice" | "text" | "money" | "number" | "long";
  options?: string[];
  optional?: boolean;
  placeholder?: string;
  extra?: { key: string; label: string; placeholder?: string };
};

const QUESTIONS: Q[] = [
  { key: "industry", q: "What kind of business is it?", kind: "choice", options: INDUSTRIES },
  { key: "city", q: "Which emirate is it in?", kind: "choice", options: EMIRATES },
  { key: "area", q: "Which area?", help: "Buyers search by area. The exact address stays private.", kind: "text", placeholder: "e.g. JLT, Al Barsha, Business Bay", optional: true },
  { key: "business_name", q: "What's the business called?", help: "Only buyers you approve ever see the name.", kind: "text", placeholder: "Trade name" },
  { key: "asking_price", q: "What's your asking price?", help: "Not sure? Put your best estimate. We'll talk it through with you.", kind: "money", placeholder: "450,000" },
  { key: "revenue", q: "Roughly how much does it sell in a year?", help: "Yearly revenue, before costs.", kind: "money", placeholder: "600,000", optional: true },
  { key: "profit", q: "And the yearly profit?", help: "What's left for the owner after all costs.", kind: "money", placeholder: "150,000", optional: true },
  { key: "years_trading", q: "How many years has it been trading?", kind: "number", placeholder: "4", optional: true },
  { key: "employees", q: "How many people work there?", kind: "number", placeholder: "6", optional: true },
  { key: "rent", q: "What's the yearly rent?", help: "Kept private until you approve a buyer.", kind: "money", placeholder: "120,000", optional: true, extra: { key: "lease", label: "Time left on the lease", placeholder: "e.g. 3 years, renewable" } },
  { key: "reason", q: "Why are you selling?", help: "Buyers always ask. Private until you approve them.", kind: "long", placeholder: "Relocating, retiring, focusing on another business…", optional: true },
  { key: "summary", q: "Describe the business in a few lines.", help: "This is what every buyer sees first. No names.", kind: "long", placeholder: "What it sells, who its customers are, what makes it good…" },
];

const STORE = "smem:sell-draft";
type Draft = Record<string, string>;

export default function Sell() {
  const { user, loading } = useMe();
  const [step, setStep] = useState(-1); // -1 intro, 0..11 questions, 12 account/submit, 13 done
  const [a, setA] = useState<Draft>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  // restore an unfinished draft
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || "null");
      if (d?.a) setA(d.a);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (Object.keys(a).length) localStorage.setItem(STORE, JSON.stringify({ a }));
    } catch {}
  }, [a]);
  useEffect(() => {
    setErr("");
    const t = setTimeout(() => input.current?.focus(), 350);
    return () => clearTimeout(t);
  }, [step]);

  const q = QUESTIONS[step];
  const total = QUESTIONS.length;
  const set = (k: string, v: string) => setA((x) => ({ ...x, [k]: v }));
  const next = () => {
    if (q && !q.optional && !(a[q.key] || "").trim()) return setErr("Please answer this one, or go back.");
    setStep((s) => Math.min(total, s + 1));
  };
  const back = () => setStep((s) => Math.max(-1, s - 1));
  const onKey = (e: React.KeyboardEvent) => {
    if (!q) return; // the account step is a normal form: Enter submits it
    if (e.key === "Enter" && !(e.target instanceof HTMLTextAreaElement && e.shiftKey)) {
      if (e.target instanceof HTMLTextAreaElement && !e.metaKey && !e.ctrlKey) return;
      e.preventDefault();
      next();
    }
  };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      if (!user) {
        const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        await api("auth/signup", { body: fd }).catch(async (x) => {
          // already have an account? log in with the same details instead
          if ((x as { status?: number }).status === 409) return api("auth/login", { body: { email: fd.email, password: fd.password } });
          throw x;
        });
        refreshMe();
      }
      await api("listings", { body: a });
      try {
        localStorage.removeItem(STORE);
      } catch {}
      setStep(total + 1);
    } catch (x) {
      setErr((x as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const pct = step < 0 ? 0 : Math.min(100, ((step + (step >= total ? 1 : 0)) / (total + 1)) * 100);

  return (
    <section className="min-h-screen bg-paper pb-24 pt-[108px] md:pt-[128px]" onKeyDown={onKey}>
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          {step >= 0 && step <= total && (
            <div className="mb-8">
              <div className="flex justify-between text-[14px] font-medium text-muted">
                <span>{step < total ? `Question ${step + 1} of ${total}` : "Last step"}</span>
                <span className="flex items-center gap-1">
                  <Lock className="size-3.5" /> Saved on this device
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-ink transition-all duration-500 ease-out-expo" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}

          {/* intro */}
          {step === -1 && (
            <div className="grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="label">Sell your business</p>
                <h1 className="display mt-3 text-[clamp(2.6rem,min(5.4vw,9vh),4.8rem)]">List it quietly. Sell it properly.</h1>
                <p className="mt-4 text-[19px] leading-relaxed text-ink-2">12 quick questions, about three minutes. We review every business and only list the ones that meet our standards.</p>
                <ul className="mt-6 space-y-2.5 text-[17px]">
                  {["Free to list. 5% only when it sells", "Your name stays hidden until you approve a buyer", "Only NDA-signed, ID-checked buyers"].map((t) => (
                    <li key={t} className="flex items-center gap-3">
                      <span className="grid size-6 place-items-center rounded-full bg-lime">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setStep(0)} className="group mt-8 flex h-14 items-center gap-2 rounded-[10px] bg-ink px-7 text-[16px] font-semibold text-paper">
                  {Object.keys(a).length ? "Continue where you left off" : "Start"} <ArrowRight className="size-4 text-lime transition-transform group-hover:translate-x-1" />
                </button>
              </div>
              <div className="relative hidden h-[420px] overflow-hidden rounded-[32px] bg-[#e3dcf2] md:block">
                <Character who="rashid" mood="happy" body="Coffee" size={340} className="absolute -bottom-4 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          )}

          {/* one question at a time */}
          {q && (
            <div key={step} className="animate-[pageIn_.5s_cubic-bezier(.16,1,.3,1)_both]">
              <h2 className="display text-[clamp(2rem,4vw,3.2rem)]">{q.q}</h2>
              {q.help && <p className="mt-3 text-[18px] text-ink-2">{q.help}</p>}
              <div className="mt-8">
                {q.kind === "choice" ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {q.options!.map((o, i) => (
                      <button
                        key={o}
                        onClick={() => {
                          set(q.key, o);
                          setTimeout(() => setStep((s) => s + 1), 180);
                        }}
                        className={clsx("flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[17px] font-medium transition", a[q.key] === o ? "border-ink bg-ink text-paper" : "border-rule-strong hover:border-ink")}
                      >
                        <span className={clsx("grid size-7 shrink-0 place-items-center rounded-lg border text-[13px] font-semibold", a[q.key] === o ? "border-paper/30" : "border-rule-strong text-muted")}>{String.fromCharCode(65 + i)}</span>
                        {o}
                      </button>
                    ))}
                  </div>
                ) : q.kind === "long" ? (
                  <textarea ref={input} value={a[q.key] || ""} onChange={(e) => set(q.key, e.target.value)} rows={5} placeholder={q.placeholder} className="field resize-none text-[18px]" />
                ) : (
                  <div className="relative">
                    {q.kind === "money" && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] font-semibold text-muted">AED</span>}
                    <input
                      ref={input}
                      value={a[q.key] || ""}
                      onChange={(e) => set(q.key, q.kind === "text" ? e.target.value : e.target.value.replace(/[^\d,]/g, ""))}
                      inputMode={q.kind === "text" ? "text" : "numeric"}
                      placeholder={q.placeholder}
                      className={clsx("field h-16 text-[22px] font-semibold", q.kind === "money" && "pl-16")}
                    />
                  </div>
                )}
                {q.extra && (
                  <div className="mt-4">
                    <Field label={q.extra.label} optional>
                      <input value={a[q.extra.key] || ""} onChange={(e) => set(q.extra!.key, e.target.value)} placeholder={q.extra.placeholder} className="field" />
                    </Field>
                  </div>
                )}
              </div>
              {err && (
                <div className="mt-4">
                  <Notice tone="error">{err}</Notice>
                </div>
              )}
              <div className="mt-8 flex items-center gap-3">
                <button onClick={back} className="flex h-12 items-center gap-2 rounded-[10px] border border-ink/30 px-4 text-[15px] font-semibold">
                  <ArrowLeft className="size-4" /> Back
                </button>
                {q.kind !== "choice" && (
                  <button onClick={next} className="flex h-12 items-center gap-2 rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-paper">
                    {q.optional && !(a[q.key] || "").trim() ? "Skip" : "Next"} <ArrowRight className="size-4 text-lime" />
                  </button>
                )}
                <span className="ml-2 hidden items-center gap-1 text-[14px] text-muted md:flex">
                  or press <kbd className="rounded border border-rule-strong px-1.5 py-0.5 font-sans">Enter</kbd> <CornerDownLeft className="size-3.5" />
                </span>
              </div>
            </div>
          )}

          {/* account + submit */}
          {step === total && (
            <form onSubmit={submit} className="animate-[pageIn_.5s_cubic-bezier(.16,1,.3,1)_both]">
              <h2 className="display text-[clamp(2rem,4vw,3.2rem)]">{user ? "Ready to send it for review?" : "Last step: your account."}</h2>
              <p className="mt-3 text-[18px] text-ink-2">
                {user ? `We'll review it and let you know at ${user.email}. Nothing goes live until we've checked it.` : "So you can follow your listing, see who's interested and approve buyers. Nothing goes live until we've checked it."}
              </p>
              {!user && !loading && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input name="name" required autoComplete="name" className="field" />
                  </Field>
                  <Field label="Phone / WhatsApp">
                    <input name="phone" type="tel" required autoComplete="tel" placeholder="+971 5X XXX XXXX" className="field" />
                  </Field>
                  <Field label="Email">
                    <input name="email" type="email" required autoComplete="email" className="field" />
                  </Field>
                  <Field label="Password" hint="At least 8 characters. Already have an account? Use the same details.">
                    <input name="password" type="password" required minLength={8} autoComplete="new-password" className="field" />
                  </Field>
                </div>
              )}
              {err && (
                <div className="mt-4">
                  <Notice tone="error">{err}</Notice>
                </div>
              )}
              <div className="mt-8 flex items-center gap-3">
                <button type="button" onClick={back} className="flex h-12 items-center gap-2 rounded-[10px] border border-ink/30 px-4 text-[15px] font-semibold">
                  <ArrowLeft className="size-4" /> Back
                </button>
                <button type="submit" disabled={busy || loading} className="flex h-12 items-center gap-2 rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-paper disabled:opacity-60">
                  {busy && <Loader2 className="size-4 animate-spin" />} Send for review
                </button>
              </div>
            </form>
          )}

          {/* done */}
          {step === total + 1 && (
            <div className="grid animate-[pageIn_.6s_cubic-bezier(.16,1,.3,1)_both] items-center gap-8 md:grid-cols-[1.3fr_1fr]">
              <div>
                <span className="grid size-14 place-items-center rounded-full bg-lime">
                  <Check className="size-7" strokeWidth={3} />
                </span>
                <h2 className="display mt-6 text-[clamp(2.2rem,4.4vw,3.6rem)]">Thank you. It&apos;s with our team.</h2>
                <p className="mt-3 text-[18px] text-ink-2">We&apos;ll review your business and get in touch to prepare the listing with you. You can follow it from your account.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href={APP.account} className="flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-paper">
                    Go to my account
                  </Link>
                  <Link href="/" className="flex h-12 items-center rounded-[10px] border border-ink/30 px-6 text-[15px] font-semibold">
                    Back to home
                  </Link>
                </div>
              </div>
              <div className="relative hidden h-[340px] overflow-hidden rounded-[32px] bg-lime md:block">
                <Character who="rashid" mood="excited" body="PointingUp" size={300} className="absolute -bottom-4 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
