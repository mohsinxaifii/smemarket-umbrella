import Image from "next/image";
import { SplitHeading } from "@/components/ui/Reveal";
import Character, { type Body, type Cast, type Mood } from "@/components/ui/Character";

/** Top of an inner page: words on the left, a photo with the person who looks after this on the right. */
export default function PageHero({
  eyebrow,
  title,
  intro,
  actions,
  image,
  alt,
  person,
  tone = "bg-paper-2",
  note,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  actions?: React.ReactNode;
  image?: string;
  alt?: string;
  person?: { who: Cast; mood: Mood; body: Body; role: string };
  tone?: string;
  note?: React.ReactNode;
}) {
  return (
    <section className="bg-paper pb-12 pt-[108px] md:pb-20 md:pt-[128px]">
      <div className="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <p className="label animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_both]">{eyebrow}</p>
          <SplitHeading as="h1" immediate className="display mt-4 text-[clamp(2.6rem,min(5.8vw,10vh),5.4rem)]">
            {title}
          </SplitHeading>
          <div className="mt-5 max-w-xl animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.3s_both] text-[18px] leading-relaxed text-ink-2 md:text-[20px]">{intro}</div>
          {actions && <div className="mt-8 flex animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.45s_both] flex-col gap-3 sm:flex-row">{actions}</div>}
          {note && <div className="mt-6 animate-[pageIn_.8s_cubic-bezier(.16,1,.3,1)_.55s_both] text-[15px] text-muted">{note}</div>}
        </div>

        <div className="relative animate-[pageIn_1s_cubic-bezier(.16,1,.3,1)_.2s_both]">
          <div className={`relative aspect-[4/3.4] overflow-hidden rounded-[32px] ${tone}`}>
            {image && <Image quality={90} src={image} alt={alt ?? ""} fill priority sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />}
            {image && <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />}
          </div>
          {person && (
            <div className="absolute -bottom-6 left-4 flex items-end gap-3 md:left-6">
              <div className={`overflow-hidden rounded-[22px] ring-4 ring-paper ${tone === "bg-paper-2" ? "bg-card" : tone}`}>
                <Character who={person.who} mood={person.mood} body={person.body} size={130} className="translate-y-[8%]" eager />
              </div>
              <span className="mb-3 rounded-full bg-card px-3.5 py-1.5 text-[14px] font-semibold shadow-[0_10px_30px_-15px_rgba(21,19,15,.5)]">{person.role}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
