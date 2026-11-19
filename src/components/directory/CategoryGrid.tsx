"use client";
import { ArrowUpRight, Briefcase, Calculator, Hammer, Megaphone, Monitor, Scale, Truck, Users } from "lucide-react";
import { DIRECTORY_CATEGORIES } from "@/lib/site";
import { useTilt, GLOW } from "@/lib/useTilt";
import { getLenis } from "@/components/layout/SmoothScroll";

const ICONS = [Briefcase, Calculator, Megaphone, Hammer, Scale, Monitor, Users, Truck];
const HINTS = ["Visas, licences, Emirates ID", "VAT, bookkeeping, corporate tax", "Social, ads, branding", "Offices, shops, renovations", "Contracts, leases, company setup", "Laptops, networks, software", "WPS payroll, contracts, policies", "Delivery, storage, freight"];

/** Category tiles: click one to search the directory for it, right away. */
export default function CategoryGrid() {
  const pick = (c: string) => {
    window.dispatchEvent(new CustomEvent("smem:dir-search", { detail: c }));
    const el = document.getElementById("dir-q");
    const l = getLenis();
    if (el && l) l.scrollTo(el, { offset: -160, duration: 1 });
    else el?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  return (
    <div className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:grid-cols-4 md:gap-4">
      {DIRECTORY_CATEGORIES.map((c, i) => (
        <Tile key={c} label={c} hint={HINTS[i]} Icon={ICONS[i]} onClick={() => pick(c)} delay={i * 50} />
      ))}
    </div>
  );
}

function Tile({ label, hint, Icon, onClick, delay }: { label: string; hint: string; Icon: typeof Briefcase; onClick: () => void; delay: number }) {
  const tilt = useTilt(6);
  return (
    <button
      {...tilt}
      onClick={onClick}
      style={{ animation: `pageIn .6s cubic-bezier(.16,1,.3,1) ${delay}ms both` }}
      className="group relative flex min-h-[170px] flex-col justify-between overflow-hidden rounded-[24px] bg-card p-5 text-left ring-1 ring-rule transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_24px_50px_-30px_rgba(21,19,15,.5)] hover:ring-ink/25 md:p-6"
    >
      <span aria-hidden className={GLOW} />
      <span className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-2xl bg-[#d5ece4] transition-colors duration-300 group-hover:bg-ink group-hover:text-lime">
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        <ArrowUpRight className="size-5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
      <span>
        <span className="block text-[18px] font-semibold leading-tight">{label}</span>
        <span className="mt-1 block text-[14px] text-muted">{hint}</span>
      </span>
    </button>
  );
}
