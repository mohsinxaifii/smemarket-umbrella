"use client";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { APP } from "@/lib/site";
import { aed, short } from "@/lib/api";
import { useTilt, GLOW } from "@/lib/useTilt";
import Image from "next/image";
import { listingImage } from "@/lib/listingImage";

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
 * A business for sale, as it appears in a grid.
 * The whole card opens the listing.
 */
export default function ListingCard({ l, badge, style }: { l: PublicListing; badge?: React.ReactNode; style?: React.CSSProperties }) {
  const tilt = useTilt(5);
  const img = listingImage(l);

  return (
    <article {...tilt} style={style} className="group relative flex flex-col rounded-[24px] bg-card p-3 pb-5 ring-1 ring-rule transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_30px_60px_-34px_rgba(21,19,15,.55)] hover:ring-ink/25 md:pb-6">
      <span aria-hidden className={GLOW} />
      {/* photo, with the tags laid over it */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-paper-2">
        <Image src={img.src} alt={img.alt} fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 90vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
          <span className="truncate rounded-full bg-paper/95 px-3 py-1 text-[12px] font-semibold backdrop-blur">{l.industry}</span>
          {badge}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2 md:px-3">
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
      <div className="mt-5">
        <span className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-ink text-[15px] font-semibold text-paper transition group-hover:bg-ink-3">
          View business <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
        </span>
      </div>
      </div>
    </article>
  );
}

/** A grey placeholder card while listings load. */
export function ListingCardSkeleton() {
  return (
    <div className="rounded-[24px] bg-card p-3 pb-5 ring-1 ring-rule" aria-hidden>
      <span className="block aspect-[16/10] animate-pulse rounded-[16px] bg-paper-2" />
      <div className="mt-4 flex justify-between px-2">
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
