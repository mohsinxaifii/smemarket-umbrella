// Runs the whole site on this machine: the Next.js site with live reload on http://localhost:3000,
// and the marketplace API (Pages Functions + local database) on :8788 behind it.
// The site forwards every /api request to the API (see next.config.ts), so you only ever open :3000.
//   npm run local          → start (seeds sample data the first time)
//   npm run local:reset    → wipe local data, reseed, start
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const reset = process.argv.includes("--reset");
execFileSync("node", ["scripts/build-peeps.mjs"], { stdio: "inherit" });
execFileSync("node", ["scripts/seed-local.mjs", ...(reset ? ["--reset"] : [])], { stdio: "inherit" });

// leads go to the local database only; no emails to the real inbox while testing
const env = { ...process.env, NEXT_PUBLIC_LEAD_ACCESS_KEY: "", NEXT_PUBLIC_LEAD_ENDPOINT: "", NEXT_TELEMETRY_DISABLED: "1" };
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
    console.log("\n  SMEmarket is running locally →  http://localhost:3000\n");
    console.log("  Accounts: admin@smemarket.ae / admin12345 · seller@test.ae / test12345 · buyer@test.ae / test12345");
    console.log("  The first page load compiles, so give it a few seconds. Ctrl+C to stop.\n");
  }
  if (/error|✘/i.test(s)) process.stdout.write(`[api] ${s}`);
});
const stop = () => {
  kids.forEach((k) => k.kill("SIGINT"));
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
kids.forEach((k) => k.on("exit", (code) => code && code !== 0 && console.log(`a local server stopped (code ${code})`)));
