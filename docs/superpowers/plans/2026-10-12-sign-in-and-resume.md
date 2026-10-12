# Sign-in by code and password, session expiry, and resuming guest sending — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Customers sign in with a 6-digit emailed code or a password (no more re-signing in by email link every time they switch app), sessions end after a set time, and a host who stops halfway through sending invitations picks up exactly where they left off on any device.

**Architecture:** Supabase Auth stays the identity provider. The login page uses `signInWithPassword`, `signInWithOtp` + `verifyOtp({type:"email"})`, and `updateUser({password})`. Session limits are enforced in the browser by `useUser()` (Supabase's server-side time-box needs the paid plan). Sending progress already lives in the `guests` table (`sent_at`); the custom WhatsApp message moves from `localStorage` to the user's auth metadata so it follows the account.

**Tech Stack:** Next.js 16 static export, React 19, `@supabase/supabase-js` v2, Tailwind 4, Playwright (`playwright-core` + local Chrome) for end-to-end checks.

**Spec:** the owner's request on 2026-10-12: "add the 6 digit code, sign in should expire after certain time, enter password to sign in again, also … user can continue [sending] right". Plus the standing rule: ask the owner before every commit and deploy.

## Global Constraints

- Code length: 6 digits (Supabase Auth → Providers → Email → "Email OTP length" must be 6).
- Session ends after 7 days without using the site, or 30 days after signing in, whichever is first.
- Passwords: at least 8 characters.
- Git author `Hadi.Imran`; no Claude co-author or "Generated with" lines.
- **Ask the owner before committing and before deploying.**
- Never put the Supabase service-role key anywhere; never paste secrets in chat.
- Test from the customer's point of view on a phone (iPhone 13 viewport) and desktop.

## Review Focus

1. **Signing in on a different app than the email** (Gmail app vs WhatsApp browser): the code must work wherever it's typed. Covered in Task 4.
2. **Wrong or expired code:** clear message saying to send a new one, no crash. Covered in Task 4.
3. **Session older than the limit:** the next visit signs out and explains why, without losing a draft invitation. Drafts are in `localStorage` keyed by template, not by user, so they survive. Covered in Task 4.
4. **Returning host halfway through a guest list:** the queue shows the next unsent guest and "N of M sent"; their custom message is still there on a new device. Covered in Task 3.
5. **Existing sessions from before this change:** they must not be signed out instantly. Their clock starts on the first visit. Covered in Task 1.

---

### Task 1: Session limits in `useUser` — DONE (built, not committed)

**Files:**
- Modify: `src/lib/useUser.tsx`

**Interfaces:**
- Produces: `markSignedIn(): void`, `EXPIRED_FLAG = "dawat:auth:expired"`, `IDLE_LIMIT_MS`, `MAX_SESSION_MS`, `useUser(): User | null | undefined` (signs out expired sessions before returning).

- [x] Track `dawat:auth:signedInAt` and `dawat:auth:lastActive` in `localStorage`.
- [x] On load: if signed in and idle > 7 days or since sign-in > 30 days, `signOut()`, set `EXPIRED_FLAG`, return `null`.
- [x] A session with no `signedInAt` (from before this change) starts its clock instead of expiring.
- [x] `SIGNED_IN` (e.g. from an email link) calls `markSignedIn()`; `SIGNED_OUT` clears the keys.

### Task 2: Login page with password and 6-digit code; account page password and sign-out — DONE (built, not committed)

**Files:**
- Modify: `src/app/login/page.tsx`, `src/app/account/page.tsx`

**Interfaces:**
- Consumes: `markSignedIn`, `EXPIRED_FLAG` from Task 1.
- Produces: `user_metadata.has_password = true` once a password is set.

- [x] Login step "password": email + password → `signInWithPassword` → `markSignedIn()` → go to `next`.
- [x] "Email me a code" → `signInWithOtp` (the email still includes the link) → step "code-sent": 6-digit field (`inputMode="numeric"`, `autoComplete="one-time-code"`) → `verifyOtp({ email, token, type: "email" })`.
- [x] After a code sign-in without `has_password`: step "set-password" (8+ characters, `updateUser({ password, data: { has_password: true } })`) or "Skip for now".
- [x] An expired session shows "For your security you were signed out…" on the login page.
- [x] Account page: "Signed in as …", Sign out, and a Set/Change password form.

### Task 3: Resume guest sending on any device

**Files:**
- Modify: `src/app/guests/page.tsx` (message load/save, queue heading)

**Interfaces:**
- Consumes: `useUser()` (User with `user_metadata`).
- Produces: `user_metadata.wa_messages: Record<slug, string>` (custom WhatsApp message per invitation, max 600 chars).

- [ ] **Step 1: Write the failing check** in `scratchpad/pw/e2e/resume.mjs`. Sign in as the test customer, set a custom message on `/guests?s=xkzsn6j3`, then open the page in a *fresh browser context* (no `localStorage`) and expect the textarea to contain the same message. Also expect the queue heading to say "Continue sending" when some guests are sent and some aren't.

```js
await p1.locator("details summary", { hasText: "Edit the WhatsApp message" }).click();
await p1.locator("details textarea").fill("Salam {name}! Resume test {link}");
await p1.waitForTimeout(1500); // debounce save
const p2 = await (await browser.newContext(ctx)).newPage(); // signed in, empty localStorage
await p2.goto(url); await p2.waitForTimeout(3000);
await p2.locator("details summary", { hasText: "Edit the WhatsApp message" }).click();
ok((await p2.locator("details textarea").inputValue()).includes("Resume test"), "message follows the account");
```

- [ ] **Step 2: Run it.** Expected: FAIL (the message is only in the first context's `localStorage`).
- [ ] **Step 3: Implement.** On load, prefer `user.user_metadata.wa_messages?.[slug]`, then `localStorage`, then `DEFAULT_MESSAGE`. On change, save to `localStorage` right away and, debounced by 800 ms, call `updateUser({ data: { wa_messages: { ...current, [slug]: text.slice(0, 600) } } })`. Heading: "Continue sending" when `0 < sent < total`, otherwise "Send invitations".
- [ ] **Step 4: Run it.** Expected: PASS. Restore the test customer's default message afterwards (the test must not leave a changed message behind).
- [ ] **Step 5: Ask the owner before committing.**

### Task 4: End-to-end verification of sign-in

**Files:**
- Test: `scratchpad/pw/e2e/auth.mjs` (no product code)

- [ ] **Step 1: Password sign-in** with the test customer (password from `e2e/pw.txt`, never printed): lands on `/account`, which shows "Signed in as".
- [ ] **Step 2: Wrong password** shows the "don't match … Email me a code" message.
- [ ] **Step 3: Code flow UI:** "Email me a code" with an empty email asks for the email. The code step accepts only digits, at most 6. A wrong 6-digit code shows the "didn't work … send a new one" message. Mock `/auth/v1/otp` and `/auth/v1/verify` with `page.route` so no real emails are sent and the auth rate limit isn't spent.
- [ ] **Step 4: Expiry:** set `dawat:auth:lastActive` to 8 days ago in `localStorage`, load `/account`, and expect a Sign in link. Then on `/login` expect the "signed out for your security" notice.
- [ ] **Step 5: An old session without `signedInAt`** stays signed in.
- [ ] **Step 6: Regression:** rerun `e2e/order-ux.mjs`, `e2e/order-and-guests.mjs`, `e2e/rsvps-ux.mjs`, `create-after.mjs`, `cr-live.mjs`; all PASS. Run axe on `/login` (phone + desktop) with no violations.

### Task 5: Supabase settings (the owner does these in the dashboard)

- [ ] Auth → Providers → Email: **Email OTP length = 6**.
- [ ] Auth → Email Templates → **Magic Link**: add the code, e.g. `<p>Your sign-in code: <strong>{{ .Token }}</strong></p>`, keeping the link.
- [ ] Auth → SMTP: connect a sender (e.g. Resend, free tier). The built-in sender only emails project team members, so customers can't receive codes without this.
- [ ] Auth → URL Configuration: Site URL `https://digital-dawat.pages.dev`, with it in Redirect URLs.
- [ ] Auth → Providers → Email → **Leaked password protection**: on (Pro feature if unavailable on Free).

### Task 6: Ship (only after the owner says yes)

- [ ] Show the owner the results of Tasks 3–4 and ask: deploy and commit?
- [ ] On yes: `npm run build` with `NEXT_PUBLIC_SITE_URL`, then `node scripts/deploy.mjs --skip-build`, then commit as `Hadi.Imran` and push. This includes the pending invitation-spacing change, if the owner approves that too.
- [ ] Update project memory.
