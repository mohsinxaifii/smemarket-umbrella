"use client";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, Loader2, Phone } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { submitLead, isEmail, isPhone, type LeadPayload } from "@/lib/leads";
import Button from "@/components/ui/Button";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

type Select = { name: string; label: string; options: string[]; optional?: boolean };

type Props = {
  type: LeadPayload["type"];
  /** chips the visitor picks from (e.g. what they want help with) */
  topics?: string[];
  topicLabel?: string;
  /** one topic only (radio-style) */
  single?: boolean;
  defaultTopics?: string[];
  /** business name becomes required (directory listings) */
  businessRequired?: boolean;
  businessLabel?: string;
  selects?: Select[];
  /** ask for a website (kept apart from the honeypot) */
  askSite?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
  messageRequired?: boolean;
  submitLabel?: string;
  doneTitle?: string;
  doneBody?: string;
  meta?: Record<string, unknown>;
  compact?: boolean;
};

type Errors = Partial<Record<string, string>>;

export default function LeadForm({
  type,
  topics,
  topicLabel = "What is it about?",
  single,
  defaultTopics = [],
  businessRequired,
  businessLabel = "Business name",
  selects = [],
  askSite,
  messageLabel = "Anything we should know?",
  messagePlaceholder = "A line or two about your business and what you need.",
  messageRequired,
  submitLabel = "Send message",
  doneTitle = "Got it",
  doneBody = "Our team will get back to you within one business day. Want to move faster? Message us on WhatsApp now.",
  meta,
  compact,
}: Props) {
  const [picked, setPicked] = useState<string[]>(defaultTopics);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [name, setName] = useState("");
  const [waPending, setWaPending] = useState<string | null>(null);

  // other parts of the page can drop a question into the message box (e.g. Advisory's common questions)
  const message = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const on = (e: Event) => {
      const { text, topic } = (e as CustomEvent<{ text: string; topic?: string }>).detail;
      if (message.current) {
        message.current.value = text;
        message.current.focus({ preventScroll: true });
      }
      if (topic && topics?.includes(topic)) setPicked((s) => (s.includes(topic) ? s : single ? [topic] : [...s, topic]));
    };
    window.addEventListener(`smem:prefill-${type}`, on);
    return () => window.removeEventListener(`smem:prefill-${type}`, on);
  }, [type, topics, single]);

  const toggle = (t: string) => setPicked((s) => (single ? [t] : s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = (k: string) => String(fd.get(k) || "").trim();
    const err: Errors = {};
    if (!v("name")) err.name = "Please add your name.";
    if (!v("phone") && !v("email")) err.phone = "Add a phone or WhatsApp number, or an email.";
    else if (v("phone") && !isPhone(v("phone"))) err.phone = "That number looks too short.";
    if (v("email") && !isEmail(v("email"))) err.email = "That email doesn't look right.";
    if (businessRequired && !v("business")) err.business = "Please add the company name.";
    if (topics && single && !picked.length) err.topics = "Please choose one.";
    selects.forEach((s) => {
      if (!s.optional && !v(s.name)) err[s.name] = `Please choose a ${s.label.toLowerCase()}.`;
    });
    if (messageRequired && !v("message")) err.message = "Tell us a little about what you need.";
    setErrors(err);
    if (Object.keys(err).length) {
      (e.currentTarget.querySelector("[aria-invalid='true']") as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    setName(v("name").split(" ")[0]);
    const extra: Record<string, unknown> = { ...meta };
    selects.forEach((s) => v(s.name) && (extra[s.label] = v(s.name)));
    if (askSite && v("site")) extra.Website = v("site");
    const res = await submitLead({
      type,
      name: v("name"),
      phone: v("phone"),
      email: v("email"),
      business: v("business"),
      message: v("message"),
      services: picked,
      meta: extra,
      website: v("website"),
    });
    if (res.ok) {
      setWaPending(res.whatsapp ?? null);
      setStatus("done");
    } else {
      setStatus("idle");
      setErrors({ form: res.error });
    }
  }

  if (status === "done" && waPending) return <WhatsAppPending href={waPending} name={name} />;

  if (status === "done")
    return (
      <div className="flex animate-[pageIn_.6s_cubic-bezier(.16,1,.3,1)_both] flex-col items-start gap-5 py-4" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-lime text-ink">
          <Check className="size-6" strokeWidth={3} />
        </span>
        <div>
          <h3 className="display text-3xl">
            {doneTitle}
            {name ? `, ${name}` : ""}.
          </h3>
          <p className="mt-2 max-w-md text-muted">{doneBody}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button href={waLink(`Hi SMEmarket, I just sent you a message${picked.length ? ` about ${picked.join(", ").toLowerCase()}` : ""}. My name is ${name}.`)} icon={<WhatsAppIcon />}>
            Continue on WhatsApp
          </Button>
          <Button href={SITE.phoneHref} variant="outline" icon={<Phone className="size-4" />}>
            Call {SITE.phone}
          </Button>
        </div>
      </div>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {topics && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{topicLabel}</legend>
          <div className="flex flex-wrap gap-2" role={single ? "radiogroup" : undefined}>
            {topics.map((t) => {
              const on = picked.includes(t);
              return (
                <button
                  type="button"
                  key={t}
                  onClick={() => toggle(t)}
                  role={single ? "radio" : undefined}
                  aria-checked={single ? on : undefined}
                  aria-pressed={single ? undefined : on}
                  aria-invalid={single && !!errors.topics}
                  className={clsx("flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition", on ? "border-ink bg-ink text-paper" : "border-rule-strong hover:border-ink")}
                >
                  {on && <Check className="size-3.5" strokeWidth={3} />}
                  {t}
                </button>
              );
            })}
          </div>
          {errors.topics && <span className="mt-1.5 block text-xs text-stamp">{errors.topics}</span>}
        </fieldset>
      )}

      <div className={clsx("grid gap-4", !compact && "sm:grid-cols-2")}>
        <Field label="Your name" error={errors.name}>
          <input name="name" className="field" autoComplete="name" placeholder="Full name" aria-invalid={!!errors.name} />
        </Field>
        <Field label={businessLabel} optional={!businessRequired} error={errors.business}>
          <input name="business" className="field" autoComplete="organization" placeholder="Company LLC" aria-invalid={!!errors.business} />
        </Field>
        <Field label="Phone / WhatsApp" error={errors.phone}>
          <input name="phone" type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="+971 5X XXX XXXX" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Email" optional error={errors.email}>
          <input name="email" type="email" className="field" autoComplete="email" placeholder="you@company.ae" aria-invalid={!!errors.email} />
        </Field>
        {selects.map((s) => (
          <Field key={s.name} label={s.label} optional={s.optional} error={errors[s.name]}>
            <select name={s.name} defaultValue="" className="field appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22><path d=%22M1 1l5 5 5-5%22 stroke=%22%2315130f%22 stroke-width=%221.6%22 fill=%22none%22/></svg>')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10" aria-invalid={!!errors[s.name]}>
              <option value="" disabled>
                Choose one
              </option>
              {s.options.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
        ))}
        {askSite && (
          <Field label="Website" optional>
            <input name="site" type="url" inputMode="url" className="field" autoComplete="url" placeholder="https://" />
          </Field>
        )}
      </div>

      <Field label={messageLabel} optional={!messageRequired} error={errors.message}>
        <textarea ref={message} name="message" rows={compact ? 3 : 4} className="field resize-none" placeholder={messagePlaceholder} aria-invalid={!!errors.message} />
      </Field>

      {errors.form && (
        <p className="rounded-lg border border-stamp/40 bg-stamp/5 px-4 py-3 text-sm text-stamp" role="alert">
          {errors.form}
        </p>
      )}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" size="lg" arrow={status !== "sending"} disabled={status === "sending"} className="w-full sm:w-auto">
          {status === "sending" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Sending
            </span>
          ) : (
            submitLabel
          )}
        </Button>
        <p className="text-sm text-muted">We reply within one business day.</p>
      </div>
    </form>
  );
}

function Field({ label, optional, error, children }: { label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-faint">(optional)</span>}
      </span>
      {children}
      {error && <span className="text-xs text-stamp">{error}</span>}
    </label>
  );
}

/** Shown when the lead went out as a pre-filled WhatsApp chat: it only reaches us once they press send. */
export function WhatsAppPending({ href, name }: { href: string; name?: string }) {
  return (
    <div className="flex animate-[pageIn_.6s_cubic-bezier(.16,1,.3,1)_both] flex-col items-start gap-5 py-4" role="status">
      <span className="grid size-12 place-items-center rounded-full bg-lime text-ink">
        <WhatsAppIcon className="size-6" />
      </span>
      <div>
        <h3 className="display text-3xl">One last tap{name ? `, ${name}` : ""}.</h3>
        <p className="mt-2 max-w-md text-ink-2">
          We&apos;ve opened WhatsApp with your details filled in. Press <span className="font-semibold text-ink">send</span> there and our team will reply within one business day.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button href={href} icon={<WhatsAppIcon />}>
          Open WhatsApp again
        </Button>
        <Button href={SITE.phoneHref} variant="outline" icon={<Phone className="size-4" />}>
          Or call {SITE.phone}
        </Button>
      </div>
    </div>
  );
}
