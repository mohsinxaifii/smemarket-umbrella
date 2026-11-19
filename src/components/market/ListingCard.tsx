"use client";
import Link from "next/link";
import { ArrowUpRight, Lock, MapPin } from "lucide-react";
import { APP } from "@/lib/site";
import { aed, short } from "@/lib/api";

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

/** A business for sale, as it appears in the grid. The name stays hidden until a buyer is approved. */
export default function ListingCard({ l, badge }: { l: PublicListing; badge?: React.ReactNode }) {
  return (
    <Link href={APP.listing(l.id)} className="group flex flex-col rounded-[24px] bg-card p-5 ring-1 ring-rule transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-30px_rgba(21,19,15,.5)] hover:ring-ink/30 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate rounded-full bg-paper-2 px-3 py-1 text-[13px] font-semibold">{l.industry}</span>
        {badge ?? (
          <span className="flex shrink-0 items-center gap-1 text-[13px] font-semibold text-muted">
            <Lock className="size-3.5" /> Sign NDA to view
          </span>
        )}
      </div>
      <h3 className="mt-4 text-[20px] font-semibold leading-snug tracking-tight">{l.business_name ?? l.title}</h3>
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
      <span className="mt-5 flex h-11 items-center justify-center gap-2 rounded-[10px] bg-ink text-[15px] font-semibold text-paper transition group-hover:bg-ink-3">
        View business <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
      </span>
    </Link>
  );
}
