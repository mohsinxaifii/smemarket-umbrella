-- Removes the QA test data made while checking the live site. Only touches accounts and rows whose
-- email ends in @example.com (a reserved domain no real user has).
--   npx wrangler d1 execute smemarket --remote --file scripts/cleanup-test-data.sql

-- uploaded files first: QA buyers' ID documents and QA listings' documents
DELETE FROM files WHERE key IN (
  SELECT id_doc_key FROM ndas WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com') AND id_doc_key IS NOT NULL
  UNION ALL
  SELECT r2_key FROM docs WHERE listing_id IN (SELECT id FROM listings WHERE seller_id IN (SELECT id FROM users WHERE email LIKE '%@example.com'))
);

DELETE FROM messages
WHERE sender_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')
   OR thread_id IN (
     SELECT id FROM threads
     WHERE buyer_id IN (SELECT id FROM users WHERE email LIKE '%@example.com')
        OR listing_id IN (SELECT id FROM listings WHERE seller_id IN (SELECT id FROM users WHERE email LIKE '%@example.com'))
   );

-- test listings (their docs, access requests, threads and saves go with them)
DELETE FROM listings WHERE seller_id IN (SELECT id FROM users WHERE email LIKE '%@example.com');

-- test accounts (sessions, NDAs, access requests, threads and saves go with them)
DELETE FROM users WHERE email LIKE '%@example.com';

DELETE FROM leads WHERE email LIKE '%@example.com';
DELETE FROM providers WHERE email LIKE '%@example.com';
