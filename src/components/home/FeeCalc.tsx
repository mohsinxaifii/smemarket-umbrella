"use client";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { APP } from "@/lib/site";

const fmt = (n: number) => `AED ${Math.round(n).toLocaleString("en-US")}`;
const MIN = 100_000;
const MAX = 5_000_000;
const STEP = 25_000;

/** Drag the price; see exactly what selling costs. The answer is the pitch: nothing until it sells. */
export default function FeeCalc() {
  const [price, setPrice] = useState(750_000);
  const pct = ((price - MIN) / (MAX - MIN)) * 100;

  return (
    <section className="section-y bg-paper">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-[36px] bg-ink p-6 text-paper md:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
            <div className="relative z-10">
              <p className="text-[15px] font-semibold text-lime">Selling with SMEmarket</p>
              <h2 className="display mt-4 text-section">Free to list. You only pay when it sells.</h2>
              <p className="mt-5 max-w-md text-[19px] leading-relaxed text-paper/70">No listing fee, no monthly fee, no retainer. One 5% success fee, paid when the Sale &amp; Purchase Agreement is signed. If it doesn&apos;t sell, you pay nothing.</p>
              <ul className="mt-6 space-y-2 text-[16px]">
                {["We prepare the listing with you", "Your name stays hidden until you approve a buyer", "Only NDA-signed, ID-checked buyers"].map((t) => (
                  <li key={t} className="flex items-center gap-2.5">
                    <span className="grid size-5 place-items-center rounded-full bg-lime text-ink">
                      <Check className="size-3" strokeWidth={3.5} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
              <a href={APP.sell} className="group mt-9 inline-flex h-14 items-center gap-2 rounded-[10px] bg-lime px-6 text-[16px] font-semibold text-ink transition hover:brightness-95">
                Start your free listing <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
              <p className="mt-3 text-[14px] text-paper/50">12 quick questions, about three minutes.</p>
            </div>

            {/* the calculator */}
            <div className="relative z-10 rounded-[28px] bg-paper p-6 text-ink md:p-8">
              <label htmlFor="price" className="flex items-baseline justify-between gap-4">
                <span className="text-[15px] font-medium text-muted">Your asking price</span>
                <span className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tabular-nums tracking-tight">{fmt(price)}</span>
              </label>
              <input
                id="price"
                type="range"
                min={MIN}
                max={MAX}
                step={STEP}
                value={price}
                onChange={(e) => setPrice(+e.target.value)}
                className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-paper-2 accent-ink [&::-moz-range-thumb]:size-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-lime [&::-moz-range-thumb]:bg-ink [&::-webkit-slider-thumb]:size-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-lime [&::-webkit-slider-thumb]:bg-ink"
                style={{ background: `linear-gradient(to right, #15130f ${pct}%, #e8e2d5 ${pct}%)` }}
              />
              <div className="mt-2 flex justify-between text-[13px] text-muted">
                <span>{fmt(MIN)}</span>
                <span>{fmt(MAX)}+</span>
              </div>

              <dl className="mt-7 divide-y divide-rule border-y border-rule">
                <Row k="To list it" v="AED 0" note="today" />
                <Row k="While it's listed" v="AED 0" note="every month" />
                <Row k="If it doesn't sell" v="AED 0" note="ever" />
              </dl>
              <div className="mt-5 flex items-end justify-between gap-4 rounded-2xl bg-lime p-5">
                <span>
                  <span className="block text-[15px] font-semibold">When the SPA is signed</span>
                  <span className="block text-[14px] text-ink/70">5% of the final sale price</span>
                </span>
                <span className="text-[clamp(1.5rem,2.6vw,2rem)] font-semibold tabular-nums tracking-tight">{fmt(price * 0.05)}</span>
              </div>
              <p className="mt-4 text-[15px] text-ink-2">
                You keep <span className="font-semibold text-ink">{fmt(price * 0.95)}</span>. Once the SPA is signed, our work is done.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ k, v, note }: { k: string; v: string; note: string }) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <dt className="text-[16px]">{k}</dt>
      <dd className="text-right">
        <span className="text-[18px] font-semibold">{v}</span> <span className="text-[14px] text-muted">{note}</span>
      </dd>
    </div>
  );
}
