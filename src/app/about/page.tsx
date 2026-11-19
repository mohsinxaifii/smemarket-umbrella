import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SplitHeading, Reveal } from "@/components/ui/Reveal";
import Character from "@/components/ui/Character";
import SmartLink from "@/components/ui/SmartLink";
import Button from "@/components/ui/Button";
import { APP, PILLARS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "SMEmarket is the UAE's marketplace for buying, selling and growing small businesses. One trusted place to do the deal.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-16 pt-[132px] text-paper md:pb-24 md:pt-[172px]">
        <Image quality={90} src="/images/al-seef.jpg" alt="A shaded street of shops in Al Seef, old Dubai" fill priority sizes="100vw" className="object-cover object-[50%_40%] opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
        <div className="container-x relative">
          <p className="label !text-paper/70">About SMEmarket</p>
          <SplitHeading as="h1" immediate className="display mt-4 max-w-5xl text-[clamp(2.6rem,min(6vw,10vh),5.6rem)]">
            Small businesses deserve a proper market.
          </SplitHeading>
          <p className="mt-6 max-w-2xl animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.3s_both] text-[19px] leading-relaxed text-paper/80 md:text-[21px]">
            The UAE&apos;s marketplace for buying, selling and growing small businesses. Curated listings, verified buyers, and one trusted place to do the deal.
          </p>
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div>
            <p className="label">Why we exist</p>
            <h2 className="display mt-4 text-section">It shouldn&apos;t be this hard.</h2>
          </div>
          <div className="space-y-5 text-[19px] leading-relaxed text-ink-2">
            <p>
              Buying or selling a small business in the UAE is harder than it should be. Deals happen through word of mouth, scattered classifieds and middlemen. Figures are hard to check and there is no trusted place to start.
            </p>
            <p className="text-ink">
              <span className="font-semibold">SMEmarket is that place.</span> We check listings before they go up, verify buyers before they see the details, and keep the conversation in one private place until the deal is signed.
            </p>
            <p>
              And because owning a business is more than the day you buy it, we added the rest: advice when the decision is hard, a directory when you need a provider, a growth studio when you need customers, and training when your team needs to keep up.
            </p>
          </div>
        </div>
      </section>

      {/* the people behind each part */}
      <section className="section-y bg-paper-2">
        <div className="container-x">
          <p className="label">One team</p>
          <h2 className="display mt-4 max-w-3xl text-section">Buy. Sell. Grow. With the same people throughout.</h2>
          <Reveal className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-3 md:gap-4 lg:grid-cols-5" stagger={0.07}>
            {PILLARS.map((p) => (
              <SmartLink key={p.slug} href={p.href} data-reveal className="group flex flex-col overflow-hidden rounded-[24px] bg-card ring-1 ring-rule">
                <span className={`relative block h-[170px] ${p.tone}`}>
                  <span className="absolute inset-x-0 bottom-0 flex justify-center">
                    <Character who={p.person.who} mood={p.person.mood} body={p.person.body} size={170} className="translate-y-[8%] transition-transform duration-500 ease-out-expo group-hover:-translate-y-1" />
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="text-[14px] text-muted">{p.person.role}</span>
                  <span className="mt-1 flex items-start justify-between gap-2 text-[18px] font-semibold leading-tight">
                    {p.name} <ArrowUpRight className="mt-0.5 size-4 shrink-0 transition-transform group-hover:rotate-45" />
                  </span>
                </span>
              </SmartLink>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[32px]">
            <Image quality={90} src="/images/creek-abra.jpg" alt="Dubai Creek seen from the bow of a traditional abra" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <p className="label">Where we are</p>
            <h2 className="display mt-4 text-section">Licensed in Dubai. Working across the UAE.</h2>
            <p className="mt-5 text-[19px] leading-relaxed text-ink-2">
              {SITE.legal} is licensed in the Meydan Free Zone, Dubai (licence {SITE.licence}), and works with owners in all seven emirates.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={APP.listings} size="lg" arrow className="!rounded-full">
                Browse businesses
              </Button>
              <Button href={APP.sell} size="lg" variant="outline" className="!rounded-full">
                Sell your business
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
