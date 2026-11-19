import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { APP, PILLARS, SITE, waLink, mailLink } from "@/lib/site";
import LeadForm from "@/components/forms/LeadForm";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { Avatar } from "@/components/ui/Character";
import { SplitHeading } from "@/components/ui/Reveal";
import SmartLink from "@/components/ui/SmartLink";

export const metadata: Metadata = {
  title: "Contact",
  description: `Talk to the SMEmarket team. WhatsApp or call ${SITE.phone}, or email ${SITE.email}.`,
  alternates: { canonical: "/contact" },
};

const WAYS = [
  { icon: <WhatsAppIcon className="size-5" />, k: "WhatsApp", v: SITE.phone, d: "The quickest way to reach us.", href: waLink(), ext: true },
  { icon: <Phone className="size-5" />, k: "Call", v: SITE.phone, d: "If we miss you, we call back.", href: SITE.phoneHref },
  { icon: <Mail className="size-5" />, k: "Email", v: SITE.email, d: "For documents, partnerships and anything you'd rather put in writing.", href: mailLink() },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-paper pb-16 pt-[136px] md:pb-24 md:pt-[160px]">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="label">Contact</p>
              <SplitHeading as="h1" immediate className="display mt-4 text-[clamp(2.8rem,min(6.6vw,11vh),6.2rem)]">
                Talk to us.
              </SplitHeading>
            </div>
            <p className="max-w-md animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.3s_both] text-[18px] leading-relaxed text-ink-2 md:pb-3 md:text-[19px]">
              Questions about buying, selling or growing a business in the UAE? Message us. A person replies within one business day.
            </p>
          </div>

          {/* three ways, as one ledger */}
          <ul className="mt-10 border-t border-ink md:mt-14">
            {WAYS.map((w) => (
              <li key={w.k} className="border-b border-rule-strong">
                <a href={w.href} {...(w.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 md:grid-cols-[180px_1fr_1fr_auto] md:gap-8 md:py-7">
                  <span className="flex items-center gap-3 text-[16px] font-semibold">
                    <span className="grid size-10 place-items-center rounded-full bg-paper-2 transition-colors duration-300 group-hover:bg-ink group-hover:text-lime">{w.icon}</span>
                    <span className="hidden md:inline">{w.k}</span>
                  </span>
                  <span className="min-w-0 truncate text-[clamp(1.25rem,2.6vw,2.2rem)] font-semibold tracking-tight transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">{w.v}</span>
                  <span className="hidden text-[16px] text-muted md:block">{w.d}</span>
                  <ArrowUpRight className="size-6 transition-transform duration-300 group-hover:rotate-45" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section data-hide-bar className="bg-paper-2 section-y">
        <div className="container-x grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div className="min-w-0 rounded-[28px] bg-card p-6 shadow-[0_40px_80px_-60px_rgba(21,19,15,.6)] ring-1 ring-rule md:p-9">
            <p className="text-[15px] font-semibold text-muted">Send us a message</p>
            <h2 className="display mt-2 text-[clamp(1.8rem,2.8vw,2.4rem)]">We&apos;ll pass it to the right person.</h2>
            <div className="mt-7">
              <LeadForm type="contact" topics={["Buy a business", "Sell a business", "Advisory", "Find a provider", "Growth services", "AI training", "Something else"]} meta={{ source: "contact" }} />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="label">Or go straight to</p>
              <ul className="mt-4 grid gap-2">
                {PILLARS.map((p) => (
                  <li key={p.slug}>
                    <SmartLink href={p.href} className="group flex items-center gap-4 rounded-[20px] bg-card p-2.5 pr-5 ring-1 ring-rule transition hover:ring-ink">
                      <Avatar who={p.person.who} mood={p.person.mood} body={p.person.body} size={52} tone={p.tone} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[17px] font-semibold leading-tight">{p.job}</span>
                        <span className="block text-[14px] text-muted">{p.name}</span>
                      </span>
                      <ArrowUpRight className="size-5 shrink-0 transition-transform duration-300 group-hover:rotate-45" />
                    </SmartLink>
                  </li>
                ))}
                <li>
                  <a href={APP.listings} className="group flex items-center justify-between rounded-[20px] bg-ink p-5 text-paper">
                    <span>
                      <span className="block text-[17px] font-semibold">Businesses for sale</span>
                      <span className="block text-[14px] text-paper/60">Browse curated UAE listings</span>
                    </span>
                    <ArrowUpRight className="size-5 text-lime transition-transform duration-300 group-hover:rotate-45" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="relative mt-2 min-h-[240px] flex-1 overflow-hidden rounded-[28px]">
              <Image quality={90} src="/images/marina-dusk.jpg" alt="The Dubai skyline at dusk" fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <p className="absolute inset-x-0 bottom-0 flex items-start gap-3 p-6 text-[15px] leading-relaxed text-paper">
                <MapPin className="mt-0.5 size-5 shrink-0" />
                <span>
                  <span className="block font-semibold">{SITE.legal}</span>
                  {SITE.address} · Licence {SITE.licence}
                  <span className="block text-paper/70">Working with owners in all seven emirates</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
