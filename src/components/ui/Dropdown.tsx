"use client";
import { useEffect, useId, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

type Option = { value: string; label: string };

/**
 * A styled replacement for <select>: a button that opens a small menu.
 * Keyboard: Enter/Space/arrows open it, arrows move, Enter picks, Escape closes, letters jump.
 */
export default function Dropdown({
  value,
  options,
  onChange,
  label,
  icon,
  className,
  menuClassName,
}: {
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  label: string;
  icon?: React.ReactNode;
  className?: string;
  menuClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const off = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [open]);

  // keep the highlighted option in view
  useEffect(() => {
    if (open) list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const show = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
    btn.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        show();
      }
      return;
    }
    if (e.key === "Escape" || e.key === "Tab") return setOpen(false);
    const move: Record<string, (a: number) => number> = {
      ArrowDown: (a) => (a + 1) % options.length,
      ArrowUp: (a) => (a - 1 + options.length) % options.length,
      Home: () => 0,
      End: () => options.length - 1,
    };
    if (move[e.key]) {
      e.preventDefault();
      setActive(move[e.key]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(active);
    }
    else if (/^[a-z]$/i.test(e.key)) {
      const i = options.findIndex((o, k) => k > active && o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      const j = i >= 0 ? i : options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()));
      if (j >= 0) setActive(j);
    }
  };

  return (
    <div ref={root} className={clsx("relative", className)}>
      <button
        ref={btn}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${current.label}`}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={onKey}
        className={clsx(
          "flex h-12 w-full items-center gap-2 rounded-[16px] pl-3.5 pr-3 text-left text-[15px] font-medium outline-none transition",
          open ? "bg-ink text-paper" : "bg-paper-2 hover:bg-[#e6dfd0] focus-visible:ring-2 focus-visible:ring-ink",
        )}
      >
        {icon && <span className={clsx("shrink-0 transition-colors", open ? "text-lime" : "text-muted")}>{icon}</span>}
        <span className="min-w-0 flex-1 truncate">{current.label}</span>
        <ChevronDown className={clsx("size-4 shrink-0 transition-transform duration-300", open && "rotate-180")} />
      </button>

      <ul
        ref={list}
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        tabIndex={-1}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        className={clsx(
          "absolute right-0 top-[calc(100%+8px)] z-30 max-h-[320px] min-w-full origin-top overflow-auto overscroll-contain rounded-[18px] bg-card p-1.5 shadow-[0_30px_60px_-24px_rgba(21,19,15,.45)] ring-1 ring-rule transition duration-200 ease-out",
          open ? "visible scale-100 opacity-100" : "invisible pointer-events-none scale-[.97] -translate-y-1 opacity-0",
          menuClassName,
        )}
      >
        {options.map((o, i) => {
          const sel = o.value === current.value;
          return (
            <li
              key={o.value}
              id={`${id}-${i}`}
              role="option"
              aria-selected={sel}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
              className={clsx(
                "flex cursor-pointer items-center justify-between gap-6 whitespace-nowrap rounded-[12px] px-3.5 py-2.5 text-[15px] transition-colors",
                i === active ? "bg-paper-2" : "",
                sel && "font-semibold",
              )}
            >
              {o.label}
              <span className={clsx("grid size-5 place-items-center rounded-full transition", sel ? "bg-lime text-ink" : "opacity-0")}>
                <Check className="size-3" strokeWidth={3} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
