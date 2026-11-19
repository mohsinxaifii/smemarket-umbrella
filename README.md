# smemarket.ae — umbrella site

Next.js static site for www.smemarket.ae (sister site: growth.smemarket.ae).

- `npm run dev` — local dev
- `npm run build:pages` — static export to `out/` (Cloudflare Pages)

Env (build time):
- `NEXT_PUBLIC_LEAD_ACCESS_KEY` — Web3Forms key; forms email leads to admin@
- `NEXT_PUBLIC_APP_URL` — where the marketplace app runs (listings, /list, login, directory search). Defaults to https://www.smemarket.ae.
- `NEXT_PUBLIC_SITE_URL` — canonical URL (default https://www.smemarket.ae)

Content lives in `src/lib/site.ts`; photos and credits in `public/images/`.
