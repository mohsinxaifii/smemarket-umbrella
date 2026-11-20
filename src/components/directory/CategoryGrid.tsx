"use client";
import { ArrowUpRight, Briefcase, Calculator, Hammer, Megaphone, Monitor, Scale, Truck, Users } from "lucide-react";
import { DIRECTORY_CATEGORIES } from "@/lib/site";
import { useTilt } from "@/lib/useTilt";
import Image from "next/image";
import { getLenis } from "@/components/layout/SmoothScroll";

const ICONS = [Briefcase, Calculator, Megaphone, Hammer, Scale, Monitor, Users, Truck];
const PHOTOS = ["bur-dubai-night", "accounts", "whiteboard", "shop-counter", "signing", "laptop-charts", "team-meeting", "warehouse"];
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
    <div className="mt-7 grid grid-cols-2 gap-2 md:mt-14 md:grid-cols-4 md:gap-4">
      {DIRECTORY_CATEGORIES.map((c, i) => (
        <Tile key={c} label={c} hint={HINTS[i]} Icon={ICONS[i]} photo={`/images/${PHOTOS[i]}.jpg`} onClick={() => pick(c)} delay={i * 50} />
      ))}
    </div>
  );
}

/** A category over a photo of that kind of work. */
function Tile({ label, hint, Icon, photo, onClick, delay }: { label: string; hint: string; Icon: typeof Briefcase; photo: string; onClick: () => void; delay: number }) {
  const tilt = useTilt(6);
  return (
    <button
      {...tilt}
      onClick={onClick}
      style={{ animation: `pageIn .6s cubic-bezier(.16,1,.3,1) ${delay}ms both` }}
      className="group relative flex min-h-[156px] flex-col justify-between overflow-hidden rounded-[20px] bg-ink p-3.5 text-left text-paper transition-[transform,box-shadow] duration-300 ease-out hover:shadow-[0_24px_50px_-30px_rgba(21,19,15,.6)] md:min-h-[220px] md:rounded-[24px] md:p-5"
    >
      <Image src={photo} alt="" fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.07]" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-ink/5" />
      <span className="relative flex items-start justify-between">
        <span className="grid size-9 place-items-center rounded-xl bg-paper/90 text-ink backdrop-blur transition-colors duration-300 group-hover:bg-lime md:size-10">
          <Icon className="size-[18px]" strokeWidth={1.75} />
        </span>
        <ArrowUpRight className="size-5 -translate-x-1 text-lime opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </span>
      <span className="relative">
        <span className="block text-[16px] font-semibold leading-tight md:text-[19px]">{label}</span>
        <span className="mt-1 block text-[12.5px] leading-snug text-paper/70 md:text-[14px]">{hint}</span>
      </span>
    </button>
  );
}
