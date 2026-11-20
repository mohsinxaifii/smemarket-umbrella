import type { Body, Cast, Mood } from "@/components/ui/Character";

export const SITE = {
  name: "SME Market",
  /** Where this site lives. Override with NEXT_PUBLIC_SITE_URL for a staging copy. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.smemarket.ae").replace(/\/$/, ""),
  tagline: "Everything your SME needs, in one place.",
  description:
    "Buy or sell a UAE business, get practical advice, find trusted providers, grow with AI-powered marketing and train your team. One place for the work of running an SME.",
  phone: "+971 52 452 9187",
  phoneHref: "tel:+971524529187",
  whatsapp: "971524529187",
  email: "admin@smemarket.ae",
  legal: "SME Market L.L.C-FZ",
  address: "Meydan Free Zone, Dubai, UAE",
  licence: "2654774.01",
};

/** Marketplace pages on this site (the API behind them lives in functions/ and server/). */
export const APP = {
  listings: "/listings",
  listing: (id: string) => `/listing?id=${encodeURIComponent(id)}`,
  sell: "/sell",
  /** team only: not linked anywhere on the public site */
  login: "/login",
  admin: "/admin",
};

export const GROWTH = {
  url: "https://growth.smemarket.ae",
  assessment: "https://growth.smemarket.ae/assessment",
  pricing: "https://growth.smemarket.ae/pricing",
};
export const TRAINING_URL = "https://operatorsroom.ai";

/** 1200×630 share card (public/og.png). */
export const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "SME Market: everything your SME needs, in one place" };

export function waLink(message = "Hi SMEmarket, I have a question.") {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function mailLink(subject = "Enquiry from smemarket.ae", body = "") {
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
}

/** UAE Ministry of Economy and Tourism, Jan 2026 (as quoted on the current site). */
export const STATS = {
  source: "UAE Ministry of Economy and Tourism, Jan 2026",
  sourceUrl:
    "https://www.moet.gov.ae/en/-/%D8%A7%D9%84%D9%86%D8%B3%D8%AE%D8%A9-%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%8A%D8%A9-%D9%84%D9%84%D9%85%D9%84%D8%AA%D9%82%D9%89-%D8%A7%D9%84%D9%88%D8%B7%D9%86%D9%8A-%D9%84%D9%84%D9%85%D8%B4%D8%A7%D8%B1%D9%8A%D8%B9-%D8%A7%D9%84%D8%B5%D8%BA%D9%8A%D8%B1%D8%A9-",
  items: [
    { value: "1.3M+", label: "SMEs in the UAE" },
    { value: "~95%", label: "of UAE companies" },
    { value: "63%", label: "of the UAE economy" },
    { value: "85%+", label: "of private-sector jobs" },
  ],
};

export type PillarIcon = "handshake" | "compass" | "search" | "trending" | "graduation";

export type Pillar = {
  slug: string;
  num: string;
  name: string;
  short: string;
  /** what the owner is trying to do, in their words */
  job: string;
  line: string;
  bullets: string[];
  href: string;
  external?: boolean;
  cta: string;
  partner?: string;
  icon: PillarIcon;
  tone: string;
  person: { who: Cast; mood: Mood; body: Body; role: string };
};

export const PILLARS: Pillar[] = [
  {
    slug: "brokerage",
    num: "01",
    name: "Business brokerage",
    short: "Buy & sell",
    job: "Buy or sell a business",
    line: "Help buying or selling an SME, with every listing checked and every buyer verified.",
    bullets: ["Curated listings, reviewed before they go up", "Ask us about any listing", "Free to list. 5% only when it sells"],
    href: "/brokerage",
    cta: "Buy or sell",
    icon: "handshake",
    tone: "bg-[#f6e3b5]",
    person: { who: "karim", mood: "explaining", body: "Paper", role: "Your broker" },
  },
  {
    slug: "advisory",
    num: "02",
    name: "Strategy & advisory",
    short: "Advice",
    job: "Make a big decision",
    line: "Practical advice from people who've run and invested in businesses.",
    bullets: ["Positioning: where you win and why", "A plan for the next stage of the business", "A clear next step, not a thick report"],
    href: "/advisory",
    cta: "Ask about advisory",
    icon: "compass",
    tone: "bg-[#dbe6ef]",
    person: { who: "priya", mood: "calm", body: "Explaining", role: "Your advisor" },
  },
  {
    slug: "directory",
    num: "03",
    name: "SME services directory",
    short: "Directory",
    job: "Find someone to help",
    line: "Find PRO, accounting, marketing, fit-out and more, anywhere in the UAE.",
    bullets: ["Type what you need and where", "A short list of real providers", "PRO, accounting, legal, IT, fit-out and more"],
    href: "/directory",
    cta: "Find a provider",
    icon: "search",
    tone: "bg-[#d5ece4]",
    person: { who: "james", mood: "happy", body: "Device", role: "Your finder" },
  },
  {
    slug: "growth",
    num: "04",
    name: "SME Growth Studio",
    short: "Growth",
    job: "Bring in more customers",
    line: "Marketing that brings in customers: SEO, ads, outreach, social, an enquiry desk and websites.",
    bullets: ["Six services, one clear price each", "AI agents do the work, our team approves it", "One number per service on your dashboard"],
    href: GROWTH.url,
    external: true,
    cta: "Visit Growth Studio",
    icon: "trending",
    tone: "bg-[#e9f1c9]",
    person: { who: "zara", mood: "excited", body: "PointingUp", role: "Your growth lead" },
  },
  {
    slug: "training",
    num: "05",
    name: "AI trainings",
    short: "Training",
    job: "Get the team using AI",
    line: "Hands-on AI training for owners and teams, in collaboration with Operators Room.",
    bullets: ["Built for owners and operators", "Hands-on, with your own work", "Tools your team can use the next day"],
    href: TRAINING_URL,
    external: true,
    cta: "Visit Operators Room",
    partner: "In collaboration with Operators Room",
    icon: "graduation",
    tone: "bg-[#e3dcf2]",
    person: { who: "faisal", mood: "excited", body: "Explaining", role: "Your trainer" },
  },
];

export const getPillar = (slug: string) => PILLARS.find((p) => p.slug === slug)!;

/** How a deal stays safe (from the current site, word for word in substance). */
export const TRUST = [
  { t: "Every listing is reviewed by us", d: "A listing is checked before it goes up. Sending us a form does not publish one." },
  { t: "Ask us about any listing", d: "No account and no paperwork to browse. Message us about a business and a person replies within one business day." },
  { t: "One team handles every enquiry", d: "Buyers ask us, not the seller. We answer their questions and only bring serious buyers forward." },
  { t: "Your business name kept private", d: "Listings show the industry, area and figures. We share the name only with buyers we have spoken to." },
];

export const FEES = [
  { k: "Listing", v: "Free", d: "Listing is free. If it doesn't sell, you don't pay anything." },
  { k: "Success fee", v: "5%", d: "5% of the final sale price, only when your business sells." },
  { k: "When", v: "At the SPA", d: "Payable on signing the Sale & Purchase Agreement. Once the SPA is signed, our work is done." },
];

export const INDUSTRIES = ["Food & beverage", "Retail", "Beauty & grooming", "Health & fitness", "Education", "Services", "E-commerce", "Manufacturing", "Logistics", "Technology", "Hospitality", "Other"];

export const DIRECTORY_CATEGORIES = ["PRO services", "Accounting & bookkeeping", "Marketing", "Fit-out", "Legal", "IT & software", "HR & payroll", "Logistics"];
export const EMIRATES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"];

export const FAQ = [
  { q: "What is SMEmarket?", a: "One place for the work of running an SME in the UAE. Buy or sell a business, get practical advice, find providers, grow with our marketing studio, and train your team on AI." },
  { q: "Do I need an account?", a: "No. Browse every listing freely, ask us about any of them, and list your own business with a short form." },
  { q: "How much does it cost to list my business?", a: "Listing is free. We charge a 5% success fee on the final sale price, payable only when the Sale & Purchase Agreement is signed. If it doesn't sell, you pay nothing." },
  { q: "Who can see my listing's details?", a: "Everyone sees the industry, area and figures. Your business name and anything else you share stay with our team until we've spoken to a serious buyer." },
  { q: "Are the figures on listings checked?", a: "We review every listing before it goes up. Price, sales and profit stay claims until a bank statement, VAT return or the books back them up." },
  { q: "Is the directory a recommendation?", a: "No. It's a starting point for finding UAE providers. We look up real businesses for what you need and show a short list. Always check them yourself." },
  { q: "How are growth services priced?", a: "Each service has its own monthly price and one number we report on, and the website is a one-time payment. Full prices are on the Growth Studio site." },
];

/** Our own sites (this one, the app, Growth Studio) open in the same tab; anything else opens a new one. */
export const isOwnSite = (href: string) => /^https:\/\/([a-z0-9-]+\.)?smemarket\.ae(\/|$)/.test(href);
export const linkProps = (href: string) =>
  href.startsWith("http") && !isOwnSite(href) ? { target: "_blank", rel: "noopener noreferrer" } : {};

/** Pages this site renders. Any other path on the same domain belongs to the app, so it gets a normal page load. */
export const SITE_ROUTES = ["/", "/brokerage", "/advisory", "/directory", "/about", "/contact", "/privacy", "/listings", "/listing", "/sell", "/login", "/admin"];
