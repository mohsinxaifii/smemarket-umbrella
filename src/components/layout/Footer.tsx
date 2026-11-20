import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import Character from "@/components/ui/Character";
import SmartLink from "@/components/ui/SmartLink";
import { APP, PILLARS, SITE, waLink, mailLink } from "@/lib/site";

const COMPANY = [
  ["/about", "About"],
  ["/contact", "Contact"],
  ["/privacy", "Privacy"],
];

/** Ink footer: the close with the whole team standing together, links, and the name set large along the bottom. */
export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-paper">
      <div className="container-x pt-[clamp(4.5rem,10vh,7rem)]">
        {/* the close */}
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <div className="pb-2">
            <h2 className="display max-w-xl text-[clamp(2.4rem,min(4.6vw,8vh),4.2rem)]">What does your business need next?</h2>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-paper/60">Buying, selling, a second opinion or more customers. Message us and a person replies within one business day.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex h-14 items-center justify-center gap-2.5 rounded-[10px] bg-[#25D366] px-6 text-[16px] font-semibold text-white transition hover:brightness-95">
                <WhatsAppIcon className="size-5" /> Chat on WhatsApp
              </a>
              <a href={APP.sell} className="group flex h-14 items-center justify-center gap-2 rounded-[10px] bg-lime px-6 text-[16px] font-semibold text-ink transition hover:brightness-95">
                List your business free <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
            </div>
          </div>

          {/* the team, together on one stage */}
          <div className="relative h-[170px] overflow-hidden rounded-[28px] bg-paper-2 sm:h-[230px]">
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              {PILLARS.map((p, i) => (
                <SmartLink
                  key={p.slug}
                  href={p.href}
                  aria-label={p.name}
                  className="group relative -mx-2 transition-transform duration-500 ease-out-expo hover:-translate-y-3"
                  style={{ zIndex: i === 2 ? 5 : 4 - Math.abs(2 - i) }}
                >
                  <span className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2.5 py-1 text-[12px] font-semibold text-paper opacity-0 transition-opacity group-hover:opacity-100">{p.short}</span>
                  <Character who={p.person.who} mood={p.person.mood} body={p.person.body} size={170} className="!h-[clamp(84px,10vw,170px)] !w-[clamp(84px,10vw,170px)] translate-y-[10%]" />
                </SmartLink>
              ))}
            </div>
          </div>
        </div>

        {/* links */}
        <nav aria-label="Footer" className="mt-16 grid grid-cols-2 gap-8 border-t border-rule-dark pt-10 sm:grid-cols-4">
          <Col title="What we do">
            {PILLARS.map((p) => (
              <li key={p.slug}>
                <SmartLink href={p.href} className="text-[15px] text-paper/75 transition-colors hover:text-paper">
                  {p.name}
                </SmartLink>
              </li>
            ))}
          </Col>
          <Col title="Marketplace">
            {[
              [APP.listings, "Businesses for sale"],
              [APP.sell, "Sell your business"],
            ].map(([h, l]) => (
              <li key={l}>
                <a href={h} className="text-[15px] text-paper/75 transition-colors hover:text-paper">
                  {l}
                </a>
              </li>
            ))}
          </Col>
          <Col title="Company">
            {COMPANY.map(([h, l]) => (
              <li key={h}>
                <Link href={h} className="text-[15px] text-paper/75 transition-colors hover:text-paper">
                  {l}
                </Link>
              </li>
            ))}
          </Col>
          <Col title="Talk to us">
            <li>
              <a href={SITE.phoneHref} className="text-[15px] text-paper/75 transition-colors hover:text-paper">
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={mailLink()} className="text-[15px] text-paper/75 transition-colors hover:text-paper">
                {SITE.email.split("@")[0]}@<wbr />
                {SITE.email.split("@")[1]}
              </a>
            </li>
            <li className="text-[15px] text-paper/50">{SITE.address}</li>
          </Col>
        </nav>
      </div>

      {/* the name, set large */}
      <div className="container-x mt-12 select-none" aria-hidden>
        <p className="translate-y-[18%] whitespace-nowrap text-center text-[clamp(4rem,17.5vw,17rem)] font-semibold leading-[0.8] tracking-[-0.06em] text-paper/[0.06]">
          SMEmarket
        </p>
      </div>
      <div className="relative border-t border-rule-dark bg-ink">
        <p className="container-x py-5 text-[13px] text-paper/45">
          © {new Date().getFullYear()} {SITE.legal} · {SITE.address} · Licence {SITE.licence}
        </p>
      </div>
    </footer>
  );
}

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[14px] font-semibold text-paper/40">{title}</p>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}
