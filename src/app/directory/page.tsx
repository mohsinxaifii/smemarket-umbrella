import type { Metadata } from "next";
import { Search } from "lucide-react";
import { SplitHeading, Reveal } from "@/components/ui/Reveal";
import Character from "@/components/ui/Character";
import Image from "next/image";
import DirectorySearch from "@/components/directory/DirectorySearch";
import CategoryGrid from "@/components/directory/CategoryGrid";
import Faq from "@/components/home/Faq";
import FormBlock from "@/components/ui/FormBlock";
import LeadForm from "@/components/forms/LeadForm";
import { DIRECTORY_CATEGORIES, EMIRATES, getPillar } from "@/lib/site";

export const metadata: Metadata = {
  title: "SME services directory",
  description: "Find PRO, accounting, marketing, fit-out, legal and IT providers anywhere in the UAE. Type what you need and where, and see real businesses from public listings, with phone, website and map.",
  alternates: { canonical: "/directory" },
};

export default function DirectoryPage() {
  const p = getPillar("directory");
  return (
    <>
      <section className="bg-paper pb-14 pt-[108px] md:pb-20 md:pt-[128px]">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:has-[[data-dir-results]]:grid-cols-1 [&:has([data-dir-results])>div:last-child]:!hidden">
          <div>
            <p className="label">SME services directory · by SMEmarket</p>
            <SplitHeading as="h1" immediate className="display mt-4 text-[clamp(2.6rem,min(5.8vw,10vh),5.4rem)]">
              What do you need help with?
            </SplitHeading>
            <p className="mt-5 max-w-xl animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.3s_both] text-[18px] leading-relaxed text-ink-2 md:text-[20px]">
              Type a service and an area in the UAE. We look up real businesses in public listings and show you how to reach them.
            </p>
            <div className="mt-8 animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.45s_both]">
              <DirectorySearch />
            </div>
          </div>
          <div className="relative hidden animate-[pageIn_1s_cubic-bezier(.16,1,.3,1)_.2s_both] lg:block">
            <div className="relative aspect-[4/4.4] overflow-hidden rounded-[32px]">
              <Image quality={90} src="/images/desk-docs.jpg" alt="A business owner going through paperwork at her desk" fill priority sizes="40vw" className="object-cover object-[40%_center]" />
            </div>
            <div className={`absolute -bottom-6 -left-6 overflow-hidden rounded-[24px] ring-4 ring-paper ${p.tone}`}>
              <Character who={p.person.who} mood={p.person.mood} body={p.person.body} size={150} className="translate-y-[8%]" eager />
            </div>
          </div>
        </div>
      </section>

      <section className="section-y bg-paper-2">
        <div className="container-x">
          <p className="label">Categories</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="display mt-4 max-w-2xl text-section">The help every SME needs, sooner or later.</h2>
            <p className="text-[16px] text-muted">Tap a category to search it.</p>
          </div>
          <CategoryGrid />
          <p className="mt-8 text-[16px] text-ink-2">
            Across all seven emirates: <span className="text-muted">{EMIRATES.join(" · ")}</span>
          </p>
        </div>
      </section>

      {/* how it works */}
      <section className="section-y bg-paper">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="relative">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] md:aspect-[4/3.4] md:rounded-[32px]">
              <Image src="/images/dubai-shop-owner.jpg" alt="A shop owner in Dubai" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
            </div>
            <p className="absolute -bottom-5 right-5 flex max-w-[280px] items-center gap-2.5 rounded-2xl bg-ink px-4 py-3 text-[15px] font-semibold leading-snug text-paper shadow-xl">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-lime text-ink">
                <Search className="size-4" />
              </span>
              “PRO services for visa renewal in Dubai”
            </p>
          </div>
          <div>
            <p className="label">How it works</p>
            <h2 className="display mt-4 text-section">Ask in plain words. Get a short list.</h2>
            <Reveal as="ol" className="mt-8 space-y-3" stagger={0.1}>
              {[
                ["Say what you need and where", "“Accountant for VAT registration in Dubai” works. So does “fit-out in Business Bay”."],
                ["See real businesses, right away", "Name, area, what they do, and how to reach them: phone, website, email or map."],
                ["Contact them directly", "No middleman, no fee to you. If nobody fits, tell us and we'll find someone."],
              ].map(([t, d], i) => (
                <li key={t} data-reveal className="flex gap-4 rounded-[22px] bg-paper-2 p-5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[14px] font-semibold text-lime">{i + 1}</span>
                  <span>
                    <span className="block text-[18px] font-semibold">{t}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-2">{d}</span>
                  </span>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <FormBlock
        id="add"
        eyebrow="For providers"
        title="Add your services to our directory."
        intro="Offer services to UAE SMEs? Send us your company now. Our own partner list is coming soon, and we'll be in touch."
        person={p.person}
        tone={p.tone}
        wa="Hi SMEmarket, I'd like to add my company to the directory."
      >
        <LeadForm
          type="directory-listing"
          businessRequired
          businessLabel="Company name"
          selects={[
            { name: "category", label: "Category", options: DIRECTORY_CATEGORIES },
            { name: "area", label: "Area", options: [...EMIRATES, "UAE-wide / other"], optional: true },
          ]}
          askSite
          messagePlaceholder="What you offer and who you work with."
          submitLabel="Add my company"
          doneTitle="Thanks"
          doneBody="Thanks. We'll be in touch as our partner list opens, usually within a few business days."
          meta={{ source: "directory" }}
        />
      </FormBlock>

      <Faq
        tone="bg-paper-2"
        title="The directory, answered."
        items={[
          { q: "Is it free to use?", a: "Yes. Searching and contacting providers is free. You deal with them directly." },
          { q: "Where do the results come from?", a: "From public business listings and maps. They're a starting point, not a recommendation from SMEmarket. Always check a provider yourself before you hire them." },
          { q: "I can't find what I need.", a: "Try fewer words, or a different area. Still nothing? Message us on WhatsApp with what you need and where, and we'll find someone." },
          { q: "How do I list my company?", a: "Use the form above. We're building our own list of partners and will contact you when it opens." },
        ]}
      />
    </>
  );
}
