"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "@/lib/useInView";

/** Counts a figure like "1.3M+" or "~95%" up from zero the first time it comes on screen. */
export default function CountUp({ value, ms = 1400 }: { value: string; ms?: number }) {
  const m = value.match(/^(\D*)([\d.]+)(.*)$/);
  const hasNumber = !!m;
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, 0.5);
  const target = m ? parseFloat(m[2]) : 0;
  const decimals = m && m[2].includes(".") ? m[2].split(".")[1].length : 0;
  const [n, setN] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    if (!seen || done.current || !hasNumber) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(target);
    // runs to the end even if the section scrolls away mid-count
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [seen, target, ms, hasNumber]);
  if (!m) return <span>{value}</span>;
  return (
    <span ref={ref} aria-label={value}>
      {m[1]}
      {n.toFixed(decimals)}
      {m[3]}
    </span>
  );
}
