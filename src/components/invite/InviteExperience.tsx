"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarPlus, ChevronDown, MapPin, Shirt } from "lucide-react";
import type { Template } from "@/lib/templates";
import {
  BISMILLAH, buildIcs, eventsDateText, formatEventDate, formatEventTime, type InviteContent, type InviteEvent,
} from "@/lib/content";
import { ArtHero, InviteCard } from "./InviteCard";
import { Ornament, isTallOrnament } from "./Ornament";
import { Rsvp } from "./Rsvp";

const eventStart = (e: InviteEvent) => new Date(`${e.date}T${e.time || "00:00"}:00`).getTime();

function Countdown({ events, ur }: { events: InviteEvent[]; ur: boolean }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const i = setInterval(() => setNow(Date.now()), 60_000);
    return () => { clearTimeout(first); clearInterval(i); };
  }, []);
  if (now === null) return null;
  const upcoming = events.filter((e) => eventStart(e) > now).sort((a, b) => eventStart(a) - eventStart(b))[0];
  if (!upcoming) return null;
  const diff = eventStart(upcoming) - now;
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor(diff / 3_600_000) % 24;
  const m = Math.floor(diff / 60_000) % 60;
  const labels = ur ? ["دن", "گھنٹے", "منٹ"] : ["Days", "Hours", "Minutes"];
  return (
    <section aria-label="Countdown">
      <div className="grid grid-cols-3 gap-2 text-center" role="timer" aria-label={`${d} days ${h} hours ${m} minutes to ${upcoming.title}`}>
        {[d, h, m].map((v, i) => (
          <div key={i} className="rounded-xl border border-line bg-card py-3">
            <p className="font-display text-3xl font-bold">{v}</p>
            <p className="text-xs uppercase tracking-widest text-foreground/60">{labels[i]}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-center text-sm text-foreground/60">{ur ? `${upcoming.title} تک` : `Until ${upcoming.title}`}</p>
    </section>
  );
}

function downloadIcs(ev: InviteEvent, hosts: string) {
  const url = URL.createObjectURL(new Blob([buildIcs(ev, hosts)], { type: "text/calendar;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${ev.title.replace(/[^\w]+/g, "-").toLowerCase() || "event"}.ics` });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * The full guest experience: loading screen -> "Tap to open" cover -> invitation, events, dress code, FAQ, RSVP.
 * `demo` shows a template with sample data and a disabled RSVP form.
 * It fills its parent (which must have a fixed height) so it can sit in a phone frame or fill the screen.
 */
export function InviteExperience({
  template, content, inviteId, demo = false,
}: { template: Template; content: InviteContent; inviteId?: string; demo?: boolean }) {
  const t = template.theme;
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const [loaded, setLoaded] = useState(false);
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const [guest, setGuest] = useState("");
  const [seats, setSeats] = useState<number | null>(null);
  const names = content.host2 ? `${content.host1} & ${content.host2}` : content.host1;
  const wa = content.contactPhone.replace(/\D/g, "");
  const tall = isTallOrnament(t.ornament);
  const ordered = useMemo(() => [...content.events].sort((a, b) => eventStart(a) - eventStart(b)), [content.events]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setTimeout(() => setLoaded(true), reduce ? 0 : 900);
    // personalised greeting: .../i?s=slug&g=Sarah%20%26%20Family
    const g = new URLSearchParams(window.location.search).get("g");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the URL after mount (static export)
    if (g) setGuest(g.slice(0, 60));
    // reserved places for this guest: ...&n=2
    const n = Number(new URLSearchParams(window.location.search).get("n"));
    if (Number.isInteger(n) && n >= 1 && n <= 20) setSeats(n);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!opened) return;
    const id = setTimeout(() => setGone(true), 1000);
    return () => clearTimeout(id);
  }, [opened]);

  const tape = template.concept === "tape";
  const font = ur ? "var(--nf-urdu), serif" : "var(--nf-display), Georgia, serif";
  const hasDress = ordered.some((e) => e.dressCode);

  return (
    <div className="relative h-full w-full overflow-hidden bg-background" dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"}>
      <div className={`h-full overflow-y-auto ${opened ? "" : "overflow-hidden"}`}>
        <div className="mx-auto max-w-md space-y-6 px-4 py-6">
          <div className="overflow-hidden rounded-2xl shadow-xl"><InviteCard template={template} content={content} /></div>

          {(guest || demo) && (
            <section className="rounded-2xl border border-line bg-card p-5 text-center">
              <p className="font-display text-2xl font-bold">
                {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "محترم مہمان،" : "Dear guest,"}
              </p>
              <p className="mt-2 text-foreground/80">
                {ur ? "ہمیں آپ کی میزبانی کا شرف ملے گا۔ ہم نے آپ کے لیے جگہ رکھی ہے۔" : "It would mean the world to have you with us. We have saved you a place."}
              </p>
              {demo && !guest && (
                <p className="mt-2 text-xs text-foreground/50">Each guest can get a link that greets them by name.</p>
              )}
            </section>
          )}

          {(content.family1 || content.family2) && (
            <section className="grid gap-3 text-center sm:grid-cols-2" aria-label="Families">
              {[content.family1, content.family2].filter(Boolean).map((f) => (
                <p key={f} className="rounded-2xl border border-line bg-card p-4 text-sm font-medium">{f}</p>
              ))}
            </section>
          )}

          <Countdown events={ordered} ur={ur} />

          <section aria-label="Events" className="space-y-4">
            <h2 className="font-display text-3xl font-bold">{ur ? "تقاریب" : tape ? "Playlist" : ordered.length > 1 ? "Events" : "Event"}</h2>
            {ordered.map((e, i) => (
              <article key={i} className="rounded-2xl border border-line bg-card p-5">
                <p className={`text-xs uppercase tracking-widest text-foreground/50 ${tape ? "font-mono" : ""}`}>
                  {ordered.length > 1 && `${tape ? "REEL " : ""}${String(i + 1).padStart(2, "0")} / ${String(ordered.length).padStart(2, "0")}`}
                </p>
                <h3 className="font-display text-2xl font-bold">{e.title}</h3>
                <p className="mt-1 font-semibold">{formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}</p>
                {e.venue && <p>{e.venue}</p>}
                {e.address && <p className="text-sm text-foreground/70">{e.address}</p>}
                {seats && (
                  <p className="mt-2 text-sm font-medium text-brand">{ur ? `${seats} مہمانوں کے لیے مدعو` : `${seats} ${seats === 1 ? "guest" : "guests"} invited`}</p>
                )}
                {e.dressCode && (
                  <p className="mt-2 flex items-center gap-2 text-sm"><Shirt className="size-4 shrink-0 text-gold" aria-hidden />{ur ? "ڈریس کوڈ: " : "Dress code: "}{e.dressCode}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {e.mapUrl && (
                    <a className="btn btn-ghost" href={e.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin className="size-4" aria-hidden />{ur ? "مقام دیکھیں" : "Open location"}</a>
                  )}
                  <button type="button" className="btn btn-ghost" onClick={() => downloadIcs(e, names)}>
                    <CalendarPlus className="size-4" aria-hidden />{ur ? "کیلنڈر میں شامل کریں" : "Add to calendar"}
                  </button>
                </div>
              </article>
            ))}
            {demo && !ordered.some((e) => e.mapUrl) && <p className="text-center text-sm text-foreground/50">Your map links appear here.</p>}
          </section>

          {hasDress && ordered.length > 1 && (
            <section aria-label="Dress code" className="rounded-2xl border border-line bg-card p-5">
              <h2 className="font-display text-2xl font-bold">{ur ? "ڈریس کوڈ" : "Dress code"}</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {ordered.filter((e) => e.dressCode).map((e, i) => (
                  <li key={i} className="flex justify-between gap-3"><span className="font-medium">{e.title}</span><span className="text-foreground/70">{e.dressCode}</span></li>
                ))}
              </ul>
            </section>
          )}

          {content.faq.length > 0 && (
            <section aria-label="Questions" className="space-y-2">
              <h2 className="font-display text-2xl font-bold">{ur ? "عام سوالات" : "Good to know"}</h2>
              {content.faq.map((f, i) => (
                <details key={i} className="group rounded-xl border border-line bg-card p-4">
                  <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 font-medium">
                    {f.q}<ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="mt-2 text-sm text-foreground/80">{f.a}</p>
                </details>
              ))}
            </section>
          )}

          {wa && (
            <a className="btn btn-ghost w-full" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
              {ur ? "میزبان کو واٹس ایپ کریں" : "WhatsApp the hosts"}
            </a>
          )}

          {content.rsvpEnabled && <Rsvp inviteId={inviteId} demo={demo} guestName={guest} seats={seats} />}

          {tape && (
            <div className="rounded-2xl bg-black p-5 text-center font-mono text-sm text-white">
              <p className="tracking-widest" style={{ color: t.accent }}>■ END OF TAPE</p>
              <button type="button" className="btn mt-3 border border-white/30 text-white"
                onClick={(e) => (e.currentTarget.closest(".overflow-y-auto") as HTMLElement | null)?.scrollTo({ top: 0, behavior: "smooth" })}>
                ◀◀ Rewind
              </button>
            </div>
          )}
          {content.closing && (
            <p className="py-6 text-center font-display text-2xl" style={{ fontFamily: font }}>{content.closing}<br /><span className="text-lg text-gold">{names}</span></p>
          )}
          <p className="pb-4 text-center text-xs text-foreground/50">Made with Digital Dawat</p>
        </div>
      </div>

      {!gone && (
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center text-center transition-transform duration-1000 ease-in-out ${template.art ? "justify-end pb-28" : "justify-center"}`}
          style={{
            background: `linear-gradient(170deg, ${t.bg}, ${t.bg2})`,
            color: t.ink,
            transform: opened ? "translateY(-100%)" : "none",
            fontFamily: ur ? "var(--nf-urdu), serif" : "var(--nf-sans), system-ui, sans-serif",
          }}
        >
          <Ornament kind={t.ornament} className={`pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2 opacity-30 ${tall ? "h-[88%] w-[88%]" : "w-[70%]"}`} />
          {template.art && <ArtHero art={template.art} bg={t.bg} />}
          {tape && (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)" }} />
              <p aria-hidden className="absolute left-5 top-5 animate-pulse font-mono text-xs tracking-widest" style={{ color: t.accent }}>● REC</p>
              <p aria-hidden className="absolute right-5 top-5 font-mono text-xs tracking-widest">❚❚ PAUSE SP</p>
            </>
          )}
          {!loaded ? (
            <p className="relative animate-pulse text-sm uppercase tracking-[0.3em]" style={{ color: t.accent }} role="status">{tape ? "● TRACKING…" : "Loading…"}</p>
          ) : (
            <div className="rise relative flex flex-col items-center gap-4 px-8" style={template.art ? { textShadow: `0 0 8px ${t.bg}, 0 0 18px ${t.bg}` } : undefined}>
              {content.bismillah && <p lang="ar" dir="rtl" className="text-2xl" style={{ color: t.accent, fontFamily: "var(--nf-urdu), serif", lineHeight: 1.8 }}>{BISMILLAH}</p>}
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: t.accent }}>{content.headline}</p>
              <h2 className="text-5xl leading-tight" style={{ fontFamily: font, fontWeight: 600 }}>{names}</h2>
              <div className="h-px w-16" style={{ background: t.accent }} />
              <p style={{ color: t.muted }}>{eventsDateText(content, loc)}</p>
              <button
                type="button"
                onClick={() => setOpened(true)}
                className="btn mt-6 animate-pulse"
                style={{ background: t.accent, color: t.bg }}
              >
                {ur ? "کھولنے کے لیے ٹیپ کریں" : tape ? "▶ Press play" : "Tap to open"}
              </button>
              <ChevronDown className="mt-2 size-5 opacity-60" aria-hidden />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
