"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { ArrowUpRight, Phone, X } from "lucide-react";
import Logo from "./Logo";
import SmartLink from "@/components/ui/SmartLink";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { Avatar } from "@/components/ui/Character";
import { APP, PILLARS, SITE, waLink } from "@/lib/site";
import { getLenis } from "./SmoothScroll";
import { useMe } from "@/lib/api";

const NAV = [
  { href: APP.listings, label: "Buy" },
  { href: APP.sell, label: "Sell" },
  { href: "/advisory", label: "Advisory" },
  { href: "/directory", label: "Directory" },
  { href: PILLARS[3].href, label: "Grow" },
  { href: "/about", label: "About" },
];

/** A full-width bar: a slim ink strip with contact details on top, the main row underneath. The strip folds away on scroll. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [overHero, setOverHero] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useMe();
  const cta = user ? { href: APP.account, label: "My account" } : { href: APP.signup, label: "Sign up free" };

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 40);
      // the home page opens on a full-bleed photo: the bar goes see-through and light until you scroll past it
      setOverHero((pathname === "/" || pathname === "") && window.scrollY < window.innerHeight - 90);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [pathname]);
  const light = overHero && !open;

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("smem:navigate", close);
    return () => window.removeEventListener("smem:navigate", close);
  }, []);
  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const here = (href: string) => href.startsWith("/") && (pathname === href || pathname === `${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* info strip */}
      <div className={clsx("overflow-hidden bg-ink text-paper transition-[height] duration-500 ease-out-expo", scrolled ? "h-0" : "h-9")}>
        <div className="container-x flex h-9 items-center justify-between gap-4 text-[13px]">
          <p className="truncate text-paper/70">
            <span className="mr-2 inline-block size-1.5 -translate-y-px rounded-full bg-lime align-middle" />
            For the 1.3M+ small and medium businesses of the UAE
          </p>
          <div className="hidden shrink-0 items-center gap-5 sm:flex">
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-paper/80 hover:text-paper">
              <WhatsAppIcon className="size-3.5" /> {SITE.phone}
            </a>
            {!user && (
              <a href={APP.login} className="text-paper/80 hover:text-paper">
                Log in
              </a>
            )}
          </div>
        </div>
      </div>

      {/* main row */}
      <div className={clsx("border-b transition-colors duration-500", light ? "border-paper/15 bg-transparent text-paper" : scrolled || open ? "border-rule bg-paper/90 backdrop-blur-xl" : "border-transparent bg-paper")}>
        <div className={clsx("container-x flex items-center justify-between gap-6 transition-[height] duration-500 ease-out-expo", scrolled ? "h-16" : "h-[76px]")}>
          <Logo onClick={() => setOpen(false)} tone={light ? "dark" : "light"} className="h-6 w-auto md:h-7" />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <SmartLink
                key={n.label}
                href={n.href}
                className={clsx(
                  "group relative px-3.5 py-2 text-[15px] font-medium transition-colors",
                  light ? "text-paper/85 hover:text-paper" : here(n.href) ? "text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                {n.label}
                {/* underline grows from the left */}
                <span className={clsx("absolute inset-x-3.5 bottom-1 h-[2px] origin-left rounded-full transition-transform duration-500 ease-out-expo", light ? "bg-paper" : "bg-ink", here(n.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
              </SmartLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={cta.href} className={clsx("group hidden h-11 items-center gap-2 rounded-[10px] pl-5 pr-4 text-[15px] font-semibold transition sm:flex", light ? "bg-paper text-ink hover:bg-white" : "bg-ink text-paper hover:bg-ink-3")}>
              {cta.label}
              <ArrowUpRight className={clsx("size-4 transition-transform duration-300 group-hover:rotate-45", light ? "text-ink" : "text-lime")} />
            </a>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={clsx("grid size-11 place-items-center rounded-[10px] border lg:hidden", light ? "border-paper/40" : "border-rule-strong")}
            >
              {open ? (
                <X className="size-5" />
              ) : (
                <span className="grid gap-[5px]">
                  <span className={clsx("block h-[2px] w-5 rounded-full", light ? "bg-paper" : "bg-ink")} />
                  <span className={clsx("block h-[2px] w-3.5 rounded-full", light ? "bg-paper" : "bg-ink")} />
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu: drops down under the bar */}
      <div
        data-lenis-prevent
        className={clsx(
          "fixed inset-x-0 bottom-0 overflow-y-auto bg-paper transition-[clip-path] duration-700 ease-out-expo lg:hidden",
          scrolled ? "top-16" : "top-[112px]",
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
        )}
      >
        <div className="container-x py-6">
          <p className="label">What do you need?</p>
          <div className="mt-3 grid gap-1">
            {PILLARS.map((p, i) => (
              <SmartLink
                key={`${p.slug}-${open}`}
                href={p.href}
                onClick={() => setOpen(false)}
                style={open ? { animation: `pageIn .6s cubic-bezier(.16,1,.3,1) ${100 + i * 50}ms both` } : undefined}
                className="flex items-center gap-3 border-b border-rule py-2.5"
              >
                <Avatar who={p.person.who} mood={p.person.mood} body={p.person.body} size={48} tone={p.tone} />
                <span className="flex-1">
                  <span className="block text-[18px] font-semibold leading-tight">{p.job}</span>
                  <span className="block text-[14px] text-muted">{p.name}</span>
                </span>
                <ArrowUpRight className="size-4 text-muted" />
              </SmartLink>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              { href: APP.listings, label: "Businesses for sale" },
              { href: APP.sell, label: "Sell your business" },
              { href: "/about", label: "About" },
              { href: "/contact", label: "Contact" },
              user ? { href: APP.account, label: "My account" } : { href: APP.login, label: "Log in" },
            ].map((n) => (
              <SmartLink key={n.label} href={n.href} onClick={() => setOpen(false)} className="py-2 text-[17px] font-medium">
                {n.label}
              </SmartLink>
            ))}
          </div>
          <div className="mt-6 grid gap-3">
            <a href={cta.href} className="flex h-14 items-center justify-center gap-2 rounded-[10px] bg-ink text-[16px] font-semibold text-paper">
              {cta.label} <ArrowUpRight className="size-4 text-lime" />
            </a>
            <div className="grid grid-cols-2 gap-3">
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#25D366] text-[15px] font-semibold text-white">
                <WhatsAppIcon className="size-4" /> WhatsApp
              </a>
              <a href={SITE.phoneHref} className="flex h-12 items-center justify-center gap-2 rounded-[10px] border border-rule-strong text-[15px] font-semibold">
                <Phone className="size-4" /> Call
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
