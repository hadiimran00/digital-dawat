"use client";

import { useEffect, useState } from "react";
import { TAPE_GLASS } from "./InviteCard";

/** Guest reply form. In demo mode it is fully visible but disabled, so buyers can see what guests get. */
export function Rsvp({
  inviteId, demo = false, showNote = demo, guestName = "", seats = null, tape = false, accent, titleClass, titleStyle, guestId = null, events = [],
}: {
  inviteId?: string; demo?: boolean; showNote?: boolean; guestName?: string; seats?: number | null; tape?: boolean; accent?: string;
  titleClass?: string; titleStyle?: React.CSSProperties;
  /** set when the guest came through their guest-list link */
  guestId?: string | null;
  /** the events this guest is invited to (position in the full list + title); asked one by one when more than one */
  events?: { i: number; title: string }[];
}) {
  // tape concept: warm see-through panel, dark fields, monospaced title
  const box = tape ? `${TAPE_GLASS} !rounded-md [&_.field]:!border-white/30 [&_.field]:!bg-black/35 [&_.field]:!text-white` : "border-line bg-card text-foreground";
  const on = accent ? { background: accent, color: tape ? "#1a0e06" : "#fff", borderColor: accent } : undefined;
  const ghost = tape ? "!bg-transparent !text-white" : "bg-white";
  const maxGuests = seats ?? 20;
  const [name, setName] = useState(guestName);
  const [attending, setAttending] = useState(true);
  const [chosen, setChosen] = useState<number | null>(null);
  // until the guest edits it, default to the places reserved in their link
  const guests = Math.min(chosen ?? seats ?? 1, maxGuests);
  const setGuests = setChosen;
  const [note, setNote] = useState("");
  // which of their events they will attend (all ticked to start)
  const [notGoing, setNotGoing] = useState<number[]>([]);
  const going = events.filter((e) => !notGoing.includes(e.i));
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
    if (attending && events.length > 1 && going.length === 0) { setState("idle"); return setError("Tick at least one event, or choose Regretfully decline."); }
    const { error } = await sb.from("rsvps").insert({
      invite_id: inviteId, guest_name: name.trim(), attending, guests: attending ? guests : 0, note: note.trim() || null,
      guest_id: guestId,
      events: attending && events.length > 0 ? going.map((e) => e.i) : null,
    });
    if (error) { setState("idle"); setError("Couldn’t send your reply. Please try again."); }
    else setState("done");
  }

  if (state === "done") {
    const chosen = events.length > 1 ? going.map((e) => e.title) : events.map((e) => e.title);
    const list = chosen.length > 1 ? `${chosen.slice(0, -1).join(", ")} and ${chosen[chosen.length - 1]}` : chosen[0];
    return (
      <div role="status" className={`space-y-2 rounded-2xl border p-6 text-center ${box}`}>
        <p className={titleClass ?? (tape ? "text-center font-mono text-2xl font-bold uppercase tracking-[0.16em]" : "font-display text-2xl font-bold")} style={titleStyle}>
          Thank you{name.trim() ? `, ${name.trim()}` : ""}!
        </p>
        <p className="font-display text-lg">
          {attending
            ? `Your reply has been sent: you're coming${list ? ` to ${list}` : ""}, ${guests} ${guests === 1 ? "guest" : "guests"}. We can't wait to see you.`
            : "Your reply has been sent. We'll miss you, and thank you for letting us know."}
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className={`space-y-4 rounded-2xl border p-5 ${box}`}>
      <h2 className={titleClass ?? (tape ? "text-center font-mono text-2xl font-bold uppercase tracking-[0.16em]" : "font-display text-2xl font-bold")} style={titleStyle}>Will you attend?</h2>
      {showNote && <p className={`rounded-lg p-2 text-sm ${tape ? "border border-white/20 bg-black/30 text-white/85" : "bg-amber-50 text-amber-900"}`}>Demo: guests reply here, and you see every response in your dashboard.</p>}
      <label className="block">Your full name
        <input className="field" value={name} maxLength={80} disabled={demo} onChange={(e) => setName(e.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Your answer">
        {([true, false] as const).map((yes) => {
          const picked = attending === yes;
          return (
            <button key={String(yes)} type="button" role="radio" aria-checked={picked} disabled={demo} onClick={() => setAttending(yes)}
              className={`press flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 px-3 text-sm font-semibold ${picked ? "" : "border-current/20 opacity-75"} ${ghost}`}
              style={picked ? { borderColor: accent ?? "var(--brand)", background: `color-mix(in srgb, ${accent ?? "var(--brand)"} 16%, transparent)` } : undefined}>
              <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded-full border-2 text-[11px]" style={{ borderColor: picked ? accent ?? "var(--brand)" : "currentColor", background: picked ? accent ?? "var(--brand)" : "transparent", color: picked ? "#fff" : "transparent" }}>✓</span>
              {yes ? "Joyfully accept" : "Regretfully decline"}
            </button>
          );
        })}
      </div>
      {attending && events.length > 1 && (
        <fieldset>
          <legend className="mb-1">Which events will you attend?</legend>
          <div className="grid gap-2">
            {events.map((e) => {
              const on = !notGoing.includes(e.i);
              return (
                <label key={e.i} className={`press flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 ${on ? "" : "opacity-70"}`} style={on ? { borderColor: accent ?? "var(--brand)" } : undefined}>
                  <input type="checkbox" className="size-5" style={{ accentColor: accent }} checked={on} disabled={demo}
                    onChange={() => setNotGoing((n) => (n.includes(e.i) ? n.filter((x) => x !== e.i) : [...n, e.i]))} />
                  <span className="font-medium">{e.title}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
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
