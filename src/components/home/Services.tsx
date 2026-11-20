import { ArrowUpRight } from "lucide-react";
import Character from "@/components/ui/Character";
import TiltLink from "@/components/ui/TiltLink";
import { PILLARS } from "@/lib/site";
import Swipe from "@/components/ui/Swipe";

/** Everything besides buying and selling, as four plain cards: what it is, who it's for, where to go. */
export default function Services() {
  const rest = PILLARS.filter((p) => p.slug !== "brokerage");
  return (
    <section className="section-y bg-paper">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="label">More than a marketplace</p>
            <h2 className="display mt-4 text-section">Own a business already? We help you run it and grow it.</h2>
          </div>
          <p className="text-[17px] leading-relaxed text-ink-2 md:text-[19px] lg:pb-2">A bigger, better-run business is worth more when you sell. Same team, start to finish.</p>
        </div>

        <div className="mt-8 md:mt-14">
          <Swipe bp="sm" desktop="sm:grid sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-4" itemWidth="78%" autoplay={3200}>
          {rest.map((p, i) => (
            <TiltLink key={p.slug} href={p.href} className={`group relative flex h-full min-h-[360px] flex-col sm:min-h-[440px] overflow-hidden rounded-[28px] p-6 transition-[transform] duration-300 ease-out ${p.tone}`}>
              <p className="text-[14px] font-semibold text-ink/55">{p.job}</p>
              <h3 className="mt-2 text-[24px] font-semibold leading-tight tracking-tight">{p.name}</h3>
              <p className="mt-2 max-w-[17rem] text-[16px] leading-relaxed text-ink-2">{p.line}</p>
              <span className="relative z-10 mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper">
                {p.cta} <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
              </span>
              <Character who={p.person.who} mood={p.person.mood} body={p.person.body} size={160} className="-mb-9 mt-auto self-end pt-4 animate-idle" style={{ animationDelay: `${i * -1.3}s` }} />
            </TiltLink>
          ))}
          </Swipe>
        </div>
      </div>
    </section>
  );
}
