import { waLink } from "./site";

export type LeadPayload = {
  type: "contact" | "brokerage" | "advisory" | "directory-listing" | "listing";
  name: string;
  phone: string;
  email?: string;
  business?: string;
  services?: string[];
  message?: string;
  meta?: Record<string, unknown>;
  /** honeypot, must stay empty */
  website?: string;
};

/** `whatsapp` is set when the lead went out as a pre-filled WhatsApp chat, which only reaches us once the visitor presses send. */
export type LeadResult = { ok: true; id: string; whatsapp?: string } | { ok: false; error: string };

/**
 * Where leads go on the static build (Cloudflare Pages).
 *  - Web3Forms (recommended, free): set NEXT_PUBLIC_LEAD_ACCESS_KEY to your access key; each lead is emailed to you.
 *    The key is meant to be public, so it's fine in the browser bundle.
 *  - Anything else that accepts a JSON POST (Formspree, Make, Zapier…): set NEXT_PUBLIC_LEAD_ENDPOINT to its URL.
 */
const ACCESS_KEY = process.env.NEXT_PUBLIC_LEAD_ACCESS_KEY || "";
const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT || (ACCESS_KEY ? "https://api.web3forms.com/submit" : "");
const STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/** Turns a lead into a ready-to-send WhatsApp message to our number. */
function leadMessage(l: LeadPayload) {
  const lines = [
    `Hi SMEmarket, I'd like to talk to your team.`,
    "",
    `Name: ${l.name}`,
    `Phone: ${l.phone}`,
    l.email && `Email: ${l.email}`,
    l.business && `Business: ${l.business}`,
    l.services?.length && `About: ${l.services.join(", ")}`,
    l.meta && Object.entries(l.meta).filter(([k]) => k !== "source").map(([k, v]) => `${k}: ${v}`).join("\n"),
    l.message && `Message: ${l.message}`,
  ];
  return lines.filter((x, i): x is string => typeof x === "string" && (x !== "" || i === 1)).join("\n");
}

/**
 * Sends a lead.
 *  1. Saves it to our own database (/api/leads), where the team sees it in /admin. A directory listing
 *     also goes to /api/providers for review.
 *  2. If a Web3Forms key is set, also emails it to the team (best effort).
 *  3. If our API can't be reached and there's no email fallback, opens WhatsApp with the details filled in,
 *     so no lead is ever lost. (Called from the submit handler, so the new tab isn't blocked.)
 */
export async function submitLead(lead: LeadPayload): Promise<LeadResult> {
  if (lead.website) return { ok: true, id: "ignored" }; // honeypot: quietly drop bots
  const post = (path: string, data: unknown) =>
    fetch(path, { method: "POST", headers: { "content-type": "application/json", "x-sm": "1", Accept: "application/json" }, body: JSON.stringify(data) });

  const page = typeof window !== "undefined" ? window.location.pathname : "";
  let saved = false;
  try {
    const res = await post("/api/leads", { ...lead, page });
    saved = res.ok;
    if (saved && lead.type === "directory-listing") {
      const m = (lead.meta || {}) as Record<string, string>;
      await post("/api/providers", { company: lead.business, category: m.Category, area: m.Area, website: m.Website, phone: lead.phone, email: lead.email, name: lead.name, description: lead.message });
    }
  } catch {
    saved = false;
  }

  const email = ENDPOINT
    ? fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...lead,
          page,
          submittedAt: new Date().toISOString(),
          ...(ACCESS_KEY && {
            access_key: ACCESS_KEY,
            subject: `New ${lead.type} from ${lead.name}${lead.business ? ` (${lead.business})` : ""}`,
            from_name: "SMEmarket website",
            services: lead.services?.join(", ") || "",
            meta: lead.meta ? JSON.stringify(lead.meta) : "",
          }),
        }),
      })
        .then((r) => r.ok)
        .catch(() => false)
    : Promise.resolve(false);

  if (saved) {
    void email;
    return { ok: true, id: "saved" };
  }
  if (await email) return { ok: true, id: "emailed" };
  if (STATIC || !ENDPOINT) {
    const href = waLink(leadMessage(lead));
    window.open(href, "_blank", "noopener,noreferrer");
    return { ok: true, id: "whatsapp", whatsapp: href };
  }
  return { ok: false, error: "Couldn't reach the server. Please try WhatsApp or call us." };
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const isPhone = (v: string) => v.replace(/[^\d]/g, "").length >= 8;

/**
 * Emails the team about something that happened on the marketplace (e.g. a new listing) through
 * the same Web3Forms inbox as the lead forms. Best effort: the record is already saved in /admin either way.
 * Never pass ID documents or passwords here.
 */
export function notifyTeam(subject: string, fields: Record<string, unknown>) {
  if (!ENDPOINT) return;
  const clean = Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  void fetch(ENDPOINT, {
    method: "POST",
    keepalive: true,
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...clean,
      page: typeof window !== "undefined" ? window.location.pathname : "",
      submittedAt: new Date().toISOString(),
      ...(ACCESS_KEY && { access_key: ACCESS_KEY, subject, from_name: "SMEmarket website" }),
    }),
  }).catch(() => {});
}
