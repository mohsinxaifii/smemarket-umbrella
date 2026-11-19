"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Bookmark, Eye, FileSignature, Loader2, LogOut, MessagesSquare, Plus, ShieldCheck, Store } from "lucide-react";
import { api, aed, refreshMe, useMe } from "@/lib/api";
import { APP } from "@/lib/site";
import AppPage, { Empty, Notice } from "./AppPage";
import ListingCard, { type PublicListing } from "./ListingCard";
import SignInGate from "./SignInGate";

type Mine = PublicListing & { review_note: string | null; pending_requests: number };
type Data = { listings: Mine[]; access: { access: string; listing: PublicListing }[]; saved: PublicListing[]; nda: { id_status: string } | null };

const STATUS: Record<string, [string, string]> = {
  pending: ["In review", "bg-[#f6e3b5]"],
  live: ["Live", "bg-lime"],
  rejected: ["Not approved", "bg-stamp/15 text-stamp"],
  sold: ["Sold", "bg-ink text-paper"],
  withdrawn: ["Withdrawn", "bg-paper-2 text-muted"],
};
const ACCESS: Record<string, string> = { requested: "Waiting for the seller", approved: "Approved", declined: "Declined" };

export default function Account() {
  const { user, loading } = useMe();
  const router = useRouter();
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"selling" | "buying" | "saved">("selling");

  useEffect(() => {
    if (!user) return;
    api<Data>("my")
      .then((x) => {
        setD(x);
        if (!x.listings.length && (x.access.length || x.saved.length)) setTab("buying");
      })
      .catch((e) => setErr(e.message));
  }, [user]);

  const logout = async () => {
    await api("auth/logout", { method: "POST" }).catch(() => {});
    refreshMe();
    router.push("/");
  };

  if (loading)
    return (
      <AppPage title="My account">
        <Loader2 className="size-6 animate-spin text-muted" />
      </AppPage>
    );
  if (!user)
    return (
      <AppPage title="My account">
        <SignInGate />
      </AppPage>
    );

  const tabs = [
    { k: "selling" as const, l: "Selling", n: d?.listings.length, i: Store },
    { k: "buying" as const, l: "Buying", n: d?.access.length, i: Eye },
    { k: "saved" as const, l: "Saved", n: d?.saved.length, i: Bookmark },
  ];

  return (
    <AppPage
      eyebrow="My account"
      title={`Hi, ${user.name.split(" ")[0]}.`}
      aside={
        <div className="flex flex-wrap gap-2">
          <Link href={APP.messages} className="flex h-11 items-center gap-2 rounded-[10px] border border-ink/30 px-4 text-[15px] font-semibold">
            <MessagesSquare className="size-4" /> Messages
          </Link>
          {user.role === "admin" && (
            <Link href={APP.admin} className="flex h-11 items-center gap-2 rounded-[10px] bg-lime px-4 text-[15px] font-semibold">
              Admin
            </Link>
          )}
          <button onClick={logout} className="flex h-11 items-center gap-2 rounded-[10px] px-3 text-[15px] font-medium text-muted hover:text-ink">
            <LogOut className="size-4" /> Log out
          </button>
        </div>
      }
    >
      {err && <Notice tone="error">{err}</Notice>}

      {/* NDA status, the one thing buyers need */}
      <div className="grid gap-3 md:grid-cols-3">
        <div className={clsx("flex items-center gap-4 rounded-[22px] p-5", d?.nda?.id_status === "approved" ? "bg-lime" : "bg-paper-2")}>
          {d?.nda ? <ShieldCheck className="size-6 shrink-0" /> : <FileSignature className="size-6 shrink-0" />}
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] font-semibold">{!d?.nda ? "NDA not signed" : d.nda.id_status === "approved" ? "NDA signed, ID checked" : d.nda.id_status === "pending" ? "NDA signed, ID in review" : "ID check didn't pass"}</span>
            <span className="block text-[14px] text-ink-2">{!d?.nda ? "Buying? Sign once to see any business's details." : "One NDA covers every listing."}</span>
          </span>
          {(!d?.nda || d.nda.id_status === "rejected") && (
            <Link href={APP.nda} className="shrink-0 rounded-[10px] bg-ink px-3.5 py-2 text-[14px] font-semibold text-paper">
              Sign
            </Link>
          )}
        </div>
        <Link href={APP.listings} className="group flex items-center gap-4 rounded-[22px] bg-[#f6e3b5] p-5">
          <Eye className="size-6 shrink-0" />
          <span className="flex-1 text-[16px] font-semibold">Browse businesses for sale</span>
          <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
        </Link>
        <Link href={APP.sell} className="group flex items-center gap-4 rounded-[22px] bg-[#e3dcf2] p-5">
          <Plus className="size-6 shrink-0" />
          <span className="flex-1 text-[16px] font-semibold">List a business, free</span>
          <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
        </Link>
      </div>

      <div role="tablist" className="mt-10 flex gap-1 border-b border-rule-strong">
        {tabs.map((t) => (
          <button key={t.k} role="tab" aria-selected={tab === t.k} onClick={() => setTab(t.k)} className={clsx("-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-[16px] font-semibold transition", tab === t.k ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}>
            <t.i className="size-4" /> {t.l}
            {!!t.n && <span className="rounded-full bg-paper-2 px-2 text-[13px]">{t.n}</span>}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {!d ? (
          <Loader2 className="size-6 animate-spin text-muted" />
        ) : tab === "selling" ? (
          d.listings.length ? (
            <ul className="grid gap-3">
              {d.listings.map((l) => {
                const [label, cls] = STATUS[l.status] ?? [l.status, "bg-paper-2"];
                return (
                  <li key={l.id}>
                    <Link href={APP.listing(l.id)} className="group flex flex-col gap-3 rounded-[22px] bg-card p-5 ring-1 ring-rule transition hover:ring-ink/30 md:flex-row md:items-center md:gap-6">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[18px] font-semibold">{l.business_name}</span>
                        <span className="block text-[14px] text-muted">
                          {l.industry} · {[l.area, l.city].filter(Boolean).join(", ")} · {aed(l.asking_price)}
                        </span>
                        {l.review_note && <span className="mt-1 block text-[14px] text-ink-2">Note from our team: {l.review_note}</span>}
                      </span>
                      <span className={clsx("w-fit rounded-full px-3 py-1 text-[13px] font-semibold", cls)}>{label}</span>
                      {l.pending_requests > 0 && <span className="w-fit rounded-full bg-ink px-3 py-1 text-[13px] font-semibold text-lime">{l.pending_requests} buyer{l.pending_requests > 1 ? "s" : ""} waiting</span>}
                      <ArrowUpRight className="hidden size-5 transition-transform group-hover:rotate-45 md:block" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="You haven't listed a business yet.">
              <Link href={APP.sell} className="font-semibold underline">
                List one for free
              </Link>{" "}
              in about three minutes.
            </Empty>
          )
        ) : tab === "buying" ? (
          d.access.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {d.access.map((a) => (
                <ListingCard key={a.listing.id} l={a.listing} badge={<span className={clsx("rounded-full px-2.5 py-1 text-[12px] font-semibold", a.access === "approved" ? "bg-lime" : "bg-paper-2 text-muted")}>{ACCESS[a.access]}</span>} />
              ))}
            </div>
          ) : (
            <Empty title="No requests yet.">Open any business and press “Request full details”.</Empty>
          )
        ) : d.saved.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {d.saved.map((l) => (
              <ListingCard key={l.id} l={l} saved />
            ))}
          </div>
        ) : (
          <Empty title="Nothing saved yet.">Save businesses you like to compare them later.</Empty>
        )}
      </div>
    </AppPage>
  );
}
