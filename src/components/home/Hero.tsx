"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { onReveal } from "@/lib/reveal";
import { APP } from "@/lib/site";

const VERBS = ["Buy", "Sell", "Grow"];

/**
 * Full-bleed photo of Dubai, one headline with a rotating verb, one line, two actions.
 * Built to be understood in a glance by someone arriving from an ad.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let id = 0;
    const cancel = onReveal(() => {
      id = window.setInterval(() => setI((x) => (x + 1) % VERBS.length), 2400);
    });
    return () => {
      cancel();
      clearInterval(id);
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const intro = gsap.timeline({ paused: true });
      intro
        .fromTo("[data-photo]", { scale: 1.18 }, { scale: 1.04, duration: 2.4, ease: "expo.out" }, 0)
        .from("[data-line]", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.1 }, 0.1)
        .from("[data-fade]", { y: 18, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 }, 0.45);
      const cancel = onReveal(() => intro.play());
      // as you scroll away, the photo drifts and the words lift
      gsap.to("[data-photo-wrap]", { yPercent: 12, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to("[data-copy]", { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "30% top", end: "80% top", scrub: true } });
      return cancel;
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-paper">
      <div data-photo-wrap className="absolute inset-0">
        <Image data-photo quality={90} src="/images/dubai-sunrise.jpg" alt="Dubai from above at first light" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
      </div>
      {/* keep the words readable: darker on the left and at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-ink/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/80 to-transparent" />

      <div data-copy className="container-x relative flex h-full flex-col justify-end pb-[clamp(3rem,9vh,6rem)] pt-36">
        <p data-fade className="text-[15px] font-medium text-paper/75">
          <span className="mr-2 inline-block size-2 rounded-full bg-lime align-middle" />
          The UAE&apos;s marketplace for small businesses
        </p>

        <h1 className="display mt-5 text-[clamp(3rem,min(8vw,13vh),8rem)] !leading-[0.95] tracking-[-0.05em]">
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-line className="block">
              <Verb i={i} />{" "}
              a business
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-line className="block">
              in the UAE.
            </span>
          </span>
        </h1>

        <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-fade className="max-w-[32rem] text-[clamp(1.05rem,1.4vw,1.3rem)] leading-relaxed text-paper/85">
              Checked listings, verified buyers, and the help to grow the business you own. All in one place.
            </p>
            <div data-fade className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href={APP.listings} className="group flex h-14 items-center justify-center gap-2 rounded-[10px] bg-lime px-6 text-[16px] font-semibold text-ink transition hover:brightness-95">
                Browse businesses for sale <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
              </a>
              <a href={APP.sell} className="flex h-14 items-center justify-center rounded-[10px] border border-paper/40 px-6 text-[16px] font-semibold backdrop-blur-sm transition hover:border-paper hover:bg-paper hover:text-ink">
                Sell yours, free to list
              </a>
            </div>
          </div>

          <a data-fade href="#how" className="group hidden items-center gap-3 text-[14px] font-medium text-paper/70 hover:text-paper md:flex">
            How it works
            <span className="grid size-11 place-items-center rounded-full border border-paper/30 transition group-hover:border-paper">
              <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/** The rotating verb. Its box eases to the exact width of the current word, so "a business" follows without a gap. */
function Verb({ i }: { i: number }) {
  const refs = useRef<(HTMLSpanElement | null)[]>([]);
  const [widths, setWidths] = useState<number[]>([]);
  useEffect(() => {
    const measure = () => setWidths(refs.current.map((el) => el?.offsetWidth ?? 0));
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const prev = (i + VERBS.length - 1) % VERBS.length;
  return (
    <span className="relative inline-block overflow-hidden pb-[0.06em] align-bottom text-lime transition-[width] duration-700 ease-out-expo" style={{ width: widths[i] || undefined }}>
      <span className="invisible">{VERBS[i]}</span>
      {VERBS.map((v, k) => (
        <span
          key={v}
          ref={(el) => {
            refs.current[k] = el;
          }}
          aria-hidden={k !== i}
          className="absolute left-0 top-0 whitespace-nowrap transition-[transform,opacity] duration-700 ease-out-expo"
          style={{ transform: `translateY(${k === i ? 0 : k === prev ? -105 : 105}%)`, opacity: k === i ? 1 : 0 }}
        >
          {v}
        </span>
      ))}
    </span>
  );
}
