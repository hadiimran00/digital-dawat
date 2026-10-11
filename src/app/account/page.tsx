"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function Account() {
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
      <h1 className="font-display text-4xl font-bold text-brand">My orders</h1>
      <div className="mt-6 space-y-3">
        {rows === null && <p>Loading…</p>}
        {rows?.length === 0 && <p>No orders yet. <Link className="underline" href="/templates">Browse templates</Link>.</p>}
        {rows?.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card p-4">
            <div>
              <p className="font-semibold">{getTemplate(r.invites?.template_id ?? "")?.name ?? "Invitation"} · {formatPKR(r.amount_pkr)}</p>
              <p className="text-sm text-foreground/70">{new Date(r.created_at).toLocaleDateString("en-GB")} · {LABEL[r.status] ?? r.status}</p>
            </div>
            <div className="flex gap-2">
              {r.invites && (
                <Link className="btn btn-primary" href={`/guests?s=${r.invites.slug}`}>Guests</Link>
              )}
              {r.status === "approved" && r.invites && (
                <>
                  <Link className="btn btn-ghost" href={`/i?s=${r.invites.slug}`}>Open</Link>
                  <Link className="btn btn-ghost" href={`/rsvps?s=${r.invites.slug}`}>RSVPs</Link>
                </>
              )}
              {r.status !== "approved" && <Link className="btn btn-primary" href={`/order?id=${r.id}`}>{r.status === "pending_review" ? "View" : "Pay"}</Link>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
