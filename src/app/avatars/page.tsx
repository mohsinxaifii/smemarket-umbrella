import type { Metadata } from "next";
import Character, { type Cast } from "@/components/ui/Character";

/** Internal: the same eight people in different avatar styles, for the team to pick from. Not linked or indexed. */
export const metadata: Metadata = { title: "Avatar options", robots: { index: false, follow: false } };

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const TONES = ["#f6e3b5", "#e3dcf2", "#d5ece4", "#f4d6cc", "#dbe7f5", "#e8f0c9", "#f6e3b5", "#e3dcf2"];
const CURRENT: Cast[] = ["lina", "rashid", "zara", "priya", "james", "omar", "aisha", "karim"];

const STYLES = [
  { key: "notionists", name: "Notionists", note: "Hand-drawn line art, like the current style but cleaner and friendlier.", licence: "Free, no credit needed (CC0)" },
  { key: "lorelei", name: "Lorelei", note: "Soft, minimal line faces. Calm and modern.", licence: "Free, no credit needed (CC0)" },
  { key: "avataaars", name: "Avataaars", note: "Flat colour cartoon people. Very familiar, a bit playful.", licence: "Free for commercial use" },
  { key: "micah", name: "Micah", note: "Bold flat colour, editorial feel.", licence: "Free, credit to the artist required (CC BY 4.0)" },
  { key: "personas", name: "Personas", note: "Rounded, friendly flat colour.", licence: "Free, credit required (CC BY 4.0)" },
  { key: "toonHead", name: "Toon Head", note: "Chunky cartoon heads with lots of character.", licence: "Free, credit required (CC BY 4.0)" },
  { key: "dylan", name: "Dylan", note: "Simple shapes, very minimal.", licence: "Free, credit required (CC BY 4.0)" },
];

function Row({ n, name, note, licence, children }: { n: number; name: string; note: string; licence: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[28px] bg-card p-6 ring-1 ring-rule md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="text-[24px] font-semibold tracking-tight">
          <span className="mr-2 text-muted">{n}.</span>
          {name}
        </h2>
        <span className="rounded-full bg-paper-2 px-3 py-1 text-[13px] font-semibold">{licence}</span>
      </div>
      <p className="mt-1 text-[16px] text-ink-2">{note}</p>
      <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8">{children}</div>
    </section>
  );
}

export default function AvatarsPage() {
  return (
    <section className="bg-paper pb-24 pt-[108px] md:pt-[128px]">
      <div className="container-x">
        <p className="label">Internal · for the team</p>
        <h1 className="display mt-3 text-[clamp(2.4rem,4.6vw,4rem)]">Pick the people.</h1>
        <p className="mt-4 max-w-2xl text-[18px] text-ink-2">
          The same eight people in eight styles. Pick a number. Whichever we choose replaces the characters everywhere on the site, in our colours. Options 2 to 8 are head-and-shoulders only, so the people standing along the bottom of the home page would become a row of portraits.
        </p>

        <div className="mt-10 grid gap-5">
          <Row n={1} name="Current: Open Peeps" note="Hand-drawn black and white, full body. What the site uses now." licence="Free, no credit needed (CC0)">
            {CURRENT.map((who, i) => (
              <span key={who} className="aspect-square overflow-hidden rounded-full" style={{ background: TONES[i] }}>
                <Character who={who} mood="happy" body="Shirt" size={160} className="mx-auto translate-y-[8%]" />
              </span>
            ))}
          </Row>
          {STYLES.map((s, k) => (
            <Row key={s.key} n={k + 2} name={s.name} note={s.note} licence={s.licence}>
              {CURRENT.map((who, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={who} src={`${BASE}/avatar-options/${s.key}/${i}.svg`} alt="" width={160} height={160} loading="lazy" className="aspect-square w-full rounded-full" style={{ background: TONES[i] }} />
              ))}
            </Row>
          ))}
        </div>
      </div>
    </section>
  );
}
