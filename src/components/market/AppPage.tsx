/** Shell for marketplace pages: room for the fixed header, a heading row, then the content. */
export default function AppPage({ eyebrow, title, intro, aside, children, tone = "bg-paper" }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; aside?: React.ReactNode; children: React.ReactNode; tone?: string }) {
  return (
    <section className={`${tone} min-h-[80vh] pb-24 pt-[136px] md:pt-[156px]`}>
      <div className="container-x">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            {eyebrow && <p className="label">{eyebrow}</p>}
            <h1 className="display mt-3 text-[clamp(2.2rem,min(4.6vw,8vh),4rem)]">{title}</h1>
            {intro && <div className="mt-3 max-w-2xl text-[18px] leading-relaxed text-ink-2">{intro}</div>}
          </div>
          {aside}
        </div>
        <div className="mt-8 md:mt-10">{children}</div>
      </div>
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const cls = { info: "bg-paper-2 text-ink-2", error: "border border-stamp/40 bg-stamp/5 text-stamp", ok: "bg-lime/60 text-ink" }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-[15px] ${cls}`}>
      {children}
    </div>
  );
}

export function Field({ label, hint, optional, error, children }: { label: string; hint?: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[15px] font-medium">
        {label} {optional && <span className="font-normal text-faint">(optional)</span>}
      </span>
      {children}
      {hint && !error && <span className="text-[13px] text-muted">{hint}</span>}
      {error && <span className="text-[13px] text-stamp">{error}</span>}
    </label>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-dashed border-rule-strong px-6 py-12 text-center">
      <p className="text-[19px] font-semibold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-[16px] text-ink-2">{children}</div>}
    </div>
  );
}

export const SELECT_CLS =
  "field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%2315130f%22 stroke-width=%221.6%22 fill=%22none%22/></svg>')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10";
