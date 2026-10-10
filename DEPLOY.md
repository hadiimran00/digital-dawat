# Deploying Digital Dawat (free: Cloudflare Pages + Supabase)

The site is a static export (`out/`), so Cloudflare only serves files. Videos are rendered in the
customer's browser; nothing runs on a server. Data lives in Supabase (already set up).

## Before you start (one-time)
- [ ] Read Cloudflare's current terms to confirm commercial use is allowed on the free plan
      (I could not retrieve their agreement; third-party reviews say yes, unlike Vercel Hobby which forbids it).
- [ ] Optional: make the GitHub repo private (Settings -> General -> Danger zone -> Change visibility).

## Option A: deploy from this computer (simplest, recommended first)
1. Create a free account at https://dash.cloudflare.com/sign-up (use your own login; never share it).
2. In a terminal:
   ```
   cd "D:\New folder (2)\dawat"
   npx wrangler@4.149.0 login        # opens a browser; click Allow
   npm run deploy                    # builds, then uploads ./out
   ```
   The first deploy asks to create the project `digital-dawat`. Your site appears at
   `https://digital-dawat.pages.dev` (if the name is taken, change `--project-name` in package.json's
   `deploy` script and the URLs below).
3. Set the real address so the sitemap and robots.txt are correct, then redeploy:
   put `NEXT_PUBLIC_SITE_URL=https://digital-dawat.pages.dev` in `.env.local`, run `npm run deploy` again.

`wrangler login` stores a Cloudflare login on this computer. Run `npx wrangler@4.149.0 logout` when finished,
or revoke it at dash.cloudflare.com -> My Profile -> API Tokens / OAuth.

## Option B: auto-deploy from GitHub
Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git -> pick the repo.
Build command `npm run build`, output directory `out`, and add the same `NEXT_PUBLIC_*` variables from
`.env.example` under Settings -> Environment variables (they are baked in at build time).
Note: a Git-connected Pages project cannot later be switched to direct upload.

## After the first deploy (required, or login will fail)
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
