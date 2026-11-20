"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ListingCard, { type PublicListing } from "@/components/market/ListingCard";
import Swipe from "@/components/ui/Swipe";
import { api } from "@/lib/api";
import { APP } from "@/lib/site";

/** The newest live businesses, straight from the marketplace. Hidden until there's something to show. */
export default function Featured() {
  const [items, setItems] = useState<PublicListing[] | null>(null);
  useEffect(() => {
    api<{ listings: PublicListing[] }>("listings")
      .then((d) => {
        setItems(d.listings.slice(0, 6));
      })
      .catch(() => setItems([]));
  }, []);
  if (!items?.length) return null;
  return (
    <section className="section-y bg-paper">
      <div className="container-x">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">For sale now</p>
            <h2 className="display mt-4 text-section">Businesses on SMEmarket today.</h2>
            <p className="mt-4 max-w-xl text-[19px] leading-relaxed text-ink-2">Every one reviewed by our team before it went live. Interested in one? Ask us and we&apos;ll share the details.</p>
          </div>
          <Link href={APP.listings} className="group inline-flex h-12 w-fit shrink-0 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-semibold text-paper">
            See all businesses <ArrowUpRight className="size-4 text-lime transition-transform group-hover:rotate-45" />
          </Link>
        </div>
        {/* phones: swipe through; bigger screens: a grid */}
        <div className="mt-10">
          <Swipe desktop="md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3" itemWidth="86%">
            {items.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </Swipe>
        </div>
      </div>
    </section>
  );
}
