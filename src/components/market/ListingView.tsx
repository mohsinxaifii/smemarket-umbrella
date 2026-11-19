"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowLeft, BadgeCheck, Bookmark, Clock, FileText, Loader2, Lock, MapPin, MessagesSquare, ShieldCheck, Unlock, Upload } from "lucide-react";
import { api, aed, short, ago } from "@/lib/api";
import { APP } from "@/lib/site";
import { Notice } from "./AppPage";
import type { PublicListing } from "./ListingCard";
import Character from "@/components/ui/Character";

type Full = PublicListing & { business_name?: string; rent?: number | null; lease?: string | null; reason?: string | null; confidential?: string | null; review_note?: string | null };
type Doc = { id?: string; name: string; kind?: string | null; size?: number };
type Me = { signedIn: boolean; owner: boolean; admin: boolean; nda: string | null; access: string | null; unlocked: boolean; saved: boolean; thread: string | null };
type Req = { id: string; status: string; created_at: number; full_name: string; company: string | null; budget: string | null; funding: string | null; timeline: string | null; id_status: string };

const STATUS: Record<string, string> = { pending: "In review by our team", live: "Live", rejected: "Not approved", sold: "Sold", withdrawn: "Withdrawn" };

export default function ListingView() {
  const id = useSearchParams().get("id") || "";
  const router = useRouter();
  const [d, setD] = useState<{ listing: Full; docs: Doc[]; me: Me } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!id) return setErr("That business isn't listed.");
    api<{ listing: Full; docs: Doc[]; me: Me }>(`listings/${encodeURIComponent(id)}`)
      .then(setD)
      .catch((e) => setErr(e.message));
  }, [id]);
  useEffect(load, [load]);

  const act = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
      load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const here = `${APP.listing(id)}`;
  const message = () =>
    act(async () => {
      const t = await api<{ id: string }>(`listings/${id}/thread`, { method: "POST" });
      router.push(`${APP.messages}?t=${t.id}`);
    });

  if (err && !d)
    return (
      <section className="min-h-[70vh] bg-paper pb-24 pt-[156px]">
        <div className="container-x">
          <Notice tone="error">{err}</Notice>
          <Link href={APP.listings} className="mt-6 inline-flex items-center gap-2 font-semibold">
            <ArrowLeft className="size-4" /> All businesses
          </Link>
        </div>
      </section>
    );
  if (!d)
    return (
      <section className="grid min-h-[70vh] place-items-center bg-paper pt-[136px]">
        <Loader2 className="size-6 animate-spin text-muted" />
      </section>
    );

  const { listing: l, docs, me } = d;
  const facts: [string, string][] = [
    ["Revenue (yearly)", aed(l.revenue)],
    ["Profit (yearly)", aed(l.profit)],
    ["Multiple", l.multiple ? `${l.multiple}x profit` : "—"],
    ["Years trading", l.years_trading != null ? String(l.years_trading) : "—"],
    ["Employees", l.employees != null ? String(l.employees) : "—"],
  ];
  const secret: [string, string][] = me.unlocked
    ? [
        ["Rent (yearly)", aed(l.rent)],
        ["Lease", l.lease || "—"],
        ["Reason for selling", l.reason || "—"],
      ]
    : [
        ["Rent (yearly)", "•••••"],
        ["Lease", "•••••"],
        ["Reason for selling", "•••••"],
      ];

  return (
    <section className="bg-paper pb-24 pt-[136px] md:pt-[156px]">
      <div className="container-x">
        <Link href={APP.listings} className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" /> All businesses
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {/* the business */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-paper-2 px-3 py-1 text-[14px] font-semibold">{l.industry}</span>
              {l.status !== "live" && <span className="rounded-full bg-[#f6e3b5] px-3 py-1 text-[14px] font-semibold">{STATUS[l.status] ?? l.status}</span>}
              {me.unlocked && !me.owner && (
                <span className="flex items-center gap-1 rounded-full bg-lime px-3 py-1 text-[14px] font-semibold">
                  <Unlock className="size-3.5" /> Full details unlocked
                </span>
              )}
            </div>
            <h1 className="display mt-4 text-[clamp(2.2rem,min(4.4vw,8vh),3.8rem)]">{l.business_name || l.title}</h1>
            {l.business_name && <p className="mt-1 text-[17px] text-muted">Listed as “{l.title}”</p>}
            <p className="mt-3 flex items-center gap-1.5 text-[17px] text-ink-2">
              <MapPin className="size-4" /> {[l.area, l.city].filter(Boolean).join(", ")}
            </p>

            <div className="mt-8 rounded-[24px] bg-ink p-6 text-paper md:p-8">
              <p className="text-[15px] text-paper/60">Asking price</p>
              <p className="text-[clamp(2.2rem,4vw,3.2rem)] font-semibold tracking-tight">{aed(l.asking_price)}</p>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-rule-dark pt-5">
                {[
                  [short(l.revenue), "Revenue"],
                  [short(l.profit), "Profit"],
                  [l.multiple ? `${l.multiple}x` : "—", "Multiple"],
                ].map(([v, k]) => (
                  <span key={k}>
                    <span className="block text-[22px] font-semibold">{v}</span>
                    <span className="block text-[13px] text-paper/55">{k}</span>
                  </span>
                ))}
              </div>
            </div>

            {l.summary && (
              <div className="mt-8">
                <h2 className="text-[20px] font-semibold">About the business</h2>
                <p className="mt-2 whitespace-pre-line text-[17px] leading-relaxed text-ink-2">{l.summary}</p>
              </div>
            )}

            <dl className="mt-8 grid border-t border-rule-strong sm:grid-cols-2">
              {[...facts, ...secret].map(([k, v], i) => (
                <div key={k} className="flex justify-between gap-4 border-b border-rule-strong py-3.5 sm:odd:pr-6 sm:even:pl-6">
                  <dt className="text-[15px] text-muted">{k}</dt>
                  <dd className={clsx("text-right text-[15px] font-semibold", i >= facts.length && !me.unlocked && "select-none blur-[3px]")}>{v}</dd>
                </div>
              ))}
            </dl>

            {me.unlocked && l.confidential && (
              <div className="mt-6 rounded-[20px] bg-paper-2 p-5">
                <p className="text-[14px] font-semibold text-muted">From the seller</p>
                <p className="mt-1 whitespace-pre-line text-[16px]">{l.confidential}</p>
              </div>
            )}

            {/* data room */}
            <div className="mt-10">
              <h2 className="flex items-center gap-2 text-[20px] font-semibold">
                <FileText className="size-5" /> Documents
              </h2>
              <ul className="mt-3 grid gap-2">
                {docs.length === 0 && <li className="text-[15px] text-muted">{me.owner ? "Add documents buyers will ask for: trade licence, financials, lease." : "The seller hasn't added documents yet."}</li>}
                {docs.map((doc, i) => (
                  <li key={doc.id ?? i}>
                    {me.unlocked && doc.id ? (
                      <a href={`/api/docs/${doc.id}`} target="_blank" rel="noopener" className="flex items-center justify-between rounded-xl border border-rule px-4 py-3 text-[15px] hover:border-ink">
                        <span className="flex items-center gap-2">
                          <FileText className="size-4 text-muted" /> {doc.name}
                        </span>
                        <Unlock className="size-4" />
                      </a>
                    ) : (
                      <span className="flex items-center justify-between rounded-xl border border-rule px-4 py-3 text-[15px] text-muted">
                        <span className="flex items-center gap-2">
                          <FileText className="size-4" /> {doc.name}
                        </span>
                        <Lock className="size-4" />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              {me.owner && <DocUpload id={l.id} onDone={load} />}
            </div>
          </div>

          {/* what you can do */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {err && (
              <div className="mb-4">
                <Notice tone="error">{err}</Notice>
              </div>
            )}
            {me.owner || me.admin ? (
              <OwnerPanel l={l} me={me} onChange={load} />
            ) : (
              <div className="overflow-hidden rounded-[28px] bg-card ring-1 ring-rule">
                <div className="p-6 md:p-7">
                  <BuyerSteps me={me} />
                  <div className="mt-6 grid gap-2.5">
                    {!me.signedIn && (
                      <>
                        <Link href={`${APP.signup}&next=${encodeURIComponent(here)}`} className="flex h-12 items-center justify-center rounded-[10px] bg-ink text-[15px] font-semibold text-paper">
                          Create a free account to see more
                        </Link>
                        <Link href={`${APP.login}?next=${encodeURIComponent(here)}`} className="flex h-12 items-center justify-center rounded-[10px] border border-ink/30 text-[15px] font-semibold">
                          I have an account
                        </Link>
                      </>
                    )}
                    {me.signedIn && !me.nda && (
                      <Link href={`${APP.nda}?next=${encodeURIComponent(here)}`} className="flex h-12 items-center justify-center rounded-[10px] bg-ink text-[15px] font-semibold text-paper">
                        Sign the NDA (one time)
                      </Link>
                    )}
                    {me.signedIn && me.nda && me.nda !== "rejected" && !me.access && (
                      <button disabled={busy} onClick={() => act(() => api(`listings/${l.id}/access`, { method: "POST" }))} className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-ink text-[15px] font-semibold text-paper disabled:opacity-60">
                        {busy && <Loader2 className="size-4 animate-spin" />} Request full details
                      </button>
                    )}
                    {me.access === "requested" && <Notice>Request sent. The seller will review it, usually within a few days.</Notice>}
                    {me.access === "approved" && !me.unlocked && <Notice>The seller approved you. Your ID check is with our team; details open as soon as it passes.</Notice>}
                    {me.access === "declined" && <Notice>The seller didn&apos;t approve this request. Other businesses are waiting.</Notice>}
                    {me.nda === "rejected" && <Notice tone="error">Your ID check didn&apos;t pass. Please contact us so we can sort it out.</Notice>}
                    {me.signedIn && (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button disabled={busy} onClick={message} className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-ink/30 text-[15px] font-semibold hover:bg-paper-2">
                          <MessagesSquare className="size-4" /> {me.thread ? "Messages" : "Ask the seller"}
                        </button>
                        <button disabled={busy} onClick={() => act(() => api(`listings/${l.id}/save`, { method: "POST" }))} className={clsx("flex h-12 items-center justify-center gap-2 rounded-[10px] border text-[15px] font-semibold", me.saved ? "border-ink bg-ink text-paper" : "border-ink/30 hover:bg-paper-2")}>
                          <Bookmark className="size-4" /> {me.saved ? "Saved" : "Save"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="relative flex items-end gap-3 bg-[#f6e3b5] px-6 pt-4">
                  <p className="pb-5 text-[14px] leading-snug text-ink-2">All messages go through SMEmarket, so every step of the deal stays on record.</p>
                  <Character who="karim" mood="explaining" body="Paper" size={110} className="shrink-0" />
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

/** The three steps to see a business, ticked off as the buyer goes. */
function BuyerSteps({ me }: { me: Me }) {
  const steps = [
    { t: "Free account", done: me.signedIn },
    { t: "Sign one NDA with ID", done: !!me.nda },
    { t: "Seller approves you", done: me.access === "approved" },
  ];
  return (
    <div>
      <p className="text-[19px] font-semibold">{me.unlocked ? "You can see everything." : "See the name, figures and documents"}</p>
      <ol className="mt-4 space-y-3">
        {steps.map((s, i) => (
          <li key={s.t} className="flex items-center gap-3 text-[15px]">
            <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-semibold", s.done ? "bg-lime" : "bg-paper-2 text-muted")}>{s.done ? <BadgeCheck className="size-4" /> : i + 1}</span>
            <span className={s.done ? "text-ink" : "text-ink-2"}>{s.t}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The seller's side: status, who's asking, approve or decline. */
function OwnerPanel({ l, me, onChange }: { l: Full; me: Me; onChange: () => void }) {
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => {
    api<{ requests: Req[] }>(`listings/${l.id}/requests`)
      .then((d) => setReqs(d.requests))
      .catch((e) => setErr(e.message));
  }, [l.id]);
  useEffect(load, [load]);
  const decide = async (rid: string, decision: "approved" | "declined") => {
    try {
      await api(`access/${rid}`, { body: { decision } });
      load();
      onChange();
    } catch (e) {
      setErr((e as Error).message);
    }
  };
  return (
    <div className="rounded-[28px] bg-card p-6 ring-1 ring-rule md:p-7">
      <p className="text-[14px] font-semibold text-muted">{me.owner ? "Your listing" : "Admin view"}</p>
      <p className="mt-1 flex items-center gap-2 text-[20px] font-semibold">
        {l.status === "live" ? <ShieldCheck className="size-5" /> : <Clock className="size-5" />} {STATUS[l.status] ?? l.status}
      </p>
      {l.status === "pending" && <p className="mt-2 text-[15px] text-ink-2">We review every business before it goes live. We&apos;ll be in touch if we need anything.</p>}
      {l.review_note && <Notice>{l.review_note}</Notice>}
      <h3 className="mt-6 text-[17px] font-semibold">Buyers asking for details</h3>
      {err && <Notice tone="error">{err}</Notice>}
      <ul className="mt-3 grid gap-2.5">
        {reqs?.length === 0 && <li className="text-[15px] text-muted">No requests yet. Verified buyers will appear here.</li>}
        {reqs?.map((r) => (
          <li key={r.id} className="rounded-2xl border border-rule p-4">
            <div className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-[16px] font-semibold">{r.full_name}</span>
                <span className="block text-[13px] text-muted">
                  {[r.company, r.budget && `Budget ${r.budget}`, r.timeline].filter(Boolean).join(" · ") || "NDA signed"} · {ago(r.created_at)}
                </span>
              </span>
              <span className={clsx("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold", r.id_status === "approved" ? "bg-lime" : "bg-paper-2 text-muted")}>{r.id_status === "approved" ? "ID checked" : "ID in review"}</span>
            </div>
            {r.status === "requested" ? (
              <div className="mt-3 flex gap-2">
                <button onClick={() => decide(r.id, "approved")} className="h-10 flex-1 rounded-[10px] bg-ink text-[14px] font-semibold text-paper">
                  Approve
                </button>
                <button onClick={() => decide(r.id, "declined")} className="h-10 flex-1 rounded-[10px] border border-ink/30 text-[14px] font-semibold">
                  Decline
                </button>
              </div>
            ) : (
              <p className="mt-2 text-[14px] font-medium">{r.status === "approved" ? "Approved" : "Declined"}</p>
            )}
          </li>
        ))}
      </ul>
      <Link href={APP.messages} className="mt-5 flex h-11 items-center justify-center gap-2 rounded-[10px] border border-ink/30 text-[15px] font-semibold">
        <MessagesSquare className="size-4" /> Messages from buyers
      </Link>
    </div>
  );
}

function DocUpload({ id, onDone }: { id: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="mt-3">
      <label className={clsx("flex h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-dashed border-ink/40 text-[15px] font-semibold hover:bg-paper-2", busy && "opacity-60")}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Add a document (up to 15 MB)
        <input
          type="file"
          className="sr-only"
          disabled={busy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const form = new FormData();
            form.set("file", file);
            setBusy(true);
            setErr("");
            try {
              await api(`listings/${id}/docs`, { form });
              onDone();
            } catch (x) {
              setErr((x as Error).message);
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {err && <p className="mt-2 text-[14px] text-stamp">{err}</p>}
      <p className="mt-2 text-[13px] text-muted">Only you, our team and buyers you approve can open these.</p>
    </div>
  );
}
