import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { APP, FEES, TRUST } from "@/lib/site";

/** The marketplace in one section: buy or sell, how deals stay safe, and what it costs. */
export default function Marketplace({ head = true, cards = true }: { head?: boolean; cards?: boolean }) {
  return (
    <section className="section-y bg-paper-2">
      <div className="container-x">
        {head && (
          <SectionHead
            eyebrow="The marketplace"
            title="Buy a business. Sell yours. Safely."
            intro="Curated listings, verified buyers and one private place to do the deal, from first message to signed SPA."
          />
        )}

        {/* buy / sell */}
        {cards && (
        <div className={`grid gap-4 lg:grid-cols-[1.15fr_1fr] ${head ? "mt-10 md:mt-14" : ""}`}>
          <a href={APP.listings} className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-[28px] p-6 text-paper md:p-9">
            <Image quality={90} src="/images/keys.jpg" alt="A new shop owner holding up the keys" fill sizes="(min-width:1024px) 55vw, 100vw" className="object-cover object-[50%_30%] transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/60 to-ink/10" />
            <div className="relative">
              <p className="text-[15px] font-semibold text-lime">Buy</p>
              <h3 className="display mt-2 text-[clamp(2rem,3.4vw,3rem)]">Find a business worth owning.</h3>
              <p className="mt-2 max-w-md text-[17px] text-paper/80">Browse curated UAE businesses for sale. Sign one NDA and unlock the full details once the seller approves you.</p>
              <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-paper px-5 text-[15px] font-semibold text-ink">
                Browse businesses <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </div>
          </a>
          <a href={APP.sell} className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[28px] bg-ink p-6 text-paper md:p-9">
            <div className="relative -mx-6 -mt-6 h-[180px] overflow-hidden md:-mx-9 md:-mt-9 md:h-[210px]">
              <Image quality={90} src="/images/signing.jpg" alt="Hands signing an agreement at a desk" fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-[50%_45%] opacity-80 transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
            </div>
            <div className="relative pt-4">
              <p className="text-[15px] font-semibold text-lime">Sell</p>
              <h3 className="display mt-2 text-[clamp(2rem,3.4vw,3rem)]">List it quietly. Sell it properly.</h3>
              <p className="mt-2 max-w-md text-[17px] text-paper/75">Twelve quick questions, about three minutes. We review your business, prepare the listing with you and bring verified buyers.</p>
              <span className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-lime px-5 text-[15px] font-semibold text-ink">
                Sell your business <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </span>
            </div>
          </a>
        </div>
        )}

        {/* trust */}
        <div className={cards || head ? "mt-16 md:mt-24" : ""}>
          <p className="label">Trust</p>
          <h3 className="display mt-4 text-[clamp(1.8rem,3vw,2.8rem)]">How we keep deals safe.</h3>
          <Reveal className="mt-8 grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4" stagger={0.1}>
            {TRUST.map((t, i) => (
              <div key={t.t} data-reveal className="rounded-[24px] bg-card p-6 ring-1 ring-rule md:p-7">
                <span className="grid size-10 place-items-center rounded-full bg-ink text-[15px] font-semibold text-lime">{i + 1}</span>
                <h4 className="mt-6 text-[20px] font-semibold leading-snug">{t.t}</h4>
                <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{t.d}</p>
              </div>
            ))}
          </Reveal>
          <p className="mt-5 text-[15px] text-muted">Price, sales and profit stay claims until a bank statement, VAT return or the books back them up.</p>
        </div>

        {/* fees */}
        <div className="mt-16 grid gap-8 md:mt-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <p className="label">Fees</p>
            <h3 className="display mt-4 text-[clamp(1.8rem,3vw,2.8rem)]">Fair fees. You pay only on a sale.</h3>
          </div>
          <dl className="grid border-t border-rule-strong sm:grid-cols-3">
            {FEES.map((f, i) => (
              <div key={f.k} className={`border-b border-rule-strong py-6 sm:border-b-0 sm:py-2 ${i ? "sm:border-l sm:pl-6" : "sm:pr-6"}`}>
                <dt className="text-[15px] text-muted sm:mt-5">{f.k}</dt>
                <dd>
                  <span className="mt-1 block text-[clamp(2.2rem,3.6vw,3.2rem)] font-semibold leading-none tracking-tight">{f.v}</span>
                  <span className="mt-3 block text-[16px] leading-relaxed text-ink-2">{f.d}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
