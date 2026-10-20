"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { NotConfigured, useUser } from "@/lib/useUser";
import { formatPKR, getTemplate } from "@/lib/templates";

interface Row {
  id: string;
  amount_pkr: number;
  status: string;
  created_at: string;
  invites: { slug: string; template_id: string; status: string } | null;
}

const LABEL: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  pending_review: "Receipt under review",
  approved: "Live",
  rejected: "Payment not confirmed",
};

/** Set or change the password used to sign in (the first sign-in is by emailed code). */
function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ ok: false, text: "Use at least 8 characters." });
    setBusy(true);
    const { error } = await getSupabase()!.auth.updateUser({ password: pw, data: { has_password: true } });
    setBusy(false);
    if (error) return setMsg({ ok: false, text: error.message });
    setPw("");
    setMsg({ ok: true, text: "Password saved. Use it with your email next time you sign in." });
  }
  return (
    <form onSubmit={save} className="rounded-2xl border border-line bg-card p-5">
      <h2 className="font-semibold">{hasPassword ? "Change your password" : "Set a password"}</h2>
      <p className="mt-1 text-sm text-foreground/70">
        {hasPassword ? "You sign in with your email and password." : "Sign in faster next time, without waiting for an email code."} For your security you&apos;re signed out after 7 days away, or 30 days after signing in.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <label className="min-w-0 flex-1"><span className="sr-only">New password</span>
          <input type="password" autoComplete="new-password" minLength={8} placeholder="New password (8+ characters)" className="field" value={pw} onChange={(e) => setPw(e.target.value)} />
        </label>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`mt-2 text-sm ${msg.ok ? "text-green-800" : "text-red-700"}`}>{msg.text}</p>}
    </form>
  );
}

export default function Account() {
  const router = useRouter();
  const user = useUser();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    sb.from("orders").select("id,amount_pkr,status,created_at,invites(slug,template_id,status)").order("created_at", { ascending: false })
      .then(({ data }) => setRows((data as unknown as Row[]) ?? []));
  }, [user]);

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined) return <p className="p-8 text-center">Loading…</p>;
  if (user === null) return <p className="p-8 text-center"><Link className="underline" href="/login?next=/account">Sign in</Link> to see your orders.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-4xl font-bold text-brand">My orders</h1>
        <button type="button" className="min-h-11 text-sm underline underline-offset-4"
          onClick={async () => { await getSupabase()?.auth.signOut({ scope: "local" }); router.replace("/"); }}>Sign out</button>
      </div>
      <p className="mt-1 text-sm text-foreground/70">Signed in as {user.email}</p>
      <div className="mt-6 space-y-3">
        {rows === null && <p>Loading…</p>}
        {rows?.length === 0 && <p>No orders yet. <Link className="underline" href="/templates">Browse templates</Link>.</p>}
        {rows?.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card p-4">
            <div>
              <p className="font-semibold">{getTemplate(r.invites?.template_id ?? "")?.name ?? "Invitation"} · {formatPKR(r.amount_pkr)}</p>
              <p className="text-sm text-foreground/70">{new Date(r.created_at).toLocaleDateString("en-GB")} · {LABEL[r.status] ?? r.status}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.invites && (
                <Link className="btn btn-primary" href={`/guests?s=${r.invites.slug}`}>Guests</Link>
              )}
              {r.status === "approved" && r.invites && (
                <>
                  <Link className="btn btn-ghost" href={`/i?s=${r.invites.slug}`}>Open</Link>
                  <Link className="btn btn-ghost" href={`/rsvps?s=${r.invites.slug}`}>RSVPs</Link>
                  <Link className="btn btn-ghost" href={`/video?s=${r.invites.slug}`}>Download video</Link>
                </>
              )}
              {r.status !== "approved" && <Link className="btn btn-primary" href={`/order?id=${r.id}`}>{r.status === "pending_review" ? "View" : "Pay"}</Link>}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10"><PasswordSection hasPassword={Boolean(user.user_metadata?.has_password)} /></div>
    </div>
  );
}
