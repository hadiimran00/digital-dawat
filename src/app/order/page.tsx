"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase, paymentInfo } from "@/lib/supabase";
import { NotConfigured, useUser } from "@/lib/useUser";
import { formatPKR } from "@/lib/templates";

interface Order {
  id: string;
  amount_pkr: number;
  status: "awaiting_payment" | "pending_review" | "approved" | "rejected";
  admin_note: string | null;
  invites: { slug: string; template_id: string } | null;
}

type Method = "bank" | "jazzcash" | "easypaisa" | "sadapay";
const METHODS: { id: Method; label: string }[] = [
  { id: "sadapay", label: "SadaPay" },
  { id: "bank", label: "Bank transfer" },
  { id: "jazzcash", label: "JazzCash" },
  { id: "easypaisa", label: "Easypaisa" },
];
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

function OrderInner() {
  const id = useSearchParams().get("id");
  const user = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const methods = METHODS.filter((m) => paymentInfo[m.id]);
  const [picked, setPicked] = useState<Method | null>(null);
  const method: Method = picked ?? methods[0]?.id ?? "sadapay";
  const [ref, setRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !id) return;
    const { data, error } = await sb.from("orders").select("id,amount_pkr,status,admin_note,invites(slug,template_id)").eq("id", id).single();
    if (error) setMsg("Order not found.");
    else setOrder(data as unknown as Order);
  }, [id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- loads remote data once the user is known
  useEffect(() => { if (user) load(); }, [user, load]);

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined) return <p className="p-8 text-center">Loading…</p>;
  if (user === null) return <p className="p-8 text-center"><Link className="underline" href={`/login/?next=${encodeURIComponent(`/order/?id=${id}`)}`}>Sign in</Link> to view your order.</p>;
  if (!order) return <p className="p-8 text-center">{msg || "Loading…"}</p>;

  const details = paymentInfo[method];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !user || !order) return;
    if (!file) return setMsg("Please attach a photo or screenshot of your payment receipt.");
    const ext = ALLOWED[file.type];
    if (!ext) return setMsg("Receipt must be a JPG, PNG or WebP image.");
    if (file.size > MAX_BYTES) return setMsg("Receipt must be under 5 MB.");
    setBusy(true);
    setMsg("");
    const path = `${user.id}/${order.id}.${ext}`;
    const up = await sb.storage.from("receipts").upload(path, file, { upsert: true, contentType: file.type });
    if (up.error) { setBusy(false); return setMsg(up.error.message); }
    const { error } = await sb.from("orders")
      .update({ status: "pending_review", receipt_path: path, payment_method: method, payment_reference: ref.trim() || null })
      .eq("id", order.id);
    setBusy(false);
    if (error) return setMsg(error.message);
    load();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-brand">Payment</h1>
      <p className="mt-2 text-lg">Amount due: <strong>{formatPKR(order.amount_pkr)}</strong></p>

      {order.status === "approved" && order.invites && (
        <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-5">
          <p className="font-semibold text-green-900">Payment confirmed. Your invitation is live.</p>
          <Link className="btn btn-primary mt-3" href={`/i/?s=${order.invites.slug}`}>Open my invitation</Link>
        </div>
      )}
      {order.status === "pending_review" && (
        <p role="status" className="mt-6 rounded-xl border border-line bg-card p-5">
          Receipt received. We’ll confirm your payment and publish your invitation. You can check back on <Link className="underline" href="/account/">My orders</Link>.
        </p>
      )}
      {order.status === "rejected" && (
        <p role="alert" className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900">
          We couldn’t confirm this payment{order.admin_note ? `: ${order.admin_note}` : "."} You can upload a new receipt below.
        </p>
      )}

      {(order.status === "awaiting_payment" || order.status === "rejected") && (
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div role="radiogroup" aria-label="Payment method" className="flex flex-wrap gap-2">
            {methods.map((m) => (
              <button key={m.id} type="button" role="radio" aria-checked={method === m.id} onClick={() => setPicked(m.id)}
                className={`btn ${method === m.id ? "btn-primary" : "btn-ghost"}`}>
                {m.label}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-card p-4 text-sm">
            {details ? <p className="whitespace-pre-line">{details}</p> : (
              <p className="text-amber-900">Payment details for this method have not been set up yet. Please contact us on WhatsApp{paymentInfo.whatsapp ? ` (+${paymentInfo.whatsapp})` : ""} before paying.</p>
            )}
          </div>
          <label className="block">Transaction ID / reference (optional)
            <input className="field" value={ref} maxLength={60} onChange={(e) => setRef(e.target.value)} />
          </label>
          <label className="block">Receipt screenshot (JPG, PNG or WebP, max 5 MB)
            <input type="file" accept="image/jpeg,image/png,image/webp" className="field pt-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <button className="btn btn-primary w-full" disabled={busy || !details}>{busy ? "Uploading…" : "I’ve paid — submit receipt"}</button>
          {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
        </form>
      )}
    </div>
  );
}

export default function OrderPage() {
  return <Suspense><OrderInner /></Suspense>;
}
