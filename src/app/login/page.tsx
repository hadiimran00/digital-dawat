"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { NotConfigured } from "@/lib/useUser";

function Login() {
  const next = useSearchParams().get("next") ?? "/account";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!backendConfigured) return <NotConfigured />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setError("");
    // Only same-site relative paths are allowed as the post-login target.
    const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}${safeNext}` },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl font-bold text-brand">Sign in</h1>
      {sent ? (
        <p role="status" className="mt-4 rounded-xl border border-line bg-card p-5">
          Check <strong>{email}</strong> for a sign-in link. You can close this tab.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">Email
            <input type="email" required autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <p className="text-sm text-foreground/60">No password needed. We use your email only for your orders.</p>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><Login /></Suspense>;
}
