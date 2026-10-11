"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { NotConfigured, useUser } from "@/lib/useUser";

interface Rsvp { id: string; guest_name: string; attending: boolean; guests: number; note: string | null; created_at: string; events: number[] | null }

const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

function Inner() {
  const slug = useSearchParams().get("s") ?? "";
  const user = useUser();
  const [rows, setRows] = useState<Rsvp[] | null>(null);
  const [eventTitles, setEventTitles] = useState<string[]>([]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    (async () => {
      const { data: inv } = await sb.from("invites").select("id,content").eq("slug", slug).maybeSingle();
      if (!inv) return setRows([]);
      setEventTitles(((inv.content as { events?: { title: string }[] })?.events ?? []).map((e) => e.title));
      const { data } = await sb.from("rsvps").select("*").eq("invite_id", inv.id).order("created_at", { ascending: false });
      setRows((data as Rsvp[]) ?? []);
    })();
  }, [slug, user]);

  if (!backendConfigured) return <NotConfigured />;
  if (!user) return <p className="p-8 text-center">Sign in to see your RSVPs.</p>;
  if (!rows) return <p className="p-8 text-center">Loading…</p>;

  const yes = rows.filter((r) => r.attending);
  const total = yes.reduce((n, r) => n + r.guests, 0);

  const evLabel = (r: Rsvp) => (r.attending ? (r.events ? r.events.map((i) => eventTitles[i]).filter(Boolean).join(", ") : "All events") : "");
  // per event: replies coming and how many people (a reply without events means every event)
  const perEvent = eventTitles.map((title, i) => {
    const coming = yes.filter((r) => !r.events || r.events.includes(i));
    return { title, replies: coming.length, people: coming.reduce((n, r) => n + r.guests, 0) };
  });

  function exportCsv() {
    const lines = [["Name", "Attending", "Guests", "Events", "Note", "Date"].join(","),
      ...rows!.map((r) => [r.guest_name, r.attending ? "Yes" : "No", r.guests, evLabel(r), r.note ?? "", r.created_at].map(csvCell).join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "rsvps.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-brand">RSVPs</h1>
      <p className="mt-2">{yes.length} accepted ({total} guests) · {rows.length - yes.length} declined</p>
      {eventTitles.length > 1 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Coming to each event">
          {perEvent.map((e) => (
            <li key={e.title} className="rounded-xl border border-line bg-card p-3 text-center">
              <p className="text-sm text-foreground/70">{e.title}</p>
              <p className="text-2xl font-bold">{e.people}</p>
              <p className="text-xs text-foreground/70">{e.replies} {e.replies === 1 ? "reply" : "replies"}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn btn-ghost" onClick={exportCsv} disabled={rows.length === 0}>Export CSV</button>
        <Link className="btn btn-primary" href={`/guests?s=${slug}`}>Guest list &amp; send invitations</Link>
      </div>
      <h2 className="mt-10 font-display text-2xl font-bold">Replies</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-card">
        {rows.length === 0 && <li className="p-4">No replies yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="p-4">
            <p className="font-semibold">{r.guest_name} <span className="font-normal text-foreground/70">· {r.attending ? `${r.guests} guest(s)` : "declined"}</span></p>
            {r.attending && r.events && <p className="text-sm text-foreground/70">{evLabel(r)}</p>}
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
