# Replace smemarket.ae with this site (Cloudflare Pages)

This repo is the full rebuilt SMEmarket site:

- **Website:** a static Next.js export, built into `out/`.
- **Marketplace API:** Cloudflare Pages Functions in `functions/`, with the code in `server/`.
- **D1 database:** accounts, listings, NDAs, messages and leads.
- **Private R2 bucket:** buyer ID documents and sellers' data-room files.

## The plan

| | Old site (keep, offline after cutover) | New site (this repo) |
|---|---|---|
| Pages project | `smemarket` (`smemarket-e2w.pages.dev`), branch `main` | **`smemarket-site`**, branch `master` |
| Data | Workers KV `SUBMISSIONS` | D1 `smemarket` and R2 `smemarket-files` |

We build the new site in its own Pages project, test it on its pages.dev address, then move the
`www.smemarket.ae` custom domain from the old project to the new one. The old project, its KV data and its
secrets stay untouched, so rolling back takes one minute. Old user accounts are **not** migrated: users sign
up again on the new site, and the old data stays safe in the old project.

**Never deploy this repo to the old `smemarket` project.** It would replace that project's KV binding and
variables.

## Leave these alone

- **Email:** the MX, SPF, DKIM, DMARC and google-site-verification records (Google Workspace).
- **`growth.smemarket.ae`:** the Pages project `smemarket-growth`.
- **The zone rule** that redirects `smemarket.ae` to `https://www.smemarket.ae`.

## Setup

You need:

- An API token on account `2947ebc94208e9440eb2351fe5ba4abf` with these permissions:
  - Account: **D1 Edit**, **Workers R2 Storage Edit**, **Cloudflare Pages Edit**
  - Zone smemarket.ae: **DNS Edit**, **Zone Read**
- The Web3Forms key, sent to you privately.
- Node 22, run as `npx -y node@22 …` if it isn't the default.

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=2947ebc94208e9440eb2351fe5ba4abf
git clone https://github.com/mohsinxaifii/smemarket-umbrella.git && cd smemarket-umbrella
npm ci
```

## 1. Back up DNS (read-only)

Export every DNS record of the zone to a file with
`GET /zones/b8181b7bc8dceaf465841c81c20ca8c4/dns_records/export`, and keep it. This is the rollback copy.

## 2. Database and file storage

```bash
npx wrangler d1 create smemarket            # if the name is taken, stop and report
# put the printed database_id into wrangler.toml, replacing 00000000-0000-0000-0000-000000000000
# (a local edit is enough; no need to push it)

npx wrangler r2 bucket create smemarket-files   # private: never enable public access. If R2 isn't enabled on the account, stop and report.
npx wrangler d1 migrations apply smemarket --remote
npx wrangler d1 execute smemarket --remote --file scripts/seed-production.sql   # the 2 real listings
```

## 3. Build and deploy to the new project

```bash
export NEXT_PUBLIC_LEAD_ACCESS_KEY=...       # Web3Forms key, baked into the build
export NEXT_PUBLIC_SITE_URL=https://www.smemarket.ae
npm run build:pages

npx wrangler pages project create smemarket-site --production-branch master
npx wrangler pages deploy out --project-name smemarket-site --branch master   # run from the repo root
```

Call the pages.dev address it prints `NEW` (for example `https://smemarket-site-xxx.pages.dev`).

## 4. Test on NEW

Use only `@example.com` emails for test accounts. Step 6 deletes them.

1. `/`, `/listings`, `/listing?id=l_jlt_barber`, `/sell`, `/directory`, `/advisory`, `/brokerage`,
   `/about`, `/contact` and `/login` all load with status 200.
2. `/` shows both listings in "Just listed".
3. `/api/me` returns `{"user":null,...}`.
4. Sign up `qa-seller@example.com`, `qa-buyer@example.com` and `qa-admin@example.com`, each with a random
   password. Then log out and log back in as one of them.
5. Make the QA admin an admin:
   `npx wrangler d1 execute smemarket --remote --command "UPDATE users SET role='admin' WHERE email='qa-admin@example.com'"`
6. As qa-seller, list a test business at `/sell`. As qa-admin, publish it in `/admin`.
7. As qa-buyer:
   - Sign the NDA at `/nda` with a small test image as the ID.
   - Request access to the test listing.
   - Save a listing.
8. As qa-admin, approve the NDA and the access request.
9. Send a message from the buyer to the seller in `/messages`, and a reply back.
10. At `/directory`, a search for "accountant" in Dubai returns businesses.
11. At `/contact`, send the form with the email `qa-buyer@example.com` and the message
    `QA test, please ignore`. It returns success.

If any step fails, **stop**: don't do the cutover, and report what failed.

## 5. Cutover (only if every test in step 4 passed)

1. Detach the custom domain `www.smemarket.ae` from the old Pages project `smemarket`:
   `DELETE /accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/smemarket/domains/www.smemarket.ae`
2. Attach it to the new project:
   `POST /accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/smemarket-site/domains` with `{"name":"www.smemarket.ae"}`
3. Point the `www` DNS record at NEW's pages.dev host, as a proxied CNAME.
4. Wait until the domain shows **active**.
5. Check `https://www.smemarket.ae`: the home page title is "SMEmarket", the new site loads, `/api/me` returns
   JSON, and `/listings` shows the 2 listings.
6. Check that `https://smemarket.ae` still redirects to www.

If the new site isn't serving within 30 minutes, roll back.

**Rollback:**
1. Detach `www.smemarket.ae` from `smemarket-site`.
2. Re-attach it to `smemarket`.
3. Point the `www` CNAME back to `smemarket-e2w.pages.dev`.

## 6. Clean up the QA data

```bash
# list the private files the QA accounts uploaded, then delete each one
npx wrangler d1 execute smemarket --remote --command "SELECT id_doc_key AS k FROM ndas WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@example.com') AND id_doc_key IS NOT NULL UNION ALL SELECT r2_key FROM docs WHERE listing_id IN (SELECT id FROM listings WHERE seller_id IN (SELECT id FROM users WHERE email LIKE '%@example.com'))"
npx wrangler r2 object delete "smemarket-files/<key>" --remote     # for each key listed

npx wrangler d1 execute smemarket --remote --file scripts/cleanup-test-data.sql
npx wrangler d1 execute smemarket --remote --command "SELECT COUNT(*) AS users FROM users; SELECT id, status FROM listings"
```

Expected result: 1 user (the system seller `listings@smemarket.ae`), and the 2 real listings, both `live`.

## 7. Admin account

There is no automatic admin. `ADMIN_EMAILS` is empty on purpose, because sign-up doesn't verify email
ownership. When the owner says they have signed up with `admin@smemarket.ae`, run:

```bash
npx wrangler d1 execute smemarket --remote --command "UPDATE users SET role='admin' WHERE email='admin@smemarket.ae'"
```

## Updating the site later

```bash
git pull && npm ci && npm run build:pages && npx wrangler pages deploy out --project-name smemarket-site --branch master
```

For a database change, add a file in `migrations/`, then run
`npx wrangler d1 migrations apply smemarket --remote` before deploying.

Optional, for Google directory results:
`npx wrangler pages secret put GOOGLE_PLACES_KEY --project-name smemarket-site`, then redeploy.
