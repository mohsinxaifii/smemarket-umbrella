// Fills the LOCAL database (wrangler's local D1, under .wrangler/) with the real listings and three test
// accounts (admin, seller, buyer) so you can check every flow. Never touches the real database.
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

// the real listings from smemarket.ae (business names stay hidden until a buyer is approved)
const listings = [
  { id: "l_jlt_barber", title: "JLT Barbershop for Sale", industry: "Beauty & grooming", city: "Dubai", area: "JLT", price: 400000, rev: 500000, profit: 100000, years: null, staff: null, rent: null, lease: null, reason: null, name: "JLT Barbershop", summary: null },
  { id: "l_tailoring", title: "Tailoring Business for Sale", industry: "Retail", city: "Dubai", area: "JLT", price: 1200000, rev: 1500000, profit: 400000, years: null, staff: null, rent: null, lease: null, reason: null, name: "Tailoring business, JLT", summary: null },
];

// no sample providers: the directory starts empty and fills with real, reviewed companies
const providers = [];

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
providers.forEach(([company, category, area, website, description], i) => {
  sql += `INSERT INTO providers (id, company, category, area, website, description, status, created_at) VALUES (${[`p${i}`, company, category, area, website, description, "live", now - i * day].map(q).join(", ")});\n`;
});

mkdirSync(path.join(root, ".wrangler"), { recursive: true });
const file = path.join(root, ".wrangler/seed.sql");
writeFileSync(file, sql);
wrangler(["d1", "execute", "smemarket", "--local", "--file", file]);
console.log(`local: seeded ${users.length} accounts and the ${listings.length} real listings`);
console.log("local: log in with admin@smemarket.ae / admin12345, seller@test.ae / test12345, buyer@test.ae / test12345");
