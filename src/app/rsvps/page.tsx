"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { NotConfigured, useUser } from "@/lib/useUser";

interface Rsvp { id: string; guest_name: string; attending: boolean; guests: number; note: string | null; created_at: string }

const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

function GuestLinks({ slug }: { slug: string }) {
  const [names, setNames] = useState("");
  const [copied, setCopied] = useState("");
  // one guest per line; optional reserved places after a bar: "Sarah & Family | 4"
  const list = names
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 200)
    .map((l) => {
      const [name, n] = l.split("|").map((x) => x.trim());
      const seats = Number(n);
      return { name, seats: Number.isInteger(seats) && seats >= 1 && seats <= 20 ? seats : null };
    })
    .filter((g) => g.name);
  const link = (g: { name: string; seats: number | null }) =>
    `${window.location.origin}/i?s=${encodeURIComponent(slug)}&g=${encodeURIComponent(g.name)}${g.seats ? `&n=${g.seats}` : ""}`;
  async function copy(g: { name: string; seats: number | null }) {
    try {
      await navigator.clipboard.writeText(link(g));
      setCopied(g.name);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }
  return (
    <section className="mt-10 rounded-2xl border border-line bg-card p-5" aria-label="Personalised links">
      <h2 className="font-display text-2xl font-bold">Personalised invitations</h2>
      <p className="mt-1 text-sm text-foreground/70">One guest per line. Each gets a link that greets them by name, e.g. “Dear Sarah &amp; Family”. Add a bar and a number to reserve places: <code>Sarah &amp; Family | 4</code>.</p>
      <textarea className="field mt-3" rows={4} value={names} onChange={(e) => setNames(e.target.value)} placeholder={"Sarah & Family\nUncle Imran"} />
      <ul className="mt-3 space-y-2">
        {list.map((g) => (
          <li key={g.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-3">
            <span className="font-medium">{g.name}{g.seats && <span className="font-normal text-foreground/60"> · {g.seats} {g.seats === 1 ? "place" : "places"}</span>}</span>
            <span className="flex gap-2">
              <button type="button" className="btn btn-ghost" onClick={() => copy(g)}>{copied === g.name ? "Copied" : "Copy link"}</button>
              <a className="btn btn-primary" target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/?text=${encodeURIComponent(`Dear ${g.name}, you are invited! ${link(g)}`)}`}>WhatsApp</a>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Inner() {
  const slug = useSearchParams().get("s") ?? "";
  const user = useUser();
  const [rows, setRows] = useState<Rsvp[] | null>(null);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    (async () => {
      const { data: inv } = await sb.from("invites").select("id").eq("slug", slug).maybeSingle();
      if (!inv) return setRows([]);
      const { data } = await sb.from("rsvps").select("*").eq("invite_id", inv.id).order("created_at", { ascending: false });
      setRows((data as Rsvp[]) ?? []);
    })();
  }, [slug, user]);

  if (!backendConfigured) return <NotConfigured />;
  if (!user) return <p className="p-8 text-center">Sign in to see your RSVPs.</p>;
  if (!rows) return <p className="p-8 text-center">Loading…</p>;

  const yes = rows.filter((r) => r.attending);
  const total = yes.reduce((n, r) => n + r.guests, 0);

  function exportCsv() {
    const lines = [["Name", "Attending", "Guests", "Note", "Date"].join(","),
      ...rows!.map((r) => [r.guest_name, r.attending ? "Yes" : "No", r.guests, r.note ?? "", r.created_at].map(csvCell).join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "rsvps.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-brand">RSVPs</h1>
      <p className="mt-2">{yes.length} accepted ({total} guests) · {rows.length - yes.length} declined</p>
      <button className="btn btn-ghost mt-4" onClick={exportCsv} disabled={rows.length === 0}>Export CSV</button>
      <GuestLinks slug={slug} />
      <h2 className="mt-10 font-display text-2xl font-bold">Replies</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-card">
        {rows.length === 0 && <li className="p-4">No replies yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="p-4">
            <p className="font-semibold">{r.guest_name} <span className="font-normal text-foreground/60">· {r.attending ? `${r.guests} guest(s)` : "declined"}</span></p>
            {r.note && <p className="text-sm text-foreground/70">{r.note}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
