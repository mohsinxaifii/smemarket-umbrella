"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, Info, X } from "lucide-react";

type T = { id: number; text: string; tone: "ok" | "info" | "error" };
let push: ((t: Omit<T, "id">) => void) | null = null;

/** Show a short confirmation at the bottom of the screen: toast("Saved"). */
export function toast(text: string, tone: T["tone"] = "ok") {
  push?.({ text, tone });
}

/** Mounted once in the layout; stacks toasts and clears each after a few seconds. */
export default function Toaster() {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    let n = 0;
    push = (t) => {
      const id = ++n;
      setItems((x) => [...x.slice(-2), { ...t, id }]);
      window.setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
    };
    return () => {
      push = null;
    };
  }, []);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4">
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto flex animate-[chipIn_.5s_cubic-bezier(.34,1.56,.64,1)_both] items-center gap-3 rounded-full bg-ink py-2.5 pl-2.5 pr-5 text-[15px] font-medium text-paper shadow-[0_20px_40px_-16px_rgba(21,19,15,.7)]">
          <span className={clsx("grid size-7 place-items-center rounded-full", t.tone === "error" ? "bg-stamp text-white" : t.tone === "info" ? "bg-paper/15" : "bg-lime text-ink")}>
            {t.tone === "error" ? <X className="size-4" /> : t.tone === "info" ? <Info className="size-4" /> : <Check className="size-4" strokeWidth={3} />}
          </span>
          {t.text}
        </div>
      ))}
    </div>
  );
}
