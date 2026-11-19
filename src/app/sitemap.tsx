import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// the static build serves folder URLs, so list them with the trailing slash it redirects to
const slash = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" ? "/" : "";
const PUBLIC = ["/", "/listings", "/sell", "/brokerage", "/directory", "/advisory", "/about", "/contact", "/privacy"];
const PRIORITY: Record<string, number> = { "/": 1, "/listings": 0.95, "/sell": 0.9, "/brokerage": 0.9, "/directory": 0.8, "/advisory": 0.8, "/about": 0.6, "/contact": 0.6, "/privacy": 0.2 };

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC.map((p) => ({ url: p === "/" ? `${SITE.url}/` : `${SITE.url}${p}${slash}`, lastModified: now, priority: PRIORITY[p] ?? 0.5 }));
}
