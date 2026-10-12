"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { EXPIRED_FLAG, NotConfigured, markSignedIn } from "@/lib/useUser";

type Step = "password" | "code-sent" | "set-password";
const CODE_LEN = 6;

function Login() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/account";
  // Only a page on this site may be the post-login target: resolve it like the browser would and compare origins
  // (catches tricks such as "/\evil.com" that a startsWith("/") check lets through)
  const safeNext = (() => {
    if (typeof window === "undefined") return "/account";
    try {
      const u = new URL(next, window.location.origin);
      return u.origin === window.location.origin ? `${u.pathname}${u.search}${u.hash}` : "/account";
    } catch { return "/account"; }
  })();
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [usePassword, setUsePassword] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(EXPIRED_FLAG)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- explain why they were signed out
        setNotice("For your security you were signed out. Sign in again with a code by email, or your password.");
        localStorage.removeItem(EXPIRED_FLAG); // explain it once, not on every visit
      }
    } catch {}
  }, []);

  if (!backendConfigured) return <NotConfigured />;
  const sb = getSupabase()!;
  const done = () => { markSignedIn(); router.replace(safeNext); };

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setError(error.message === "Invalid login credentials"
      ? "That email and password don't match. If you haven't set a password yet, tap “Forgot it? Email me a code instead”."
      : error.message);
    done();
  }

  async function sendCode() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Type your email address first.");
    setBusy(true); setError("");
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      // the email carries both the code and a link; the link keeps working for anyone who taps it
      options: { emailRedirectTo: `${window.location.origin}${safeNext}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setCode(""); setStep("code-sent");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\D/g, "");
    if (token.length !== CODE_LEN) return setError(`Type the ${CODE_LEN}-digit code from the email.`);
    setBusy(true); setError("");
    const { data, error } = await sb.auth.verifyOtp({ email: email.trim(), token, type: "email" });
    setBusy(false);
    if (error) return setError("That code didn't work. It may have expired: send a new one and use the latest email.");
    markSignedIn();
    // first time (or forgot it): offer a password so next time is quicker
    if (!data.user?.user_metadata?.has_password) setStep("set-password");
    else router.replace(safeNext);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) return setError("Use at least 8 characters.");
    setBusy(true); setError("");
    const { error } = await sb.auth.updateUser({ password: newPassword, data: { has_password: true } });
    setBusy(false);
    if (error) return setError(error.message);
    router.replace(safeNext);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-brand">{step === "set-password" ? "Set a password" : "Sign in"}</h1>
      {notice && step === "password" && <p role="status" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}

      {step === "password" && (
        <div className="mt-6 space-y-4">
          {/* most customers are new: the email code comes first; a password is the quicker way back for returning hosts */}
          <label className="block">Email
            <input type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          {!usePassword ? (
            <>
              <button type="button" className="btn btn-primary w-full" disabled={busy} onClick={sendCode}>{busy ? "Sending…" : "Email me a sign-in code"}</button>
              <p className="text-sm text-foreground/70">We&apos;ll email you a {CODE_LEN}-digit code to type here. No account or password needed.</p>
              <button type="button" className="min-h-11 text-sm font-semibold underline underline-offset-4" onClick={() => { setUsePassword(true); setError(""); }}>I have a password</button>
            </>
          ) : (
            <form onSubmit={signInWithPassword} className="space-y-4">
              <label className="block">Password
                <input type="password" autoComplete="current-password" className="field" value={password} autoFocus onChange={(e) => setPassword(e.target.value)} />
              </label>
              <button className="btn btn-primary w-full" disabled={busy || !password}>{busy ? "Signing in…" : "Sign in"}</button>
              <button type="button" className="min-h-11 text-sm underline underline-offset-4" onClick={() => { setUsePassword(false); setError(""); }}>Forgot it? Email me a code instead</button>
            </form>
          )}
        </div>
      )}

      {step === "code-sent" && (
        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          <p className="rounded-xl border border-line bg-card p-4 text-sm">We sent a {CODE_LEN}-digit code to <strong>{email}</strong>. It can take a minute to arrive; check spam too.</p>
          <label className="block">Code
            <input inputMode="numeric" autoComplete="one-time-code" className="field text-center text-2xl tracking-[0.5em] tabular-nums" value={code} autoFocus
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, CODE_LEN))} />
          </label>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Checking…" : "Sign in"}</button>
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <button type="button" className="min-h-11 underline underline-offset-4" onClick={sendCode} disabled={busy}>Send a new code</button>
            <button type="button" className="min-h-11 underline underline-offset-4" onClick={() => { setStep("password"); setError(""); }}>Use a different email</button>
          </div>
        </form>
      )}

      {step === "set-password" && (
        <form onSubmit={savePassword} className="mt-6 space-y-4">
          <p className="text-sm text-foreground/80">You&apos;re signed in. Set a password so next time you can sign in straight away, without waiting for an email.</p>
          <label className="block">New password
            <input type="password" autoComplete="new-password" minLength={8} className="field" value={newPassword} autoFocus onChange={(e) => setNewPassword(e.target.value)} />
            <span className="mt-1 block text-xs text-foreground/70">At least 8 characters.</span>
          </label>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Save password and continue"}</button>
          <button type="button" className="btn btn-ghost w-full" onClick={() => router.replace(safeNext)}>Skip for now</button>
        </form>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
