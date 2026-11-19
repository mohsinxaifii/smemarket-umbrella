"use client";
import { useCallback, useRef } from "react";

/**
 * A gentle 3D tilt that follows the pointer, with a soft light where the cursor is.
 * Mouse only (touch scrolls normally); off for people who prefer reduced motion.
 * Spread the returned props onto the card; it sets --tilt-x/--tilt-y/--glow-x/--glow-y.
 */
export function useTilt(max = 6) {
  const raf = useRef(0);
  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) translateY(-4px)`;
        el.style.setProperty("--glow-x", `${px * 100}%`);
        el.style.setProperty("--glow-y", `${py * 100}%`);
      });
    },
    [max],
  );
  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLElement>) => {
    cancelAnimationFrame(raf.current);
    e.currentTarget.style.transform = "";
  }, []);
  return { onPointerMove, onPointerLeave };
}

/** Class for the light that follows the cursor (put it on an absolutely positioned child). */
export const GLOW =
  "pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(420px_circle_at_var(--glow-x,50%)_var(--glow-y,50%),rgba(255,255,255,.55),transparent_45%)]";
