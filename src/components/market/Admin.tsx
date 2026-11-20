"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Check, ExternalLink, Loader2, X } from "lucide-react";
import { api, aed, ago, useMe } from "@/lib/api";
import { APP } from "@/lib/site";
import AppPage, { Empty, Notice } from "./AppPage";

type Row = Record<string, string | number | null>;
type Data = { listings: Row[]; ndas: Row[]; providers: Row[]; leads: Row[]; users: number };
type Tab = "listings" | "providers" | "leads";

/** The team's desk: review listings, check IDs, approve directory providers, see every lead. */
export default function Admin() {
  const { user, loading } = useMe();
  const [d, setD] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>("listings");
  const [err, setErr] = useState("");
  const [note, setNote] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    api<Data>("admin/overview")
      .then(setD)
      .catch((e) => setErr(e.message));
  }, []);
  useEffect(() => {
    if (user?.role === "admin") load();
  }, [user, load]);

  const run = async (path: string, body: unknown) => {
    try {
      await api(path, { body });
      load();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  if (loading) return <AppPage title="Admin"><Loader2 className="size-6 animate-spin text-muted" /></AppPage>;
  if (!user)
    return (
      <AppPage title="Admin">
        <Link href={`${APP.login}?next=${encodeURIComponent(APP.admin)}`} className="inline-flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-paper">
          Team log in
        </Link>
      </AppPage>
    );
  if (user.role !== "admin") return <AppPage title="Admin"><Notice tone="error">This page is for the SMEmarket team.</Notice></AppPage>;

  const count = (rows: Row[] | undefined, k: string, v: string) => rows?.filter((r) => r[k] === v).length ?? 0;
  const tabs: { k: Tab; l: string; n: number }[] = [
    { k: "listings", l: "Listings", n: count(d?.listings, "status", "pending") },
    { k: "providers", l: "Directory", n: count(d?.providers, "status", "pending") },
    { k: "leads", l: "Leads", n: count(d?.leads, "status", "new") },
  ];
  const btn = "inline-flex h-9 items-center gap-1.5 rounded-[8px] px-3 text-[14px] font-semibold";

  return (
    <AppPage eyebrow="Admin" title="The desk." intro={d ? `${d.listings.length} listings · ${d.leads.length} enquiries` : undefined}>
      {err && <Notice tone="error">{err}</Notice>}
      <div role="tablist" className="flex flex-wrap gap-1 border-b border-rule-strong">
        {tabs.map((t) => (
          <button key={t.k} role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)} className={clsx("-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[16px] font-semibold", tab === t.k ? "border-ink" : "border-transparent text-muted hover:text-ink")}>
            {t.l}
            {t.n > 0 && <span className="rounded-full bg-ink px-2 text-[13px] text-lime">{t.n}</span>}
          </button>
        ))}
      </div>

      {!d ? (
        <Loader2 className="mt-6 size-6 animate-spin text-muted" />
      ) : (
        <div className="mt-6 grid gap-3">
          {tab === "listings" &&
            (d.listings.length ? (
              d.listings.map((l) => (
                <div key={String(l.id)} className="rounded-[20px] bg-card p-5 ring-1 ring-rule">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[18px] font-semibold">
                        {l.business_name || l.title} {l.business_name ? <span className="font-normal text-muted">· {l.title}</span> : null}
                      </p>
                      <p className="text-[14px] text-muted">
                        {l.industry} · {[l.area, l.city].filter(Boolean).join(", ")} · Asking {aed(Number(l.asking_price))} · Revenue {aed(l.revenue as number)} · Profit {aed(l.profit as number)}
                      </p>
                      <p className="mt-1 text-[14px] text-muted">
                        Seller: {[l.contact_name ?? l.seller_name, l.contact_phone, l.contact_email ?? (l.contact_name ? null : l.seller_email)].filter(Boolean).join(" · ")} · {ago(Number(l.created_at))}
                      </p>
                      {l.summary && <p className="mt-2 max-w-3xl text-[15px] text-ink-2">{l.summary}</p>}
                    </div>
                    <span className={clsx("rounded-full px-3 py-1 text-[13px] font-semibold", l.status === "live" ? "bg-lime" : l.status === "pending" ? "bg-[#f6e3b5]" : "bg-paper-2")}>{l.status}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input value={note[String(l.id)] ?? String(l.review_note ?? "")} onChange={(e) => setNote((n) => ({ ...n, [String(l.id)]: e.target.value }))} placeholder="Team note (optional)" className="field h-9 max-w-sm py-1 text-[14px]" />
                    {l.status !== "live" && (
                      <button onClick={() => run(`admin/listings/${l.id}`, { status: "live", review_note: note[String(l.id)] ?? l.review_note ?? "" })} className={`${btn} bg-ink text-paper`}>
                        <Check className="size-4" /> Publish
                      </button>
                    )}
                    {l.status === "pending" && (
                      <button onClick={() => run(`admin/listings/${l.id}`, { status: "rejected", review_note: note[String(l.id)] ?? "" })} className={`${btn} border border-ink/30`}>
                        <X className="size-4" /> Reject
                      </button>
                    )}
                    {l.status === "live" && (
                      <>
                        <button onClick={() => run(`admin/listings/${l.id}`, { status: "sold" })} className={`${btn} border border-ink/30`}>
                          Mark sold
                        </button>
                        <button onClick={() => run(`admin/listings/${l.id}`, { status: "pending" })} className={`${btn} border border-ink/30`}>
                          Unpublish
                        </button>
                      </>
                    )}
                    <Link href={APP.listing(String(l.id))} className={`${btn} text-ink-2 hover:text-ink`}>
                      <ExternalLink className="size-4" /> Open
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <Empty title="No listings yet." />
            ))}

          {tab === "providers" &&
            (d.providers.length ? (
              d.providers.map((p) => (
                <div key={String(p.id)} className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-card p-5 ring-1 ring-rule">
                  <div className="min-w-0">
                    <p className="text-[17px] font-semibold">
                      {p.company} <span className="font-normal text-muted">· {p.category}</span>
                    </p>
                    <p className="text-[14px] text-muted">{[p.area, p.website, p.email, p.phone, p.contact_name].filter(Boolean).join(" · ")}</p>
                    {p.description && <p className="mt-1 text-[15px] text-ink-2">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx("rounded-full px-3 py-1 text-[13px] font-semibold", p.status === "live" ? "bg-lime" : "bg-paper-2")}>{p.status}</span>
                    {p.status !== "live" && (
                      <button onClick={() => run(`admin/providers/${p.id}`, { status: "live" })} className={`${btn} bg-ink text-paper`}>
                        <Check className="size-4" /> Publish
                      </button>
                    )}
                    {p.status !== "rejected" && (
                      <button onClick={() => run(`admin/providers/${p.id}`, { status: "rejected" })} className={`${btn} border border-ink/30`}>
                        <X className="size-4" /> {p.status === "live" ? "Remove" : "Reject"}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <Empty title="No directory submissions yet." />
            ))}

          {tab === "leads" &&
            (d.leads.length ? (
              d.leads.map((l) => {
                const p = (() => {
                  try {
                    return JSON.parse(String(l.payload)) as Record<string, unknown>;
                  } catch {
                    return {};
                  }
                })();
                return (
                  <div key={String(l.id)} className={clsx("rounded-[20px] p-5 ring-1 ring-rule", l.status === "new" ? "bg-card" : "bg-paper-2 opacity-70")}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[17px] font-semibold">
                          {l.name || "No name"} <span className="font-normal text-muted">· {l.type}</span>
                        </p>
                        <p className="text-[14px] text-muted">{[l.phone, l.email, p.business, ago(Number(l.created_at))].filter(Boolean).join(" · ")}</p>
                        {Array.isArray(p.services) && p.services.length > 0 && <p className="mt-1 text-[14px]">About: {(p.services as string[]).join(", ")}</p>}
                        {p.message ? <p className="mt-1 max-w-3xl text-[15px] text-ink-2">{String(p.message)}</p> : null}
                      </div>
                      {l.status === "new" && (
                        <button onClick={() => run(`admin/leads/${l.id}`, { status: "done" })} className={`${btn} border border-ink/30`}>
                          <Check className="size-4" /> Mark handled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <Empty title="No leads yet." />
            ))}
        </div>
      )}
    </AppPage>
  );
}
