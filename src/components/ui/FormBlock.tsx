import { Avatar } from "@/components/ui/Character";
import type { Body, Cast, Mood } from "@/components/ui/Character";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import { waLink } from "@/lib/site";

/** A form on a card, with who will read it and the WhatsApp alternative beside it. */
export default function FormBlock({
  id,
  eyebrow,
  title,
  intro,
  person,
  tone,
  wa,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  intro: string;
  person: { who: Cast; mood: Mood; body: Body; role: string };
  tone: string;
  wa: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-hide-bar className="section-y bg-paper">
      <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="label">{eyebrow}</p>
          <h2 className="display mt-4 text-section">{title}</h2>
          <p className="mt-5 max-w-md text-[19px] leading-relaxed text-ink-2">{intro}</p>
          <div className="mt-8 flex items-center gap-4">
            <Avatar who={person.who} mood={person.mood} body={person.body} size={64} tone={tone} />
            <p className="text-[16px] leading-snug">
              <span className="block font-semibold">A person reads every message</span>
              <span className="text-muted">and replies within one business day.</span>
            </p>
          </div>
          <a href={waLink(wa)} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex h-12 items-center gap-2.5 rounded-full bg-[#25D366] px-5 text-[15px] font-semibold text-white transition hover:brightness-95">
            <WhatsAppIcon className="size-5" /> Rather WhatsApp us?
          </a>
        </div>
        <div className="min-w-0 rounded-[28px] bg-card p-6 shadow-[0_40px_80px_-60px_rgba(21,19,15,.6)] ring-1 ring-rule md:p-9">{children}</div>
      </div>
    </section>
  );
}
