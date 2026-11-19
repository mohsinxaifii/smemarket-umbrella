import { ArrowUpRight } from "lucide-react";
import Character, { type Body, type Cast, type Mood } from "@/components/ui/Character";
import TiltLink from "@/components/ui/TiltLink";
import { APP, GROWTH } from "@/lib/site";

const WHO: { who: Cast; mood: Mood; body: Body; tone: string; t: string; d: string; cta: string; href: string }[] = [
  { who: "lina", mood: "excited", body: "Paper", tone: "bg-[#f6e3b5]", t: "Buying your first business", d: "Skip years of building from zero. Find a business that already has customers, staff and a track record.", cta: "Browse businesses", href: APP.listings },
  { who: "rashid", mood: "happy", body: "Coffee", tone: "bg-[#e3dcf2]", t: "Ready to sell yours", d: "Retiring, relocating or moving on. List it free, stay anonymous, and only talk to verified buyers.", cta: "List for free", href: APP.sell },
  { who: "zara", mood: "excited", body: "PointingUp", tone: "bg-[#e9f1c9]", t: "Growing what you own", d: "More customers and better numbers, with marketing, advice and trusted providers. And a better price if you ever sell.", cta: "Grow my business", href: GROWTH.url },
];

/** Three kinds of owner, each with the one next step that fits. */
export default function ForWho() {
  return (
    <section className="section-y bg-paper-2">
      <div className="container-x">
        <p className="label">Who it&apos;s for</p>
        <h2 className="display mt-4 max-w-3xl text-section">Wherever you are with your business.</h2>
        <div className="mt-10 grid gap-4 md:mt-14 lg:grid-cols-3">
          {WHO.map((w, i) => (
            <TiltLink key={w.t} href={w.href} className={`group relative flex min-h-[460px] flex-col overflow-hidden rounded-[28px] p-7 transition-[transform] duration-300 ease-out md:p-8 ${w.tone}`}>
              <h3 className="text-[clamp(1.6rem,2.4vw,2rem)] font-semibold leading-tight tracking-tight">{w.t}</h3>
              <p className="mt-3 max-w-[22rem] text-[17px] leading-relaxed text-ink-2">{w.d}</p>
              <span className="relative z-10 mt-6 inline-flex w-fit items-center gap-2 rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-paper">
                {w.cta} <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
              </span>
              <Character who={w.who} mood={w.mood} body={w.body} size={230} className="-mb-12 mt-auto self-end animate-idle" style={{ animationDelay: `${i * -1.3}s` }} />
            </TiltLink>
          ))}
        </div>
      </div>
    </section>
  );
}
