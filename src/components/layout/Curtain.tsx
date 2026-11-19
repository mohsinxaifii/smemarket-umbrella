"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { setCovered } from "@/lib/reveal";
import { stripBase } from "@/lib/image-loader";
import { getLenis } from "./SmoothScroll";
import { SITE_ROUTES } from "@/lib/site";
import Character from "@/components/ui/Character";

/*
 * Big lime pixel blocks.
 *  - First visit: on ink, the blocks pop in at random until the screen is solid lime, with a little film grain.
 *    A seller walks in from the left ("I'm ready to sell my café."), a buyer from the right
 *    ("I'm looking to buy one."), and SMEmarket lands between them: "We bring them together, and help you grow."
 *    Then the blocks break away in a diagonal wave and the page is underneath. Once per visit, about 3.6s.
 *  - Between pages: the blocks sweep in, show where you're going, and sweep out.
 */
/** The scene: a seller and a buyer, and us in the middle. */
const SELLER = { who: "rashid" as const, mood: "happy" as const, body: "Coffee" as const, says: "I'm ready to sell my café." };
const BUYER = { who: "lina" as const, mood: "excited" as const, body: "Paper" as const, says: "I'm looking to buy one." };
const NAMES: Record<string, string> = {
  "/": "Home",
  "/brokerage": "Buy & sell",
  "/advisory": "Advisory",
  "/directory": "Directory",
  "/about": "About",
  "/contact": "Contact",
  "/privacy": "Privacy",
  "/listings": "For sale",
  "/listing": "For sale",
  "/sell": "Sell",
  "/login": "Welcome",
  "/account": "Your account",
  "/nda": "NDA",
  "/messages": "Messages",
  "/admin": "Admin",
};

function glide(hash: string, immediate = false) {
  const el = hash ? document.getElementById(hash) : null;
  const l = getLenis();
  if (l) l.scrollTo(el ?? 0, { offset: el ? -90 : 0, duration: 1.3, immediate });
  else if (el) el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}
const norm = (p: string) => stripBase(p).replace(/\/$/, "") || "/";

/** Fine film grain as an inline SVG, so nothing extra is downloaded. */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.55'/></svg>\")";

export default function Curtain() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const arrived = useRef<(() => void) | null>(null);
  const [grid, setGrid] = useState<{ cols: number; rows: number } | null>(null);
  const [dest, setDest] = useState("");

  useEffect(() => {
    if (!arrived.current) return;
    const done = arrived.current;
    arrived.current = null;
    requestAnimationFrame(() => requestAnimationFrame(done));
  }, [pathname]);

  // size the blocks to the screen: ~12 across on desktop, 6 on a phone, always square
  useLayoutEffect(() => {
    if (!prefersReducedMotion()) setCovered(true);
    const size = () => {
      const cols = window.innerWidth < 640 ? 6 : window.innerWidth < 1024 ? 9 : 12;
      setGrid({ cols, rows: Math.ceil(window.innerHeight / (window.innerWidth / cols)) });
    };
    size();
    window.addEventListener("resize", size);
    return () => window.removeEventListener("resize", size);
  }, []);

  /* first visit */
  const started = useRef(false);
  useEffect(() => {
    if (!grid || started.current) return;
    started.current = true;
    const el = root.current!;
    el.classList.remove("intro-failsafe");
    const q = gsap.utils.selector(el);
    const blocks = q("[data-block]");
    const hide = () => {
      gsap.set(el, { autoAlpha: 0 });
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem("smem:intro") === "1";
      sessionStorage.setItem("smem:intro", "1");
    } catch {}

    if (prefersReducedMotion()) {
      hide();
      setCovered(false);
      return;
    }
    gsap.set(q("[data-name]"), { yPercent: 115, autoAlpha: 1 });
    gsap.set(q("[data-tag], [data-bubble]"), { autoAlpha: 0 });
    gsap.set(q("[data-seller]"), { xPercent: -120, autoAlpha: 1 });
    gsap.set(q("[data-buyer]"), { xPercent: 120, autoAlpha: 1 });
    const g = { grid: [grid.rows, grid.cols] as [number, number] };

    if (seen) {
      // later loads: solid lime, straight into the break-away
      gsap.set(blocks, { scale: 1.02 });
      gsap.set(q("[data-ink]"), { opacity: 0 });
      setCovered(false);
      const quick = gsap.to(blocks, { scale: 0, duration: 0.5, ease: "power3.in", stagger: { ...g, from: "start", amount: 0.45 }, onComplete: hide });
      return () => {
        quick.kill();
      };
    }

    const tl = gsap.timeline();
    tl.fromTo(blocks, { scale: 0 }, { scale: 1.02, duration: 0.4, ease: "back.out(2)", stagger: { ...g, from: "random", amount: 0.5 } }, 0.1)
      .set(q("[data-ink]"), { opacity: 0 })
      .fromTo(q("[data-meta]"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6);
    tl.to(q("[data-seller]"), { xPercent: 0, duration: 0.8, ease: "expo.out" }, 0.5)
      .fromTo(q("[data-bubble='s']"), { autoAlpha: 0, scale: 0.6, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, 0.85)
      .to(q("[data-buyer]"), { xPercent: 0, duration: 0.8, ease: "expo.out" }, 1.15)
      .fromTo(q("[data-bubble='b']"), { autoAlpha: 0, scale: 0.6, y: 10 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(2)" }, 1.5)
      .to(q("[data-bubble]"), { autoAlpha: 0, y: -8, duration: 0.25 }, 2.3)
      .to(q("[data-name]"), { yPercent: 0, duration: 0.6, ease: "expo.out" }, 2.25)
      .to(q("[data-tag]"), { autoAlpha: 1, duration: 0.4 }, 2.45)
      // the two lean in towards the middle, the deal is done
      .to(q("[data-seller]"), { x: 30, duration: 0.5, ease: "power2.out" }, 2.3)
      .to(q("[data-buyer]"), { x: -30, duration: 0.5, ease: "power2.out" }, 2.3)
      .to(q("[data-name]"), { yPercent: -115, duration: 0.4, ease: "expo.in" }, 3.15)
      .to(q("[data-tag], [data-meta]"), { autoAlpha: 0, duration: 0.25 }, 3.15)
      .to(q("[data-seller]"), { xPercent: -120, duration: 0.5, ease: "expo.in" }, 3.1)
      .to(q("[data-buyer]"), { xPercent: 120, duration: 0.5, ease: "expo.in" }, 3.1)
      .add(() => setCovered(false), 3.5)
      .to(blocks, { scale: 0, duration: 0.55, ease: "power3.in", stagger: { ...g, from: "start", amount: 0.5 } }, 3.45)
      .add(hide);
    return () => {
      tl.kill();
    };
  }, [grid]);

  /* page changes */
  useEffect(() => {
    if (!grid) return;
    const el = root.current!;
    const q = gsap.utils.selector(el);
    const reduced = prefersReducedMotion();
    const g = { grid: [grid.rows, grid.cols] as [number, number] };

    const cover = () =>
      new Promise<void>((resolve) => {
        gsap.set(q("[data-name], [data-tag], [data-meta], [data-seller], [data-buyer], [data-bubble]"), { autoAlpha: 0 });
        gsap.set(q("[data-ink]"), { opacity: 0 });
        gsap.set(el, { autoAlpha: 1 });
        if (reduced) {
          gsap.set(q("[data-block]"), { scale: 1.02 });
          return resolve();
        }
        gsap.fromTo(q("[data-block]"), { scale: 0 }, { scale: 1.02, duration: 0.4, ease: "power3.out", stagger: { ...g, from: "end", amount: 0.35 }, onComplete: () => resolve() });
        gsap.fromTo(q("[data-dest]"), { yPercent: 115, autoAlpha: 1 }, { yPercent: 0, duration: 0.55, ease: "expo.out", delay: 0.4 });
      });
    const uncover = () =>
      new Promise<void>((resolve) => {
        setCovered(false);
        const done = () => {
          gsap.set(el, { autoAlpha: 0 });
          resolve();
        };
        if (reduced) return done();
        gsap.to(q("[data-dest]"), { yPercent: -115, duration: 0.35, ease: "expo.in" });
        gsap.to(q("[data-block]"), { scale: 0, duration: 0.45, ease: "power3.in", delay: 0.15, stagger: { ...g, from: "start", amount: 0.35 }, onComplete: done });
      });

    const go = async (url: URL) => {
      busy.current = true;
      window.dispatchEvent(new Event("smem:navigate"));
      const path = stripBase(url.pathname);
      setDest(NAMES[norm(path)] ?? "");
      router.prefetch(path);
      setCovered(true);
      await cover();
      const landed = new Promise<void>((r) => (arrived.current = r));
      router.push(path + url.search + url.hash, { scroll: false });
      await Promise.race([landed, new Promise((r) => setTimeout(r, 4000))]);
      glide(url.hash.slice(1), true);
      await new Promise((r) => setTimeout(r, 150));
      await uncover();
      busy.current = false;
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      // app pages (listings, sign-up…) live on the backend: let the browser load them
      const p = norm(url.pathname);
      if (!SITE_ROUTES.includes(p)) return;
      e.preventDefault();
      if (busy.current) return;
      if (p === norm(location.pathname)) {
        window.dispatchEvent(new Event("smem:navigate"));
        requestAnimationFrame(() => glide(url.hash.slice(1)));
        return;
      }
      go(url);
    };
    // capture phase: runs before Next's <Link> handler, so every internal link gets the transition
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, grid]);

  return (
    <div ref={root} aria-hidden className="intro-failsafe pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {/* ink underlay: covers the page until the blocks have filled in */}
      <div data-ink className="absolute inset-0 bg-ink" />

      {/* the blocks */}
      {grid && (
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridAutoRows: `${100 / grid.cols}vw` }}>
          {Array.from({ length: grid.cols * grid.rows }).map((_, i) => (
            <span key={i} data-block className="block bg-lime" style={{ transform: "scale(0)" }} />
          ))}
        </div>
      )}

      {/* grain over everything */}
      <div className="absolute inset-0 opacity-[0.22] mix-blend-multiply [animation:grain_.6s_steps(3)_infinite]" style={{ backgroundImage: GRAIN }} />

      {/* us, in the middle */}
      <div className="absolute inset-x-0 top-[22%] px-5 text-center text-ink md:top-1/2 md:-translate-y-[60%]">
        <div className="overflow-hidden pb-[0.06em]">
          <p data-name className="invisible text-[clamp(3rem,9vw,8rem)] font-semibold leading-[0.98] tracking-[-0.06em]">
            SMEmarket
          </p>
        </div>
        <p data-tag className="invisible mx-auto mt-4 max-w-[30rem] text-[clamp(1.05rem,1.7vw,1.4rem)] font-medium leading-snug text-ink/75">
          We bring buyers and sellers together, and help you grow what you own.
        </p>
      </div>

      {/* the seller, from the left */}
      <div data-seller className="invisible absolute bottom-0 left-[-4%] md:left-[3%]">
        <p data-bubble="s" className="absolute bottom-[88%] left-[18%] w-max max-w-[44vw] origin-bottom-left rounded-2xl rounded-bl-md bg-ink px-4 py-2.5 text-[clamp(.95rem,1.4vw,1.2rem)] font-semibold text-paper md:left-[58%] md:max-w-[30vw]">
          {SELLER.says}
        </p>
        <Character who={SELLER.who} mood={SELLER.mood} body={SELLER.body} size={420} eager className="!h-[min(46vh,44vw,460px)] !w-[min(46vh,44vw,460px)] translate-y-[6%]" />
      </div>

      {/* the buyer, from the right */}
      <div data-buyer className="invisible absolute bottom-0 right-[-4%] md:right-[3%]">
        <p data-bubble="b" className="absolute bottom-[88%] right-[18%] w-max max-w-[44vw] origin-bottom-right rounded-2xl rounded-br-md bg-paper px-4 py-2.5 text-[clamp(.95rem,1.4vw,1.2rem)] font-semibold text-ink md:right-[58%] md:max-w-[30vw]">
          {BUYER.says}
        </p>
        <Character who={BUYER.who} mood={BUYER.mood} body={BUYER.body} size={420} eager className="!h-[min(46vh,44vw,460px)] !w-[min(46vh,44vw,460px)] translate-y-[6%] -scale-x-100" />
      </div>

      <div data-meta className="absolute inset-x-0 top-0 flex items-center justify-between p-5 text-[14px] font-semibold text-ink opacity-0 md:p-8">
        <span>SMEmarket</span>
        <span className="hidden sm:inline">The UAE&apos;s marketplace for small businesses</span>
      </div>

      {/* page-change label */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="overflow-hidden pb-[0.08em]">
          <span data-dest className="invisible block text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-tight tracking-[-0.05em] text-ink">
            {dest}
          </span>
        </div>
      </div>
    </div>
  );
}
