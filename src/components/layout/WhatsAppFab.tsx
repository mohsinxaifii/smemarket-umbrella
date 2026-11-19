"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/site";

/** A round WhatsApp button in the corner, once you've scrolled a little. Steps aside over forms and the footer. */
export default function WhatsAppFab() {
  const [show, setShow] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const on = () => setShow(window.scrollY > 500);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setBlocked(seen.size > 0);
    });
    const watch = () => document.querySelectorAll("[data-hide-bar], footer").forEach((t) => io.observe(t));
    watch();
    const mo = new MutationObserver(watch);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp us"
      className={clsx(
        "fixed bottom-4 right-4 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_-14px_rgba(21,19,15,.6)] transition-all duration-500 ease-out-expo hover:scale-105 md:bottom-6 md:right-6",
        show && !blocked ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
    >
      <WhatsAppIcon className="size-6" />
    </a>
  );
}
