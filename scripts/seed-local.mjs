// Fills the LOCAL database (wrangler's local D1, under .wrangler/) with sample data so every page has
// something to show while you check the site. Never touches the real database.
//   node scripts/seed-local.mjs          → seed only if the database is empty
//   node scripts/seed-local.mjs --reset  → wipe local data and seed again
import { execFileSync } from "node:child_process";
import { pbkdf2Sync, randomBytes } from "node:crypto";
import { rmSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const wrangler = (args) => execFileSync("npx", ["wrangler", ...args], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

if (process.argv.includes("--reset")) {
  rmSync(path.join(root, ".wrangler/state"), { recursive: true, force: true });
  console.log("local: wiped local database and files");
}
wrangler(["d1", "migrations", "apply", "smemarket", "--local"]);

const count = wrangler(["d1", "execute", "smemarket", "--local", "--json", "--command", "SELECT COUNT(*) AS n FROM users"]);
if (JSON.parse(count)[0].results[0].n > 0) {
  console.log("local: database already has data (use --reset to start fresh)");
  process.exit(0);
}

// same scheme as server/util.ts: PBKDF2-SHA256, 100k iterations, hex salt used as text
const hash = (password) => {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: pbkdf2Sync(password, salt, 100_000, 32, "sha256").toString("hex") };
};
const q = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const now = Date.now();
const day = 864e5;

const users = [
  { id: "u_admin", name: "SMEmarket Admin", email: "admin@smemarket.ae", phone: "+971524529187", role: "admin", password: "admin12345" },
  { id: "u_seller", name: "Rashid Seller", email: "seller@test.ae", phone: "+971500000001", role: "user", password: "test12345" },
  { id: "u_buyer", name: "Lina Buyer", email: "buyer@test.ae", phone: "+971500000002", role: "user", password: "test12345" },
];

const listings = [
  { id: "l_cafe", title: "Specialty café near the metro", industry: "Food & beverage", city: "Dubai", area: "JLT", price: 450000, rev: 620000, profit: 150000, years: 4, staff: 6, rent: 120000, lease: "3 years left, renewable", reason: "Moving back home", name: "Bean There Café LLC", summary: "Busy specialty café a two-minute walk from the metro. Loyal morning regulars, strong weekend brunch trade and 4.7★ on Google. Fully fitted, trained team staying on." },
  { id: "l_barber", title: "Established barbershop", industry: "Beauty & grooming", city: "Dubai", area: "Al Barsha", price: 400000, rev: 500000, profit: 100000, years: 6, staff: 5, rent: 95000, lease: "2 years left", reason: "Focusing on another business", name: "Sharp Cuts Barbershop", summary: "Five chairs, walk-ins all day and a booked-out evening schedule. Six years in the same community with a steady base of repeat clients." },
  { id: "l_ecom", title: "Home fragrance e-commerce brand", industry: "E-commerce", city: "Dubai", area: "Online, UAE-wide", price: 850000, rev: 1100000, profit: 280000, years: 3, staff: 3, rent: 30000, lease: "Small warehouse unit, flexible", reason: "Founder starting a new venture", name: "Oud & Ember", summary: "Direct-to-consumer home fragrance brand with its own website, a strong Instagram following and repeat-order rate above 35%. Supplier contracts transfer with the sale." },
  { id: "l_gym", title: "Boutique fitness studio", industry: "Health & fitness", city: "Dubai", area: "Business Bay", price: 1200000, rev: 1500000, profit: 400000, years: 5, staff: 9, rent: 260000, lease: "4 years left", reason: "Owner relocating", name: "Pulse Studio", summary: "Group classes and personal training in a fully fitted 3,000 sq ft studio. Around 280 active members on monthly plans." },
  { id: "l_laundry", title: "Laundry and dry cleaning with delivery", industry: "Services", city: "Sharjah", area: "Al Majaz", price: 320000, rev: 480000, profit: 110000, years: 7, staff: 7, rent: 70000, lease: "3 years left", reason: "Retiring", name: "FreshPress Laundry", summary: "Walk-in shop plus pickup and delivery across Al Majaz and Al Nahda. Corporate contracts with three nearby hotels." },
  { id: "l_nursery", title: "Licensed early-years nursery", industry: "Education", city: "Abu Dhabi", area: "Khalifa City", price: 2400000, rev: 2100000, profit: 520000, years: 8, staff: 18, rent: 380000, lease: "6 years left", reason: "Partners retiring", name: "Little Steps Nursery", summary: "Licensed for 90 children with a waiting list. Purpose-built premises with outdoor play area. Experienced staff and management in place." },
  { id: "l_pending", title: "Restaurant in a busy food court", industry: "Food & beverage", city: "Dubai", area: "Al Quoz", price: 380000, rev: 560000, profit: 90000, years: 3, staff: 6, rent: 110000, lease: "2 years left", reason: "Health reasons", name: "Spice Route Kitchen", summary: "Waiting for review: shows how a new listing looks in admin.", status: "pending" },
];

const providers = [
  ["Ledger Pros Accounting", "Accounting & bookkeeping", "Dubai", "ledgerpros.example", "VAT registration, bookkeeping and corporate tax for SMEs."],
  ["Swift PRO Services", "PRO services", "Dubai", "swiftpro.example", "Visa renewals, trade licence renewals and Emirates ID processing."],
  ["Blueprint Interiors", "Fit-out", "Dubai", "blueprintfitout.example", "Office and retail fit-out, Business Bay and Downtown."],
  ["Gulf Legal Partners", "Legal", "Abu Dhabi", "gulflegal.example", "Company formation, SPAs and commercial leases."],
  ["Northstar IT", "IT & software", "Sharjah", "northstarit.example", "Networks, laptops and Microsoft 365 for small offices."],
  ["PayRoll Easy", "HR & payroll", "UAE-wide / other", "payrolleasy.example", "WPS payroll, contracts and HR policies."],
];

let sql = "";
for (const u of users) {
  const { salt, hash: h } = hash(u.password);
  sql += `INSERT INTO users (id, name, email, phone, pass_hash, pass_salt, role, created_at) VALUES (${[u.id, u.name, u.email, u.phone, h, salt, u.role, now - 30 * day].map(q).join(", ")});\n`;
}
listings.forEach((l, i) => {
  const t = now - (i + 1) * 2 * day;
  sql += `INSERT INTO listings (id, seller_id, status, title, industry, city, area, asking_price, revenue, profit, years_trading, employees, rent, lease, reason, summary, business_name, created_at, updated_at) VALUES (${[
    l.id, "u_seller", l.status || "live", l.title, l.industry, l.city, l.area, l.price, l.rev, l.profit, l.years, l.staff, l.rent, l.lease, l.reason, l.summary, l.name, t, t,
  ]
    .map(q)
    .join(", ")});\n`;
});
// the sample buyer has signed the NDA (ID approved) and was approved for the café, so you can see an unlocked listing
sql += `INSERT INTO ndas (user_id, full_name, company, signature, budget, funding, timeline, id_doc_key, id_status, version, signed_at) VALUES ('u_buyer', 'Lina Buyer', NULL, 'Lina Buyer', 'AED 250K – 500K', 'Own funds', 'Within 3 months', NULL, 'approved', '2026-11', ${now - 5 * day});\n`;
sql += `INSERT INTO access (id, listing_id, buyer_id, status, created_at, decided_at) VALUES ('a1', 'l_cafe', 'u_buyer', 'approved', ${now - 4 * day}, ${now - 3 * day});\n`;
sql += `INSERT INTO access (id, listing_id, buyer_id, status, created_at) VALUES ('a2', 'l_barber', 'u_buyer', 'requested', ${now - day});\n`;
sql += `INSERT INTO threads (id, listing_id, buyer_id, created_at, last_at) VALUES ('t1', 'l_cafe', 'u_buyer', ${now - 3 * day}, ${now - 2 * day});\n`;
sql += `INSERT INTO messages (id, thread_id, sender_id, body, created_at) VALUES ('m1', 't1', 'u_buyer', 'Hi! Could we arrange a visit next week to see the café during the morning rush?', ${now - 3 * day});\n`;
sql += `INSERT INTO messages (id, thread_id, sender_id, body, created_at) VALUES ('m2', 't1', 'u_seller', 'Of course. Tuesday at 8am works well, that''s our busiest hour.', ${now - 2 * day});\n`;
providers.forEach(([company, category, area, website, description], i) => {
  sql += `INSERT INTO providers (id, company, category, area, website, description, status, created_at) VALUES (${[`p${i}`, company, category, area, website, description, "live", now - i * day].map(q).join(", ")});\n`;
});
sql += `INSERT INTO leads (id, type, name, email, phone, payload, created_at) VALUES ('lead1', 'advisory', 'Omar Sample', 'omar@example.com', '+971500000003', '{"message":"Thinking about opening a second branch, would like a second opinion.","services":["Planning"]}', ${now - day});\n`;

mkdirSync(path.join(root, ".wrangler"), { recursive: true });
const file = path.join(root, ".wrangler/seed.sql");
writeFileSync(file, sql);
wrangler(["d1", "execute", "smemarket", "--local", "--file", file]);
console.log(`local: seeded ${users.length} accounts, ${listings.length} listings, ${providers.length} providers`);
console.log("local: log in with admin@smemarket.ae / admin12345, seller@test.ae / test12345, buyer@test.ae / test12345");
