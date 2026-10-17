// Builds the site and uploads ./out to Cloudflare Pages.
//
//   npm run deploy               testing: project digital-dawat  -> https://digital-dawat.pages.dev (not indexed by Google)
//   npm run deploy -- --prod     production: project kabootar-post -> https://kabootarpost.com
//
// Both use the same Supabase project (the same customers, orders and replies), so test with test accounts.
// Wrangler is run from a clean temporary folder that contains only the built files. Running it inside this
// project makes it detect Next.js and try to auto-install an adapter, which edits package.json and breaks
// node_modules. First time only: `npx wrangler@4.149.0 login`, and the projects must exist
// (`wrangler pages project create <name> --production-branch main`, run from a clean folder).
import { spawnSync } from "node:child_process";
import { appendFileSync, cpSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PROD = process.argv.includes("--prod");
const PROJECT = process.env.CF_PAGES_PROJECT ?? (PROD ? "kabootar-post" : "digital-dawat");
const SITE_URL = PROD ? "https://kabootarpost.com" : "https://digital-dawat.pages.dev";
const WRANGLER = "wrangler@4.149.0";
// Commands are fixed strings (no user input), run through the shell so npm/npx work on Windows too.
const run = (cmd, opts = {}) => spawnSync(cmd, { stdio: "inherit", shell: true, ...opts });

console.log(`Deploying ${PROD ? "PRODUCTION" : "testing"}: ${PROJECT} (${SITE_URL})`);
if (!process.argv.includes("--skip-build")) {
  // the site address goes into links, sitemaps and social previews, so it is fixed at build time
  const b = run("npm run build", { env: { ...process.env, NEXT_PUBLIC_SITE_URL: SITE_URL } });
  if (b.status !== 0) process.exit(b.status ?? 1);
}
if (!existsSync("out")) {
  console.error("No ./out folder. Run the build first.");
  process.exit(1);
}
// Placeholder images and songs (public/placeholder) are for local review only and must never be published.
if (existsSync("out/placeholder") && !process.argv.includes("--allow-placeholders")) {
  console.error("Refusing to deploy: the build contains public/placeholder (unlicensed review assets).");
  console.error("Replace them with licensed files (and point the templates at the new paths), or move them out of public/.");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "dawat-deploy-"));
try {
  cpSync("out", dir, { recursive: true });
  // the testing copy must never compete with the real site in search results
  if (!PROD) appendFileSync(join(dir, "_headers"), "\n/*\n  X-Robots-Tag: noindex, nofollow\n");
  const d = run(`npx --yes ${WRANGLER} pages deploy . --project-name ${PROJECT} --branch main`, {
    cwd: dir,
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
  process.exitCode = d.status ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
