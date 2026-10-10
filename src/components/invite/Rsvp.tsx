"use client";

import { useEffect, useState } from "react";
import { TAPE_GLASS } from "./InviteCard";

/** Guest reply form. In demo mode it is fully visible but disabled, so buyers can see what guests get. */
export function Rsvp({ inviteId, demo = false, guestName = "", seats = null, tape = false, accent }: { inviteId?: string; demo?: boolean; guestName?: string; seats?: number | null; tape?: boolean; accent?: string }) {
  // tape concept: warm see-through panel, dark fields, monospaced title
  const box = tape ? `${TAPE_GLASS} !rounded-md [&_.field]:!border-white/30 [&_.field]:!bg-black/35 [&_.field]:!text-white` : "border-line bg-card text-foreground";
  const on = accent ? { background: accent, color: tape ? "#1a0e06" : "#fff", borderColor: accent } : undefined;
  const ghost = tape ? "!border-white/40 !bg-transparent !text-white" : "";
  const maxGuests = seats ?? 20;
  const [name, setName] = useState(guestName);
  const [attending, setAttending] = useState(true);
  const [chosen, setChosen] = useState<number | null>(null);
  // until the guest edits it, default to the places reserved in their link
  const guests = Math.min(chosen ?? seats ?? 1, maxGuests);
  const setGuests = setChosen;
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState("");
  // the personalised link may fill in the guest name after first render
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync a prop that arrives after mount
    if (guestName) setName((n) => n || guestName);
  }, [guestName]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (demo || !inviteId) return;
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    if (!sb) return;
    if (!name.trim()) return setError("Please enter your name.");
    setState("busy");
    setError("");
    const { error } = await sb.from("rsvps").insert({
      invite_id: inviteId, guest_name: name.trim(), attending, guests: attending ? guests : 0, note: note.trim() || null,
    });
    if (error) { setState("idle"); setError("Couldn’t send your reply. Please try again."); }
    else setState("done");
  }

  if (state === "done") return <p role="status" className="rounded-xl bg-green-50 p-5 text-center text-green-900">Thank you! Your reply has been sent.</p>;
  return (
    <form onSubmit={submit} className={`space-y-4 rounded-2xl border p-5 ${box}`}>
      <h2 className={tape ? "text-center font-mono text-2xl font-bold uppercase tracking-[0.16em]" : "font-display text-2xl font-bold"}>Will you attend?</h2>
      {demo && <p className={`rounded-lg p-2 text-sm ${tape ? "border border-white/20 bg-black/30 text-white/85" : "bg-amber-50 text-amber-900"}`}>Demo: guests reply here, and you see every response in your dashboard.</p>}
      <label className="block">Your full name
        <input className="field" value={name} maxLength={80} disabled={demo} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="flex gap-2" role="group" aria-label="Attendance">
        <button type="button" disabled={demo} aria-pressed={attending} className={`btn flex-1 ${attending ? "btn-primary" : "btn-ghost"} ${attending ? "" : ghost}`} style={attending ? on : undefined} onClick={() => setAttending(true)}>Joyfully accept</button>
        <button type="button" disabled={demo} aria-pressed={!attending} className={`btn flex-1 ${!attending ? "btn-primary" : "btn-ghost"} ${!attending ? "" : ghost}`} style={!attending ? on : undefined} onClick={() => setAttending(false)}>Regretfully decline</button>
      </div>
      {attending && (
        <label className="block">Number of guests (including you)
          <input type="number" min={1} max={maxGuests} disabled={demo} className="field" value={guests} onChange={(e) => setGuests(Math.min(maxGuests, Math.max(1, Number(e.target.value) || 1)))} />
          {seats && <span className="text-sm text-foreground/70">{seats} {seats === 1 ? "place is" : "places are"} reserved for you.</span>}
        </label>
      )}
      <label className="block">Message (optional)
        <textarea className="field" rows={2} maxLength={300} disabled={demo} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <button className="btn btn-primary w-full" style={on} disabled={demo || state === "busy"}>{state === "busy" ? "Sending…" : "Send reply"}</button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
