import type { Metadata } from "next";
import { Compass, Map, Route, Scale } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import FormBlock from "@/components/ui/FormBlock";
import LeadForm from "@/components/forms/LeadForm";
import { Reveal } from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import { getPillar, waLink } from "@/lib/site";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

export const metadata: Metadata = {
  title: "Strategy & advisory for SME owners",
  description: "Practical advice from people who've run and invested in businesses: positioning, planning, and a clear next step for UAE SME owners.",
  alternates: { canonical: "/advisory" },
};

const AREAS = [
  { icon: Compass, t: "Positioning", d: "Where you win, who you're really for, and how to say it so the right customers listen." },
  { icon: Map, t: "Planning", d: "The next twelve months on one page: what to do first, what to stop, and what it should cost." },
  { icon: Scale, t: "Before you buy or sell", d: "A second opinion on a deal: is the price fair, what to check, and what to ask the other side." },
  { icon: Route, t: "A clear next step", d: "Not a thick report. A decision, the reasons for it, and what happens on Monday." },
];

const HOW = [
  { t: "Tell us what you're working on", d: "A few lines here or on WhatsApp is enough." },
  { t: "We talk it through", d: "A conversation with someone who has run and invested in businesses." },
  { t: "You leave with a next step", d: "Written down, specific, and yours to act on." },
];

export default function AdvisoryPage() {
  const p = getPillar("advisory");
  return (
    <>
      <PageHero
        eyebrow="Strategy & advisory · by SMEmarket"
        title="Advice from people who've done it."
        intro="Help with the decisions that shape the next stage of your business: positioning, planning, and a clear next step."
        image="/images/advice-cafe.jpg"
        alt="Two business owners talking over coffee and a laptop"
        person={p.person}
        tone={p.tone}
        actions={
          <>
            <Button href="#ask" size="lg" arrow className="!rounded-full">
              Ask about advisory
            </Button>
            <Button href={waLink("Hi SMEmarket, I'd like to ask about advisory.")} size="lg" variant="outline" icon={<WhatsAppIcon />} className="!rounded-full">
              WhatsApp us
            </Button>
          </>
        }
      />

      <section className="section-y bg-paper-2">
        <div className="container-x">
          <SectionHead eyebrow="What we help with" title="The decisions that are hard to make alone." intro="This is an in-house service. You talk to our team, not a marketplace of consultants." />
          <Reveal className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2 md:gap-4" stagger={0.08}>
            {AREAS.map((a) => (
              <div key={a.t} data-reveal className="flex gap-5 rounded-[28px] bg-card p-6 ring-1 ring-rule md:p-8">
                <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${p.tone}`}>
                  <a.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[22px] font-semibold tracking-tight">{a.t}</span>
                  <span className="mt-1.5 block text-[17px] leading-relaxed text-ink-2">{a.d}</span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-ink text-paper">
        <div className="container-x">
          <p className="label !text-paper/60">How it works</p>
          <h2 className="display mt-4 text-section">Three steps to a clear answer.</h2>
          <Reveal className="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-4" stagger={0.12}>
            {HOW.map((h, i) => (
              <div key={h.t} data-reveal className="rounded-[28px] border border-rule-dark p-6 md:p-8">
                <span className="grid size-10 place-items-center rounded-full bg-lime text-[15px] font-semibold text-ink">{i + 1}</span>
                <h3 className="mt-8 text-[22px] font-semibold">{h.t}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-paper/70">{h.d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <FormBlock
        id="ask"
        eyebrow="Ask about advisory"
        title="What are you working on?"
        intro="Tell us the decision in front of you. We'll come back with how we can help and what it would involve."
        person={p.person}
        tone={p.tone}
        wa="Hi SMEmarket, I'd like to ask about advisory."
      >
        <LeadForm
          type="advisory"
          topics={["Positioning", "Planning", "Buying or selling", "Something else"]}
          topicLabel="What do you want help with?"
          messageLabel="Tell us a little more"
          messagePlaceholder="Where the business is today, and the decision you're facing."
          messageRequired
          meta={{ source: "advisory" }}
        />
      </FormBlock>
    </>
  );
}
