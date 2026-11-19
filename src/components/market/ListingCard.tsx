"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Bookmark, Lock, MapPin } from "lucide-react";
import { APP } from "@/lib/site";
import { ApiError, aed, api, short } from "@/lib/api";
import { useTilt, GLOW } from "@/lib/useTilt";
import { toast } from "@/components/ui/Toast";

export type PublicListing = {
  id: string;
  status: string;
  title: string;
  industry: string;
  city: string;
  area: string | null;
  asking_price: number;
  revenue: number | null;
  profit: number | null;
  multiple: number | null;
  years_trading: number | null;
  employees: number | null;
  summary: string | null;
  created_at: number;
  business_name?: string;
};

/**
 * A business for sale, as it appears in a grid. The name stays hidden until a buyer is approved.
 * The whole card opens the listing; the bookmark saves it without leaving the page.
 */
export default function ListingCard({ l, badge, saved: savedProp = false, style }: { l: PublicListing; badge?: React.ReactNode; saved?: boolean; style?: React.CSSProperties }) {
  const tilt = useTilt(5);
  const router = useRouter();
  const [saved, setSaved] = useState(savedProp);
  const [busy, setBusy] = useState(false);
  useEffect(() => setSaved(savedProp), [savedProp]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setSaved((s) => !s); // optimistic
    try {
      const r = await api<{ saved: boolean }>(`listings/${l.id}/save`, { method: "POST" });
      setSaved(r.saved);
      toast(r.saved ? "Saved to your account" : "Removed from saved", r.saved ? "ok" : "info");
    } catch (e) {
      setSaved((s) => !s);
      if (e instanceof ApiError && e.status === 401) {
        toast("Log in to save businesses", "info");
        router.push(`${APP.login}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      } else toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article {...tilt} style={style} className="group relative flex flex-col rounded-[24px] bg-card p-5 ring-1 ring-rule transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_30px_60px_-34px_rgba(21,19,15,.55)] hover:ring-ink/25 md:p-6">
      <span aria-hidden className={GLOW} />
      <div className="flex items-center justify-between gap-3">
        <span className="truncate rounded-full bg-paper-2 px-3 py-1 text-[13px] font-semibold">{l.industry}</span>
        {badge ?? (
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-muted">
            <Lock className="size-3.5" /> Sign NDA to view
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[20px] font-semibold leading-snug tracking-tight">
        {/* the stretched link: the whole card is clickable */}
        <Link href={APP.listing(l.id)} className="after:absolute after:inset-0 after:z-[1] after:rounded-[24px] after:content-['']">
          {l.business_name ?? l.title}
        </Link>
      </h3>
      <p className="mt-1 flex items-center gap-1 text-[14px] text-muted">
        <MapPin className="size-3.5" /> {[l.area, l.city].filter(Boolean).join(", ")}
      </p>
      <p className="mt-5 text-[13px] text-muted">Asking price</p>
      <p className="text-[26px] font-semibold tracking-tight">{aed(l.asking_price)}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-rule pt-4 text-center">
        {[
          [short(l.revenue), "Revenue"],
          [short(l.profit), "Profit"],
          [l.multiple ? `${l.multiple}x` : "—", "Multiple"],
        ].map(([v, k]) => (
          <span key={k}>
            <span className="block text-[17px] font-semibold">{v}</span>
            <span className="block text-[12px] text-muted">{k}</span>
          </span>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <span className="flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-ink text-[15px] font-semibold text-paper transition group-hover:bg-ink-3">
          View business <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save this business"}
          className={clsx(
            "relative z-10 grid size-11 shrink-0 place-items-center rounded-[10px] border transition active:scale-90",
            saved ? "border-ink bg-lime text-ink" : "border-rule-strong bg-card hover:border-ink",
          )}
        >
          <Bookmark key={String(saved)} className={clsx("size-[18px]", saved && "animate-[tickPop_.45s_cubic-bezier(.34,1.56,.64,1)] fill-ink")} />
        </button>
      </div>
    </article>
  );
}

/** A grey placeholder card while listings load. */
export function ListingCardSkeleton() {
  return (
    <div className="rounded-[24px] bg-card p-5 ring-1 ring-rule md:p-6" aria-hidden>
      <div className="flex justify-between">
        <span className="h-6 w-28 animate-pulse rounded-full bg-paper-2" />
        <span className="h-4 w-24 animate-pulse rounded bg-paper-2" />
      </div>
      <span className="mt-5 block h-5 w-3/4 animate-pulse rounded bg-paper-2" />
      <span className="mt-2 block h-4 w-1/3 animate-pulse rounded bg-paper-2" />
      <span className="mt-6 block h-3 w-20 animate-pulse rounded bg-paper-2" />
      <span className="mt-2 block h-7 w-40 animate-pulse rounded bg-paper-2" />
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-rule pt-4">
        {[0, 1, 2].map((i) => (
          <span key={i} className="mx-auto block h-8 w-14 animate-pulse rounded bg-paper-2" />
        ))}
      </div>
      <span className="mt-5 block h-11 animate-pulse rounded-[10px] bg-paper-2" />
    </div>
  );
}
