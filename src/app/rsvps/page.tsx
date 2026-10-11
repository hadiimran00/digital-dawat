"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, RotateCw, Search, Send } from "lucide-react";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { NotConfigured, useUser } from "@/lib/useUser";

interface Rsvp { id: string; guest_name: string; attending: boolean; guests: number; note: string | null; created_at: string; events: number[] | null }
type Filter = "all" | "yes" | "no";

const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralise spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};
const people = (n: number) => `${n} ${n === 1 ? "person" : "people"}`;
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

function Inner() {
  const slug = useSearchParams().get("s") ?? "";
  const user = useUser();
  const [rows, setRows] = useState<Rsvp[] | null>(null);
  const [hosts, setHosts] = useState("");
  const [eventTitles, setEventTitles] = useState<string[]>([]);
  const [state, setState] = useState<"ok" | "missing" | "failed">("ok");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !user || !slug) return;
    const { data: inv, error: ie } = await sb.from("invites").select("id,content").eq("slug", slug).maybeSingle();
    if (ie) return setState("failed");
    if (!inv) return setState("missing");
    const content = inv.content as { host1?: string; host2?: string; events?: { title: string }[] };
    setHosts(content.host2 ? `${content.host1} & ${content.host2}` : content.host1 ?? "");
    setEventTitles((content.events ?? []).map((e) => e.title));
    const { data, error } = await sb.from("rsvps").select("*").eq("invite_id", inv.id).order("created_at", { ascending: false });
    // a failed load must never look like "no replies yet"
    if (error) return setState("failed");
    setState("ok");
    setRows((data as Rsvp[]) ?? []);
  }, [slug, user]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- loads remote data once the user is known
  useEffect(() => { load(); }, [load]);
  // replies keep arriving: refresh when the host comes back to this tab
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => { window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, [load]);

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <p className="p-8 text-center"><Link className="underline" href={`/login?next=${encodeURIComponent(`/rsvps?s=${slug}`)}`}>Sign in</Link> to see your replies.</p>;
  if (state === "missing") return <p className="p-8 text-center">This invitation could not be found in your account. <Link className="underline" href="/account">Go to My orders</Link></p>;
  if (state === "failed" && !rows) {
    return (
      <div role="alert" className="mx-auto max-w-md p-8 text-center">
        <p>Your replies didn&apos;t load. Check your connection and try again.</p>
        <button type="button" className="btn btn-ghost mt-4" onClick={load}><RotateCw className="size-4" aria-hidden /> Try again</button>
      </div>
    );
  }
  if (!rows) return <p className="p-8 text-center">Loading…</p>;

  const yes = rows.filter((r) => r.attending);
  const total = yes.reduce((n, r) => n + r.guests, 0);
  const evLabel = (r: Rsvp) => (r.attending ? (r.events ? r.events.map((i) => eventTitles[i]).filter(Boolean).join(", ") : "All events") : "");
  // per event: replies coming and how many people (a reply without events means every event)
  const perEvent = eventTitles.map((title, i) => {
    const coming = yes.filter((r) => !r.events || r.events.includes(i));
    return { title, replies: coming.length, people: coming.reduce((n, r) => n + r.guests, 0) };
  });
  const FILTERS: { id: Filter; label: string; n: number }[] = [
    { id: "all", label: "All", n: rows.length },
    { id: "yes", label: "Coming", n: yes.length },
    { id: "no", label: "Not coming", n: rows.length - yes.length },
  ];
  const shown = rows.filter((r) =>
    (filter === "all" || (filter === "yes") === r.attending) && (!q || r.guest_name.toLowerCase().includes(q.toLowerCase())));

  function exportCsv() {
    const lines = [["Name", "Attending", "Guests", "Events", "Note", "Date"].join(","),
      ...rows!.map((r) => [r.guest_name, r.attending ? "Yes" : "No", r.guests, evLabel(r), r.note ?? "", r.created_at].map(csvCell).join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: `replies-${slug}.csv` }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm"><Link className="underline" href="/account">My orders</Link> · <Link className="underline" href={`/guests?s=${slug}`}>Guests</Link></p>
      <h1 className="mt-2 font-display text-4xl font-bold text-brand">Replies{hosts && ` for ${hosts}`}</h1>

      {state === "failed" && (
        <p role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          The latest replies didn&apos;t load, so this list may be out of date.
          <button type="button" className="btn btn-ghost" onClick={load}><RotateCw className="size-4" aria-hidden /> Try again</button>
        </p>
      )}

      {/* the number a host needs first: how many people are coming */}
      <dl className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-3">
        {[["People coming", total], ["Replied yes", yes.length], ["Can't come", rows.length - yes.length]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-card px-1 py-3"><dt className="text-xs text-foreground/70">{k}</dt><dd className="text-2xl font-bold tabular-nums">{v}</dd></div>
        ))}
      </dl>

      {eventTitles.length > 1 && (
        <section className="mt-6" aria-label="Coming to each event">
          <h2 className="text-sm font-semibold">Coming to each event</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {perEvent.map((e) => (
              <li key={e.title} className="rounded-xl border border-line bg-card p-3 text-center">
                <p className="text-sm text-foreground/70">{e.title}</p>
                <p className="text-2xl font-bold tabular-nums">{e.people}</p>
                <p className="text-xs text-foreground/70">from {e.replies} {e.replies === 1 ? "reply" : "replies"}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10" aria-label="Replies">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">All replies</h2>
          <button type="button" className="btn btn-ghost" onClick={exportCsv} disabled={rows.length === 0}><Download className="size-4" aria-hidden /> Download replies (CSV)</button>
        </div>

        {rows.length > 0 && (
          <>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Show">
              {FILTERS.map((f) => (
                <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
                  className={`press min-h-11 rounded-full border px-4 text-sm font-medium ${filter === f.id ? "border-brand bg-brand text-brand-ink" : "border-line bg-card"}`}>
                  {f.label} <span className="tabular-nums opacity-70">{f.n}</span>
                </button>
              ))}
            </div>
            {rows.length > 8 && (
              <label className="relative mt-3 block">
                <span className="sr-only">Search replies</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-foreground/60" aria-hidden />
                <input type="search" className="field pl-10" placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
              </label>
            )}
          </>
        )}

        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
          {rows.length === 0 && (
            <li className="p-5">
              <p className="font-semibold">No replies yet</p>
              <p className="mt-1 text-sm text-foreground/70">Replies appear here as soon as guests answer on the invitation. Send each guest their own link from your guest list.</p>
              <Link className="btn btn-primary mt-4" href={`/guests?s=${slug}`}><Send className="size-4" aria-hidden /> Send invitations</Link>
            </li>
          )}
          {rows.length > 0 && shown.length === 0 && <li className="p-5 text-foreground/70">No replies match this view.</li>}
          {shown.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{r.guest_name}</p>
                {r.attending && <p className="text-sm text-foreground/70">{evLabel(r)}</p>}
                {r.note && <p className="mt-1 border-l-2 border-gold pl-3 text-sm italic text-foreground/80">{r.note}</p>}
              </div>
              <div className="text-right">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.attending ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                  {r.attending ? `Coming · ${people(r.guests)}` : "Can't come"}
                </span>
                <p className="mt-2 text-xs text-foreground/70"><time dateTime={r.created_at}>{when(r.created_at)}</time></p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {rows.length > 0 && (
        <div className="mt-6">
          <Link className="btn btn-primary" href={`/guests?s=${slug}`}><Send className="size-4" aria-hidden /> Guest list &amp; send invitations</Link>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense><Inner /></Suspense>;
}
