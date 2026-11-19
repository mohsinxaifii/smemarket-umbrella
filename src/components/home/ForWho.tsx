import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Character, { type Body, type Cast, type Mood } from "@/components/ui/Character";
import TiltLink from "@/components/ui/TiltLink";
import { APP, GROWTH } from "@/lib/site";

const WHO: { who: Cast; mood: Mood; body: Body; tone: string; t: string; d: string; cta: string; href: string; img: string; alt: string }[] = [
  { who: "lina", mood: "excited", body: "Paper", tone: "bg-[#f6e3b5]", t: "Buying your first business", d: "Skip years of building from zero. Find a business that already has customers, staff and a track record.", cta: "Browse businesses", href: APP.listings, img: "/images/cafe-counter.jpg", alt: "A busy café counter" },
  { who: "rashid", mood: "happy", body: "Coffee", tone: "bg-[#e3dcf2]", t: "Ready to sell yours", d: "Retiring, relocating or moving on. List it free, stay anonymous, and only talk to verified buyers.", cta: "List for free", href: APP.sell, img: "/images/tailor-owner.jpg", alt: "A business owner at work in her studio" },
  { who: "zara", mood: "excited", body: "PointingUp", tone: "bg-[#e9f1c9]", t: "Growing what you own", d: "More customers and better numbers, with marketing, advice and trusted providers. And a better price if you ever sell.", cta: "Grow my business", href: GROWTH.url, img: "/images/dubai-shop-owner.jpg", alt: "A shop owner in his store in Dubai" },
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
            <TiltLink key={w.t} href={w.href} className={`group relative flex flex-col overflow-hidden rounded-[28px] p-3 pb-7 transition-[transform] duration-300 ease-out md:pb-8 ${w.tone}`}>
              {/* the photo, with the person standing in front of it */}
              <div className="relative">
                <div className="relative aspect-[16/11] overflow-hidden rounded-[20px]">
                  <Image src={w.img} alt={w.alt} fill sizes="(min-width:1024px) 30vw, 90vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]" />
                </div>
                <div className={`absolute -bottom-7 right-3 rounded-full p-1.5 ${w.tone}`}>
                  <span className="block overflow-hidden rounded-full bg-paper">
                    <Character who={w.who} mood={w.mood} body={w.body} size={104} className="translate-y-[10%] animate-idle" style={{ animationDelay: `${i * -1.3}s` }} />
                  </span>
                </div>
              </div>
              <div className="flex flex-1 flex-col px-4 pt-6 md:px-5">
                <h3 className="text-[clamp(1.5rem,2.2vw,1.9rem)] font-semibold leading-tight tracking-tight">{w.t}</h3>
                <p className="mb-6 mt-3 max-w-[24rem] text-[17px] leading-relaxed text-ink-2">{w.d}</p>
                <span className="relative z-10 mt-auto inline-flex w-fit items-center gap-2 rounded-[10px] bg-ink px-5 py-3 text-[15px] font-semibold text-paper">
                  {w.cta} <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
                </span>
              </div>
            </TiltLink>
          ))}
        </div>
      </div>
    </section>
  );
}
