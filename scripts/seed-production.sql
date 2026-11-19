-- One-time: puts the two real listings on the LIVE database. Safe to run twice (INSERT OR IGNORE).
--   npx wrangler d1 execute smemarket --remote --file scripts/seed-production.sql
-- The listings belong to a system "SMEmarket" seller that can't log in (its password hash matches nothing).
-- Manage them from /admin with the admin account.

INSERT OR IGNORE INTO users (id, name, email, phone, pass_hash, pass_salt, role, created_at)
VALUES ('u_smemarket', 'SMEmarket', 'listings@smemarket.ae', NULL, '!', '!', 'user', CAST(strftime('%s','now') AS INTEGER) * 1000);

INSERT OR IGNORE INTO listings (id, seller_id, status, title, industry, city, area, asking_price, revenue, profit, years_trading, employees, rent, lease, reason, summary, business_name, created_at, updated_at)
VALUES
  ('l_jlt_barber', 'u_smemarket', 'live', 'JLT Barbershop for Sale', 'Beauty & grooming', 'Dubai', 'JLT', 400000, 500000, 100000, NULL, NULL, NULL, NULL, NULL, NULL, 'JLT Barbershop',
   CAST(strftime('%s','now') AS INTEGER) * 1000 - 172800000, CAST(strftime('%s','now') AS INTEGER) * 1000 - 172800000),
  ('l_tailoring', 'u_smemarket', 'live', 'Tailoring Business for Sale', 'Retail', 'Dubai', 'JLT', 1200000, 1500000, 400000, NULL, NULL, NULL, NULL, NULL, NULL, 'Tailoring business, JLT',
   CAST(strftime('%s','now') AS INTEGER) * 1000 - 345600000, CAST(strftime('%s','now') AS INTEGER) * 1000 - 345600000);
