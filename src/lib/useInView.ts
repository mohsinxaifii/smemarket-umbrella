"use client";
import { useEffect, useRef, useState, type RefObject } from "react";

/** True while the element is on screen. Autoplaying sections use it to play only when someone can see them. */
export function useInView(ref: RefObject<Element | null>, threshold = 0.3) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold]);
  return on;
}

/** Steps through 0..count-1 every `ms` while `active`; holds still for people who prefer reduced motion. */
export function useCycle(count: number, ms: number, active: boolean) {
  const [i, setI] = useState(0);
  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  useEffect(() => {
    if (!active || reduced.current) return;
    const t = setTimeout(() => setI((x) => (x + 1) % count), ms);
    return () => clearTimeout(t);
  }, [i, active, count, ms]);
  return [i, setI] as const;
}
