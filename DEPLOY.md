# Deploying Digital Dawat (free: Cloudflare Pages + Supabase)

The site is a static export (`out/`), so Cloudflare only serves files. Videos are rendered in the
customer's browser; nothing runs on a server. Data lives in Supabase (already set up).

## Live site
**https://digital-dawat.pages.dev** (Cloudflare Pages project `digital-dawat`, first deployed 2026-10-10).

## Before real customers (one-time checklist)
- [ ] Read Cloudflare's current terms to confirm commercial use is allowed on the free plan
      (their agreement could not be retrieved; third-party reviews say yes, unlike Vercel Hobby which forbids it).
- [ ] Optional: make the GitHub repo private (Settings -> General -> Danger zone -> Change visibility).

## Deploying again
```
cd "D:\New folder (2)\dawat"
npm run deploy          # builds, then uploads ./out from a clean temp folder
```
First time on a new computer: `npx wrangler@4.149.0 login` (opens a browser; click Allow). The project already exists.

**Do not run `wrangler` inside this folder.** It detects Next.js and tries to auto-install an adapter, which edits
`package.json` and breaks `node_modules`. `scripts/deploy.mjs` copies `out/` to a temp folder and runs Wrangler there.

The project was created with `wrangler pages project create digital-dawat --production-branch main --force`, run from
a clean folder. The `--force` is needed because newer Wrangler otherwise routes Pages through Workers and requires a
`workers.dev` name. Do not pass `--force` again.

`wrangler login` stores a Cloudflare login on this computer. Run `npx wrangler@4.149.0 logout` when finished,
or revoke it at dash.cloudflare.com -> My Profile -> API Tokens / OAuth.

## Option B: auto-deploy from GitHub
Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> pick the repo.
Build command `npm run build`, output directory `out`, and add the same `NEXT_PUBLIC_*` variables from
`.env.example` under Settings -> Environment variables (they are baked in at build time).
Note: a Git-connected Pages project cannot later be switched to direct upload.

## After deploying (required, or login will fail)
1. Supabase -> Authentication -> URL Configuration:
   - Site URL: `https://digital-dawat.pages.dev`
   - Redirect URLs: add `https://digital-dawat.pages.dev/**` (keep `http://localhost:3000/**` for development).
2. Open the site and test, in this order:
   - [ ] Home, templates, hover previews, a template demo (tap to open).
   - [ ] Sign in with your email (check spam). The link must return you to the live site, not localhost.
   - [ ] `/admin` opens (your account is already an admin).
   - [ ] Place a test order with a cheap template, upload any screenshot as receipt, approve it in `/admin`,
         open the invite link, send an RSVP, see it on the RSVP page.
   - [ ] Delete the test order/invite afterwards (Supabase table editor) so it does not clutter real data.
3. Phones: open the live site on a real iPhone and an Android phone, create a video in each style,
   and note how long it takes. (Only desktop Chrome has been tested so far.)

## Free domain for now
Use the `*.pages.dev` address. When you buy a domain later: Pages project -> Custom domains -> Set up a domain.
Then update the Supabase Site URL/redirects and `NEXT_PUBLIC_SITE_URL`, and redeploy. Old `pages.dev` links keep working.

## Known limits and next steps
- Supabase free projects pause after about a week of inactivity (all invite links stop loading until restored).
  Set up a weekly keep-alive ping, or move to the paid plan before real customers rely on it.
- Supabase's built-in login email is rate limited; use your own email provider (SMTP) before launch.
- WhatsApp link previews need a small Cloudflare Pages Function (not built yet).
- Review before launch: the draft refund policy, the Urdu default wording, and template prices.
- `npm run build` runs `scripts/fix-rsc-paths.mjs` afterwards, which copies Next.js route payload files to the dotted
  paths the browser requests. Without it every prefetch 404s and each click becomes a full page load.
