"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, MapPin, Search } from "lucide-react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { onReveal } from "@/lib/reveal";
import { APP, EMIRATES } from "@/lib/site";
import { api, aed, short } from "@/lib/api";
import { listingImage } from "@/lib/listingImage";
import type { PublicListing } from "@/components/market/ListingCard";
import Link from "next/link";
import Dropdown from "@/components/ui/Dropdown";
import { useRouter } from "next/navigation";
import Character, { type Body, type Cast, type Mood } from "@/components/ui/Character";

/**
 * The people along the bottom edge: owners and buyers, each here for something.
 * `x` is the left position (% of the screen), `s` the size relative to the strip's height,
 * `phone` marks the five that stay on small screens.
 */
// x: position on desktop. px: position on phones, where only four people stand and every one fits fully on screen.
const PEOPLE: { who: Cast; mood: Mood; body: Body; says: string; service: string; x: number; s: number; phone?: boolean; px?: number }[] = [
  { who: "lina", mood: "excited", body: "Paper", says: "Buying my first business", service: "Business brokerage", x: 1.5, s: 0.92, phone: true, px: 1 },
  { who: "james", mood: "happy", body: "Device", says: "Found a VAT accountant", service: "Services directory", x: 10.5, s: 0.84 },
  { who: "priya", mood: "calm", body: "Explaining", says: "Planning a second branch", service: "Strategy & advisory", x: 21, s: 0.96, phone: true, px: 25 },
  { who: "omar", mood: "happy", body: "Shirt", says: "Asked about a café, got a visit", service: "Business brokerage", x: 32, s: 0.86 },
  { who: "rashid", mood: "happy", body: "Coffee", says: "Selling my café, quietly", service: "Business brokerage", x: 43, s: 1, phone: true, px: 49 },
  { who: "hana", mood: "happy", body: "Paper", says: "Training my team on AI", service: "AI trainings", x: 54, s: 0.88 },
  { who: "zara", mood: "excited", body: "PointingUp", says: "Getting more customers", service: "Growth Studio", x: 64.5, s: 0.97, phone: true, px: 73 },
  { who: "sami", mood: "calm", body: "Device", says: "Listed for free in 3 minutes", service: "Sell your business", x: 75, s: 0.85 },
  { who: "maya", mood: "happy", body: "Explaining", says: "New website, more enquiries", service: "Growth Studio", x: 83.5, s: 0.93 },
];

/** Where a speech bubble sits over its person: hugging the screen edge near the sides (phones are narrower, so wider bands there). */
const bubbleAlign = (x: number) =>
  clsx(
    // the right-most person on a phone stands partly off-screen, so their bubble shifts well inward
    x < 30 ? "left-[8%]" : x > 80 ? "right-[62%]" : x > 55 ? "right-[8%]" : "left-1/2 -translate-x-1/2",
    x < 8 ? "md:left-[8%] md:right-auto md:translate-x-0" : x > 80 ? "md:right-[8%] md:left-auto md:translate-x-0" : "md:left-1/2 md:right-auto md:-translate-x-1/2",
  );
const tailAlign = (x: number) =>
  clsx(x < 30 ? "ml-8" : x > 80 ? "ml-auto mr-3" : x > 55 ? "ml-auto mr-8" : "mx-auto", x < 8 ? "md:ml-8 md:mr-0" : x > 80 ? "md:ml-auto md:mr-8" : "md:mx-auto");

/** A thin paper outline, so the drawings read like stickers on the dark photo. */
const STICKER = "[filter:drop-shadow(2px_0_0_#f2eee6)_drop-shadow(-2px_0_0_#f2eee6)_drop-shadow(0_2px_0_#f2eee6)_drop-shadow(0_-2px_0_#f2eee6)]";

/**
 * Dubai at dusk, a plain promise and a working search, like the front page of a real marketplace.
 * Along the bottom edge stand the people SMEmarket is for; every couple of seconds one of them says what they came for.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [talking, setTalking] = useState<number[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timers: number[] = [];
    const cancel = onReveal(() => {
      const pop = () =>
        setTalking((cur) => {
          const phone = window.innerWidth < 768;
          const pool = PEOPLE.map((p, k) => (phone && !p.phone ? -1 : k)).filter((k) => k >= 0 && !cur.includes(k));
          const next = pool[Math.floor(Math.random() * pool.length)];
          // two bubbles at most (one on phones), never on neighbours, so they don't overlap
          const kept = phone ? [] : cur.slice(-1).filter((k) => Math.abs(k - next) > 2);
          return [...kept, next];
        });
      timers.push(window.setTimeout(pop, 600));
      timers.push(window.setInterval(pop, 1900));
    });
    return () => {
      cancel();
      timers.forEach((t) => {
        clearInterval(t);
        clearTimeout(t);
      });
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const intro = gsap.timeline({ paused: true });
      intro
        .fromTo("[data-photo]", { scale: 1.18 }, { scale: 1.04, duration: 2.4, ease: "expo.out" }, 0)
        .from("[data-line]", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.1 }, 0.1)
        .from("[data-fade]", { y: 16, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 }, 0.5)
        .from("[data-person]", { yPercent: 70, opacity: 0, duration: 0.9, ease: "back.out(1.4)", stagger: { each: 0.06, from: "center" } }, 0.4);
      const cancel = onReveal(() => intro.play());
      const drift = gsap.to("[data-photo-wrap]", { scale: 1.08, xPercent: -2, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
      return () => {
        cancel();
        drift.kill();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative flex h-[100svh] min-h-[620px] flex-col overflow-hidden bg-ink text-paper">
      <div data-photo-wrap className="absolute inset-0">
        <Image data-photo quality={90} src="/images/dubai-sunrise.jpg" alt="Dubai from above at first light" fill priority sizes="100vw" className="object-cover object-[50%_60%]" />
      </div>
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      {/* words + search, centred in the space between the header and the people */}
      <div className="container-x relative grid flex-1 items-center gap-10 pb-[clamp(4.5rem,11vh,7rem)] pt-[clamp(88px,12vh,120px)] lg:grid-cols-[1.32fr_0.68fr] lg:gap-12">
        <div>
        <h1 className="font-semibold leading-[0.98] tracking-[-0.05em]">
          <span className="-mx-[0.12em] -mb-[0.14em] block overflow-hidden px-[0.12em] pb-[0.2em]">
            <span data-line className="block text-[clamp(2.6rem,min(6.2vw,10.5vh),6rem)]">
              Find a business
            </span>
          </span>
          <span className="-mx-[0.12em] -mb-[0.14em] block overflow-hidden px-[0.12em] pb-[0.2em]">
            <span data-line className="block text-[clamp(2.6rem,min(6.2vw,10.5vh),6rem)]">
              worth <span className="text-lime">owning.</span>
            </span>
          </span>
        </h1>

        <p data-fade className="mt-[clamp(0.8rem,2.2vh,1.3rem)] max-w-[34rem] text-[clamp(1.02rem,min(1.3vw,2.2vh),1.2rem)] leading-relaxed text-paper/75">
          Small businesses for sale across the UAE, each one checked by our team. See one you like? Ask us about it.
        </p>

        <div data-fade className="relative z-30 mt-[clamp(1.2rem,3.4vh,2.2rem)] max-w-[760px]">
          <HeroSearch />
        </div>

        <div data-fade className="mt-[clamp(0.9rem,2.2vh,1.3rem)] flex max-w-[760px] flex-wrap items-center gap-x-5 gap-y-2 text-[15px] text-paper/65">
          <PopularIndustries />
          <a href={APP.sell} className="group ml-auto inline-flex items-center gap-1.5 font-semibold text-paper sm:ml-auto">
            Selling? List yours free <ArrowUpRight className="size-4 text-lime transition-transform duration-300 group-hover:rotate-45" />
          </a>
        </div>
        </div>

        <div data-fade className="hidden lg:block">
          <JustListed />
        </div>
      </div>

      {/* the people, standing along the bottom edge */}
      <div className="relative h-[26vw] max-h-[130px] shrink-0 md:h-[clamp(130px,23vh,240px)] md:max-h-none" aria-hidden>
        {PEOPLE.map((c, k) => {
          const on = talking.includes(k);
          return (
            <div
              key={c.who}
              className={clsx("absolute bottom-0 left-[var(--px)] md:left-[var(--dx)]", !c.phone && "hidden md:block")}
              style={{ ["--px" as string]: `${c.px ?? c.x}%`, ["--dx" as string]: `${c.x}%`, height: `${c.s * 100}%`, aspectRatio: "1", zIndex: on ? 20 : Math.round(c.s * 10) }}
            >
              <div data-person className="h-full w-full">
                <div className={clsx("h-full w-full transition-transform duration-500 ease-out-expo", on ? "-translate-y-2" : "")}>
                  <div className="animate-idle h-full w-full" style={{ animationDelay: `${k * -0.7}s` }}>
                    <Character who={c.who} mood={c.mood} body={c.body} size={250} eager className={clsx("!h-full !w-full translate-y-[14%] md:!h-[118%] md:!w-[118%] md:-translate-x-[8%] md:translate-y-[6%]", STICKER)} />
                  </div>
                </div>
              </div>
              {on && (
                <div className={clsx("absolute bottom-[96%] w-max max-w-[min(230px,70vw)] animate-[chipIn_.6s_cubic-bezier(.34,1.56,.64,1)_both]", bubbleAlign(c.x))}>
                  <div className="rounded-2xl bg-paper px-3.5 py-2.5 text-ink shadow-[0_18px_40px_-16px_rgba(0,0,0,.7)]">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{c.service}</p>
                    <p className="mt-0.5 text-[15px] font-semibold leading-snug">“{c.says}”</p>
                  </div>
                  <span className={clsx("block size-3 -translate-y-1.5 rotate-45 bg-paper", tailAlign(c.x))} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Search the marketplace straight from the hero: what kind of business, and where. */
function HeroSearch() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const router = useRouter();
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    if (city) p.set("city", city);
    router.push(`${APP.listings}${p.toString() ? `?${p}` : ""}`);
  };
  return (
    <form onSubmit={go} role="search" className="relative z-30 flex flex-col gap-2 rounded-[18px] bg-paper p-2 text-ink shadow-[0_30px_70px_-30px_rgba(0,0,0,.8)] sm:flex-row sm:items-center">
      <label className="flex flex-1 items-center gap-3 pl-3">
        <Search className="size-5 shrink-0 text-muted" />
        <span className="sr-only">What kind of business?</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Café, salon, clinic, e-commerce…" className="h-12 w-full min-w-0 bg-transparent text-[17px] outline-none placeholder:text-faint" />
      </label>
      <Dropdown
        label="Emirate"
        value={city}
        onChange={setCity}
        icon={<MapPin className="size-4" />}
        options={[{ value: "", label: "All emirates" }, ...EMIRATES.map((c) => ({ value: c, label: c }))]}
        className="sm:w-[180px]"
      />
      <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-[12px] bg-ink px-6 text-[16px] font-semibold text-paper transition hover:bg-ink-3">
        Search businesses
      </button>
    </form>
  );
}

/**
 * The newest businesses for sale, live from the marketplace, as a deck you can swipe.
 * Drag (or swipe) the front card left for the next one, right for the previous; arrows, dots and the
 * keyboard work too. It turns over on its own until someone touches it. With nothing listed yet,
 * a card invites sellers instead.
 */
function JustListed() {
  const [items, setItems] = useState<PublicListing[] | null>(null);
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drag, setDrag] = useState<{ x: number; raw: number; active: boolean }>({ x: 0, raw: 0, active: false });
  const [fling, setFling] = useState<0 | 1 | -1>(0); // card flying off: -1 left, 1 right
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const moved = useRef(false);
  const resume = useRef<number>(0);

  useEffect(() => {
    api<{ listings: PublicListing[] }>("listings")
      .then((d) => setItems(d.listings.slice(0, 5)))
      .catch(() => setItems([]));
  }, []);
  const n = items?.length ?? 0;

  // autoplay, paused while someone is hovering or dragging (and for a few seconds after they let go)
  useEffect(() => {
    if (n < 2 || paused || drag.active || prefersReducedMotion()) return;
    const t = setTimeout(() => go(1), 3600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [front, n, paused, drag.active]);
  const hold = () => {
    setPaused(true);
    clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setPaused(false), 6000);
  };

  /** step the deck: 1 = next, -1 = previous (the front card flies off the way you'd expect) */
  function go(dir: 1 | -1) {
    if (n < 2 || fling) return;
    setFling(dir === 1 ? -1 : 1);
    window.setTimeout(() => {
      setFront((f) => (f + dir + n) % n);
      setFling(0);
      setDrag({ x: 0, raw: 0, active: false });
    }, 220);
  }

  const onDown = (e: React.PointerEvent) => {
    if (n < 2) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    moved.current = false;
    hold();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!start.current || start.current.id !== e.pointerId) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (!moved.current && Math.abs(dx) < 6) return;
    if (!moved.current && Math.abs(dy) > Math.abs(dx)) {
      start.current = null; // a vertical scroll, not a swipe
      return;
    }
    if (!moved.current) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    moved.current = true;
    // the card follows your finger but never travels more than ~44px, so it can't cover the search;
    // it tilts more the further you pull instead
    const x = Math.sign(dx) * 44 * (1 - Math.exp(-Math.abs(dx) / 90));
    setDrag({ x, raw: dx, active: true });
  };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    const raw = drag.raw;
    if (Math.abs(raw) > 70) go(raw < 0 ? 1 : -1);
    else setDrag({ x: 0, raw: 0, active: false });
  };

  if (!items) return <div className="h-[340px]" />;
  if (!items.length)
    return (
      <a href={APP.sell} className="group ml-auto block max-w-[400px] rounded-[24px] bg-paper p-6 text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)]">
        <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">New listings opening</p>
        <p className="mt-2 text-[26px] font-semibold leading-tight tracking-tight">Be one of the first businesses on SMEmarket.</p>
        <p className="mt-2 text-[15px] text-ink-2">Free to list. 5% only when it sells.</p>
        <span className="mt-5 inline-flex h-11 items-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-semibold text-paper">
          List yours free <ArrowUpRight className="size-4 text-lime transition-transform group-hover:rotate-45" />
        </span>
      </a>
    );

  return (
    <div
      className="ml-auto max-w-[400px] select-none outline-none"
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Just listed"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        hold();
        go(e.key === "ArrowRight" ? 1 : -1);
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-[14px] font-semibold text-paper/75">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-lime" />
          </span>
          Just listed
        </p>
        {n > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-[13px] tabular-nums text-paper/55">
              {front + 1} / {n}
            </span>
            {([-1, 1] as const).map((d) => (
              <button
                key={d}
                onClick={() => (hold(), go(d))}
                aria-label={d === 1 ? "Next business" : "Previous business"}
                className="grid size-9 place-items-center rounded-full border border-paper/25 text-paper transition hover:border-paper hover:bg-paper hover:text-ink active:scale-90"
              >
                <ArrowUpRight className={clsx("size-4", d === 1 ? "rotate-45" : "-rotate-[135deg]")} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative touch-pan-y pb-[44px]">
        {/* invisible copy of the front card: gives the deck its real height */}
        <div aria-hidden className="invisible">
          <DeckCard l={items[front]} />
        </div>
        {items.map((l, k) => {
          const pos = (k - front + n) % n; // 0 = front
          if (pos > 2) return null;
          const isFront = pos === 0;
          const x = isFront ? (fling ? fling * 60 : drag.x) : 0;
          const pull = Math.min(1, Math.abs(drag.raw) / 200); // 0 → 1 as you pull
          const rot = isFront ? (fling ? fling * 7 : Math.sign(drag.x) * pull * 6) : 0;
          // while you drag, the card behind rises to meet you
          const lift = pull;
          const depth = isFront ? 0 : pos - (pos === 1 ? lift : 0);
          return (
            <div
              key={l.id}
              className={clsx("absolute inset-x-0 top-0", isFront ? "cursor-grab active:cursor-grabbing" : "pointer-events-none")}
              style={{
                transform: `translate3d(${x}px, ${depth * 18}px, 0) rotate(${rot}deg) scale(${1 - depth * 0.05})`,
                // cards behind are solid but dimmed (see-through cards made their text bleed together)
                opacity: isFront && fling ? 0 : 1,
                filter: isFront ? undefined : `brightness(${pos === 1 ? 0.62 + lift * 0.38 : 0.4})`,
                zIndex: 10 - pos,
                transition: drag.active && isFront ? "none" : fling && isFront ? "transform .22s ease-in, opacity .2s ease-in" : "transform .5s cubic-bezier(.16,1,.3,1), opacity .4s, filter .4s",
              }}
              onPointerDown={isFront ? onDown : undefined}
              onPointerMove={isFront ? onMove : undefined}
              onPointerUp={isFront ? onUp : undefined}
              onPointerCancel={isFront ? onUp : undefined}
            >
              <Link
                href={APP.listing(l.id)}
                draggable={false}
                tabIndex={isFront ? 0 : -1}
                aria-hidden={!isFront}
                // a drag shouldn't count as a click
                onClickCapture={(e) => {
                  if (moved.current) {
                    e.preventDefault();
                    e.stopPropagation();
                    moved.current = false;
                  }
                }}
                className="block rounded-[24px] text-ink shadow-[0_40px_80px_-40px_rgba(0,0,0,.9)]"
              >
                <DeckCard l={l} />
              </Link>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-2 flex justify-center">
          <div className="flex gap-1.5">
            {items.map((l, k) => (
              <button key={l.id} onClick={() => (hold(), setFront(k))} aria-label={`Show ${l.title}`} className={clsx("h-1.5 rounded-full transition-all duration-500", k === front ? "w-6 bg-lime" : "w-1.5 bg-paper/30 hover:bg-paper/60")} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** What a card in the deck shows. */
function DeckCard({ l }: { l: PublicListing }) {
  const img = listingImage(l);
  return (
    <div className="overflow-hidden rounded-[24px] bg-paper">
      <div className="relative h-[clamp(84px,12vh,120px)]">
        <Image src={img.src} alt={img.alt} fill sizes="400px" draggable={false} className="pointer-events-none object-cover" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 p-3">
          <span className="truncate rounded-full bg-paper/95 px-3 py-1 text-[12px] font-semibold">{l.industry}</span>
          <span className="shrink-0 rounded-full bg-ink/75 px-2.5 py-1 text-[12px] font-medium text-paper backdrop-blur">{[l.area, l.city].filter(Boolean).join(", ")}</span>
        </div>
      </div>
      <div className="p-5 pt-4">
      <p className="truncate text-[20px] font-semibold leading-snug tracking-tight" title={l.title}>
        {l.title}
      </p>
      <p className="mt-3 text-[13px] text-muted">Asking price</p>
      <p className="text-[28px] font-semibold tracking-tight">{aed(l.asking_price)}</p>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-rule pt-4">
        {[
          [short(l.revenue), "Revenue"],
          [short(l.profit), "Profit"],
          [l.multiple ? `${l.multiple}x` : "—", "Multiple"],
        ].map(([v, k2]) => (
          <span key={k2}>
            <span className="block text-[17px] font-semibold">{v}</span>
            <span className="block text-[12px] text-muted">{k2}</span>
          </span>
        ))}
      </div>
      <span className="mt-4 flex items-center justify-between text-[14px] font-semibold">
        View business <ArrowUpRight className="size-4" />
      </span>
      </div>
    </div>
  );
}

/** The industries that actually have businesses for sale right now, most listings first. */
function PopularIndustries() {
  const [top, setTop] = useState<[string, number][]>([]);
  useEffect(() => {
    api<{ listings: PublicListing[] }>("listings")
      .then((d) => {
        const n = new Map<string, number>();
        d.listings.forEach((l) => n.set(l.industry, (n.get(l.industry) ?? 0) + 1));
        setTop([...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4));
      })
      .catch(() => {});
  }, []);
  if (!top.length) return null;
  return (
    <>
      <span className="hidden animate-[pageIn_.5s_ease-out_both] sm:inline">Popular:</span>
      {top.map(([industry, count]) => (
        <a key={industry} href={`${APP.listings}?industry=${encodeURIComponent(industry)}`} className="hidden animate-[pageIn_.5s_ease-out_both] underline decoration-paper/25 underline-offset-4 transition hover:text-paper hover:decoration-paper sm:inline">
          {industry} <span className="text-paper/40 no-underline">({count})</span>
        </a>
      ))}
    </>
  );
}
