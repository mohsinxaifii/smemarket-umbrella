"use client";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import AppPage, { Empty, Notice, SELECT_CLS } from "./AppPage";
import ListingCard, { ListingCardSkeleton, type PublicListing } from "./ListingCard";
import Button from "@/components/ui/Button";
import { api } from "@/lib/api";
import { APP } from "@/lib/site";

const PRICES: [string, number | null, number | null][] = [
  ["Any price", null, null],
  ["Up to AED 250K", null, 250_000],
  ["AED 250K – 500K", 250_000, 500_000],
  ["AED 500K – 1M", 500_000, 1_000_000],
  ["AED 1M – 3M", 1_000_000, 3_000_000],
  ["AED 3M+", 3_000_000, null],
];

/** Browse live listings with filters. Filters live in the URL so a search can be shared. */
export default function Browse() {
  const [data, setData] = useState<{ listings: PublicListing[]; cities: string[]; industries: string[]; saved: string[] } | null>(null);
  const [round, setRound] = useState(0); // bumps on every new result set, so the cards cascade in again
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const [f, setF] = useState({ q: "", city: "", industry: "", price: 0, sort: "" });
  const [showFilters, setShowFilters] = useState(false);

  // read filters from the URL once
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setF({ q: p.get("q") || "", city: p.get("city") || "", industry: p.get("industry") || "", price: Number(p.get("price") || 0), sort: p.get("sort") || "" });
  }, []);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (f.q) p.set("q", f.q);
    if (f.city) p.set("city", f.city);
    if (f.industry) p.set("industry", f.industry);
    const [, min, max] = PRICES[f.price] ?? PRICES[0];
    if (min) p.set("min", String(min));
    if (max) p.set("max", String(max));
    if (f.sort) p.set("sort", f.sort);
    return p.toString();
  }, [f]);

  useEffect(() => {
    const t = setTimeout(() => {
      setBusy(true);
      api<typeof data>(`listings${qs ? `?${qs}` : ""}`)
        .then((d) => {
          setData((prev) => ({ listings: d!.listings, saved: d!.saved ?? [], cities: prev?.cities.length ? prev.cities : d!.cities, industries: prev?.industries.length ? prev.industries : d!.industries }));
          setRound((r) => r + 1);
          setErr("");
        })
        .catch((e) => setErr(e.message))
        .finally(() => setBusy(false));
      const url = new URLSearchParams();
      Object.entries(f).forEach(([k, v]) => v && url.set(k, String(v)));
      window.history.replaceState(null, "", `${window.location.pathname}${url.toString() ? `?${url}` : ""}`);
    }, 250);
    return () => clearTimeout(t);
  }, [qs, f]);

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: k === "price" ? Number(e.target.value) : e.target.value }));
  const active = !!(f.q || f.city || f.industry || f.price);

  return (
    <AppPage
      eyebrow="Businesses for sale"
      title="Find your next business."
      intro="Curated UAE businesses, every one reviewed by our team before it goes live. Sign one NDA to see names, figures and documents."
      aside={
        <Button href={APP.sell} variant="outline">
          Selling? List free
        </Button>
      }
    >
      {/* search + filters */}
      <div className="rounded-[22px] bg-card p-2 ring-1 ring-rule">
        <div className="flex items-center gap-2">
          <span className="flex flex-1 items-center gap-3 pl-3">
            <Search className="size-5 shrink-0 text-muted" />
            <input value={f.q} onChange={set("q")} placeholder="Search: café, salon, JLT, e-commerce…" aria-label="Search businesses" className="h-12 w-full min-w-0 bg-transparent text-[17px] outline-none placeholder:text-faint" />
          </span>
          <button onClick={() => setShowFilters((s) => !s)} className="flex h-12 items-center gap-2 rounded-[14px] px-4 text-[15px] font-semibold hover:bg-paper-2 md:hidden" aria-expanded={showFilters}>
            <SlidersHorizontal className="size-4" /> Filters
          </button>
        </div>
        <div className={`${showFilters ? "grid" : "hidden"} gap-2 border-t border-rule p-2 pt-3 md:grid md:grid-cols-4`}>
          <select value={f.city} onChange={set("city")} className={SELECT_CLS} aria-label="City">
            <option value="">All cities</option>
            {data?.cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={f.industry} onChange={set("industry")} className={SELECT_CLS} aria-label="Industry">
            <option value="">All industries</option>
            {data?.industries.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={f.price} onChange={set("price")} className={SELECT_CLS} aria-label="Price">
            {PRICES.map(([l], i) => (
              <option key={l} value={i}>
                {l}
              </option>
            ))}
          </select>
          <select value={f.sort} onChange={set("sort")} className={SELECT_CLS} aria-label="Sort">
            <option value="">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="profit">Highest profit</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between text-[15px] text-muted">
        <span className="flex items-center gap-2">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {data ? `${data.listings.length} ${data.listings.length === 1 ? "business" : "businesses"}` : "Loading businesses…"}
        </span>
        {active && (
          <button onClick={() => setF({ q: "", city: "", industry: "", price: 0, sort: f.sort })} className="flex items-center gap-1 font-medium text-ink hover:underline">
            <X className="size-4" /> Clear filters
          </button>
        )}
      </div>

      {err && (
        <div className="mt-4">
          <Notice tone="error">{err}</Notice>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!data &&
          Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        {data?.listings.map((l, i) => (
          <div key={`${round}-${l.id}`} className="h-full [&>article]:h-full" style={{ animation: `pageIn .55s cubic-bezier(.16,1,.3,1) ${Math.min(i, 8) * 60}ms both` }}>
            <ListingCard l={l} saved={data.saved.includes(l.id)} />
          </div>
        ))}
      </div>
      {data && !data.listings.length && !busy && (
        <div className="mt-4">
          <Empty title={active ? "No match. Try fewer filters." : "New businesses are on their way."}>Not seeing the right fit? Check back soon, or tell us what you&apos;re looking for on WhatsApp and we&apos;ll keep an eye out.</Empty>
        </div>
      )}

      <p className="mt-10 text-[14px] text-muted">Names and identifying details unlock after the seller approves you. Figures are seller-provided until a bank statement, VAT return or the books back them up.</p>
    </AppPage>
  );
}
