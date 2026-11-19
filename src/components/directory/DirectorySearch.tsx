"use client";
import { useRef, useState } from "react";
import { ExternalLink, Loader2, Mail, MapPin, Phone, Search } from "lucide-react";
import { api } from "@/lib/api";
import { waLink } from "@/lib/site";

const EXAMPLES = ["Accountant for VAT registration in Dubai", "PRO services for visa renewal in Dubai", "Office fit-out in Business Bay"];

type Provider = { id: string; company: string; category: string; area: string | null; website: string | null; phone: string | null; email: string | null; description: string | null };

/** Plain-English search over the providers our team has approved, with results right under the box. */
export default function DirectorySearch() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ q: string; providers: Provider[] } | null>(null);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const search = async (term: string) => {
    if (!term.trim()) return;
    setBusy(true);
    setErr("");
    try {
      const d = await api<{ providers: Provider[] }>(`providers?q=${encodeURIComponent(term)}`);
      setRes({ q: term, providers: d.providers });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search(q);
        }}
        className="flex flex-col gap-2 rounded-[22px] bg-card p-2 shadow-[0_30px_60px_-40px_rgba(21,19,15,.6)] ring-1 ring-rule sm:flex-row sm:items-center"
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
            required
            maxLength={200}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Accountant for VAT registration in Dubai"
            className="h-12 w-full min-w-0 bg-transparent text-[17px] outline-none placeholder:text-faint"
          />
        </span>
        <button type="submit" disabled={busy} className="flex h-12 items-center justify-center gap-2 rounded-[16px] bg-ink px-6 text-[16px] font-semibold text-paper transition hover:bg-ink-3 disabled:opacity-70">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {busy ? "Looking up providers…" : "Find providers"}
        </button>
      </form>

      {!res && (
        <>
          <p className="mt-5 text-[14px] font-medium text-muted">For example</p>
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

      {err && <p className="mt-4 text-[15px] text-stamp">{err}</p>}

      {res && (
        <div className="mt-6 animate-[pageIn_.5s_cubic-bezier(.16,1,.3,1)_both]">
          <p className="text-[15px] text-muted">
            {res.providers.length ? `${res.providers.length} provider${res.providers.length > 1 ? "s" : ""} for “${res.q}”` : `No providers listed for “${res.q}” yet.`}
          </p>
          {res.providers.length === 0 && (
            <p className="mt-2 text-[16px] text-ink-2">
              Our directory is growing.{" "}
              <a href={waLink(`Hi SMEmarket, I'm looking for: ${res.q}`)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                Tell us on WhatsApp
              </a>{" "}
              and we&apos;ll find someone for you.
            </p>
          )}
          <ul className="mt-3 grid gap-2.5">
            {res.providers.map((p) => (
              <li key={p.id} className="rounded-2xl bg-card p-4 ring-1 ring-rule">
                <p className="text-[17px] font-semibold">{p.company}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-[14px] text-muted">
                  <span>{p.category}</span>
                  {p.area && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {p.area}
                    </span>
                  )}
                </p>
                {p.description && <p className="mt-2 text-[15px] text-ink-2">{p.description}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[14px] font-semibold">
                  {p.website && (
                    <a href={/^https?:\/\//.test(p.website) ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-1.5 rounded-full border border-rule-strong px-3 py-1.5 hover:border-ink">
                      <ExternalLink className="size-3.5" /> Website
                    </a>
                  )}
                  {p.phone && (
                    <a href={`tel:${p.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 rounded-full border border-rule-strong px-3 py-1.5 hover:border-ink">
                      <Phone className="size-3.5" /> Call
                    </a>
                  )}
                  {p.email && (
                    <a href={`mailto:${p.email}`} className="flex items-center gap-1.5 rounded-full border border-rule-strong px-3 py-1.5 hover:border-ink">
                      <Mail className="size-3.5" /> Email
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button onClick={() => (setRes(null), setQ(""), input.current?.focus())} className="mt-4 text-[15px] font-semibold underline">
            New search
          </button>
        </div>
      )}
    </div>
  );
}
