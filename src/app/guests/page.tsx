"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Copy, Download, Pencil, RotateCw, Search, Send, Trash2, Upload, UserPlus, X } from "lucide-react";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { NotConfigured, useUser } from "@/lib/useUser";
import { ContentSchema } from "@/lib/contentSchema";
import type { InviteContent } from "@/lib/content";
import {
  DEFAULT_MESSAGE, MAX_GUESTS, type Guest, type ImportRow, eventNames, fillMessage, guestCode, guestLink, normalizePhone, parseGuests, toCsv, whatsappLink,
} from "@/lib/guests";

interface Reply { guest_id: string | null; attending: boolean; guests: number }
type Filter = "all" | "unsent" | "sent" | "opened" | "replied" | "waiting";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unsent", label: "Not sent" },
  { id: "sent", label: "Sent, not opened" },
  { id: "opened", label: "Opened, no reply" },
  { id: "replied", label: "Replied" },
  { id: "waiting", label: "No reply yet" },
];

function EventPicker({ content, value, onChange }: { content: InviteContent; value: number[] | null; onChange: (v: number[] | null) => void }) {
  const all = value === null;
  const toggle = (i: number) => {
    const cur = value ?? content.events.map((_, j) => j);
    const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i].sort((a, b) => a - b);
    if (next.length === 0) return; // at least one event
    onChange(next.length === content.events.length ? null : next);
  };
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Invited to">
      <button type="button" aria-pressed={all} onClick={() => onChange(null)} className={`press min-h-11 rounded-full border px-4 text-sm font-medium ${all ? "border-brand bg-brand text-brand-ink" : "border-line bg-white"}`}>
        All events
      </button>
      {content.events.map((e, i) => {
        const on = all || value!.includes(i);
        return (
          <button key={i} type="button" aria-pressed={on && !all} onClick={() => toggle(i)}
            className={`press inline-flex min-h-11 items-center gap-1 rounded-full border px-4 text-sm font-medium ${on && !all ? "border-brand bg-brand/10 text-brand" : "border-line bg-white"}`}>
            {on && !all && <Check className="size-3.5" aria-hidden />}{e.title}
          </button>
        );
      })}
    </div>
  );
}

function GuestsInner() {
  const slug = useSearchParams().get("s") ?? "";
  const user = useUser();
  const [invite, setInvite] = useState<{ id: string; content: InviteContent; published: boolean } | null | undefined>(undefined);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [template, setTemplate] = useState(DEFAULT_MESSAGE);
  // add / edit form
  const [editing, setEditing] = useState<Guest | null>(null);
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fSeats, setFSeats] = useState(1);
  const [fEvents, setFEvents] = useState<number[] | null>(null);
  // import
  const [importText, setImportText] = useState("");
  const [importEvents, setImportEvents] = useState<number[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);

  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb || !user || !slug) return;
    const { data: inv } = await sb.from("invites").select("id,content,status").eq("slug", slug).maybeSingle();
    const parsed = inv && ContentSchema.safeParse(inv.content);
    if (!inv || !parsed?.success) return setInvite(null);
    setInvite({ id: inv.id, content: parsed.data, published: inv.status === "published" });
    const [{ data: g, error: ge }, { data: r, error: re }] = await Promise.all([
      sb.from("guests").select("*").eq("invite_id", inv.id).order("created_at", { ascending: true }),
      sb.from("rsvps").select("guest_id,attending,guests").eq("invite_id", inv.id),
    ]);
    // a failed load must never look like an empty guest list
    if (ge || re) return setLoadFailed(true);
    setLoadFailed(false);
    setGuests((g as Guest[]) ?? []);
    setReplies((r as Reply[]) ?? []);
  }, [user, slug]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- loads remote data once the user is known
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const onFocus = () => { if (document.visibilityState === "visible") load(); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [load]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dawat:message:${slug}`);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the host's saved message
      if (saved) setTemplate(saved);
    } catch {}
  }, [slug]);

  // success messages fade after a few seconds; problems stay until dismissed or replaced
  useEffect(() => {
    if (!msg?.ok) return;
    const id = setTimeout(() => setMsg(null), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  const replyBy = useMemo(() => {
    const m = new Map<string, Reply>();
    for (const r of replies) if (r.guest_id) m.set(r.guest_id, r);
    return m;
  }, [replies]);
  const status = (g: Guest) => (replyBy.has(g.id) ? "replied" : g.opened_at ? "opened" : g.sent_at ? "sent" : "unsent");
  const preview = useMemo(() => (invite ? parseGuests(importText, invite.content, importEvents) : []), [importText, invite, importEvents]);

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined || (user && invite === undefined)) return <p className="p-8 text-center">Loading…</p>;
  if (!user) return <p className="p-8 text-center"><Link className="underline" href={`/login?next=${encodeURIComponent(`/guests?s=${slug}`)}`}>Sign in</Link> to manage your guests.</p>;
  if (!invite) return <p className="p-8 text-center">This invitation could not be found in your account.</p>;

  const content = invite.content;
  const hosts = content.host2 ? `${content.host1} & ${content.host2}` : content.host1;
  const messageFor = (g: Guest) =>
    fillMessage(template, { name: g.name, hosts, link: guestLink(origin, slug, g), events: eventNames(content, g.events).join(", ") });
  const counts = {
    total: guests.length,
    sent: guests.filter((g) => g.sent_at).length,
    opened: guests.filter((g) => g.opened_at).length,
    replied: guests.filter((g) => replyBy.has(g.id)).length,
    places: guests.reduce((n, g) => n + g.seats, 0),
    coming: guests.reduce((n, g) => { const r = replyBy.get(g.id); return n + (r?.attending ? r.guests : 0); }, 0),
  };
  const inFilter = (g: Guest, f: Filter) => { const s = status(g); return f === "all" || (f === "waiting" ? s !== "replied" : s === f); };
  const shown = guests.filter((g) => {
    return inFilter(g, filter) && (!q || g.name.toLowerCase().includes(q.toLowerCase()) || (g.phone ?? "").includes(q.replace(/\D/g, "")));
  });
  const next = guests.find((g) => !g.sent_at);

  const flash = (ok: boolean, text: string) => setMsg({ ok, text });

  /**
   * Called from the WhatsApp links. The browser must follow the link that was tapped before the list changes:
   * marking sent moves the queue to the next guest, and if that re-render happened first the browser would
   * open the NEXT guest's chat. So the update waits until the navigation has started.
   */
  const sentLater = (g: Guest) => { setTimeout(() => markSent(g), 400); };
  async function markSent(g: Guest) {
    const now = new Date().toISOString();
    setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, sent_at: x.sent_at ?? now } : x)));
    await getSupabase()!.from("guests").update({ sent_at: now }).eq("id", g.id).is("sent_at", null);
  }
  async function unmarkSent(g: Guest) {
    setGuests((list) => list.map((x) => (x.id === g.id ? { ...x, sent_at: null } : x)));
    await getSupabase()!.from("guests").update({ sent_at: null }).eq("id", g.id);
  }

  function resetForm() {
    setEditing(null); setFName(""); setFPhone(""); setFSeats(1); setFEvents(null);
  }
  function startEdit(g: Guest) {
    setEditing(g); setFName(g.name); setFPhone(g.phone ?? ""); setFSeats(g.seats); setFEvents(g.events);
    document.getElementById("guest-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  async function saveGuest(e: React.FormEvent) {
    e.preventDefault();
    const name = fName.trim();
    if (!name) { const el = document.getElementById("guest-name"); el?.scrollIntoView({ block: "center", behavior: "smooth" }); el?.focus({ preventScroll: true }); return flash(false, "Type the guest's name as it should appear, for example Sarah & Family."); }
    const phone = fPhone.trim() ? normalizePhone(fPhone) : null;
    if (fPhone.trim() && !phone) return flash(false, "That phone number doesn't look right. Use e.g. 0300 1234567 or +92 300 1234567.");
    if (!editing && guests.length >= MAX_GUESTS) return flash(false, `You can add up to ${MAX_GUESTS} guests.`);
    setBusy(true);
    const row = { name, phone, seats: fSeats, events: fEvents };
    const sb = getSupabase()!;
    const { error } = editing
      ? await sb.from("guests").update(row).eq("id", editing.id)
      : await sb.from("guests").insert({ ...row, invite_id: invite!.id, code: guestCode() });
    setBusy(false);
    if (error) return flash(false, error.message);
    flash(true, editing ? `${name} updated.` : `${name} added. Their link is ready to send.`);
    resetForm();
    load();
  }
  async function removeGuest(g: Guest) {
    if (!window.confirm(`Remove ${g.name}? Their link will stop working.`)) return;
    const { error } = await getSupabase()!.from("guests").delete().eq("id", g.id);
    if (error) return flash(false, error.message);
    flash(true, `${g.name} removed.`);
    load();
  }
  async function importGuests() {
    const good = preview.filter((r) => !r.problem);
    if (good.length === 0) return flash(false, "Nothing to add. Check the rows marked in red.");
    if (guests.length + good.length > MAX_GUESTS) return flash(false, `That would be more than ${MAX_GUESTS} guests.`);
    setBusy(true);
    const rows = good.map((r) => ({ invite_id: invite!.id, code: guestCode(), name: r.name, phone: r.phone, seats: r.seats, events: r.events }));
    let error = null;
    for (let i = 0; i < rows.length && !error; i += 200) ({ error } = await getSupabase()!.from("guests").insert(rows.slice(i, i + 200)));
    setBusy(false);
    if (error) return flash(false, error.message);
    flash(true, `${good.length} guests added.${preview.length - good.length ? ` ${preview.length - good.length} rows were skipped.` : ""}`);
    setImportText("");
    load();
  }
  async function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 2_000_000) return flash(false, "That file is too large (over 2 MB).");
    setImportText(await f.text());
  }
  async function copy(g: Guest) {
    try {
      await navigator.clipboard.writeText(messageFor(g));
      setCopied(g.id);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }
  function downloadCsv() {
    const csv = toCsv([
      ["Name", "Phone", "Places", "Events", "Link", "Sent", "Opened", "Reply"],
      ...guests.map((g) => {
        const r = replyBy.get(g.id);
        return [g.name, g.phone ?? "", g.seats, eventNames(content, g.events).join("; "), guestLink(origin, slug, g), g.sent_at ? "Yes" : "", g.opened_at ? "Yes" : "", r ? (r.attending ? `Yes (${r.guests})` : "No") : ""];
      }),
    ]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    Object.assign(document.createElement("a"), { href: url, download: `guest-links-${slug}.csv` }).click();
    URL.revokeObjectURL(url);
  }
  const badge = (g: Guest) => {
    const s = status(g);
    const r = replyBy.get(g.id);
    const map = {
      unsent: ["Not sent", "bg-stone-100 text-stone-700"],
      sent: ["Sent", "bg-sky-50 text-sky-800"],
      opened: ["Opened", "bg-amber-50 text-amber-900"],
      replied: [r?.attending ? `Coming · ${r.guests}` : "Not coming", r?.attending ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"],
    } as const;
    const [label, cls] = map[s];
    return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>{label}</span>;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm"><Link className="underline" href="/account">My orders</Link> · <Link className="underline" href={`/rsvps?s=${slug}`}>Replies</Link></p>
      <h1 className="mt-2 font-display text-4xl font-bold text-brand">Guests for {hosts}</h1>
      {!invite.published && (
        <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Your invitation is not published yet. You can prepare your guest list now; links start working once we confirm your payment.
        </p>
      )}

      <dl className="mt-6 grid grid-cols-5 gap-2 text-center sm:gap-3">
        {[["Guests", counts.total], ["Places", counts.places], ["Sent", counts.sent], ["Opened", counts.opened], ["Replied", counts.replied]].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-line bg-card px-1 py-3"><dt className="text-xs text-foreground/70">{k}</dt><dd className="text-2xl font-bold tabular-nums">{v}</dd></div>
        ))}
      </dl>
      {loadFailed && (
        <p role="alert" className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Your guest list didn&apos;t load. Check your connection and try again.
          <button type="button" className="btn btn-ghost" onClick={load}><RotateCw className="size-4" aria-hidden /> Try again</button>
        </p>
      )}
      {counts.replied > 0 && (
        <p className="mt-2 text-sm text-foreground/70"><strong className="text-foreground">{counts.coming}</strong> {counts.coming === 1 ? "person is" : "people are"} coming so far, of {counts.places} places. <Link className="underline" href={`/rsvps?s=${slug}`}>See totals for each event</Link></p>
      )}

      {/* messages appear where the host is looking, not at the top of a long page */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {msg && (
          <p role={msg.ok ? "status" : "alert"} className={`pointer-events-auto flex max-w-lg items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl ${msg.ok ? "border-green-300 bg-green-50 text-green-900" : "border-red-300 bg-red-50 text-red-800"}`}>
            <span className="py-1">{msg.text}</span>
            <button type="button" className="press -my-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full" onClick={() => setMsg(null)} aria-label="Dismiss message"><X className="size-4" aria-hidden /></button>
          </p>
        )}
      </div>

      {/* ---------------- sending queue ---------------- */}
      {guests.length > 0 && (
        <section className="mt-6 rounded-2xl border border-line bg-card p-5" aria-label="Send invitations">
          <h2 className="font-display text-2xl font-bold">Send invitations</h2>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100" aria-hidden>
            <div className="h-full bg-brand transition-[width] duration-300 ease-out" style={{ width: `${(counts.sent / counts.total) * 100}%` }} />
          </div>
          <p className="mt-1 text-sm text-foreground/70">{counts.sent} of {counts.total} sent</p>
          {next ? (
            <div className="mt-4 rounded-xl border border-line p-4">
              <p className="text-sm text-foreground/70">Next guest</p>
              <p className="text-xl font-semibold">{next.name} <span className="text-sm font-normal text-foreground/70">· {next.seats} {next.seats === 1 ? "place" : "places"} · {next.events ? eventNames(content, next.events).join(", ") : "All events"}</span></p>
              <p className="mt-1 text-sm text-foreground/70">{next.phone ? `+${next.phone}` : "No number saved: WhatsApp will ask you to pick the contact."}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a className="btn btn-primary" href={whatsappLink(next.phone, messageFor(next))} target="_blank" rel="noopener noreferrer" onClick={() => sentLater(next)}>
                  <Send className="size-4" aria-hidden /> Open WhatsApp and mark sent
                </a>
                <button type="button" className="btn btn-ghost" onClick={() => markSent(next)}>Mark sent (sent another way)</button>
              </div>
              <p className="mt-3 text-xs text-foreground/70">WhatsApp opens with the message typed in. Tap send there, then come back here for the next guest. Send in batches: many messages in a few minutes can be flagged by WhatsApp.</p>
            </div>
          ) : (
            <p className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-900">Everyone on your list has been sent their invitation.</p>
          )}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold">Edit the WhatsApp message</summary>
            <textarea className="field mt-2" rows={3} value={template} maxLength={600}
              onChange={(e) => { setTemplate(e.target.value); try { localStorage.setItem(`dawat:message:${slug}`, e.target.value); } catch {} }} />
            <p className="mt-1 text-xs text-foreground/70">{"{name}"} = guest&apos;s name, {"{hosts}"} = your names, {"{events}"} = their events, {"{link}"} = their personal link (always added).</p>
          </details>
        </section>
      )}

      {/* ---------------- add / edit ---------------- */}
      <section className="mt-6 rounded-2xl border border-line bg-card p-5" aria-label={editing ? "Edit guest" : "Add a guest"}>
        <h2 className="font-display text-2xl font-bold">{editing ? `Edit ${editing.name}` : "Add a guest"}</h2>
        <form id="guest-form" onSubmit={saveGuest} className="mt-3 grid gap-3 sm:grid-cols-[2fr_2fr_1fr]">
          <label className="block">Name (as it should appear)
            <input id="guest-name" className="field" value={fName} maxLength={80} placeholder="Sarah & Family" onChange={(e) => setFName(e.target.value)} />
          </label>
          <label className="block">WhatsApp number (optional)
            <input className="field" inputMode="tel" value={fPhone} maxLength={20} placeholder="0300 1234567" onChange={(e) => setFPhone(e.target.value)} />
          </label>
          <label className="block">Places
            <input className="field" type="number" min={1} max={20} value={fSeats} onChange={(e) => setFSeats(Math.min(20, Math.max(1, Number(e.target.value) || 1)))} />
          </label>
          <div className="sm:col-span-3">
            <p className="mb-1 text-sm font-medium">Invited to</p>
            <EventPicker content={content} value={fEvents} onChange={setFEvents} />
          </div>
          <div className="flex gap-2 sm:col-span-3">
            <button className="btn btn-primary" disabled={busy}><UserPlus className="size-4" aria-hidden />{editing ? "Save changes" : "Add guest"}</button>
            {editing && <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>}
          </div>
        </form>
      </section>

      {/* ---------------- import ---------------- */}
      <details className="mt-6 rounded-2xl border border-line bg-card p-5">
        <summary className="cursor-pointer font-display text-2xl font-bold">Add many guests at once</summary>
        <p className="mt-2 text-sm text-foreground/70">
          Copy the rows from Excel or Google Sheets and paste them below, or upload a CSV file. Columns: <strong>Name, Phone, Places, Events</strong>
          (a header row is fine). Events can be &quot;all&quot; or names like &quot;Baraat, Walima&quot;. Rows without events get the events you pick here.
        </p>
        <div className="mt-3"><EventPicker content={content} value={importEvents} onChange={setImportEvents} /></div>
        <textarea className="field mt-3 font-mono text-sm" rows={6} value={importText} onChange={(e) => setImportText(e.target.value)}
          placeholder={"Name\tPhone\tPlaces\tEvents\nSarah & Family\t0300 1234567\t4\tall\nUncle Imran\t0321 7654321\t2\tWalima"} />
        <label className="btn btn-ghost mt-2 cursor-pointer">
          <Upload className="size-4" aria-hidden /> Upload CSV
          <input type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        {preview.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold">{preview.filter((r) => !r.problem).length} ready to add{preview.some((r) => r.problem) && `, ${preview.filter((r) => r.problem).length} with problems (skipped)`}</p>
            <div className="mt-2 max-h-64 overflow-auto rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-stone-50"><tr><th className="p-2">Name</th><th className="p-2">Phone</th><th className="p-2">Places</th><th className="p-2">Events</th></tr></thead>
                <tbody>
                  {preview.slice(0, 300).map((r: ImportRow, i) => (
                    <tr key={i} className={`border-t border-line ${r.problem ? "bg-red-50" : ""}`}>
                      <td className="p-2">{r.name || "—"}{r.problem && <span className="block text-xs text-red-700">{r.problem}</span>}</td>
                      <td className="p-2">{r.phone ? `+${r.phone}` : r.phoneRaw || "—"}</td>
                      <td className="p-2">{r.seats}</td>
                      <td className="p-2">{eventNames(content, r.events).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn btn-primary mt-3" disabled={busy} onClick={importGuests}>Add {preview.filter((r) => !r.problem).length} guests</button>
          </div>
        )}
      </details>

      {/* ---------------- list ---------------- */}
      <section className="mt-8" aria-label="Guest list">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Guest list</h2>
          <button type="button" className="btn btn-ghost" onClick={downloadCsv} disabled={guests.length === 0}><Download className="size-4" aria-hidden /> Download all links (CSV)</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}
              className={`press min-h-11 rounded-full border px-4 text-sm font-medium ${filter === f.id ? "border-brand bg-brand text-brand-ink" : "border-line bg-card"}`}>
              {f.label} <span className="tabular-nums opacity-70">{guests.filter((g) => inFilter(g, f.id)).length}</span>
            </button>
          ))}
        </div>
        <label className="relative mt-3 block">
          <span className="sr-only">Search guests</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-foreground/60" aria-hidden />
          <input type="search" className="field pl-10" placeholder="Search by name or number" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-card">
          {guests.length === 0 && <li className="p-5 text-foreground/70">No guests yet. Add them above, one by one or all at once from a spreadsheet.</li>}
          {guests.length > 0 && shown.length === 0 && <li className="p-5 text-foreground/70">No guests match this view.</li>}
          {shown.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-semibold">{g.name} <span className="font-normal text-foreground/70">· {g.seats} {g.seats === 1 ? "place" : "places"}</span></p>
                <p className="text-sm text-foreground/70">{g.phone ? `+${g.phone}` : "No number"} · {g.events ? eventNames(content, g.events).join(", ") : "All events"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {badge(g)}
                {/* only guests still waiting for their invitation get the filled button, so the list shows who's left */}
                <a className={`btn ${g.sent_at ? "btn-ghost" : "btn-primary"}`} href={whatsappLink(g.phone, messageFor(g))} target="_blank" rel="noopener noreferrer" onClick={() => sentLater(g)}
                  aria-label={`${g.sent_at ? "Resend" : "Send"} ${g.name}'s invitation on WhatsApp`}>
                  {g.sent_at ? <RotateCw className="size-4" aria-hidden /> : <Send className="size-4" aria-hidden />} {g.sent_at ? "Resend" : "WhatsApp"}
                </a>
                <button type="button" className="btn btn-ghost" onClick={() => copy(g)} aria-label={`Copy ${g.name}'s message and link`}><Copy className="size-4" aria-hidden />{copied === g.id ? "Copied" : "Copy"}</button>
                {g.sent_at && !replyBy.has(g.id) && <button type="button" className="btn btn-ghost" onClick={() => unmarkSent(g)}>Mark not sent</button>}
                <button type="button" className="press grid size-11 place-items-center rounded-full border border-line" onClick={() => startEdit(g)} aria-label={`Edit ${g.name}`}><Pencil className="size-4" aria-hidden /></button>
                <button type="button" className="press grid size-11 place-items-center rounded-full border border-line text-red-700" onClick={() => removeGuest(g)} aria-label={`Remove ${g.name}`}><Trash2 className="size-4" aria-hidden /></button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function GuestsPage() {
  return <Suspense><GuestsInner /></Suspense>;
}
