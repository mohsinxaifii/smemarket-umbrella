import type { Metadata } from "next";
import { Compass, Map, Route, Scale } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Button from "@/components/ui/Button";
import FormBlock from "@/components/ui/FormBlock";
import AskBoard from "@/components/forms/AskBoard";
import Faq from "@/components/home/Faq";
import Character from "@/components/ui/Character";
import Image from "next/image";
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
          <Reveal className="mt-7 grid gap-2 md:mt-14 md:grid-cols-2 md:gap-4" stagger={0.08}>
            {AREAS.map((a) => (
              <div key={a.t} data-reveal className="flex gap-4 rounded-[20px] bg-card p-4 ring-1 ring-rule md:gap-5 md:rounded-[28px] md:p-8">
                <span className={`grid size-10 shrink-0 place-items-center rounded-2xl md:size-12 ${p.tone}`}>
                  <a.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[18px] font-semibold tracking-tight md:text-[22px]">{a.t}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-ink-2 md:mt-1.5 md:text-[17px]">{a.d}</span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* the questions owners actually bring: tap one and it lands in the form */}
      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <p className="label">Bring us a question</p>
            <h2 className="display mt-4 text-section">What owners ask us most.</h2>
            <p className="mt-5 max-w-lg text-[19px] leading-relaxed text-ink-2">Tap one that sounds like you. It goes straight into the form below, ready to send.</p>
            <div className="mt-8">
              <AskBoard
                form="advisory"
                items={[
                  { q: "Should I open a second branch or wait?", topic: "Planning" },
                  { q: "Is this business I'm looking at priced fairly?", topic: "Buying or selling" },
                  { q: "What is my business actually worth?", topic: "Buying or selling" },
                  { q: "Why are customers choosing my competitor?", topic: "Positioning" },
                  { q: "Where should I spend my marketing budget?", topic: "Positioning" },
                  { q: "How do I get ready to sell in a year?", topic: "Planning" },
                ]}
              />
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3.6] overflow-hidden rounded-[32px]">
              <Image src="/images/handshake.jpg" alt="Two business owners shaking hands" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <div className={`absolute -bottom-6 -left-4 overflow-hidden rounded-[24px] ring-4 ring-paper ${p.tone}`}>
              <Character who={p.person.who} mood={p.person.mood} body={p.person.body} size={140} className="translate-y-[8%] animate-idle" />
            </div>
            <p className="absolute right-4 top-4 max-w-[240px] rounded-2xl rounded-tr-md bg-paper px-4 py-3 text-[15px] font-semibold leading-snug shadow-lg">“Bring me the decision. You&apos;ll leave with a next step.”</p>
          </div>
        </div>
      </section>

      <section className="section-y bg-ink text-paper">
        <div className="container-x">
          <p className="label !text-paper/60">How it works</p>
          <h2 className="display mt-4 text-section">Three steps to a clear answer.</h2>
          <Reveal className="mt-7 grid gap-2 md:mt-14 md:grid-cols-3 md:gap-4" stagger={0.12}>
            {HOW.map((h, i) => (
              <div key={h.t} data-reveal className="flex gap-4 rounded-[20px] border border-rule-dark p-4 md:block md:rounded-[28px] md:p-8">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-lime text-[15px] font-semibold text-ink md:size-10">{i + 1}</span>
                <span className="block">
                  <h3 className="text-[18px] font-semibold md:mt-8 md:text-[22px]">{h.t}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-paper/70 md:mt-2 md:text-[16px]">{h.d}</p>
                </span>
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

      <Faq
        tone="bg-paper-2"
        title="Advisory, answered."
        items={[
          { q: "Who will I talk to?", a: "Our in-house team: people who have run and invested in businesses. Not a marketplace of consultants." },
          { q: "How does it start?", a: "Tell us what you're working on, here or on WhatsApp. We come back with how we can help and what it would involve." },
          { q: "Can you help me before I buy a business on SMEmarket?", a: "Yes. A second opinion on price, what to check and what to ask the seller is one of the most common things we're asked." },
          { q: "Do I get a long report?", a: "No. You get a clear answer, the reasons for it, and what to do next." },
        ]}
      />
    </>
  );
}
