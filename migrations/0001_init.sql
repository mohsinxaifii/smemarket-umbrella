-- SMEmarket marketplace schema (Cloudflare D1 / SQLite)

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',            -- 'user' | 'admin'
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,                   -- SHA-256 of the cookie value; the raw token is never stored
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions(user_id);

-- A business for sale. Public fields are shown to everyone; business_name and confidential
-- fields only to the owner, admins and approved buyers.
CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | live | rejected | sold | withdrawn
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT,
  asking_price INTEGER NOT NULL,
  revenue INTEGER,
  profit INTEGER,
  years_trading INTEGER,
  employees INTEGER,
  rent INTEGER,
  lease TEXT,
  reason TEXT,
  summary TEXT,
  business_name TEXT NOT NULL,
  confidential TEXT,
  review_note TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX listings_status ON listings(status);
CREATE INDEX listings_seller ON listings(seller_id);

-- One NDA per buyer covers every listing.
CREATE TABLE ndas (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  company TEXT,
  signature TEXT NOT NULL,
  budget TEXT,
  funding TEXT,
  timeline TEXT,
  id_doc_key TEXT,                               -- R2 key of the ID image
  id_status TEXT NOT NULL DEFAULT 'pending',     -- pending | approved | rejected
  ip TEXT,
  user_agent TEXT,
  version TEXT NOT NULL,
  signed_at INTEGER NOT NULL
);

CREATE TABLE access (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'requested',      -- requested | approved | declined
  created_at INTEGER NOT NULL,
  decided_at INTEGER,
  UNIQUE (listing_id, buyer_id)
);

CREATE TABLE threads (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  last_at INTEGER NOT NULL,
  UNIQUE (listing_id, buyer_id)
);

CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX messages_thread ON messages(thread_id, created_at);

CREATE TABLE docs (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT,
  r2_key TEXT NOT NULL,
  size INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE saved (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE providers (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  contact_name TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',        -- pending | live | rejected
  created_at INTEGER NOT NULL
);
CREATE INDEX providers_status ON providers(status);

-- Every form on the site (contact, brokerage, advisory) lands here too, so nothing depends on email alone.
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
