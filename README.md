# smemarket.ae — umbrella site

Next.js static site for www.smemarket.ae (sister site: growth.smemarket.ae).

- `npm run dev` — local dev
- `npm run build:pages` — static export to `out/` (Cloudflare Pages)

Env (build time):
- `NEXT_PUBLIC_LEAD_ACCESS_KEY` — Web3Forms key; forms email leads to admin@
- `NEXT_PUBLIC_APP_URL` — where the marketplace app runs (listings, /list, login, directory search). Defaults to https://www.smemarket.ae.
- `NEXT_PUBLIC_SITE_URL` — canonical URL (default https://www.smemarket.ae)

Content lives in `src/lib/site.ts`; photos and credits in `public/images/`.

## Marketplace (accounts, listings, NDAs, messages, admin)

- API: `functions/api/[[path]].ts` → `server/api.ts` (Cloudflare Pages Functions). Data in D1 (`migrations/`), files in R2.
- **Run everything locally: `npm run local`** → http://localhost:3000 (site with live reload; /api is forwarded to the local API + database with sample data on :8788).
  `npm run local:reset` wipes local data and reseeds. Sample logins: admin@smemarket.ae / admin12345, seller@test.ae / test12345, buyer@test.ae / test12345.
  Lead emails are switched off locally; leads land in /admin → Leads.
- Admins: any account whose email is in `ADMIN_EMAILS` (wrangler.toml) gets the admin role, then /admin.

First deploy:
1. `npx wrangler d1 create smemarket` → paste the id into wrangler.toml
2. `npx wrangler r2 bucket create smemarket-files`
3. `npm run db:migrate`
4. `npm run build:pages && npx wrangler pages deploy out`
