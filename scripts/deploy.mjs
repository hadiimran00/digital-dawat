// Builds the site and uploads ./out to Cloudflare Pages (project: digital-dawat).
//
// Wrangler is run from a clean temporary folder that contains only the built files. Running it inside this
// project makes it detect Next.js and try to auto-install an adapter, which edits package.json and breaks
// node_modules. First time only: `npx wrangler@4.149.0 login`, and the project must exist
// (`wrangler pages project create digital-dawat --production-branch main --force`, run from a clean folder).
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PROJECT = process.env.CF_PAGES_PROJECT ?? "digital-dawat";
const WRANGLER = "wrangler@4.149.0";
const run = (cmd, args, opts = {}) => spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32", ...opts });

if (!process.argv.includes("--skip-build")) {
  const b = run("npm", ["run", "build"]);
  if (b.status !== 0) process.exit(b.status ?? 1);
}
if (!existsSync("out")) {
  console.error("No ./out folder. Run the build first.");
  process.exit(1);
}

const dir = mkdtempSync(join(tmpdir(), "dawat-deploy-"));
try {
  cpSync("out", dir, { recursive: true });
  const d = run("npx", ["--yes", WRANGLER, "pages", "deploy", ".", "--project-name", PROJECT, "--branch", "main"], {
    cwd: dir,
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
  });
  process.exitCode = d.status ?? 1;
} finally {
  rmSync(dir, { recursive: true, force: true });
}
