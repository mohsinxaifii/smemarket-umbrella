"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { api, refreshMe } from "@/lib/api";
import { APP } from "@/lib/site";
import { Field, Notice } from "./AppPage";
import Character from "@/components/ui/Character";
import Image from "next/image";

/** Only same-site paths are allowed as a destination after login. */
const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : APP.admin);

export default function Login() {
  const params = useSearchParams();
  const router = useRouter();
  const allowSignup = params.get("tab") === "signup";
  const [tab, setTab] = useState<"signup" | "login">(allowSignup ? "signup" : "login");
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
          <h1 className="display text-[clamp(2.6rem,min(5vw,9vh),4.6rem)]">The team desk.</h1>
          <p className="mt-4 max-w-md text-[19px] text-ink-2">For the SMEmarket team: review new listings, publish them, and answer every enquiry.</p>
          <div className="relative mt-10 max-w-[520px]">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[28px]">
              <Image src="/images/cafe-counter.jpg" alt="A busy café counter" fill sizes="520px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/55 to-transparent" />
            </div>
            <div className="absolute -bottom-8 -right-4 flex items-end">
              <span className="overflow-hidden rounded-full bg-[#f6e3b5] ring-4 ring-paper">
                <Character who="lina" mood="excited" body="Paper" size={96} className="translate-y-[10%] animate-idle" />
              </span>
              <span className="-ml-4 overflow-hidden rounded-full bg-[#e3dcf2] ring-4 ring-paper">
                <Character who="rashid" mood="happy" body="Device" size={112} className="translate-y-[10%] animate-idle [animation-delay:-1.5s]" />
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[480px] rounded-[28px] bg-card p-6 shadow-[0_40px_80px_-60px_rgba(21,19,15,.6)] ring-1 ring-rule md:p-9">
          {allowSignup && (
          <div role="tablist" className="relative mb-7 grid grid-cols-2 rounded-full bg-paper-2 p-1">
            <span className={clsx("absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-500 ease-out-expo", tab === "login" && "translate-x-full")} />
            {(["signup", "login"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => (setTab(t), setErr(""))} className={clsx("relative z-10 h-11 rounded-full text-[15px] font-semibold transition-colors", tab === t ? "text-paper" : "text-ink")}>
                {t === "signup" ? "Sign up" : "Log in"}
              </button>
            ))}
          </div>
          )}
          <h2 className="display text-[clamp(1.7rem,2.6vw,2.2rem)]">{tab === "signup" ? "Create your team account" : "Team log in"}</h2>

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
            {tab === "login" && <p className="text-[14px] text-muted">Forgot your password? Ask a team admin to reset it.</p>}
          </form>
        </div>
      </div>
    </section>
  );
}
