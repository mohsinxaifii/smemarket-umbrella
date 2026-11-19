"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { BadgeCheck, Camera, Loader2, ShieldCheck } from "lucide-react";
import { api, refreshMe, useMe } from "@/lib/api";
import { APP, SITE } from "@/lib/site";
import AppPage, { Field, Notice, SELECT_CLS } from "./AppPage";
import SignInGate from "./SignInGate";

const safeNext = (n: string | null) => (n && n.startsWith("/") && !n.startsWith("//") ? n : APP.listings);

/** The one-time buyer NDA: who you are, what you're looking for, and a photo of your ID. */
export default function NdaForm() {
  const { user, nda, loading } = useMe();
  const params = useSearchParams();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (file) form.set("id_doc", file);
    setBusy(true);
    setErr("");
    try {
      await api("nda", { form });
      refreshMe();
      router.push(safeNext(params.get("next")));
    } catch (x) {
      setErr((x as Error).message);
      setBusy(false);
    }
  }

  return (
    <AppPage eyebrow="For buyers" title="Sign the NDA once." intro="It covers every business on SMEmarket. Sellers see your name and what you're looking for, never your ID, nationality or phone number.">
      {loading ? (
        <Loader2 className="size-6 animate-spin text-muted" />
      ) : !user ? (
        <SignInGate title="Create an account to sign the NDA" />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <form onSubmit={submit} className="grid gap-5 rounded-[28px] bg-card p-6 ring-1 ring-rule md:p-9">
            {nda && <Notice tone={nda.id_status === "rejected" ? "error" : "ok"}>{nda.id_status === "approved" ? "You've signed and your ID is checked. You can request any business." : nda.id_status === "pending" ? "You've signed. Your ID is with our team. You can already request businesses." : "Your ID check didn't pass. Upload a clearer photo below."}</Notice>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name, as on your ID">
                <input name="full_name" required defaultValue={nda?.full_name || user.name} className="field" />
              </Field>
              <Field label="Company" optional>
                <input name="company" className="field" />
              </Field>
              <Field label="Budget">
                <select name="budget" required defaultValue="" className={SELECT_CLS}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {["Up to AED 250K", "AED 250K – 500K", "AED 500K – 1M", "AED 1M – 3M", "AED 3M+"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="How will you pay?">
                <select name="funding" required defaultValue="" className={SELECT_CLS}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {["Own funds", "Bank finance", "Investors / partners", "A mix"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="When do you want to buy?">
                <select name="timeline" required defaultValue="" className={SELECT_CLS}>
                  <option value="" disabled>
                    Choose one
                  </option>
                  {["Now", "Within 3 months", "3–6 months", "Just exploring"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Emirates ID (front) or passport photo page" hint="A clear phone photo is fine. JPG, PNG or PDF, up to 8 MB. Only our team sees it.">
              <label className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-ink/40 px-4 py-4 hover:bg-paper-2">
                <Camera className="size-5" />
                <span className="truncate text-[15px] font-medium">{file ? file.name : nda ? "Upload a new photo (optional)" : "Choose a photo"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp,image/heic,application/pdf" capture="environment" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </Field>

            <div className="rounded-2xl bg-paper-2 p-5 text-[15px] leading-relaxed text-ink-2">
              <p className="font-semibold text-ink">The agreement, in plain words</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>You keep everything you learn about a listed business confidential.</li>
                <li>You don&apos;t contact the business, its staff, customers or landlord directly. Everything goes through SMEmarket.</li>
                <li>You use the information only to decide whether to buy.</li>
                <li>This applies to every business you view, for two years from today.</li>
              </ul>
            </div>

            <Field label="Type your full name as your signature">
              <input name="signature" required className="field font-semibold italic" />
            </Field>
            <label className="flex items-start gap-3 text-[15px]">
              <input type="checkbox" name="agree" value="yes" required className="mt-1 size-5 accent-ink" />
              <span>
                I agree to the NDA above and to how SMEmarket handles my data, as set out in the{" "}
                <Link href="/privacy" className="underline">
                  privacy policy
                </Link>
                .
              </span>
            </label>
            {err && <Notice tone="error">{err}</Notice>}
            <button type="submit" disabled={busy} className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-ink text-[16px] font-semibold text-paper disabled:opacity-60">
              {busy && <Loader2 className="size-4 animate-spin" />} Sign the NDA
            </button>
          </form>

          <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
            {[
              { i: ShieldCheck, t: "Sellers never see your ID", d: "Or your nationality or phone number. Only your name, company and what you're looking for." },
              { i: BadgeCheck, t: "Checked by our team", d: "We check your ID before any seller's figures open." },
            ].map((x) => (
              <div key={x.t} className="flex gap-4 rounded-[22px] bg-paper-2 p-5">
                <x.i className="size-6 shrink-0" />
                <span>
                  <span className="block text-[17px] font-semibold">{x.t}</span>
                  <span className="mt-1 block text-[15px] text-ink-2">{x.d}</span>
                </span>
              </div>
            ))}
            <p className="px-1 text-[14px] text-muted">
              Questions? WhatsApp {SITE.phone} or email {SITE.email}.
            </p>
          </aside>
        </div>
      )}
    </AppPage>
  );
}
