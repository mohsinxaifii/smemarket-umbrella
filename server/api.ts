import { currentUser, endSession, login, requireAdmin, requireUser, signup, startSession } from "./auth";
import { searchDirectory } from "./directory";
import { getFile, putFile } from "./files";
import { type Env, type User, HttpError, body, fail, id, isEmail, json, now, num, str } from "./util";

/*
 * SMEmarket marketplace API. One router for everything under /api.
 * Every state-changing request must carry the header "x-sm: 1" (the site's fetch helper adds it):
 * browsers can't send a custom header cross-site without a CORS preflight we never allow,
 * so together with SameSite=Lax cookies this blocks cross-site request forgery.
 */

type Ctx = { req: Request; env: Env; url: URL; params: string[] };
type Handler = (c: Ctx) => Promise<Response>;
const routes: { method: string; parts: string[]; fn: Handler }[] = [];
const route = (method: string, path: string, fn: Handler) => routes.push({ method, parts: path.split("/").filter(Boolean), fn });

const NDA_VERSION = "2026-11";
const MAX_ID = 8 * 1024 * 1024;
const MAX_DOC = 15 * 1024 * 1024;

/* ───────────── listings: shapes and access ───────────── */

type ListingRow = {
  id: string;
  seller_id: string;
  status: string;
  title: string;
  industry: string;
  city: string;
  area: string | null;
  asking_price: number;
  revenue: number | null;
  profit: number | null;
  years_trading: number | null;
  employees: number | null;
  rent: number | null;
  lease: string | null;
  reason: string | null;
  summary: string | null;
  business_name: string;
  confidential: string | null;
  review_note: string | null;
  created_at: number;
  updated_at: number;
};

/** What anyone can see: no name, no rent/lease/reason, no confidential notes. */
const publicListing = (l: ListingRow) => ({
  id: l.id,
  status: l.status,
  title: l.title,
  industry: l.industry,
  city: l.city,
  area: l.area,
  asking_price: l.asking_price,
  revenue: l.revenue,
  profit: l.profit,
  multiple: l.profit ? Math.round((l.asking_price / l.profit) * 10) / 10 : null,
  years_trading: l.years_trading,
  employees: l.employees,
  summary: l.summary,
  created_at: l.created_at,
});
const privateListing = (l: ListingRow) => ({
  ...publicListing(l),
  business_name: l.business_name,
  rent: l.rent,
  lease: l.lease,
  reason: l.reason,
  confidential: l.confidential,
});

async function getListing(env: Env, listingId: string) {
  return (await env.DB.prepare("SELECT * FROM listings WHERE id = ?").bind(listingId).first<ListingRow>()) ?? fail(404, "That business isn't listed.");
}

/** What this user may do with this listing. */
async function relation(env: Env, l: ListingRow, u: User | null) {
  if (!u) return { owner: false, admin: false, nda: null as null | { id_status: string }, access: null as null | string, unlocked: false };
  const owner = l.seller_id === u.id;
  const admin = u.role === "admin";
  const nda = await env.DB.prepare("SELECT id_status FROM ndas WHERE user_id = ?").bind(u.id).first<{ id_status: string }>();
  const acc = await env.DB.prepare("SELECT status FROM access WHERE listing_id = ? AND buyer_id = ?").bind(l.id, u.id).first<{ status: string }>();
  const unlocked = owner || admin || (acc?.status === "approved" && nda?.id_status === "approved");
  return { owner, admin, nda, access: acc?.status ?? null, unlocked };
}

/* ───────────── auth ───────────── */

route("POST", "auth/signup", async ({ req, env, url }) => {
  const b = await body(req);
  const name = str(b.name, 120);
  const email = str(b.email, 200);
  const phone = str(b.phone, 40);
  const password = typeof b.password === "string" ? b.password : "";
  if (!name) fail(400, "Please add your name.");
  if (!isEmail(email)) fail(400, "Please add a valid email.");
  if (password.length < 8) fail(400, "Use at least 8 characters for your password.");
  const user = await signup(env, { name, email, phone, password });
  const cookie = await startSession(env, user.id, url.protocol === "https:");
  return json({ user }, { headers: { "set-cookie": cookie } });
});

route("POST", "auth/login", async ({ req, env, url }) => {
  const b = await body(req);
  const userId = await login(env, str(b.email, 200), typeof b.password === "string" ? b.password : "");
  const cookie = await startSession(env, userId, url.protocol === "https:");
  return json({ ok: true }, { headers: { "set-cookie": cookie } });
});

route("POST", "auth/logout", async ({ req, env }) => json({ ok: true }, { headers: { "set-cookie": await endSession(env, req) } }));

route("GET", "me", async ({ req, env }) => {
  const user = await currentUser(env, req);
  if (!user) return json({ user: null });
  const nda = await env.DB.prepare("SELECT full_name, id_status, signed_at FROM ndas WHERE user_id = ?").bind(user.id).first();
  return json({ user, nda });
});

/* ───────────── browse and view ───────────── */

route("GET", "listings", async ({ req, env, url }) => {
  const where = ["status = 'live'"];
  const args: (string | number)[] = [];
  const city = str(url.searchParams.get("city"), 60);
  const industry = str(url.searchParams.get("industry"), 60);
  const q = str(url.searchParams.get("q"), 80);
  const min = num(url.searchParams.get("min"));
  const max = num(url.searchParams.get("max"));
  if (city) (where.push("city = ?"), args.push(city));
  if (industry) (where.push("industry = ?"), args.push(industry));
  if (min !== null) (where.push("asking_price >= ?"), args.push(min));
  if (max !== null && max > 0) (where.push("asking_price <= ?"), args.push(max));
  if (q) (where.push("(title LIKE ? OR summary LIKE ? OR area LIKE ? OR industry LIKE ?)"), args.push(...Array(4).fill(`%${q}%`)));
  const order = { price_asc: "asking_price ASC", price_desc: "asking_price DESC", profit: "profit DESC" }[url.searchParams.get("sort") || ""] || "created_at DESC";
  const { results } = await env.DB.prepare(`SELECT * FROM listings WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT 200`).bind(...args).all<ListingRow>();
  const facets = await env.DB.prepare("SELECT city, industry FROM listings WHERE status = 'live'").all<{ city: string; industry: string }>();
  // which of these the visitor has saved, so cards can show their bookmark state
  const me = await currentUser(env, req);
  const saved = me ? (await env.DB.prepare("SELECT listing_id FROM saved WHERE user_id = ?").bind(me.id).all<{ listing_id: string }>()).results.map((r) => r.listing_id) : [];
  return json({
    saved,
    listings: results.map(publicListing),
    cities: [...new Set(facets.results.map((r) => r.city))].sort(),
    industries: [...new Set(facets.results.map((r) => r.industry))].sort(),
  });
});

route("GET", "listings/:id", async ({ req, env, params }) => {
  const u = await currentUser(env, req);
  const l = await getListing(env, params[0]);
  const rel = await relation(env, l, u);
  if (l.status !== "live" && !rel.owner && !rel.admin) fail(404, "That business isn't listed.");
  const docs = rel.unlocked
    ? (await env.DB.prepare("SELECT id, name, kind, size, created_at FROM docs WHERE listing_id = ? ORDER BY created_at").bind(l.id).all()).results
    : (await env.DB.prepare("SELECT name, kind FROM docs WHERE listing_id = ? ORDER BY created_at").bind(l.id).all()).results;
  const saved = u ? !!(await env.DB.prepare("SELECT 1 FROM saved WHERE user_id = ? AND listing_id = ?").bind(u.id, l.id).first()) : false;
  const thread = u ? await env.DB.prepare("SELECT id FROM threads WHERE listing_id = ? AND buyer_id = ?").bind(l.id, u.id).first<{ id: string }>() : null;
  return json({
    listing: rel.unlocked ? { ...privateListing(l), review_note: rel.owner || rel.admin ? l.review_note : undefined } : publicListing(l),
    docs,
    me: { signedIn: !!u, owner: rel.owner, admin: rel.admin, nda: rel.nda?.id_status ?? null, access: rel.access, unlocked: rel.unlocked, saved, thread: thread?.id ?? null },
  });
});

route("POST", "listings/:id/save", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const l = await getListing(env, params[0]);
  const had = await env.DB.prepare("SELECT 1 FROM saved WHERE user_id = ? AND listing_id = ?").bind(u.id, l.id).first();
  if (had) await env.DB.prepare("DELETE FROM saved WHERE user_id = ? AND listing_id = ?").bind(u.id, l.id).run();
  else await env.DB.prepare("INSERT INTO saved (user_id, listing_id, created_at) VALUES (?, ?, ?)").bind(u.id, l.id, now()).run();
  return json({ saved: !had });
});

/* ───────────── selling ───────────── */

route("POST", "listings", async ({ req, env }) => {
  const u = await requireUser(env, req);
  const b = await body(req);
  const v = {
    business_name: str(b.business_name, 160),
    title: str(b.title, 120),
    industry: str(b.industry, 60),
    city: str(b.city, 60),
    area: str(b.area, 80) || null,
    asking_price: num(b.asking_price),
    revenue: num(b.revenue),
    profit: num(b.profit),
    years_trading: num(b.years_trading),
    employees: num(b.employees),
    rent: num(b.rent),
    lease: str(b.lease, 200) || null,
    reason: str(b.reason, 600) || null,
    summary: str(b.summary, 1500) || null,
  };
  if (!v.business_name) fail(400, "Please add the business name. Buyers only see it once you approve them.");
  if (!v.industry || !v.city) fail(400, "Please choose an industry and a city.");
  if (!v.asking_price) fail(400, "Please add an asking price.");
  const title = v.title || `${v.industry} business for sale`;
  const lid = id(9);
  const t = now();
  await env.DB.prepare(
    `INSERT INTO listings (id, seller_id, status, title, industry, city, area, asking_price, revenue, profit, years_trading, employees, rent, lease, reason, summary, business_name, created_at, updated_at)
     VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(lid, u.id, title, v.industry, v.city, v.area, v.asking_price, v.revenue, v.profit, v.years_trading, v.employees, v.rent, v.lease, v.reason, v.summary, v.business_name, t, t)
    .run();
  return json({ id: lid, status: "pending" });
});

route("POST", "listings/:id/withdraw", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const l = await getListing(env, params[0]);
  if (l.seller_id !== u.id && u.role !== "admin") fail(403, "Not your listing.");
  await env.DB.prepare("UPDATE listings SET status = 'withdrawn', updated_at = ? WHERE id = ?").bind(now(), l.id).run();
  return json({ ok: true });
});

/* ───────────── NDA and access ───────────── */

route("POST", "nda", async ({ req, env }) => {
  const u = await requireUser(env, req);
  const form = await req.formData().catch(() => fail(400, "Invalid form."));
  const f = (k: string, max = 200) => str(form!.get(k), max);
  const full_name = f("full_name", 120);
  const signature = f("signature", 120);
  if (!full_name || !signature) fail(400, "Please type your full name and signature.");
  if (form!.get("agree") !== "yes") fail(400, "Please confirm you agree to the NDA.");
  const file = form!.get("id_doc");
  let key: string | null = null;
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const doc = file as unknown as File;
    if (doc.size > MAX_ID) fail(400, "That file is over 8 MB. A phone photo is fine.");
    if (!/^(image\/(jpeg|png|webp|heic)|application\/pdf)$/.test(doc.type)) fail(400, "Please upload a photo (JPG or PNG) or a PDF of your ID.");
    key = `ids/${u.id}/${id(8)}`;
    await putFile(env, key, await doc.arrayBuffer(), doc.type);
  }
  const existing = await env.DB.prepare("SELECT id_doc_key, id_status FROM ndas WHERE user_id = ?").bind(u.id).first<{ id_doc_key: string | null; id_status: string }>();
  if (!key && !existing?.id_doc_key) fail(400, "Please upload a photo of your Emirates ID or passport.");
  await env.DB.prepare(
    `INSERT INTO ndas (user_id, full_name, company, signature, budget, funding, timeline, id_doc_key, id_status, ip, user_agent, version, signed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET full_name = excluded.full_name, company = excluded.company, signature = excluded.signature, budget = excluded.budget,
       funding = excluded.funding, timeline = excluded.timeline, id_doc_key = COALESCE(excluded.id_doc_key, ndas.id_doc_key),
       id_status = CASE WHEN excluded.id_doc_key IS NULL THEN ndas.id_status ELSE 'pending' END,
       ip = excluded.ip, user_agent = excluded.user_agent, version = excluded.version, signed_at = excluded.signed_at`,
  )
    .bind(u.id, full_name, f("company", 120) || null, signature, f("budget") || null, f("funding") || null, f("timeline") || null, key, req.headers.get("cf-connecting-ip"), str(req.headers.get("user-agent"), 300), NDA_VERSION, now())
    .run();
  return json({ ok: true, id_status: key ? "pending" : existing?.id_status });
});

route("POST", "listings/:id/access", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const l = await getListing(env, params[0]);
  if (l.status !== "live") fail(400, "This business isn't taking requests.");
  if (l.seller_id === u.id) fail(400, "This is your own listing.");
  const nda = await env.DB.prepare("SELECT id_status FROM ndas WHERE user_id = ?").bind(u.id).first<{ id_status: string }>();
  if (!nda) fail(400, "Please sign the NDA first.");
  if (nda!.id_status === "rejected") fail(400, "Your ID check didn't pass. Please contact us.");
  await env.DB.prepare("INSERT INTO access (id, listing_id, buyer_id, status, created_at) VALUES (?, ?, ?, 'requested', ?) ON CONFLICT(listing_id, buyer_id) DO NOTHING")
    .bind(id(), l.id, u.id, now())
    .run();
  return json({ access: "requested" });
});

/** The seller's (or admin's) view of who wants in. Never shows a buyer's ID, nationality or phone. */
route("GET", "listings/:id/requests", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const l = await getListing(env, params[0]);
  if (l.seller_id !== u.id && u.role !== "admin") fail(403, "Not your listing.");
  const { results } = await env.DB.prepare(
    `SELECT a.id, a.status, a.created_at, n.full_name, n.company, n.budget, n.funding, n.timeline, n.id_status, n.signed_at
     FROM access a JOIN ndas n ON n.user_id = a.buyer_id WHERE a.listing_id = ? ORDER BY a.created_at DESC`,
  )
    .bind(l.id)
    .all();
  return json({ requests: results });
});

route("POST", "access/:id", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const b = await body(req);
  const decision = b.decision === "approved" ? "approved" : b.decision === "declined" ? "declined" : fail(400, "Approve or decline.");
  const a = (await env.DB.prepare("SELECT a.id, l.seller_id FROM access a JOIN listings l ON l.id = a.listing_id WHERE a.id = ?").bind(params[0]).first<{ id: string; seller_id: string }>()) ?? fail(404, "Request not found.");
  if (a!.seller_id !== u.id && u.role !== "admin") fail(403, "Not your listing.");
  await env.DB.prepare("UPDATE access SET status = ?, decided_at = ? WHERE id = ?").bind(decision, now(), a!.id).run();
  return json({ status: decision });
});

/* ───────────── data room ───────────── */

route("POST", "listings/:id/docs", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const l = await getListing(env, params[0]);
  if (l.seller_id !== u.id && u.role !== "admin") fail(403, "Not your listing.");
  const form = await req.formData().catch(() => fail(400, "Invalid form."));
  const file = form!.get("file");
  if (!file || typeof file !== "object" || !("arrayBuffer" in file)) fail(400, "Choose a file to upload.");
  const doc = file as unknown as File;
  if (doc.size > MAX_DOC) fail(400, "Files can be up to 15 MB.");
  const did = id(9);
  const key = `docs/${l.id}/${did}`;
  await putFile(env, key, await doc.arrayBuffer(), doc.type || "application/octet-stream");
  await env.DB.prepare("INSERT INTO docs (id, listing_id, name, kind, r2_key, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(did, l.id, str(doc.name, 160) || "Document", str(form!.get("kind"), 60) || null, key, doc.size, now())
    .run();
  return json({ id: did });
});

route("GET", "docs/:id", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const d = (await env.DB.prepare("SELECT * FROM docs WHERE id = ?").bind(params[0]).first<{ listing_id: string; r2_key: string; name: string }>()) ?? fail(404, "Not found.");
  const l = await getListing(env, d!.listing_id);
  if (!(await relation(env, l, u)).unlocked) fail(403, "You need the seller's approval to open this.");
  const obj = (await getFile(env, d!.r2_key)) ?? fail(404, "File missing.");
  return new Response(obj!.body, {
    headers: { "content-type": obj!.type, "content-disposition": `inline; filename="${d!.name.replace(/"/g, "")}"`, "cache-control": "private, no-store" },
  });
});

/* ───────────── messages ───────────── */

async function threadFor(env: Env, threadId: string, u: User) {
  const t =
    (await env.DB.prepare("SELECT t.*, l.seller_id, l.title FROM threads t JOIN listings l ON l.id = t.listing_id WHERE t.id = ?").bind(threadId).first<{
      id: string;
      buyer_id: string;
      seller_id: string;
      listing_id: string;
      title: string;
    }>()) ?? fail(404, "Conversation not found.");
  if (t!.buyer_id !== u.id && t!.seller_id !== u.id && u.role !== "admin") fail(403, "Not your conversation.");
  return t!;
}

route("POST", "listings/:id/thread", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const l = await getListing(env, params[0]);
  if (l.status !== "live") fail(400, "This business isn't listed.");
  if (l.seller_id === u.id) fail(400, "Buyers start conversations about your listing.");
  const existing = await env.DB.prepare("SELECT id FROM threads WHERE listing_id = ? AND buyer_id = ?").bind(l.id, u.id).first<{ id: string }>();
  if (existing) return json({ id: existing.id });
  const tid = id();
  await env.DB.prepare("INSERT INTO threads (id, listing_id, buyer_id, created_at, last_at) VALUES (?, ?, ?, ?, ?)").bind(tid, l.id, u.id, now(), now()).run();
  return json({ id: tid });
});

route("GET", "threads", async ({ req, env }) => {
  const u = await requireUser(env, req);
  const { results } = await env.DB.prepare(
    `SELECT t.id, t.listing_id, t.last_at, l.title, l.seller_id = ? AS i_am_seller,
       (SELECT body FROM messages m WHERE m.thread_id = t.id ORDER BY created_at DESC LIMIT 1) AS last_body
     FROM threads t JOIN listings l ON l.id = t.listing_id
     WHERE t.buyer_id = ? OR l.seller_id = ? ORDER BY t.last_at DESC LIMIT 100`,
  )
    .bind(u.id, u.id, u.id)
    .all();
  return json({ threads: results });
});

route("GET", "threads/:id", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const t = await threadFor(env, params[0], u);
  const { results } = await env.DB.prepare("SELECT m.id, m.body, m.created_at, m.sender_id = ? AS mine, u.role AS sender_role, m.sender_id = ? AS from_buyer FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.thread_id = ? ORDER BY m.created_at")
    .bind(u.id, t.buyer_id, t.id)
    .all();
  const buyer = await env.DB.prepare("SELECT COALESCE(n.full_name, u.name) AS name FROM users u LEFT JOIN ndas n ON n.user_id = u.id WHERE u.id = ?").bind(t.buyer_id).first<{ name: string }>();
  return json({ thread: { id: t.id, listing_id: t.listing_id, title: t.title, i_am_seller: t.seller_id === u.id, buyer_name: buyer?.name }, messages: results });
});

route("POST", "threads/:id", async ({ req, env, params }) => {
  const u = await requireUser(env, req);
  const t = await threadFor(env, params[0], u);
  const b = await body(req);
  const text = str(b.body, 4000);
  if (!text) fail(400, "Write a message first.");
  const mid = id();
  await env.DB.batch([
    env.DB.prepare("INSERT INTO messages (id, thread_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, ?)").bind(mid, t.id, u.id, text, now()),
    env.DB.prepare("UPDATE threads SET last_at = ? WHERE id = ?").bind(now(), t.id),
  ]);
  return json({ id: mid });
});

/* ───────────── my account ───────────── */

route("GET", "my", async ({ req, env }) => {
  const u = await requireUser(env, req);
  const listings = (
    await env.DB.prepare(
      `SELECT l.*, (SELECT COUNT(*) FROM access a WHERE a.listing_id = l.id AND a.status = 'requested') AS pending_requests
       FROM listings l WHERE seller_id = ? ORDER BY created_at DESC`,
    )
      .bind(u.id)
      .all<ListingRow & { pending_requests: number }>()
  ).results.map((l) => ({ ...privateListing(l), review_note: l.review_note, pending_requests: l.pending_requests }));
  const access = (
    await env.DB.prepare("SELECT a.status, a.created_at, l.* FROM access a JOIN listings l ON l.id = a.listing_id WHERE a.buyer_id = ? ORDER BY a.created_at DESC")
      .bind(u.id)
      .all<ListingRow & { status: string }>()
  ).results.map((r) => ({ access: r.status, listing: publicListing(r) }));
  const saved = (await env.DB.prepare("SELECT l.* FROM saved s JOIN listings l ON l.id = s.listing_id WHERE s.user_id = ? AND l.status = 'live' ORDER BY s.created_at DESC").bind(u.id).all<ListingRow>()).results.map(publicListing);
  const nda = await env.DB.prepare("SELECT full_name, id_status, signed_at FROM ndas WHERE user_id = ?").bind(u.id).first();
  return json({ user: u, listings, access, saved, nda });
});

/* ───────────── directory ───────────── */

const EMIRATES = ["dubai", "abu dhabi", "sharjah", "ajman", "ras al khaimah", "fujairah", "umm al quwain"];

route("GET", "directory/search", async ({ env, url }) => {
  const q = (url.searchParams.get("q") || "").trim();
  if (q.length < 2) return fail(400, "Tell us what you're looking for.");
  try {
    return json(await searchDirectory(env, q, url.searchParams.get("area") || ""));
  } catch (e) {
    return fail(502, (e as Error).message.startsWith("google") ? "The search didn't answer. Try again in a moment." : (e as Error).message);
  }
});

route("GET", "providers", async ({ env, url }) => {
  const q = str(url.searchParams.get("q"), 200).toLowerCase();
  const { results } = await env.DB.prepare("SELECT id, company, category, area, website, phone, email, description FROM providers WHERE status = 'live'").all<Record<string, string | null>>();
  if (!q) return json({ providers: results.slice(0, 30) });
  const area = EMIRATES.find((e) => q.includes(e));
  const words = q
    .replace(/[^a-z0-9& ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["for", "the", "and", "with", "near", "services", "service"].includes(w));
  const scored = results
    .map((p) => {
      const hay = `${p.company} ${p.category} ${p.description ?? ""}`.toLowerCase();
      let s = words.reduce((a, w) => a + (hay.includes(w) ? 2 : 0), 0);
      if (area && (p.area || "").toLowerCase().includes(area)) s += 3;
      if ((p.area || "").toLowerCase().includes("uae")) s += 1;
      return { p, s };
    })
    .filter((x) => x.s >= 2)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12)
    .map((x) => x.p);
  return json({ providers: scored });
});

route("POST", "providers", async ({ req, env }) => {
  const b = await body(req);
  const company = str(b.company, 160);
  const category = str(b.category, 80);
  if (!company || !category) fail(400, "Please add the company name and a category.");
  await env.DB.prepare(
    "INSERT INTO providers (id, company, category, area, website, phone, email, contact_name, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)",
  )
    .bind(id(), company, category, str(b.area, 80) || null, str(b.website, 200) || null, str(b.phone, 40) || null, str(b.email, 200) || null, str(b.name, 120) || null, str(b.description, 1000) || null, now())
    .run();
  return json({ ok: true });
});

/* ───────────── leads (every form on the site) ───────────── */

route("POST", "leads", async ({ req, env }) => {
  const b = await body(req);
  if (str(b.website, 10)) return json({ ok: true }); // honeypot
  const type = str(b.type, 40) || "contact";
  await env.DB.prepare("INSERT INTO leads (id, type, name, email, phone, payload, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id(), type, str(b.name, 120) || null, str(b.email, 200) || null, str(b.phone, 40) || null, JSON.stringify(b).slice(0, 8000), now())
    .run();
  return json({ ok: true });
});

/* ───────────── admin ───────────── */

route("GET", "admin/overview", async ({ req, env }) => {
  await requireAdmin(env, req);
  const q = (sql: string) => env.DB.prepare(sql).all().then((r) => r.results);
  const [listings, ndas, providers, leads, users] = await Promise.all([
    q("SELECT l.*, u.name AS seller_name, u.email AS seller_email, u.phone AS seller_phone FROM listings l JOIN users u ON u.id = l.seller_id ORDER BY CASE l.status WHEN 'pending' THEN 0 ELSE 1 END, l.created_at DESC LIMIT 200"),
    q("SELECT n.user_id, n.full_name, n.company, n.budget, n.funding, n.timeline, n.id_status, n.signed_at, n.id_doc_key IS NOT NULL AS has_id, u.email, u.phone FROM ndas n JOIN users u ON u.id = n.user_id ORDER BY CASE n.id_status WHEN 'pending' THEN 0 ELSE 1 END, n.signed_at DESC LIMIT 200"),
    q("SELECT * FROM providers ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 200"),
    q("SELECT * FROM leads ORDER BY created_at DESC LIMIT 200"),
    q("SELECT COUNT(*) AS n FROM users"),
  ]);
  return json({ listings, ndas, providers, leads, users: (users[0] as { n: number }).n });
});

route("POST", "admin/listings/:id", async ({ req, env, params }) => {
  await requireAdmin(env, req);
  const l = await getListing(env, params[0]);
  const b = await body(req);
  const status = ["pending", "live", "rejected", "sold", "withdrawn"].includes(String(b.status)) ? String(b.status) : l.status;
  const pick = (k: keyof ListingRow, max = 600) => (k in b ? str(b[k], max) || null : l[k]);
  const pickN = (k: keyof ListingRow) => (k in b ? num(b[k]) : l[k]);
  await env.DB.prepare(
    `UPDATE listings SET status = ?, title = ?, summary = ?, industry = ?, city = ?, area = ?, asking_price = ?, revenue = ?, profit = ?, review_note = ?, updated_at = ? WHERE id = ?`,
  )
    .bind(status, pick("title", 120) ?? l.title, pick("summary", 1500), pick("industry", 60) ?? l.industry, pick("city", 60) ?? l.city, pick("area", 80), pickN("asking_price") ?? l.asking_price, pickN("revenue"), pickN("profit"), pick("review_note", 600), now(), l.id)
    .run();
  return json({ ok: true, status });
});

route("POST", "admin/ndas/:id", async ({ req, env, params }) => {
  await requireAdmin(env, req);
  const b = await body(req);
  const s = b.id_status === "approved" ? "approved" : b.id_status === "rejected" ? "rejected" : fail(400, "Approve or reject.");
  await env.DB.prepare("UPDATE ndas SET id_status = ? WHERE user_id = ?").bind(s, params[0]).run();
  return json({ ok: true });
});

route("GET", "admin/ndas/:id/doc", async ({ req, env, params }) => {
  await requireAdmin(env, req);
  const n = (await env.DB.prepare("SELECT id_doc_key FROM ndas WHERE user_id = ?").bind(params[0]).first<{ id_doc_key: string | null }>()) ?? fail(404, "Not found.");
  const obj = (n!.id_doc_key && (await getFile(env, n!.id_doc_key))) || fail(404, "No ID on file.");
  return new Response(obj.body, { headers: { "content-type": obj.type, "cache-control": "private, no-store" } });
});

route("POST", "admin/providers/:id", async ({ req, env, params }) => {
  await requireAdmin(env, req);
  const b = await body(req);
  const s = ["live", "rejected", "pending"].includes(String(b.status)) ? String(b.status) : fail(400, "Bad status.");
  await env.DB.prepare("UPDATE providers SET status = ? WHERE id = ?").bind(s, params[0]).run();
  return json({ ok: true });
});

route("POST", "admin/leads/:id", async ({ req, env, params }) => {
  await requireAdmin(env, req);
  const b = await body(req);
  await env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(str(b.status, 20) || "done", params[0]).run();
  return json({ ok: true });
});

/* ───────────── dispatcher ───────────── */

export async function handle(req: Request, env: Env, path: string[]) {
  const url = new URL(req.url);
  try {
    if (req.method !== "GET" && req.headers.get("x-sm") !== "1") fail(403, "Blocked.");
    for (const r of routes) {
      if (r.method !== req.method || r.parts.length !== path.length) continue;
      const params: string[] = [];
      if (r.parts.every((p, i) => (p.startsWith(":") ? (params.push(decodeURIComponent(path[i])), true) : p === path[i]))) return await r.fn({ req, env, url, params });
    }
    return json({ error: "Not found." }, { status: 404 });
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, { status: e.status });
    console.error(e);
    return json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}
