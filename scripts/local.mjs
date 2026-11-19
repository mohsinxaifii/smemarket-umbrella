// Runs the whole site on this machine: the Next.js site with live reload on http://localhost:3000,
// and the marketplace API (Pages Functions + local database) on :8788 behind it.
// The site forwards every /api request to the API (see next.config.ts), so you only ever open :3000.
//   npm run local          → start (seeds sample data the first time)
//   npm run local:reset    → wipe local data, reseed, start
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";

const reset = process.argv.includes("--reset");
execFileSync("node", ["scripts/build-peeps.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/seed-local.mjs", ...(reset ? ["--reset"] : [])], { stdio: "inherit" });

// leads go to the local database only; no emails to the real inbox while testing
// its own build folder, so production builds (.next / out) never clash with the running dev site
const env = { ...process.env, NEXT_PUBLIC_LEAD_ACCESS_KEY: "", NEXT_PUBLIC_LEAD_ENDPOINT: "", NEXT_TELEMETRY_DISABLED: "1", NEXT_DIST_DIR: ".next-local" };
rmSync(".next-local", { recursive: true, force: true });
const kids = [
  spawn("npx", ["next", "dev", "-p", "3000"], { stdio: ["ignore", "pipe", "inherit"], env }),
  // the API only; wrangler wants its static folder to exist, the site itself comes from next dev
  (mkdirSync("out", { recursive: true }), spawn("npx", ["wrangler", "pages", "dev", "out", "--port", "8788"], { stdio: ["ignore", "pipe", "inherit"], env })),
];
const [next, api] = kids;
next.stdout.on("data", (d) => {
  const s = String(d);
  if (/error/i.test(s)) process.stdout.write(`[site] ${s}`);
});
let told = false;
api.stdout.on("data", (d) => {
  const s = String(d);
  if (!told && /Ready on/.test(s)) {
    told = true;
    warmUp();
    console.log("\n  SMEmarket is running locally →  http://localhost:3000\n");
    console.log("  Accounts: admin@smemarket.ae / admin12345 · seller@test.ae / test12345 · buyer@test.ae / test12345");
    console.log("  The first page load compiles, so give it a few seconds. Ctrl+C to stop.\n");
  }
  if (/error|✘/i.test(s)) process.stdout.write(`[api] ${s}`);
});
// Next's dev server builds each page the first time it's opened, and a page hit mid-build can briefly 404.
// Open every page once in the background so they're all ready before you click around.
async function warmUp() {
  const pages = ["/", "/listings", "/listing?id=l_jlt_barber", "/sell", "/login", "/account", "/nda", "/messages", "/admin", "/brokerage", "/advisory", "/directory", "/about", "/contact", "/privacy"];
  for (let tries = 0; tries < 60; tries++) {
    try {
      await fetch("http://localhost:3000/");
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  for (const p of pages) await fetch(`http://localhost:3000${p}`).catch(() => {});
  console.log("  All pages are ready.\n");
}

const stop = () => {
  kids.forEach((k) => k.kill("SIGINT"));
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
kids.forEach((k) => k.on("exit", (code) => code && code !== 0 && console.log(`a local server stopped (code ${code})`)));
