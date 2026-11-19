import { Reveal } from "@/components/ui/Reveal";
import { STATS } from "@/lib/site";
import CountUp from "@/components/ui/CountUp";

/** Why this matters: SMEs are most of the UAE economy. */
export default function Numbers() {
  return (
    <section className="section-y bg-ink text-paper">
      <div className="container-x">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:items-end lg:gap-16">
          <div>
            <p className="label !text-paper/60">Why we exist</p>
            <h2 className="display mt-4 text-section">Small businesses run the UAE.</h2>
          </div>
          <p className="text-[19px] leading-relaxed text-paper/70 lg:pb-2">Yet buying one, selling one, or finding a good accountant still runs on word of mouth and forwarded messages. They deserve a proper market.</p>
        </div>
        <Reveal className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-[28px] bg-rule-dark lg:grid-cols-4" stagger={0.08}>
          {STATS.items.map((s) => (
            <div key={s.label} data-reveal className="bg-ink p-6 md:p-8">
              <p className="text-[clamp(2.4rem,5vw,4.4rem)] font-semibold leading-none tracking-tight text-lime tabular-nums">
                <CountUp value={s.value} />
              </p>
              <p className="mt-3 text-[16px] text-paper/75 md:text-[17px]">{s.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
