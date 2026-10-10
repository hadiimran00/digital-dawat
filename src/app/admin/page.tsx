"use client";

import { useCallback, useEffect, useState } from "react";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { NotConfigured, useUser } from "@/lib/useUser";
import { formatPKR, getTemplate } from "@/lib/templates";

interface Row {
  id: string; amount_pkr: number; status: string; receipt_path: string | null;
  payment_method: string | null; payment_reference: string | null; created_at: string;
  invites: { slug: string; template_id: string; content: { host1: string; host2: string } } | null;
}

export default function Admin() {
  const user = useUser();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [filter, setFilter] = useState("pending_review");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !user) return;
    const a = await sb.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
    setIsAdmin(Boolean(a.data));
    if (!a.data) return;
    const { data, error } = await sb.from("orders")
      .select("id,amount_pkr,status,receipt_path,payment_method,payment_reference,created_at,invites(slug,template_id,content)")
      .order("created_at", { ascending: false });
    if (error) setErr(error.message);
    setRows((data as unknown as Row[]) ?? []);
  }, [user]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- loads remote data once the user is known
  useEffect(() => { load(); }, [load]);

  async function viewReceipt(path: string) {
    const sb = getSupabase();
    const { data, error } = await sb!.storage.from("receipts").createSignedUrl(path, 120);
    if (error) setErr(error.message);
    else window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  async function review(id: string, approve: boolean) {
    const note = approve ? null : window.prompt("Reason for rejecting (shown to the customer):") ?? "";
    if (!approve && note === "") return;
    const { error } = await getSupabase()!.rpc("review_order", { order_id: id, approve, note });
    if (error) setErr(error.message);
    else load();
  }

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <p className="p-8 text-center">Sign in first.</p>;
  if (isAdmin === false) return <p className="p-8 text-center">This area is for site administrators.</p>;
  if (!rows) return <p className="p-8 text-center">Loading…</p>;

  const shown = rows.filter((r) => filter === "all" || r.status === filter);
  const revenue = rows.filter((r) => r.status === "approved").reduce((n, r) => n + r.amount_pkr, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-brand">Admin</h1>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-line bg-card p-4"><dt className="text-sm text-foreground/70">Confirmed revenue</dt><dd className="text-xl font-bold">{formatPKR(revenue)}</dd></div>
        <div className="rounded-xl border border-line bg-card p-4"><dt className="text-sm text-foreground/70">To review</dt><dd className="text-xl font-bold">{rows.filter((r) => r.status === "pending_review").length}</dd></div>
        <div className="rounded-xl border border-line bg-card p-4"><dt className="text-sm text-foreground/70">Live invites</dt><dd className="text-xl font-bold">{rows.filter((r) => r.status === "approved").length}</dd></div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter orders">
        {["pending_review", "awaiting_payment", "approved", "rejected", "all"].map((f) => (
          <button key={f} aria-pressed={filter === f} onClick={() => setFilter(f)} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}>{f.replace("_", " ")}</button>
        ))}
      </div>
      {err && <p role="alert" className="mt-4 text-red-700">{err}</p>}
      <ul className="mt-4 space-y-3">
        {shown.length === 0 && <li className="text-foreground/70">Nothing here.</li>}
        {shown.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card p-4">
            <div>
              <p className="font-semibold">
                {r.invites?.content.host1}{r.invites?.content.host2 && ` & ${r.invites.content.host2}`} · {getTemplate(r.invites?.template_id ?? "")?.name} · {formatPKR(r.amount_pkr)}
              </p>
              <p className="text-sm text-foreground/70">
                {new Date(r.created_at).toLocaleString("en-GB")} · {r.status.replace("_", " ")}
                {r.payment_method && ` · ${r.payment_method}`}{r.payment_reference && ` · ref ${r.payment_reference}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {r.receipt_path && <button className="btn btn-ghost" onClick={() => viewReceipt(r.receipt_path!)}>View receipt</button>}
              {r.invites && <a className="btn btn-ghost" href={`/i?s=${r.invites.slug}`} target="_blank" rel="noopener noreferrer">Preview</a>}
              {r.status === "pending_review" && (
                <>
                  <button className="btn btn-primary" onClick={() => review(r.id, true)}>Approve &amp; publish</button>
                  <button className="btn btn-ghost" onClick={() => review(r.id, false)}>Reject</button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
