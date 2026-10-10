# Digital Dawat — digital invitations

Next.js static export + Supabase (auth, Postgres, storage) + Cloudflare Pages.

## Run locally
```
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
```
Without Supabase keys the site runs in preview mode: browsing, search, editing, live preview and video export work; ordering, accounts, public invites, RSVPs and admin show a "backend not connected" notice.

## Connect the backend
1. Create a free project at supabase.com.
2. SQL editor → run `supabase/schema.sql`.
3. Authentication → URL configuration: add your site URL (and `http://localhost:3000`) as redirect URLs.
4. Copy `.env.example` to `.env.local`; set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the anon key is public by design; security comes from the row-level-security policies in the schema) and your payment details.
5. Sign in once on the site, then make yourself admin in the SQL editor:
   `insert into public.admins select id from auth.users where email = 'you@example.com';`
6. Never put the `service_role` key in this project.

## Deploy (Cloudflare Pages)
Build command `npm run build`, output directory `out`, and add the same `NEXT_PUBLIC_*` variables.

## Keeping prices in sync
Prices live in `src/lib/templates.ts` (display) and the `template_prices` table (what orders are charged). Change both.
