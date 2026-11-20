"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Link2, Loader2, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import Image from "next/image";
import { listingImage } from "@/lib/listingImage";
import { api, aed, short } from "@/lib/api";
import { APP, SITE, waLink } from "@/lib/site";
import type { PublicListing } from "./ListingCard";
import Character from "@/components/ui/Character";
import LeadForm from "@/components/forms/LeadForm";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { getLenis } from "@/components/layout/SmoothScroll";

/** One business for sale: the figures, a short description, and a way to ask us about it. */
export default function ListingView() {
  const id = useSearchParams().get("id") || "";
  const [l, setL] = useState<PublicListing | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return setErr("That business isn't listed.");
    api<{ listing: PublicListing }>(`listings/${encodeURIComponent(id)}`)
      .then((d) => setL(d.listing))
      .catch((e) => setErr(e.message));
  }, [id]);

  const share = async () => {
    const url = window.location.href;
    // phones get the native share sheet; elsewhere, copy the link
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({ title: l?.title, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Couldn't copy the link", "error");
    }
  };
  const toForm = () => {
    const el = document.getElementById("enquire");
    const lenis = getLenis();
    if (el && lenis) lenis.scrollTo(el, { offset: -110, duration: 1 });
    else el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (err && !l)
    return (
      <section className="min-h-[70vh] bg-paper pb-24 pt-[156px]">
        <div className="container-x">
          <h1 className="display text-[clamp(2.2rem,4vw,3.4rem)]">This business isn&apos;t available.</h1>
          <p className="mt-3 max-w-xl text-[18px] text-ink-2">It may have sold, or the link is wrong. Here are the businesses for sale right now.</p>
          <Link href={APP.listings} className="mt-6 inline-flex items-center gap-2 font-semibold">
            <ArrowLeft className="size-4" /> All businesses
          </Link>
        </div>
      </section>
    );
  if (!l)
    return (
      <section className="grid min-h-[70vh] place-items-center bg-paper pt-[108px]">
        <Loader2 className="size-6 animate-spin text-muted" />
      </section>
    );

  const place = [l.area, l.city].filter(Boolean).join(", ");
  const ask = `Hi SMEmarket, I'm interested in "${l.title}" (${place}, ${aed(l.asking_price)}). Can you share more details?`;
  const facts: [string, string][] = [
    ["Asking price", aed(l.asking_price)],
    ["Revenue (yearly)", aed(l.revenue)],
    ["Profit (yearly)", aed(l.profit)],
    ["Price to profit", l.multiple ? `${l.multiple}x` : "—"],
    ...(l.years_trading != null ? [["Years trading", String(l.years_trading)] as [string, string]] : []),
    ...(l.employees != null ? [["Employees", String(l.employees)] as [string, string]] : []),
    ["Location", place],
    ["Industry", l.industry],
  ];

  return (
    <section className="bg-paper pb-32 pt-[108px] md:pt-[128px] lg:pb-24">
      <div className="container-x">
        <Link href={APP.listings} className="inline-flex items-center gap-2 text-[15px] font-medium text-ink-2 hover:text-ink">
          <ArrowLeft className="size-4" /> All businesses
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
          {/* the business */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-paper-2 px-3 py-1 text-[14px] font-semibold">{l.industry}</span>
              {l.status !== "live" && <span className="rounded-full bg-[#f6e3b5] px-3 py-1 text-[14px] font-semibold">Not live yet</span>}
            </div>
            <h1 className="display mt-4 text-[clamp(2.2rem,min(4.4vw,8vh),3.8rem)]">{l.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="flex items-center gap-1.5 text-[17px] text-ink-2">
                <MapPin className="size-4" /> {place}
              </p>
              <button onClick={share} className="flex items-center gap-1.5 rounded-full border border-rule-strong px-3 py-1.5 text-[14px] font-semibold transition hover:border-ink hover:bg-ink hover:text-paper active:scale-95">
                <Link2 className="size-4" /> Share
              </button>
            </div>

            <div className="relative mt-6 aspect-[16/8] overflow-hidden rounded-[24px] bg-paper-2">
              <Image src={listingImage(l).src} alt={listingImage(l).alt} fill priority sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
            </div>

            <div className="mt-4 rounded-[24px] bg-ink p-6 text-paper md:p-8">
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
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-rule-strong py-3.5 sm:odd:pr-6 sm:even:pl-6">
                  <dt className="text-[15px] text-muted">{k}</dt>
                  <dd className="text-right text-[15px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 flex items-start gap-2 text-[14px] text-muted">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" /> Figures are provided by the seller. Our team goes through the details with you before anything is signed.
            </p>
          </div>

          {/* ask us about it */}
          <aside id="enquire" className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[28px] bg-card ring-1 ring-rule">
              <div className="p-6 md:p-7">
                <p className="text-[21px] font-semibold leading-snug">Interested in this business?</p>
                <p className="mt-1.5 text-[15px] text-ink-2">Ask us anything: the name, the books, the lease, a visit. A person replies within one business day.</p>
                <a href={waLink(ask)} target="_blank" rel="noopener noreferrer" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#25d366] text-[15px] font-semibold text-ink transition hover:brightness-95">
                  <WhatsAppIcon className="size-5" /> Ask on WhatsApp
                </a>
                <div className="my-5 flex items-center gap-3 text-[13px] text-muted">
                  <span className="h-px flex-1 bg-rule" /> or send us your details <span className="h-px flex-1 bg-rule" />
                </div>
                <LeadForm
                  type="listing"
                  compact
                  messageLabel="Your question"
                  messagePlaceholder="I'd like to know more about this business."
                  submitLabel="Ask about this business"
                  doneTitle="Thanks"
                  doneBody="We'll get back to you about this business within one business day."
                  meta={{ Listing: l.title, "Listing ID": l.id, Price: aed(l.asking_price), Location: place }}
                />
              </div>
              <div className="relative flex items-end gap-3 bg-[#f6e3b5] px-6 pt-4">
                <p className="pb-5 text-[14px] leading-snug text-ink-2">
                  Prefer to talk? Call us on{" "}
                  <a href={SITE.phoneHref} className="font-semibold underline">
                    {SITE.phone}
                  </a>
                  .
                </p>
                <Character who="karim" mood="explaining" body="Paper" size={110} className="shrink-0" />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* phones: price and the next step, always within thumb's reach */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1">
            <span className="block text-[12px] text-muted">Asking price</span>
            <span className="block truncate text-[18px] font-semibold tracking-tight">{aed(l.asking_price)}</span>
          </span>
          <a href={waLink(ask)} target="_blank" rel="noopener noreferrer" aria-label="Ask on WhatsApp" className="grid size-12 place-items-center rounded-[10px] bg-[#25d366] text-ink">
            <WhatsAppIcon className="size-5" />
          </a>
          <button onClick={toForm} className="flex h-12 items-center gap-2 rounded-[10px] bg-ink px-4 text-[15px] font-semibold text-paper">
            <MessageCircle className="size-4 text-lime" /> Ask about it
          </button>
        </div>
      </div>
    </section>
  );
}
