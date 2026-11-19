"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { setCovered } from "@/lib/reveal";
import { stripBase } from "@/lib/image-loader";
import { getLenis } from "./SmoothScroll";
import { SITE_ROUTES } from "@/lib/site";
import { Avatar, type Body, type Cast, type Mood } from "@/components/ui/Character";

/*
 * One ink sheet.
 *  - Home page, every fresh visit: "Every business has a next chapter." rises line by line, the people of
 *    SMEmarket pop up in a row beneath it, then the sheet lifts off the page, its bottom edge bowing
 *    into a soft curve as it goes. About 2.4s.
 *  - Any other page on a fresh visit: the sheet simply lifts.
 *  - Between pages: no sheet. The page fades up and out, a lime progress bar runs along the top, the next page settles in.
 */

type P = { who: Cast; mood: Mood; body: Body; tone: string; does: string };
const PEOPLE: P[] = [
  { who: "lina", mood: "excited", body: "Paper", tone: "bg-[#f6e3b5]", does: "Buy" },
  { who: "rashid", mood: "happy", body: "Coffee", tone: "bg-[#e3dcf2]", does: "Sell" },
  { who: "zara", mood: "excited", body: "PointingUp", tone: "bg-[#e9f1c9]", does: "Grow" },
  { who: "priya", mood: "calm", body: "Explaining", tone: "bg-[#dbe6ef]", does: "Advice" },
  { who: "james", mood: "happy", body: "Device", tone: "bg-[#d5ece4]", does: "Providers" },
];
const LINES = [["Every", "business", "has"], ["a", "next", "chapter."]];

function glide(hash: string, immediate = false) {
  const el = hash ? document.getElementById(hash) : null;
  const l = getLenis();
  if (l) l.scrollTo(el ?? 0, { offset: el ? -90 : 0, duration: 1.3, immediate });
  else if (el) el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}
const norm = (p: string) => stripBase(p).replace(/\/$/, "") || "/";

/** The sheet's curved edge: flat while it covers the page, bowed while it moves. */
const curve = (edge: "top" | "bottom", depth: number) => {
  const r = `${Math.round(window.innerWidth / 2)}px ${depth}px`;
  return edge === "bottom" ? { borderBottomLeftRadius: r, borderBottomRightRadius: r } : { borderTopLeftRadius: r, borderTopRightRadius: r };
};

export default function Curtain() {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const arrived = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!arrived.current) return;
    const done = arrived.current;
    arrived.current = null;
    requestAnimationFrame(() => requestAnimationFrame(done));
  }, [pathname]);
  const progress = useRef<{ start: () => void; done: () => void } | null>(null);

  /* first load */
  useLayoutEffect(() => {
    const el = root.current!;
    el.classList.remove("intro-failsafe");
    const q = gsap.utils.selector(el);
    const sheet = q("[data-sheet]");
    const hide = () => {
      gsap.set(el, { autoAlpha: 0 });
    };
    if (prefersReducedMotion()) {
      hide();
      setCovered(false);
      return;
    }
    setCovered(true);
    const lift = (tl: gsap.core.Timeline, at: number) =>
      tl
        .add(() => setCovered(false), at)
        .to(sheet, { yPercent: -100, duration: 1.05, ease: "expo.inOut" }, at)
        .fromTo(sheet, curve("bottom", 0), { ...curve("bottom", Math.min(220, window.innerHeight * 0.25)), duration: 0.55, ease: "power2.in" }, at)
        .add(hide);

    if (norm(window.location.pathname) !== "/") {
      gsap.set(q("[data-intro]"), { autoAlpha: 0 });
      const tl = gsap.timeline();
      lift(tl, 0.15);
      return () => {
        tl.kill();
      };
    }

    gsap.set(q("[data-word]"), { yPercent: 110 });
    gsap.set(q("[data-person]"), { yPercent: 60, scale: 0.6, autoAlpha: 0 });
    gsap.set(q("[data-does]"), { autoAlpha: 0, y: 6 });
    gsap.set(q("[data-sub]"), { autoAlpha: 0, y: 10 });
    const tl = gsap.timeline();
    tl.to(q("[data-word]"), { yPercent: 0, duration: 0.85, ease: "expo.out", stagger: 0.06 }, 0.2)
      .to(q("[data-sub]"), { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.75)
      .to(q("[data-person]"), { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.55, ease: "back.out(1.9)", stagger: 0.08 }, 0.85)
      .to(q("[data-does]"), { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08 }, 1.05)
      .to(q("[data-intro]"), { y: -40, autoAlpha: 0, duration: 0.45, ease: "power2.in" }, 2.0);
    lift(tl, 2.1);
    return () => {
      tl.kill();
    };
  }, []);

  /* page changes: the page fades up and out, a thin progress bar runs while the next one loads, the new page settles in */
  useEffect(() => {
    const html = document.documentElement;
    let fallback = 0;

    const go = (url: URL) => {
      busy.current = true;
      window.dispatchEvent(new Event("smem:navigate"));
      const path = stripBase(url.pathname);
      router.prefetch(path);
      progress.current?.start();
      const reduced = prefersReducedMotion();
      if (!reduced) html.dataset.nav = "leaving";
      arrived.current = () => {
        arrived.current = null;
        delete html.dataset.nav;
        progress.current?.done();
        glide(url.hash.slice(1), true);
        busy.current = false;
        clearTimeout(fallback);
      };
      // let the fade-out play, then switch pages
      const samePage = norm(path) === norm(location.pathname); // only the query changes (e.g. another listing)
      window.setTimeout(() => {
        router.push(path + url.search + url.hash, { scroll: false });
        // same page component, so the path never changes: settle once the new data has had a moment
        if (samePage) window.setTimeout(() => arrived.current?.(), 450);
      }, reduced ? 0 : 180);
      // never leave the page hidden, even if the route is slow or fails
      fallback = window.setTimeout(() => arrived.current?.(), 8000);
    };

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      const p = norm(url.pathname);
      if (!SITE_ROUTES.includes(p)) return;
      e.preventDefault();
      if (busy.current) return;
      if (p === norm(location.pathname) && url.search === location.search) {
        window.dispatchEvent(new Event("smem:navigate"));
        requestAnimationFrame(() => glide(url.hash.slice(1)));
        return;
      }
      go(url);
    };
    // capture phase: runs before Next's <Link> handler, so every internal link gets the same transition
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimeout(fallback);
    };
  }, [router]);

  return (
    <>
    <NavProgress api={progress} />
    <div ref={root} aria-hidden className="intro-failsafe pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <div data-sheet className="absolute inset-0 bg-ink text-paper">
        {/* home welcome */}
        <div data-intro className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[clamp(2.1rem,8vw,7.6rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
            {LINES.map((line, i) => (
              <span key={i} className="flex flex-wrap justify-center gap-x-[0.24em]">
                {line.map((w) => (
                  <span key={w} className="-mx-[0.12em] overflow-hidden px-[0.12em] pb-[0.08em]">
                    <span data-word className={`inline-block ${w === "chapter." ? "text-lime" : ""}`}>
                      {w}
                    </span>
                  </span>
                ))}
              </span>
            ))}
          </p>
          <p data-sub className="mt-5 max-w-xl text-[clamp(1rem,1.6vw,1.35rem)] leading-snug text-paper/70">
            Buy one, sell yours, or grow the one you have. SMEmarket is where it happens.
          </p>
          <ul className="mt-10 flex gap-3 md:mt-12 md:gap-6">
            {PEOPLE.map((p) => (
              <li key={p.who} className="flex flex-col items-center">
                <span data-person className="block">
                  <Avatar who={p.who} mood={p.mood} body={p.body} tone={p.tone} size={56} className="md:hidden" />
                  <Avatar who={p.who} mood={p.mood} body={p.body} tone={p.tone} size={92} className="hidden md:block" />
                </span>
                <span data-does className="mt-2 text-[12px] font-semibold text-paper/60 md:text-[14px]">
                  {p.does}
                </span>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
    </>
  );
}

/** A thin lime bar along the top while the next page loads. */
function NavProgress({ api }: { api: React.MutableRefObject<{ start: () => void; done: () => void } | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let tw: gsap.core.Tween | null = null;
    api.current = {
      start() {
        tw?.kill();
        gsap.set(bar.current, { scaleX: 0, opacity: 1 });
        tw = gsap.to(bar.current, { scaleX: 0.85, duration: 4, ease: "power3.out" });
      },
      done() {
        tw?.kill();
        tw = gsap.to(bar.current, { scaleX: 1, duration: 0.25, ease: "power2.out", onComplete: () => void gsap.to(bar.current, { opacity: 0, duration: 0.3 }) });
      },
    };
    return () => {
      tw?.kill();
      api.current = null;
    };
  }, [api]);
  return <div ref={bar} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[3px] origin-left bg-lime opacity-0" style={{ transform: "scaleX(0)" }} />;
}
