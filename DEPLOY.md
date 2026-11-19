# Deploy the new smemarket.ae on Cloudflare Pages

This repo is the full SMEmarket site:

- **Website:** a static Next.js export, built into `out/`.
- **Marketplace API:** Cloudflare Pages Functions in `functions/`, with the code in `server/`.
- **D1 database:** accounts, listings, NDAs, messages and leads.
- **Private R2 bucket:** buyer ID documents and sellers' data-room files.

## How the switch works

| | Old site (keep it) | New site (this repo) |
|---|---|---|
| Pages project | `smemarket` (`smemarket-e2w.pages.dev`), branch `main` | **`smemarket-site`**, branch `master` |
| Data | Workers KV `SUBMISSIONS` | D1 `smemarket` and R2 `smemarket-files` |

We build the new site in its **own** Pages project and test it on its pages.dev address, while the live
site keeps running. At cutover we move the `www.smemarket.ae` custom domain from the old project to the new
one. The old project, its KV data and its secrets stay untouched. To roll back, move the domain back.

**Never deploy this repo to the old `smemarket` project.** Its `wrangler.toml` would replace that project's
KV binding and variables.

## Leave these alone

- **Email:** the MX, SPF, DKIM, DMARC and google-site-verification records. They all point to Google
  Workspace, and email must keep working.
- **`growth.smemarket.ae`:** the Pages project `smemarket-growth`, a separate site.
- **The zone rule** that redirects `smemarket.ae` to `https://www.smemarket.ae`. It stays as it is.

## What you need

- A Cloudflare API token on account `2947ebc94208e9440eb2351fe5ba4abf` with these permissions:
  - Account: **D1 Edit**, **Workers R2 Storage Edit**, **Cloudflare Pages Edit**, **Workers KV Storage Read**
  - Zone smemarket.ae: **DNS Edit**, **Zone Read**, **Single Redirect / Page Rules Read**
- The Web3Forms access key, the same one the growth site uses. It emails every form submission to the
  team. Get it from the team privately, never in a channel.
- Optional: a Google Places key (`GOOGLE_PLACES_KEY`) for Google results in the directory. Without one, the
  directory uses OpenStreetMap.
- Node 22, run as `npx -y node@22 …` if it isn't the default.

```bash
export CLOUDFLARE_API_TOKEN=...
export CLOUDFLARE_ACCOUNT_ID=2947ebc94208e9440eb2351fe5ba4abf
git clone https://github.com/mohsinxaifii/smemarket-umbrella.git && cd smemarket-umbrella
npm ci
```

## Phase A: look before touching anything (read-only)

1. Export every DNS record for smemarket.ae to a file and keep it. This is the rollback copy.
2. List the zone's redirect rules, page rules and any Workers routes.
3. Take stock of the old site's KV data. Don't copy any secret values into chat.
   - Find the `SUBMISSIONS` namespace id:
     `npx wrangler kv namespace list`
   - Count the keys:
     `npx wrangler kv key list --namespace-id <id> --remote`
   - Group the keys by prefix (for example `user:`, `session:`, `msg:`) and count each group.
   - For each prefix, show one record with **every value replaced by its type**, so only the field names
     show. Say whether passwords look hashed, and roughly how.
4. Report back. The owner decides whether old accounts get migrated before cutover.

## Phase B: build the new site next to the old one (live site unaffected)

### Create the database and file storage

```bash
npx wrangler d1 create smemarket            # if the name is taken, stop and report
# put the printed database_id into wrangler.toml, replacing 00000000-0000-0000-0000-000000000000
# (a local edit is enough; no need to push it)

npx wrangler r2 bucket create smemarket-files   # private: never enable public access
npx wrangler d1 migrations apply smemarket --remote
npx wrangler d1 execute smemarket --remote --file scripts/seed-production.sql   # the 2 real listings
```

### Build and deploy

```bash
export NEXT_PUBLIC_LEAD_ACCESS_KEY=...       # Web3Forms key, baked into the build
export NEXT_PUBLIC_SITE_URL=https://www.smemarket.ae
npm run build:pages

npx wrangler pages project create smemarket-site --production-branch master   # first time only
npx wrangler pages deploy out --project-name smemarket-site --branch master   # run from the repo root
```

Note the pages.dev address it prints. Cloudflare may add a suffix, as in `smemarket-site-xxx.pages.dev`.

### Test on that pages.dev address

- `/` loads, and "Just listed" shows the 2 listings.
- `/listings` and `/listing?id=l_jlt_barber` load.
- `/api/me` returns `{"user":null,...}`.
- Sign up at `/login?tab=signup`, log out, then log in again.
- `/directory`: a search such as "accountant" in Dubai returns businesses.
- `/contact`: send the form, and check that it reaches the team inbox.
- Sign the NDA at `/nda` with a test ID image.
- Request access to a listing.
- Add a test listing at `/sell`.

Then sign up with **admin@smemarket.ae**. That email gets the admin role through `ADMIN_EMAILS`. In `/admin`,
approve the test NDA and request, and send a message between the two accounts. Withdraw the test listing
afterwards.

## Phase C: cutover (only with the owner's go-ahead)

1. If the owner chose to migrate old accounts, run that migration first.
2. Detach the custom domain `www.smemarket.ae` from the old Pages project `smemarket`.
3. Attach it to `smemarket-site`:
   ```bash
   curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/smemarket-site/domains" \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" --data '{"name":"www.smemarket.ae"}'
   ```
4. Point the `www` DNS record (proxied CNAME) at the new project's pages.dev address. That's the address
   from Phase B, not `smemarket-e2w.pages.dev`.
5. Wait until the domain shows **Active** in Pages. Then run the Phase B tests again on
   `https://www.smemarket.ae`, and check that `https://smemarket.ae` still redirects to www.

Rollback: detach `www.smemarket.ae` from `smemarket-site`, re-attach it to `smemarket`, and point the `www`
CNAME back to `smemarket-e2w.pages.dev`.

## Updating the site later

```bash
git pull && npm ci && npm run build:pages && npx wrangler pages deploy out --project-name smemarket-site --branch master
```

For a database change, add a file in `migrations/`, then run
`npx wrangler d1 migrations apply smemarket --remote` before deploying.

Optional, for Google directory results:
`npx wrangler pages secret put GOOGLE_PLACES_KEY --project-name smemarket-site`, then redeploy.
