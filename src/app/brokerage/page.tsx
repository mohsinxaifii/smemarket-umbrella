import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import FormBlock from "@/components/ui/FormBlock";
import LeadForm from "@/components/forms/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import Marketplace from "@/components/home/Marketplace";
import Faq from "@/components/home/Faq";
import { APP, FAQ, getPillar } from "@/lib/site";

export const metadata: Metadata = {
  title: "Buy or sell a UAE business",
  description: "Curated UAE businesses for sale, verified buyers, NDAs before details unlock. Free to list, 5% success fee only when your business sells.",
  alternates: { canonical: "/brokerage" },
};

const BUY = [
  { t: "Browse curated listings", d: "Every business is reviewed before it goes up. Filter by city, industry and price." },
  { t: "Sign one NDA", d: "A quick ID check and an NDA, once. Then request access to the listings you like." },
  { t: "Get approved, see everything", d: "When the seller approves you, the name, figures and full details open." },
  { t: "Talk, check, agree", d: "Ask questions in a private thread, check the books, and agree terms through to the SPA." },
];
const SELL = [
  { t: "Answer 12 quick questions", d: "About three minutes. Nothing is published when you send it." },
  { t: "We review and prepare it", d: "We check your business and write the listing with you. Anonymous by default." },
  { t: "Verified buyers request access", d: "Each one has signed an NDA and passed an ID check. You decide who sees more." },
  { t: "Sell, then pay", d: "Listing is free. 5% of the final price, only when the SPA is signed." },
];

export default function BrokeragePage() {
  const p = getPillar("brokerage");
  return (
    <>
      <PageHero
        eyebrow="Business brokerage · by SMEmarket"
        title="Buy or sell a UAE business."
        intro="Curated listings, checked before they go up. Verified buyers. One trusted place to do the deal, from first message to signed SPA."
        image="/images/keys.jpg"
        alt="A new shop owner holding up the keys"
        person={p.person}
        tone={p.tone}
        actions={
          <>
            <Button href={APP.listings} size="lg" arrow className="!rounded-full">
              Browse businesses
            </Button>
            <Button href={APP.sell} size="lg" variant="outline" className="!rounded-full">
              Sell your business
            </Button>
          </>
        }
      />

      {/* how it works, both sides */}
      <section className="section-y bg-paper-2">
        <div className="container-x">
          <p className="label">How it works</p>
          <h2 className="display mt-4 max-w-3xl text-section">Four steps, whichever side of the table you&apos;re on.</h2>
          <div className="mt-10 grid gap-4 md:mt-14 lg:grid-cols-2">
            {[
              { side: "Buying", steps: BUY, href: APP.listings, cta: "Browse businesses", dark: false },
              { side: "Selling", steps: SELL, href: APP.sell, cta: "Start your listing", dark: true },
            ].map((c) => (
              <div key={c.side} className={`flex flex-col rounded-[28px] p-6 md:p-9 ${c.dark ? "bg-ink text-paper" : "bg-card ring-1 ring-rule"}`}>
                <p className={`text-[15px] font-semibold ${c.dark ? "text-lime" : "text-muted"}`}>{c.side}</p>
                <Reveal as="ul" className="mt-4" stagger={0.08}>
                  {c.steps.map((s, i) => (
                    <li key={s.t} data-reveal className={`flex gap-4 border-b py-5 last:border-0 ${c.dark ? "border-rule-dark" : "border-rule"}`}>
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[14px] font-semibold ${c.dark ? "bg-lime text-ink" : "bg-ink text-lime"}`}>{i + 1}</span>
                      <span>
                        <span className="block text-[19px] font-semibold">{s.t}</span>
                        <span className={`mt-1 block text-[16px] leading-relaxed ${c.dark ? "text-paper/70" : "text-ink-2"}`}>{s.d}</span>
                      </span>
                    </li>
                  ))}
                </Reveal>
                <a href={c.href} className={`group mt-6 inline-flex h-12 w-fit items-center gap-2 rounded-full px-5 text-[15px] font-semibold ${c.dark ? "bg-lime text-ink" : "bg-ink text-paper"}`}>
                  {c.cta} <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Marketplace head={false} cards={false} />

      <FormBlock
        id="talk"
        eyebrow="Talk to a broker"
        title="Not sure where to start?"
        intro="Tell us whether you want to buy, sell or both, and a little about what you're looking for. Everything you send stays confidential."
        person={p.person}
        tone={p.tone}
        wa="Hi SMEmarket, I'd like to talk about buying or selling a business."
      >
        <LeadForm
          type="brokerage"
          topics={["Buy a business", "Sell a business", "Both, or not sure yet"]}
          topicLabel="I want to"
          single
          messageLabel="Your message"
          messagePlaceholder="Industry, area, budget or asking price, timeline… whatever you know so far."
          messageRequired
          meta={{ source: "brokerage" }}
        />
      </FormBlock>

      <Faq items={FAQ.slice(1, 5)} title="Buying and selling, answered." tone="bg-paper-2" />
    </>
  );
}
