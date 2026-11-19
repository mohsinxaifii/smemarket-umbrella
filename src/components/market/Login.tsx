"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { api, refreshMe } from "@/lib/api";
import { APP } from "@/lib/site";
import { Field, Notice } from "./AppPage";
import Character from "@/components/ui/Character";

/** Only same-site paths are allowed as a destination after login. */
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : APP.account);

export default function Login() {
  const params = useSearchParams();
  const router = useRouter();
  const [tab, setTab] = useState<"signup" | "login">(params.get("tab") === "signup" ? "signup" : "login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setErr("");
    try {
      if (tab === "signup") await api("auth/signup", { body: { name: fd.name, email: fd.email, phone: fd.phone, password: fd.password } });
      else await api("auth/login", { body: { email: fd.email, password: fd.password } });
      refreshMe();
      router.push(safeNext(params.get("next")));
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <section className="min-h-screen bg-paper pb-20 pt-[108px] md:pt-[128px]">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div className="hidden lg:block">
          <h1 className="display text-[clamp(2.6rem,min(5vw,9vh),4.6rem)]">One account for everything.</h1>
          <p className="mt-4 max-w-md text-[19px] text-ink-2">Buy, sell, or grow your business. The same account works for all three.</p>
          <ul className="mt-8 space-y-3 text-[17px]">
            {["Browse and save businesses for sale", "Sign one NDA to unlock full details", "List your own business for free", "Message buyers and sellers privately"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid size-6 place-items-center rounded-full bg-lime">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-end">
            <Character who="rashid" mood="happy" body="Device" size={220} />
            <Character who="lina" mood="excited" body="Paper" size={200} className="-ml-10" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-[480px] rounded-[28px] bg-card p-6 shadow-[0_40px_80px_-60px_rgba(21,19,15,.6)] ring-1 ring-rule md:p-9">
          <div role="tablist" className="relative grid grid-cols-2 rounded-full bg-paper-2 p-1">
            <span className={clsx("absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-500 ease-out-expo", tab === "login" && "translate-x-full")} />
            {(["signup", "login"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => (setTab(t), setErr(""))} className={clsx("relative z-10 h-11 rounded-full text-[15px] font-semibold transition-colors", tab === t ? "text-paper" : "text-ink")}>
                {t === "signup" ? "Sign up" : "Log in"}
              </button>
            ))}
          </div>
          <h2 className="display mt-7 text-[clamp(1.7rem,2.6vw,2.2rem)]">{tab === "signup" ? "Create your free account" : "Welcome back"}</h2>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            {tab === "signup" && (
              <Field label="Full name">
                <input name="name" required autoComplete="name" className="field" />
              </Field>
            )}
            <Field label="Email">
              <input name="email" type="email" required autoComplete="email" className="field" />
            </Field>
            {tab === "signup" && (
              <Field label="Phone / WhatsApp" optional hint="So our team can reach you about a deal.">
                <input name="phone" type="tel" autoComplete="tel" placeholder="+971 5X XXX XXXX" className="field" />
              </Field>
            )}
            <Field label="Password" hint={tab === "signup" ? "At least 8 characters." : undefined}>
              <span className="relative">
                <input name="password" type={show ? "text" : "password"} required minLength={tab === "signup" ? 8 : 1} autoComplete={tab === "signup" ? "new-password" : "current-password"} className="field pr-12" />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink">
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </span>
            </Field>
            {err && <Notice tone="error">{err}</Notice>}
            <button type="submit" disabled={busy} className="mt-1 flex h-14 items-center justify-center gap-2 rounded-[10px] bg-ink text-[16px] font-semibold text-paper transition hover:bg-ink-3 disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />}
              {tab === "signup" ? "Create account" : "Log in"}
            </button>
            {tab === "signup" && (
              <p className="text-[13px] text-muted">
                By creating an account you agree to how we handle your data in our{" "}
                <a href="/privacy" className="underline">
                  privacy policy
                </a>
                .
              </p>
            )}
            {tab === "login" && <p className="text-[14px] text-muted">Forgot your password? Message us on WhatsApp and we&apos;ll reset it.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
