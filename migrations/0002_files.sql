-- Private files (buyer ID documents, sellers' data-room documents) stored in the database itself,
-- so the site needs no separate file storage. Big files are split into chunks under D1's 2 MB value limit.
CREATE TABLE files (
  key TEXT NOT NULL,
  part INTEGER NOT NULL,
  type TEXT,
  data BLOB NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (key, part)
);
