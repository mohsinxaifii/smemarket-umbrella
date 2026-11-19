# Deploy smemarket.ae to Cloudflare Pages

This repo is the full SMEmarket site: the static website (Next.js export in `out/`) and the marketplace API
(Cloudflare Pages Functions in `functions/`, code in `server/`). It uses one D1 database (accounts, listings,
NDAs, messages, leads) and one private R2 bucket (buyer ID documents, sellers' data-room files).

When it's done, `https://www.smemarket.ae` and `https://smemarket.ae` serve this site, and sign-up, login,
listings, selling, NDA, messages, the directory search, /admin and every form work.

## What you need first

- A Cloudflare API token with: **Account → D1: Edit**, **Account → Workers R2 Storage: Edit**,
  **Account → Cloudflare Pages: Edit**, **Zone (smemarket.ae) → DNS: Edit**.
- The Cloudflare account ID.
- The Web3Forms access key (the same one the growth site uses). It emails every form submission to the team.
- Optional: a Google Places API key (`GOOGLE_PLACES_KEY`). With it, the directory shows Google results.
  Without it, it uses OpenStreetMap.
- Node 22.

```bash
export CLOUDFLARE_API_TOKEN=...      # the token above
export CLOUDFLARE_ACCOUNT_ID=...
git clone https://github.com/mohsinxaifii/smemarket-umbrella.git && cd smemarket-umbrella
npm ci
```

## 1. Create the database and file storage (one time)

```bash
npx wrangler d1 create smemarket
# copy the "database_id" it prints into wrangler.toml, replacing 00000000-0000-0000-0000-000000000000

npx wrangler r2 bucket create smemarket-files   # private: do NOT enable public access

npx wrangler d1 migrations apply smemarket --remote          # creates the tables
npx wrangler d1 execute smemarket --remote --file scripts/seed-production.sql   # the 2 real listings
```

R2 must be enabled on the account first (Dashboard → R2 → enable; there is a free tier).

Commit the `database_id` change:

```bash
git add wrangler.toml && git commit -m "Set production D1 database id" && git push
```

## 2. Build and deploy

```bash
export NEXT_PUBLIC_LEAD_ACCESS_KEY=...   # the Web3Forms key, baked into the build so forms email the team
export NEXT_PUBLIC_SITE_URL=https://www.smemarket.ae
npm run build:pages                      # writes the site to out/

npx wrangler pages project create smemarket --production-branch master   # first time only
npx wrangler pages deploy out --project-name smemarket --branch master
```

Run `deploy` from the repo root, so the `functions/` folder (the API) is deployed with the site. The D1
and R2 bindings and `ADMIN_EMAILS` come from `wrangler.toml`.

Optional Google directory results:

```bash
npx wrangler pages secret put GOOGLE_PLACES_KEY --project-name smemarket
```

Then redeploy, with the same two commands as above.

Check it on the `*.pages.dev` URL that deploy prints before touching the domain:

- `/` loads and shows the 2 listings in "Just listed".
- `/listings` shows them.
- `/login?tab=signup` creates an account.
- `/api/me` returns JSON.
- `/directory`: a search returns businesses.
- `/contact`: sending the form arrives in the team inbox.

## 3. Point smemarket.ae at it

Before you change anything:

- **Save a copy of every existing DNS record** for smemarket.ae, so the old site can be restored.
- **Do not touch** the `MX`, `TXT` (SPF/DKIM/DMARC) or mail records. Email must keep working.
- **Do not touch** `growth.smemarket.ae`. It is a separate site.

Then:

1. Check where DNS lives with `dig NS smemarket.ae +short`. If the answers aren't Cloudflare
   nameservers, add the zone to Cloudflare and switch the nameservers at the registrar first.
2. Remove the old site's records for `@` (A/AAAA/CNAME) and `www`.
3. Add both domains to the Pages project:
   ```bash
   for d in www.smemarket.ae smemarket.ae; do
     curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/smemarket/domains" \
       -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json" --data "{\"name\":\"$d\"}"
   done
   ```
   Cloudflare then creates the proxied CNAME records to `smemarket.pages.dev`. If it doesn't, add them
   yourself: `www` and `@` as CNAME to `smemarket.pages.dev`, proxied.
4. Optional: add a Redirect Rule `smemarket.ae/*` → `https://www.smemarket.ae/${1}` (301), so there's one
   canonical address.

## 4. After it's live

1. Create the admin account. Sign up at `https://www.smemarket.ae/login?tab=signup` with
   **admin@smemarket.ae** and a strong password. That email gets the admin role, set by `ADMIN_EMAILS` in
   `wrangler.toml`. Then open `/admin`.
2. Test the full flow:
   - Sign up as a buyer, then sign the NDA at `/nda` and upload an ID.
   - Request access to a listing.
   - Approve the buyer and the request in `/admin`.
   - Send a message.
   - List a test business at `/sell`, and withdraw it afterwards.

## Updating the site later

```bash
git pull && npm ci && npm run build:pages && npx wrangler pages deploy out --project-name smemarket --branch master
```

For a database change, add a new file in `migrations/`, then run
`npx wrangler d1 migrations apply smemarket --remote` before deploying.

## Rolling back

In Cloudflare Pages → smemarket → Deployments, pick an earlier deployment and choose **Rollback**. To bring
back the old site entirely, restore the DNS records you saved in step 3.
