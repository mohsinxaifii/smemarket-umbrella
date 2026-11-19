import { BadgeCheck, Check, GraduationCap, Lock, MapPin, Search, Sparkles } from "lucide-react";

const card = "rounded-xl bg-white shadow-[0_8px_20px_-12px_rgba(21,19,15,.35)]";

/** A small, honest picture of what each part of SMEmarket looks like in use. */
export default function PillarVisual({ slug }: { slug: string }) {
  if (slug === "brokerage")
    return (
      <div className={`${card} w-[290px] p-4`}>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[12px] font-semibold">Retail</span>
          <span className="flex items-center gap-1 text-[12px] font-semibold text-muted">
            <Lock className="size-3" /> Sign NDA to view
          </span>
        </div>
        <p className="mt-3 text-[17px] font-semibold leading-tight">Tailoring business for sale</p>
        <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
          <MapPin className="size-3" /> JLT, Dubai
        </p>
        <p className="mt-3 text-[12px] text-muted">Asking price</p>
        <p className="text-[22px] font-semibold tracking-tight">AED 1,200,000</p>
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-rule pt-3 text-center">
          {[
            ["1.5M", "Revenue"],
            ["400K", "Profit"],
            ["3x", "Multiple"],
          ].map(([v, k]) => (
            <span key={k}>
              <span className="block text-[15px] font-semibold">{v}</span>
              <span className="block text-[11px] text-muted">{k}</span>
            </span>
          ))}
        </div>
      </div>
    );

  if (slug === "advisory")
    return (
      <div className={`${card} w-[290px] p-4`}>
        <p className="text-[12px] font-semibold text-muted">Your next step</p>
        <p className="mt-1 text-[17px] font-semibold leading-tight">Open a second branch, or not?</p>
        <ul className="mt-3 space-y-2 text-[13px]">
          {["Where the first branch really earns", "What a second one needs to break even", "Go, wait, or a better option"].map((t, i) => (
            <li key={t} className="flex items-start gap-2">
              <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${i < 2 ? "bg-ink text-lime" : "border border-rule-strong"}`}>{i < 2 && <Check className="size-2.5" strokeWidth={4} />}</span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-lg bg-paper-2 px-3 py-2 text-[12px] text-ink-2">A clear answer, not a thick report.</p>
      </div>
    );

  if (slug === "directory")
    return (
      <div className="w-[290px] space-y-2">
        <div className={`${card} flex items-center gap-2 px-3 py-2.5 text-[13px]`}>
          <Search className="size-4 text-muted" />
          <span className="truncate">Accountant for VAT registration in Dubai</span>
        </div>
        {["Accounting & bookkeeping", "Accounting & tax", "Bookkeeping & VAT"].map((t, i) => (
          <div key={t} className={`${card} flex items-center gap-3 p-3`} style={{ opacity: 1 - i * 0.18 }}>
            <span className="grid size-9 place-items-center rounded-lg bg-paper-2 text-[13px] font-semibold">{i + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="block h-2.5 w-28 rounded bg-ink/80" />
              <span className="mt-1.5 block text-[12px] text-muted">{t} · Dubai</span>
            </span>
          </div>
        ))}
      </div>
    );

  if (slug === "growth")
    return (
      <div className={`${card} w-[290px] p-4`}>
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-semibold text-muted">Enquiries from the site</p>
          <span className="rounded-full bg-lime px-2 py-0.5 text-[11px] font-semibold">KPI</span>
        </div>
        <div className="mt-4 flex h-20 items-end gap-1.5">
          {[30, 38, 34, 46, 52, 49, 61, 70].map((h, i) => (
            <span key={i} className={`flex-1 rounded-t ${i === 7 ? "bg-ink" : "bg-ink/15"}`} style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
          <BadgeCheck className="size-3.5 text-ink" /> Every post and ad approved by our team
        </p>
      </div>
    );

  return (
    <div className={`${card} w-[290px] p-4`}>
      <p className="flex items-center gap-1.5 text-[12px] font-semibold text-muted">
        <Sparkles className="size-3.5" /> Hands-on session
      </p>
      <p className="mt-1 text-[17px] font-semibold leading-tight">AI for owners and teams</p>
      <ol className="mt-3 space-y-1.5 text-[13px]">
        {["Write, reply and plan faster", "Automate one real task", "Leave with tools you'll use tomorrow"].map((t, i) => (
          <li key={t} className="flex gap-2.5 rounded-lg bg-paper-2 px-3 py-2">
            <span className="font-semibold text-muted">{i + 1}</span>
            {t}
          </li>
        ))}
      </ol>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted">
        <GraduationCap className="size-3.5" /> With Operators Room
      </p>
    </div>
  );
}
