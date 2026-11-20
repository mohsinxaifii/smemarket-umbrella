-- Listings without accounts: sellers submit a short form, buyers contact SMEmarket directly.
-- The seller's contact details live on the listing (only the team sees them in /admin).
ALTER TABLE listings ADD COLUMN contact_name TEXT;
ALTER TABLE listings ADD COLUMN contact_phone TEXT;
ALTER TABLE listings ADD COLUMN contact_email TEXT;

-- the system seller every submitted listing belongs to (can't log in: its hash matches nothing)
INSERT OR IGNORE INTO users (id, name, email, phone, pass_hash, pass_salt, role, created_at)
VALUES ('u_smemarket', 'SMEmarket', 'listings@smemarket.ae', NULL, '!', '!', 'user', CAST(strftime('%s','now') AS INTEGER) * 1000);
