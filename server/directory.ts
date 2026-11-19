// Directory search over PUBLIC business data. Our own curated list and partner system come later.
//   - GOOGLE_PLACES_KEY set → Google Places (New) Text Search, restricted to the UAE.
//   - otherwise            → OpenStreetMap (Overpass), free and keyless.
// Results are cached for a day so repeat searches are instant and we stay polite to the sources.
import type { Env } from "./util";

export type Place = {
  id: string;
  name: string;
  category: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  hours: string | null;
  rating: number | null;
  reviews: number | null;
  maps: string;
};
export type SearchResult = { q: string; area: string; source: "google" | "osm"; places: Place[] };

const UAE = { s: 22.6, w: 51.5, n: 26.1, e: 56.4 };
// rough boxes around where businesses actually are in each emirate
const AREAS: Record<string, { s: number; w: number; n: number; e: number }> = {
  Dubai: { s: 24.79, w: 54.89, n: 25.36, e: 55.65 },
  "Abu Dhabi": { s: 24.05, w: 54.2, n: 24.6, e: 55.9 },
  Sharjah: { s: 25.22, w: 55.35, n: 25.42, e: 55.65 },
  Ajman: { s: 25.36, w: 55.42, n: 25.47, e: 55.58 },
  "Ras Al Khaimah": { s: 25.55, w: 55.75, n: 26.05, e: 56.15 },
  Fujairah: { s: 25.05, w: 56.2, n: 25.4, e: 56.4 },
  "Umm Al Quwain": { s: 25.45, w: 55.52, n: 25.65, e: 55.75 },
};

/** "accountant for VAT in Sharjah" → area Sharjah, unless the visitor picked one. */
export function pickArea(q: string, area: string) {
  if (AREAS[area]) return area;
  const hit = Object.keys(AREAS).find((a) => new RegExp(`\\b${a}\\b`, "i").test(q));
  return hit || "UAE";
}

export async function searchDirectory(env: Env, rawQ: string, rawArea: string): Promise<SearchResult> {
  const q = rawQ.replace(/\s+/g, " ").trim().slice(0, 120);
  const area = pickArea(q, rawArea);
  const source = env.GOOGLE_PLACES_KEY ? "google" : "osm";

  // a day of caching, keyed by source + query + area
  const key = new Request(`https://cache.local/dir/${source}/${encodeURIComponent(area)}/${encodeURIComponent(q.toLowerCase())}`);
  const cache = typeof caches !== "undefined" ? (caches as unknown as { default?: Cache }).default : undefined;
  try {
    const hit = await cache?.match(key);
    if (hit) return (await hit.json()) as SearchResult;
  } catch {}

  const places = source === "google" ? await google(env.GOOGLE_PLACES_KEY!, q, area) : await osm(q, area);
  const out: SearchResult = { q, area, source, places };
  if (places.length) {
    try {
      await cache?.put(key, new Response(JSON.stringify(out), { headers: { "content-type": "application/json", "cache-control": "max-age=86400" } }));
    } catch {}
  }
  return out;
}

/* ---------------- Google Places ---------------- */

async function google(key: string, q: string, area: string): Promise<Place[]> {
  const box = AREAS[area] || UAE;
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.internationalPhoneNumber,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri,places.primaryTypeDisplayName,places.businessStatus",
    },
    body: JSON.stringify({
      textQuery: area === "UAE" || new RegExp(area, "i").test(q) ? q : `${q} in ${area}`,
      regionCode: "AE",
      languageCode: "en",
      pageSize: 20,
      locationRestriction: { rectangle: { low: { latitude: box.s, longitude: box.w }, high: { latitude: box.n, longitude: box.e } } },
    }),
  });
  if (!res.ok) throw new Error(`google ${res.status}`);
  type G = {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    primaryTypeDisplayName?: { text: string };
    businessStatus?: string;
  };
  const d = (await res.json()) as { places?: G[] };
  return (d.places || [])
    .filter((p) => p.businessStatus !== "CLOSED_PERMANENTLY" && p.displayName?.text)
    .map((p) => ({
      id: `g_${p.id}`,
      name: p.displayName!.text,
      category: p.primaryTypeDisplayName?.text || "Business",
      address: p.formattedAddress || null,
      phone: p.internationalPhoneNumber || null,
      website: p.websiteUri || null,
      email: null,
      hours: null,
      rating: p.rating ?? null,
      reviews: p.userRatingCount ?? null,
      maps: p.googleMapsUri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.displayName!.text)}`,
    }));
}

/* ---------------- OpenStreetMap ---------------- */

type Rule = { test: RegExp; label: string; term: string; tags: string[]; names?: string };
// plain-English words → the OpenStreetMap tags (and name patterns) businesses of that kind carry
const RULES: Rule[] = [
  { test: /account|bookkeep|\bvat\b|audit|\btax|financ/i, label: "Accounting", term: "accounting", tags: ['"office"="accountant"', '"office"="tax_advisor"', '"office"="financial"'], names: "account|audit|bookkeep|chartered|tax" },
  { test: /\blaw|legal|lawyer|advocate|contract|notary|lease/i, label: "Legal", term: "lawyer", tags: ['"office"="lawyer"', '"office"="notary"'], names: "advocate|legal|law firm|lawyers" },
  { test: /\bpro\b|visa|typing|emirates id|licen[cs]e|immigration|amer|tasheel|government/i, label: "PRO & typing", term: "typing", tags: ['"office"="government"'], names: "typing|pro services|amer|tasheel|tadbeer|document clearing|visa" },
  { test: /business setup|company setup|formation|incorporat|free ?zone|setup/i, label: "Business setup", term: "business setup", tags: ['"office"="consulting"'], names: "business setup|company formation|corporate services|business services" },
  { test: /market|advert|brand|social|seo|digital|agency|design/i, label: "Marketing", term: "marketing", tags: ['"office"="advertising_agency"', '"office"="marketing"', '"craft"="signmaker"'], names: "marketing|advertis|digital|media|branding" },
  { test: /fit.?out|interior|renovat|carpent|contract(or|ing)|joinery|shop ?fit/i, label: "Fit-out", term: "interior", tags: ['"shop"="interior_decoration"', '"craft"="carpenter"', '"office"="architect"', '"office"="construction_company"'], names: "fit.?out|interior|decor|joinery|contracting" },
  { test: /\bit\b|software|computer|network|laptop|web|tech|cctv|server/i, label: "IT & software", term: "computer", tags: ['"office"="it"', '"shop"="computer"', '"office"="telecommunication"', '"craft"="electronics_repair"'], names: "computer|technolog|software|it solutions|systems" },
  { test: /\bhr\b|payroll|recruit|staff|manpower|employ|hiring|wps/i, label: "HR & recruitment", term: "manpower", tags: ['"office"="employment_agency"'], names: "manpower|recruit|staffing|employment|payroll" },
  { test: /logistic|deliver|courier|freight|shipping|cargo|storage|warehouse|moving|movers/i, label: "Logistics", term: "logistics", tags: ['"office"="logistics"', '"office"="courier"', '"office"="moving_company"', '"shop"="storage_rental"'], names: "logistic|cargo|freight|courier|shipping|movers" },
  { test: /insur/i, label: "Insurance", term: "insurance", tags: ['"office"="insurance"'], names: "insurance" },
  { test: /real estate|property|broker|realtor/i, label: "Real estate", term: "real estate", tags: ['"office"="estate_agent"'], names: "real estate|properties" },
  { test: /print|signage|sign\b/i, label: "Printing", term: "printing", tags: ['"shop"="copyshop"', '"craft"="printer"', '"craft"="signmaker"'], names: "printing|press|signage" },
  { test: /clean/i, label: "Cleaning", term: "cleaning", tags: ['"office"="cleaning"', '"shop"="dry_cleaning"'], names: "cleaning" },
];
const STOP = new Set("a an and for in at of the to with near me my uae services service company companies best need help find looking".split(" ").concat(Object.keys(AREAS).flatMap((a) => a.toLowerCase().split(" "))));

const OVERPASS = "https://overpass.kumi.systems/api/interpreter";
const UA = { "user-agent": "sme-directory/1.0", accept: "application/json" };

/** fetch that gives up after ms, so one slow source never holds the page */
async function quick(url: string, init: RequestInit, ms: number): Promise<unknown> {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { ...init, signal: c.signal });
    // read the body inside the time limit too: a slow stream counts as no answer
    return r.ok ? await r.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function osm(q: string, area: string): Promise<Place[]> {
  const box = AREAS[area] || UAE;
  const bbox = `${box.s},${box.w},${box.n},${box.e}`;
  const rules = RULES.filter((r) => r.test.test(q));
  const parts: string[] = [];
  for (const r of rules) {
    for (const t of r.tags) parts.push(`nwr[${t}]["name"](${bbox});`);
    if (r.names) parts.push(`nwr["name"~"${r.names}",i][~"^(office|shop|craft)$"~"."](${bbox});`);
  }
  // nothing matched a known kind of business: look for the visitor's own words in business names
  if (!rules.length) {
    const words = q
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w))
      .slice(0, 3);
    if (!words.length) return [];
    parts.push(`nwr["name"~"${words.join("|")}",i][~"^(office|shop|craft)$"~"."](${bbox});`);
  }
  const ql = `[out:json][timeout:20];(${parts.join("")});out center tags 80;`;

  type El = { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };
  // two public OpenStreetMap services at once: Overpass (rich tags, sometimes slow) and Nominatim (fast)
  const words = q.toLowerCase().replace(/[^a-z0-9\s&-]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
  const nq = `${rules[0]?.term || words.slice(0, 4).join(" ")}${area !== "UAE" ? ` ${area}` : ""}`;
  const nUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=en&countrycodes=ae&limit=30&extratags=1&addressdetails=1&bounded=1&viewbox=${box.w},${box.n},${box.e},${box.s}&q=${encodeURIComponent(nq)}`;
  const [op, nm] = await Promise.all([
    quick(OVERPASS, { method: "POST", body: new URLSearchParams({ data: ql }), headers: UA }, 9000),
    quick(nUrl, { headers: UA }, 6000),
  ]);
  if (!op && !nm) throw new Error("The public directory didn't answer. Try again in a moment.");
  const els: El[] = op ? [...((op as { elements?: El[] }).elements || [])] : [];
  if (nm) {
    type N = { osm_type: string; osm_id: number; lat: string; lon: string; name: string; category: string; type: string; extratags?: Record<string, string>; address?: Record<string, string> };
    for (const n of Array.isArray(nm) ? (nm as N[]) : []) {
      if (!n.name || n.category === "highway" || n.category === "place" || n.category === "boundary") continue;
      const a = n.address || {};
      els.push({
        type: n.osm_type,
        id: n.osm_id,
        lat: +n.lat,
        lon: +n.lon,
        tags: {
          ...n.extratags,
          name: n.name,
          [n.category === "building" ? "office" : n.category]: n.type,
          ...(a.road && { "addr:street": a.road }),
          ...(a.house_number && { "addr:housenumber": a.house_number }),
          ...((a.suburb || a.neighbourhood) && { "addr:suburb": a.suburb || a.neighbourhood }),
          ...((a.city || a.town) && { "addr:city": a.city || a.town }),
        },
      });
    }
  }

  const labelOf = (t: Record<string, string>) => {
    const r = rules.find((r) => r.tags.some((x) => { const [k, v] = x.replace(/"/g, "").split("="); return t[k] === v; }));
    if (r) return r.label;
    const raw = t.office || t.shop || t.craft || "Business";
    return /^(yes|company|building|hangar|office)$/.test(raw) ? (rules[0]?.label ?? "Business") : raw.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
  };

  const seen = new Set<string>();
  const out: (Place & { score: number })[] = [];
  for (const e of els) {
    const t = e.tags || {};
    const name = t["name:en"] || t.name;
    if (!name || t.disused || t["disused:office"]) continue;
    const dedupe = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    const lat = e.lat ?? e.center?.lat;
    const lon = e.lon ?? e.center?.lon;
    const address =
      [t["addr:unit"], t["addr:housename"] || t["addr:building"], [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "), t["addr:suburb"] || t["addr:district"], t["addr:city"]]
        .filter(Boolean)
        .join(", ") || null;
    const phone = t.phone || t["contact:phone"] || t["contact:mobile"] || null;
    const website = t.website || t["contact:website"] || t.url || null;
    const email = t.email || t["contact:email"] || null;
    out.push({
      id: `o_${e.type[0]}${e.id}`,
      name,
      category: labelOf(t),
      address,
      phone: phone?.split(";")[0].trim() || null,
      website: website?.split(";")[0].trim() || null,
      email: email?.split(";")[0].trim() || null,
      hours: t.opening_hours || null,
      rating: null,
      reviews: null,
      maps: lat && lon ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${lat},${lon}`)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
      // the most useful first: ways to reach them, then an address
      score: (phone ? 3 : 0) + (website ? 3 : 0) + (email ? 1 : 0) + (address ? 1 : 0),
    });
  }
  return out
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map(({ score: _s, ...p }) => p);
}
