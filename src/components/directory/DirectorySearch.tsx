"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Clock, ExternalLink, Loader2, Mail, MapPin, Phone, Search, Star } from "lucide-react";
import { api } from "@/lib/api";
import Dropdown from "@/components/ui/Dropdown";
import { EMIRATES, waLink } from "@/lib/site";

const EXAMPLES = ["Accountant for VAT registration", "PRO services for visa renewal", "Office fit-out", "Logistics company"];

type Place = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hours: string | null;
  rating: number | null;
  reviews: number | null;
  maps: string;
};
type Result = { q: string; area: string; source: "google" | "osm"; places: Place[] };

const TONES = ["#d5ece4", "#f6e3b5", "#e3dcf2", "#f4d6cc", "#dbe7f5", "#e8f0c9"];
const tone = (s: string) => TONES[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
const host = (u: string) => {
  try {
    return new URL(/^https?:\/\//.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "");
  } catch {
    return u;
  }
};
const mapsSearch = (q: string, area: string) => `https://www.google.com/maps/search/${encodeURIComponent(`${q} ${area === "UAE" ? "UAE" : `${area} UAE`}`)}`;

/** Plain-English search over public business listings, with results right under the box. */
export default function DirectorySearch() {
  const [q, setQ] = useState("");
  const [area, setArea] = useState("Dubai");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const areaRef = useRef(area);
  areaRef.current = area;

  const search = async (term: string, where = areaRef.current) => {
    if (term.trim().length < 2) return input.current?.focus();
    setBusy(true);
    setErr("");
    try {
      setRes(await api<Result>(`directory/search?q=${encodeURIComponent(term)}&area=${encodeURIComponent(where)}`));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // a category tile elsewhere on the page can start a search
  useEffect(() => {
    const on = (e: Event) => {
      const term = (e as CustomEvent<string>).detail;
      setQ(term);
      search(term);
    };
    window.addEventListener("smem:dir-search", on);
    return () => window.removeEventListener("smem:dir-search", on);
  }, []);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(q);
        }}
        className="flex flex-col gap-2 rounded-[22px] bg-card p-2 shadow-[0_30px_60px_-40px_rgba(21,19,15,.6)] ring-1 ring-rule transition-shadow focus-within:ring-2 focus-within:ring-ink sm:flex-row sm:items-center"
      >
        <label htmlFor="dir-q" className="sr-only">
          What do you need help with?
        </label>
        <span className="flex flex-1 items-center gap-3 pl-3">
          <Search className="size-5 shrink-0 text-muted" />
          <input
            ref={input}
            id="dir-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={120}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Accountant for VAT registration"
            className="h-12 w-full min-w-0 bg-transparent text-[17px] outline-none placeholder:text-faint focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
        </span>
        <span className="flex gap-2">
          <Dropdown
            label="Area"
            value={area}
            icon={<MapPin className="size-4" />}
            options={[...EMIRATES.map((e) => ({ value: e, label: e })), { value: "UAE", label: "All of the UAE" }]}
            onChange={(v) => {
              setArea(v);
              if (res) search(res.q, v);
            }}
            className="flex-1 sm:w-[190px] sm:flex-none"
          />
          <button type="submit" disabled={busy} className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-ink px-5 text-[16px] font-semibold text-paper transition hover:bg-ink-3 disabled:opacity-70 sm:px-6">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4 sm:hidden" />}
            <span className="hidden sm:inline">{busy ? "Searching" : "Search"}</span>
          </button>
        </span>
      </form>

      {!res && !busy && (
        <>
          <p className="mt-5 text-[14px] font-medium text-muted">Try</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {EXAMPLES.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setQ(e);
                  search(e);
                }}
                className="rounded-full border border-rule-strong px-3.5 py-2 text-[14px] transition hover:border-ink hover:bg-ink hover:text-paper"
              >
                {e}
              </button>
            ))}
          </div>
        </>
      )}

      {err && (
        <p className="mt-4 text-[15px] text-stamp" role="alert">
          {err}
        </p>
      )}

      {busy && !res && (
        <div data-dir-results>
          <Skeletons />
        </div>
      )}

      {res && (
        <div data-dir-results className={clsx("mt-6 transition-opacity", busy && "opacity-50")} aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[15px] text-muted">
              {res.places.length ? (
                <>
                  <span className="font-semibold text-ink">{res.places.length}</span> {res.places.length === 1 ? "business" : "businesses"} for “{res.q}” in {res.area === "UAE" ? "the UAE" : res.area}
                </>
              ) : (
                <>Nothing in public listings for “{res.q}” in {res.area === "UAE" ? "the UAE" : res.area} yet.</>
              )}
            </p>
            <button onClick={() => (setRes(null), setQ(""), input.current?.focus())} className="text-[14px] font-semibold underline underline-offset-4">
              New search
            </button>
          </div>

          {res.places.length > 0 && (
            <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {res.places.map((p, i) => (
                <PlaceCard key={p.id} p={p} i={i} />
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-col gap-3 rounded-2xl bg-paper-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[15px] text-ink-2">{res.places.length ? "Want more options?" : "Try fewer words or another area, or look wider:"}</p>
            <div className="flex flex-wrap gap-2 text-[14px] font-semibold">
              <a href={mapsSearch(res.q, res.area)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-card px-3.5 py-2 ring-1 ring-rule-strong transition hover:ring-ink">
                <MapPin className="size-3.5" /> Search Google Maps
              </a>
              <a href={waLink(`Hi SMEmarket, I'm looking for: ${res.q} (${res.area})`)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-paper transition hover:bg-ink-3">
                Ask us to find one <ArrowUpRight className="size-3.5 text-lime" />
              </a>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-faint">
            Public business data {res.source === "google" ? "from Google" : "© OpenStreetMap contributors"}. Not a recommendation: check a provider yourself before you hire them.
          </p>
        </div>
      )}
    </div>
  );
}

function PlaceCard({ p, i }: { p: Place; i: number }) {
  const btn = "flex items-center gap-1.5 rounded-full border border-rule-strong px-3 py-1.5 transition hover:border-ink hover:bg-ink hover:text-paper";
  return (
    <li style={{ animation: `pageIn .55s cubic-bezier(.16,1,.3,1) ${Math.min(i, 10) * 45}ms both` }} className="group flex gap-4 rounded-[20px] bg-card p-4 ring-1 ring-rule transition hover:shadow-[0_20px_40px_-30px_rgba(21,19,15,.5)] hover:ring-ink/25 md:p-5">
      <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl text-[18px] font-semibold transition-transform duration-300 group-hover:-rotate-6" style={{ background: tone(p.name) }}>
        {p.name.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "•"}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[17px] font-semibold leading-snug">{p.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
          <span className="rounded-full bg-paper-2 px-2 py-0.5 font-medium text-ink-2">{p.category}</span>
          {p.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-[#f2b705] text-[#f2b705]" /> {p.rating.toFixed(1)}
              {p.reviews != null && <span>({p.reviews.toLocaleString()})</span>}
            </span>
          )}
          {p.website && <span className="truncate">{host(p.website)}</span>}
        </p>
        {p.address && (
          <p className="mt-2 flex gap-1.5 text-[14px] text-ink-2">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted" /> <span className="min-w-0">{p.address}</span>
          </p>
        )}
        {p.hours && (
          <p className="mt-1 flex gap-1.5 text-[13px] text-muted">
            <Clock className="mt-0.5 size-3.5 shrink-0" /> <span className="min-w-0 truncate">{p.hours}</span>
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-semibold">
          {p.phone && (
            <a href={`tel:${p.phone.replace(/[^\d+]/g, "")}`} className={btn}>
              <Phone className="size-3.5" /> {p.phone}
            </a>
          )}
          {p.website && (
            <a href={/^https?:\/\//.test(p.website) ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer nofollow" className={btn}>
              <ExternalLink className="size-3.5" /> Website
            </a>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className={btn}>
              <Mail className="size-3.5" /> Email
            </a>
          )}
          <a href={p.maps} target="_blank" rel="noopener noreferrer" className={btn}>
            <MapPin className="size-3.5" /> Map
          </a>
        </div>
      </div>
    </li>
  );
}

function Skeletons() {
  return (
    <div className="mt-6" aria-hidden>
      <p className="flex items-center gap-2 text-[15px] text-muted">
        <Loader2 className="size-4 animate-spin" /> Looking through public listings…
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex gap-4 rounded-[20px] bg-card p-5 ring-1 ring-rule">
            <span className="size-12 shrink-0 animate-pulse rounded-2xl bg-paper-2" />
            <span className="flex-1">
              <span className="block h-5 w-2/3 animate-pulse rounded bg-paper-2" />
              <span className="mt-2 block h-4 w-1/3 animate-pulse rounded bg-paper-2" />
              <span className="mt-4 block h-7 w-1/2 animate-pulse rounded-full bg-paper-2" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
