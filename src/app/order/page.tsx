"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy, ImageUp, Send } from "lucide-react";
import { backendConfigured, getSupabase, paymentInfo } from "@/lib/supabase";
import { NotConfigured, useUser } from "@/lib/useUser";
import { formatPKR, getTemplate } from "@/lib/templates";
import { SupportLink } from "@/components/SupportLink";

interface Order {
  id: string;
  amount_pkr: number;
  status: "awaiting_payment" | "pending_review" | "approved" | "rejected";
  admin_note: string | null;
  invites: { slug: string; template_id: string } | null;
}

type Method = "bank" | "jazzcash" | "easypaisa";
const METHODS: { id: Method; label: string }[] = [
  { id: "bank", label: "Online Bank Transfer" },
  { id: "jazzcash", label: "JazzCash" },
  { id: "easypaisa", label: "Easypaisa" },
];
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const STEPS = ["Customise", "Pay", "We confirm", "Live"];

/** Where the customer is in the whole journey, so the next step is never a surprise. */
function Progress({ status }: { status: Order["status"] }) {
  const at = status === "approved" ? 3 : status === "pending_review" ? 2 : 1;
  return (
    <ol className="mt-6 grid grid-cols-4 gap-2 text-center text-xs" aria-label="Order progress">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === at ? "step" : undefined}>
          <span className={`block h-1.5 rounded-full ${i <= at ? "bg-brand" : "bg-line"}`} />
          <span className={`mt-1.5 block ${i === at ? "font-semibold text-brand" : "text-foreground/70"}`}>{i < at && <Check className="mr-0.5 inline size-3" aria-hidden />}{s}</span>
        </li>
      ))}
    </ol>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button type="button" className="btn btn-ghost min-h-11 shrink-0 px-3 text-sm" aria-label={`${done ? "Copied" : "Copy"} ${label}`}
      onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch {} }}>
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}{done ? "Copied" : "Copy"}
    </button>
  );
}

/** account numbers and IBANs paste into banking apps without spaces or dashes; names copy as shown */
const forCopy = (v: string) => (/^[A-Z0-9 -]+$/i.test(v) && (v.match(/\d/g) ?? []).length >= 8 ? v.replace(/[\s-]/g, "") : v);

/** Payment details are free text (one "Label: value" per line); each line gets its own Copy button. */
function PaymentDetails({ text }: { text: string }) {
  return (
    <ul className="divide-y divide-line">
      {text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
        const m = line.match(/^([^:]{1,30}):\s*(.+)$/);
        const value = m ? m[2] : line;
        return (
          <li key={line} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0">
              {m && <span className="block text-xs text-foreground/70">{m[1]}</span>}
              <span className="block break-words font-semibold">{value}</span>
            </span>
            {/* labelled values and account numbers get a Copy button; a plain heading line does not */}
            {(m || forCopy(value) !== value) && <CopyButton text={forCopy(value)} label={m ? m[1] : "account number"} />}
          </li>
        );
      })}
    </ul>
  );
}

function OrderInner() {
  const id = useSearchParams().get("id");
  const user = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const methods = METHODS.filter((m) => paymentInfo[m.id]);
  const [picked, setPicked] = useState<Method | null>(null);
  const method: Method = picked ?? methods[0]?.id ?? "bank";
  const [ref, setRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [msg, setMsg] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !id) return setNotFound(true);
    const { data, error } = await sb.from("orders").select("id,amount_pkr,status,admin_note,invites(slug,template_id)").eq("id", id).single();
    if (error) setNotFound(true);
    else setOrder(data as unknown as Order);
  }, [id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- loads remote data once the user is known
  useEffect(() => { if (user) load(); }, [user, load]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined) return <p className="p-8 text-center">Loading…</p>;
  if (user === null) return <p className="p-8 text-center"><Link className="underline" href={`/login?next=${encodeURIComponent(`/order?id=${id}`)}`}>Sign in</Link> to view your order.</p>;
  if (notFound) return <p className="p-8 text-center">We couldn&apos;t find this order in your account. <Link className="underline" href="/account">Go to My orders</Link></p>;
  if (!order) return <p className="p-8 text-center">Loading…</p>;

  const details = paymentInfo[method];
  const template = order.invites ? getTemplate(order.invites.template_id) : undefined;

  function pick(f: File | null) {
    setMsg("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f && ALLOWED[f.type] ? URL.createObjectURL(f) : "");
    setFile(f);
    if (f && !ALLOWED[f.type]) setMsg("That file isn't a photo. Choose a JPG, PNG or WebP screenshot of the receipt.");
    else if (f && f.size > MAX_BYTES) setMsg("That photo is over 5 MB. Take a screenshot of the receipt instead, which is much smaller.");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabase();
    if (!sb || !user || !order) return;
    if (!file) return setMsg("Add a photo or screenshot of your payment receipt, then submit.");
    const ext = ALLOWED[file.type];
    if (!ext || file.size > MAX_BYTES) return;
    setBusy(true);
    setMsg("");
    const path = `${user.id}/${order.id}.${ext}`;
    const up = await sb.storage.from("receipts").upload(path, file, { upsert: true, contentType: file.type });
    if (up.error) { setBusy(false); return setMsg("The receipt didn't upload. Check your connection and try again."); }
    const { error } = await sb.from("orders")
      .update({ status: "pending_review", receipt_path: path, payment_method: method, payment_reference: ref.trim() || null })
      .eq("id", order.id);
    setBusy(false);
    if (error) return setMsg("Your receipt uploaded, but the order didn't update. Please try again.");
    window.scrollTo({ top: 0, behavior: "smooth" });
    load();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-sm"><Link className="underline" href="/account">My orders</Link></p>
      <h1 className="mt-2 font-display text-4xl font-bold text-brand">{order.status === "approved" ? "Your invitation is live" : `Pay for ${template?.name ?? "your invitation"}`}</h1>
      <Progress status={order.status} />

      {order.status === "approved" && order.invites && (
        <div className="mt-6 rounded-2xl border border-green-300 bg-green-50 p-5">
          <p className="font-semibold text-green-900">Payment confirmed. Your invitation is live.</p>
          <p className="mt-1 text-sm text-green-900">Next, add your guests. Each one gets a personal link you can send on WhatsApp.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="btn btn-primary" href={`/guests?s=${order.invites.slug}`}><Send className="size-4" aria-hidden /> Add guests and send</Link>
            <Link className="btn btn-ghost" href={`/i?s=${order.invites.slug}`}>Open my invitation</Link>
          </div>
        </div>
      )}
      {order.status === "pending_review" && (
        <div role="status" className="mt-6 rounded-2xl border border-line bg-card p-5">
          <p className="font-semibold">Receipt received. Thank you.</p>
          <p className="mt-1 text-sm text-foreground/80">We&apos;ll check the payment and publish your invitation. You can prepare your guest list now, and their links start working once it&apos;s live.</p>
          {order.invites && <Link className="btn btn-primary mt-4" href={`/guests?s=${order.invites.slug}`}>Prepare my guest list</Link>}
        </div>
      )}
      {order.status === "rejected" && (
        <p role="alert" className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-900">
          We couldn&apos;t confirm this payment{order.admin_note ? `: ${order.admin_note}` : "."} Check the amount and account, then upload a new receipt below.
        </p>
      )}

      {(order.status === "awaiting_payment" || order.status === "rejected") && (
        <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
          <section className="rounded-2xl border border-line bg-card p-5" aria-labelledby="pay-1">
            <h2 id="pay-1" className="font-semibold">1. Send {formatPKR(order.amount_pkr)}</h2>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-background px-4 py-3">
              <span><span className="block text-xs text-foreground/70">Amount</span><span className="text-2xl font-bold tabular-nums">{formatPKR(order.amount_pkr)}</span></span>
              <CopyButton text={String(order.amount_pkr)} label="amount" />
            </div>
            {methods.length > 1 && (
              <div role="radiogroup" aria-label="Payment method" className="mt-4 flex flex-wrap gap-2">
                {methods.map((m) => (
                  <button key={m.id} type="button" role="radio" aria-checked={method === m.id} onClick={() => setPicked(m.id)}
                    className={`btn ${method === m.id ? "btn-primary" : "btn-ghost"}`}>{m.label}</button>
                ))}
              </div>
            )}
            <div className="mt-4">
              <p className="text-sm font-medium">{methods.length === 1 ? `By ${methods[0].label.toLowerCase()} to` : "Send it to"}</p>
              {details ? <PaymentDetails text={details} /> : (
                <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                  Payment details for this method aren&apos;t set up yet. Please message us before paying. <SupportLink topic="I'd like to pay for my invitation" className="text-amber-900" />
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-5" aria-labelledby="pay-2">
            <h2 id="pay-2" className="font-semibold">2. Upload the receipt</h2>
            <label className="mt-3 flex min-h-28 cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-line p-4 hover:border-gold">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
                <img src={previewUrl} alt="Your receipt" className="size-20 shrink-0 rounded-lg object-cover" />
              ) : (
                <span className="grid size-20 shrink-0 place-items-center rounded-lg bg-background"><ImageUp className="size-7 text-foreground/60" aria-hidden /></span>
              )}
              <span className="min-w-0 text-sm">
                <span className="block font-semibold">{file ? "Change receipt" : "Choose a screenshot or photo"}</span>
                <span className="block truncate text-foreground/70">{file ? file.name : "JPG, PNG or WebP, up to 5 MB"}</span>
              </span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0] ?? null)} />
            </label>
            <label className="mt-4 block">Transaction ID (optional)
              <input className="field" value={ref} maxLength={60} onChange={(e) => setRef(e.target.value)} />
              <span className="mt-1 block text-xs text-foreground/70">Helps us find your payment faster.</span>
            </label>
          </section>

          {msg && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{msg}</p>}
          <button className="btn btn-primary w-full" disabled={busy || !details}>{busy ? "Uploading…" : "Submit receipt"}</button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-foreground/70">Questions about your order? <SupportLink topic={`I have a question about my order (${template?.name ?? "invitation"})`} className="text-brand" /></p>
    </div>
  );
}

export default function OrderPage() {
  return <Suspense><OrderInner /></Suspense>;
}
