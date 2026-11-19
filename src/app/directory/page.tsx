import type { Metadata } from "next";
import { Briefcase, Calculator, Hammer, Megaphone, Monitor, Scale, Truck, Users } from "lucide-react";
import { SplitHeading, Reveal } from "@/components/ui/Reveal";
import Character from "@/components/ui/Character";
import Image from "next/image";
import DirectorySearch from "@/components/directory/DirectorySearch";
import FormBlock from "@/components/ui/FormBlock";
import LeadForm from "@/components/forms/LeadForm";
import { DIRECTORY_CATEGORIES, EMIRATES, getPillar } from "@/lib/site";

export const metadata: Metadata = {
  title: "SME services directory",
  description: "Find PRO, accounting, marketing, fit-out, legal and IT providers anywhere in the UAE. Type what you need and where, and get a short list of providers reviewed by our team.",
  alternates: { canonical: "/directory" },
};

const ICONS = [Briefcase, Calculator, Megaphone, Hammer, Scale, Monitor, Users, Truck];

export default function DirectoryPage() {
  const p = getPillar("directory");
  return (
    <>
      <section className="bg-paper pb-14 pt-[108px] md:pb-20 md:pt-[128px]">
        <div className="container-x grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
          <div>
            <p className="label">SME services directory · by SMEmarket</p>
            <SplitHeading as="h1" immediate className="display mt-4 text-[clamp(2.6rem,min(5.8vw,10vh),5.4rem)]">
              What do you need help with?
            </SplitHeading>
            <p className="mt-5 max-w-xl animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.3s_both] text-[18px] leading-relaxed text-ink-2 md:text-[20px]">
              Type a service and an area in the UAE. We show you providers from our directory, each one reviewed by our team.
            </p>
            <div className="mt-8 animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.45s_both]">
              <DirectorySearch />
            </div>
            <p className="mt-6 text-[14px] text-muted">A starting point for finding UAE providers, not a recommendation.</p>
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
          <h2 className="display mt-4 text-section">The help every SME needs, sooner or later.</h2>
          <Reveal className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 md:gap-4" stagger={0.05}>
            {DIRECTORY_CATEGORIES.map((c, i) => {
              const I = ICONS[i];
              return (
                <div key={c} data-reveal className="flex min-h-[150px] flex-col justify-between rounded-[24px] bg-card p-5 ring-1 ring-rule md:p-6">
                  <I className="size-6" strokeWidth={1.75} />
                  <span className="mt-6 text-[18px] font-semibold leading-tight">{c}</span>
                </div>
              );
            })}
          </Reveal>
          <p className="mt-8 text-[16px] text-ink-2">
            Across all seven emirates: <span className="text-muted">{EMIRATES.join(" · ")}</span>
          </p>
        </div>
      </section>

      <FormBlock
        id="add"
        eyebrow="For providers"
        title="Add your services to our directory."
        intro="Offer services to UAE SMEs? Add your company and we'll review it before it appears."
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
          doneBody="We'll review your company and let you know when it's listed, usually within a few business days."
          meta={{ source: "directory" }}
        />
      </FormBlock>
    </>
  );
}
