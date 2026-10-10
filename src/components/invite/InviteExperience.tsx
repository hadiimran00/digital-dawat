"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, ChevronDown, MapPin, Music, Shirt, VolumeX } from "lucide-react";
import type { Template } from "@/lib/templates";
import {
  BISMILLAH, buildIcs, eventsDateText, formatEventDate, formatEventTime, type InviteContent, type InviteEvent,
} from "@/lib/content";
import { burst, type TapFx } from "@/lib/tapFx";
import { ArtHero, GOLD, InviteCard, TAPE_GLASS } from "./InviteCard";
import { Families } from "./Families";
import { Ornament, isTallOrnament } from "./Ornament";
import { Rsvp } from "./Rsvp";
import { ScratchReveal } from "./ScratchReveal";

const eventStart = (e: InviteEvent) => new Date(`${e.date}T${e.time || "00:00"}:00`).getTime();
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Glass panels for the video-tape concept, ordinary cards otherwise. */
const GLASS = TAPE_GLASS;
const PLAIN = "border-line bg-card";

function Countdown({
  events, ur, tape, scratchKind, accent, panel, muted,
}: { events: InviteEvent[]; ur: boolean; tape: boolean; scratchKind: "static" | "foil" | null; accent: string; panel: string; muted: string }) {
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
  const date = new Date(`${upcoming.date}T00:00:00`);
  const loc = ur ? "ur-PK" : "en-GB";
  return (
    <section aria-label="Countdown">
      {scratchKind && (
        <ScratchReveal
          kind={scratchKind}
          accent={accent}
          label={scratchKind === "static" ? "Scratch off the static to find the date" : "Scratch the gold to find the date"}
          revealLabel={ur ? "ظاہر کریں" : "Reveal"}
        >
          <div className={`mb-4 rounded-2xl border p-5 text-center ${panel}`}>
            <p className={`text-xs uppercase tracking-[0.25em] ${muted} ${tape ? "font-mono" : ""}`}>{date.toLocaleDateString(loc, { weekday: "long" })}</p>
            <p className="font-display text-4xl font-bold">{date.toLocaleDateString(loc, { day: "numeric", month: "long" })}</p>
            <p className={`${muted} ${tape ? "font-mono" : ""}`}>{date.getFullYear()}</p>
          </div>
        </ScratchReveal>
      )}
      <div className="grid grid-cols-3 gap-2 text-center" role="timer" aria-label={`${d} days ${h} hours ${m} minutes to ${upcoming.title}`}>
        {[d, h, m].map((v, i) => (
          <div key={i} className={`rounded-xl border py-3 ${panel}`}>
            <p className={`text-3xl font-bold ${tape ? "font-mono" : "font-display"}`}>{String(v).padStart(i === 0 ? 1 : 2, "0")}</p>
            <p className={`text-xs uppercase tracking-widest ${muted}`}>{labels[i]}</p>
          </div>
        ))}
      </div>
      <p className={`mt-2 text-center text-sm ${muted}`}>{ur ? `${upcoming.title} تک` : `Until ${upcoming.title}`}</p>
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

const SCENES: { orn: "jharokha" | "rosette" | "jali" | "bars" | "floral" | "crescent"; deg: number }[] = [
  { orn: "jharokha", deg: 160 },
  { orn: "rosette", deg: 200 },
  { orn: "jali", deg: 140 },
  { orn: "bars", deg: 180 },
  { orn: "floral", deg: 220 },
  { orn: "crescent", deg: 170 },
];

/** Fixed background "scenes" that cross-fade as the guest scrolls. Our own graphics, easy to swap for photos later. */
const PHOTO_POS = ["50% 18%", "50% 58%", "15% 40%", "85% 40%", "50% 90%", "50% 35%"];

function SceneBackdrop({ scene, t, photo }: { scene: number; t: Template["theme"]; photo?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden" style={{ background: t.bg }}>
      {SCENES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: scene === i ? 1 : 0,
            background: photo
              ? `linear-gradient(rgba(12,8,5,0.52), rgba(12,8,5,0.68)), url(${photo}) ${PHOTO_POS[i]} / cover no-repeat`
              : `radial-gradient(120% 70% at 50% 18%, ${t.accent}33, transparent 60%), linear-gradient(${s.deg}deg, ${t.bg}, ${t.bg2})`,
          }}
        >
          {!photo && (
            <Ornament
              kind={s.orn}
              className={`absolute left-1/2 -translate-x-1/2 opacity-[0.16] ${s.orn === "jharokha" ? "top-[2%] h-[96%] w-[96%]" : "top-[8%] w-[120%] max-w-none"}`}
            />
          )}
        </div>
      ))}
      {/* tape look: grain, scan lines and a vignette */}
      <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 3px)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 45%, rgba(0,0,0,0.65))" }} />
    </div>
  );
}

/** Small "● REC  SECTION" label above each panel in the tape concept; nothing otherwise. */
function Tag({ tape, label, accent }: { tape: boolean; label: string; accent?: string }) {
  if (!tape) return null;
  return (
    <p className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/80" aria-hidden>
      <span><span className="text-red-500">●</span> REC</span><span style={{ color: accent }}>{label}</span>
    </p>
  );
}

/** Tape concept: one full screen per section, content resting near the bottom so the photo shows above it. */
function Screen({ tape, scene, id, framed = true, above, children }: { tape: boolean; scene: number; id?: string; framed?: boolean; above?: React.ReactNode; children: React.ReactNode }) {
  if (!tape) return <>{children}</>;
  return (
    <div id={id} data-scene={scene} className="flex min-h-[100cqh] snap-start flex-col justify-end pb-[calc(5.5rem+var(--frame-bottom,0px))] pt-[calc(4.5rem+var(--frame-top,0px))]">
      {above}
      <div className="relative">
        {framed && ["-left-2 -top-2 border-l-2 border-t-2", "-right-2 -top-2 border-r-2 border-t-2", "-bottom-2 -left-2 border-b-2 border-l-2", "-bottom-2 -right-2 border-b-2 border-r-2"].map((c) => (
          <span key={c} aria-hidden className={`pointer-events-none absolute size-5 border-white/80 ${c}`} />
        ))}
        {children}
      </div>
    </div>
  );
}

/** Section title in the tape's lettering: white monospaced capitals with a faint VHS colour split. */
function TapeTitle({ children, as: As = "h2" }: { children: React.ReactNode; as?: "h2" | "h3" }) {
  return <As className="text-center font-mono text-2xl font-bold uppercase tracking-[0.16em]" style={{ textShadow: VHS }}>{children}</As>;
}

/** Gold script lettering for names and greetings. */
const goldScript = { fontFamily: "var(--nf-script), cursive", fontWeight: 400, backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } as const;

const SMALL_BTN = "press inline-flex min-h-10 items-center gap-1.5 rounded-sm px-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em]";

/** VHS colour split: a faint red and cyan ghost either side of tape lettering. */
const VHS = "-1.5px 0 rgba(255,40,90,0.55), 1.5px 0 rgba(0,220,255,0.55)";

const pad = (n: number) => String(n).padStart(2, "0");
const timecode = (s: number) => `${Math.floor(s / 3600)}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;

/**
 * The full guest experience: "Tap to open" cover -> invitation, events, dress code, FAQ, RSVP.
 * `demo` shows a template with sample data and a disabled RSVP form.
 * It fills its parent (which must have a fixed height) so it can sit in a phone frame or fill the screen.
 * Templates with the "tape" concept add a fixed scene layer, an on-screen display (play state, timecode, date stamp)
 * and see-through panels.
 */
export function InviteExperience({
  template, content, inviteId, demo = false,
}: { template: Template; content: InviteContent; inviteId?: string; demo?: boolean }) {
  const t = template.theme;
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const tape = template.concept === "tape";
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const [guest, setGuest] = useState("");
  const [seats, setSeats] = useState<number | null>(null);
  const [scene, setScene] = useState(0);
  const [atEnd, setAtEnd] = useState(false); // the scroll-down hint stays until the very bottom
  const [seconds, setSeconds] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const song = useRef<HTMLAudioElement>(null);
  const [songOff, setSongOff] = useState(false);
  const names = content.host2 ? `${content.host1} & ${content.host2}` : content.host1;
  const wa = content.contactPhone.replace(/\D/g, "");
  const tall = isTallOrnament(t.ornament);
  const ordered = useMemo(() => [...content.events].sort((a, b) => eventStart(a) - eventStart(b)), [content.events]);

  const panel = tape ? GLASS : PLAIN;
  const muted = tape ? "text-white/75" : "text-foreground/70";
  const mono = tape ? "font-mono" : "";
  const scratchKind: "static" | "foil" | null = tape ? "static" : template.motion === "scratch" ? "foil" : null;
  const fx: TapFx = tape ? "flash" : template.motion === "sparkle" ? "sparkles" : "petals";
  const fxCaption = ur
    ? "کچھ دیکھنے کے لیے ٹیپ کریں"
    : fx === "flash" ? "Tap anywhere for a camera flash" : fx === "sparkles" ? "Tap anywhere for sparkles" : "Tap anywhere for petals";

  useEffect(() => {
    // personalised greeting: .../i?s=slug&g=Sarah%20%26%20Family and reserved places: ...&n=2
    const q = new URLSearchParams(window.location.search);
    const g = q.get("g");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the URL after mount (static export)
    if (g) setGuest(g.slice(0, 60));
    const n = Number(q.get("n"));
    if (Number.isInteger(n) && n >= 1 && n <= 20) setSeats(n);
  }, []);
  useEffect(() => {
    if (!opened) return;
    const id = setTimeout(() => setGone(true), 560);
    return () => clearTimeout(id);
  }, [opened]);

  // tape: timecode runs once the guest presses play
  useEffect(() => {
    if (!tape || !opened) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [tape, opened]);

  // tape: switch the background scene as sections scroll into view
  useEffect(() => {
    if (!tape || !scroller.current) return;
    const root = scroller.current;
    const io = new IntersectionObserver(
      (entries) => {
        const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) setScene(Number((best.target as HTMLElement).dataset.scene ?? 0));
      },
      { root, threshold: [0.2, 0.5, 0.8], rootMargin: "-25% 0px -25% 0px" },
    );
    root.querySelectorAll("[data-scene]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tape]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 48);
  }, []);
  // Opening is a tap, so the browser lets the song start; a failure (blocked, offline) just leaves it silent.
  const open = () => {
    setOpened(true);
    const a = song.current;
    if (a) { a.volume = 0.7; a.play().catch(() => setSongOff(true)); }
  };
  const toggleSong = () => {
    const a = song.current;
    if (!a) return;
    if (a.paused) { a.play().then(() => setSongOff(false)).catch(() => {}); } else { a.pause(); setSongOff(true); }
  };
  const toTop = () => { setSeconds(0); scroller.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }); };
  const goTo = (i: number) =>
    document.getElementById(`ev-${i}`)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
  const onTap = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,summary,input,textarea,select,label,canvas,[role=tab]")) return;
    burst(fx, e.clientX, e.clientY, fx === "sparkles" ? [t.accent, "#fff3c4"] : [t.accent, "#c2185b", "#e8b95c"]);
  };

  const font = ur ? "var(--nf-urdu), serif" : "var(--nf-display), Georgia, serif";
  const hasDress = ordered.some((e) => e.dressCode);
  const sceneAttr = (n: number) => (tape ? { "data-scene": n } : {});
  const stamp = new Date(`${ordered[0].date}T00:00:00`).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase().replace(/(\w+) (\d+) (\d+)/, "$1 $2 $3");

  return (
    <div className="relative h-full w-full overflow-hidden bg-background" dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} onPointerDown={onTap}>
      {tape && <SceneBackdrop scene={scene} t={t} photo={template.backdrop?.src} />}

      <div
        ref={scroller}
        onScroll={onScroll}
        className={`relative z-[1] h-full overflow-y-auto overscroll-contain ${opened ? "" : "overflow-hidden"} ${tape ? "snap-y snap-proximity text-white [container-type:size]" : ""}`}
      >
        {tape ? (
        <div className="mx-auto max-w-md px-5">
          <Screen tape scene={0} framed={false}>
            <div className="overflow-hidden rounded-md"><InviteCard template={template} content={content} chrome={false} clear={!!template.backdrop} /></div>
          </Screen>

          {(content.family1 || content.family2 || content.members1.length > 0 || content.members2.length > 0) && (
            <Screen tape scene={1}>
              <div className={`rounded-md border p-4 ${panel}`}>
                <Tag tape label={ur ? "خاندان" : "Families"} accent={t.accent} />
                <Families content={content} ur={ur} glass />
              </div>
            </Screen>
          )}

          {(guest || demo) && (
            <Screen tape scene={2}>
              <section className={`rounded-md border p-5 text-center ${panel}`}>
                <Tag tape label={ur ? "پیغام" : "Message"} accent={t.accent} />
                <p className="pb-1 text-4xl leading-tight" style={ur ? { fontFamily: font } : goldScript}>
                  {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "محترم مہمان،" : "Dear guest,"}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/90">
                  {ur
                    ? "ہمیں آپ کی میزبانی کا شرف ملے گا۔ ہم نے آپ کے لیے جگہ رکھی ہے۔"
                    : "Your presence is the blessing we are asking for. It would not be complete without the people who have loved us all our lives. We have saved you a place."}
                </p>
                {ordered.length > 1 && (
                  <nav aria-label={ur ? "تقاریب" : "Jump to an event"} className="mt-4 flex flex-wrap justify-center gap-2">
                    {ordered.map((e, i) => (
                      <button key={i} type="button" onClick={() => goTo(i)} className={`${SMALL_BTN} border border-white/50 hover:bg-white/10`}>{e.title}</button>
                    ))}
                  </nav>
                )}
                {demo && !guest && <p className="mt-3 text-xs text-white/70">Each guest can get a link that greets them by name.</p>}
              </section>
            </Screen>
          )}

          <Screen tape scene={3}>
            <div className={`rounded-md border p-4 ${panel}`}>
              <Tag tape label={ur ? "الٹی گنتی" : "Countdown"} accent={t.accent} />
              <Countdown events={ordered} ur={ur} tape scratchKind={scratchKind} accent={t.accent} panel="border-white/15 bg-black/30" muted="text-white/75" />
            </div>
          </Screen>

          {ordered.map((e, i) => (
            <Screen
              key={i}
              tape
              scene={3}
              id={`ev-${i}`}
              above={
                <p aria-hidden className="mx-auto mb-5 w-fit rounded-sm border border-white/40 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
                  ✦ {ur ? fxCaption : "Tap anywhere for a photo flash"}
                </p>
              }
            >
              <article className={`rounded-md border p-5 text-center ${panel}`}>
                <Tag tape label={`Tape ${pad(i + 1)} / ${pad(ordered.length)}`} accent={t.accent} />
                {seats && (
                  <p className="mx-auto -mt-1 mb-2 w-fit rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em]" style={{ background: t.accent, color: t.bg }}>
                    {ur ? `${seats} مہمان مدعو` : `${seats} ${seats === 1 ? "guest" : "guests"} invited`}
                  </p>
                )}
                <TapeTitle as="h3">{e.title}</TapeTitle>
                <p className="mt-2 font-display text-lg font-semibold">{formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}</p>
                {e.venue && <p className="mt-1 text-sm">{e.venue}</p>}
                {e.address && <p className="text-xs text-white/75">{e.address}</p>}
                {e.dressCode && <p className="mt-1 text-xs text-white/75">{ur ? "ڈریس کوڈ: " : "Dress code: "}{e.dressCode}</p>}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {e.mapUrl && (
                    <a className={SMALL_BTN} style={{ background: t.accent, color: t.bg }} href={e.mapUrl} target="_blank" rel="noopener noreferrer">
                      <MapPin className="size-3.5" aria-hidden />{ur ? "مقام" : "Open location"}
                    </a>
                  )}
                  <button type="button" className={`${SMALL_BTN} border border-white/60`} onClick={() => downloadIcs(e, names)}>
                    <CalendarPlus className="size-3.5" aria-hidden />{ur ? "کیلنڈر" : "Add to calendar"}
                  </button>
                </div>
              </article>
            </Screen>
          ))}

          {hasDress && ordered.length > 1 && (
            <Screen tape scene={4}>
              <section aria-label="Dress code" className={`rounded-md border p-5 text-center ${panel}`}>
                <Tag tape label={ur ? "پروگرام" : "Programme"} accent={t.accent} />
                <TapeTitle>{ur ? "ڈریس کوڈ" : "Dress code"}</TapeTitle>
                <ul className="mt-4 space-y-3">
                  {ordered.filter((e) => e.dressCode).map((e, i) => (
                    <li key={i}>
                      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>{e.title}</p>
                      <p className="text-sm text-white/90">{e.dressCode}</p>
                    </li>
                  ))}
                </ul>
              </section>
            </Screen>
          )}

          {content.faq.length > 0 && (
            <Screen tape scene={4}>
              <section aria-label="Questions" className={`rounded-md border p-5 ${panel}`}>
                <Tag tape label="Q & A" accent={t.accent} />
                <TapeTitle>{ur ? "عام سوالات" : "A few questions"}</TapeTitle>
                <div className="mt-4 divide-y divide-white/15 border-t border-white/15">
                  {content.faq.map((f, i) => (
                    <details key={i} className="group py-3">
                      <summary className="flex min-h-8 cursor-pointer list-none items-center gap-3 text-sm font-medium">
                        <span className="font-mono text-[11px] font-bold" style={{ color: t.accent }}>A{i + 1}</span>
                        <span className="flex-1">{f.q}</span>
                        <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-sm border border-white/50 font-mono text-xs transition-transform duration-200 ease-out group-open:rotate-45">+</span>
                      </summary>
                      <p className="mt-2 pl-8 text-sm text-white/85">{f.a}</p>
                    </details>
                  ))}
                </div>
                {wa && (
                  <a className={`${SMALL_BTN} mt-4 w-full justify-center border border-white/50`} href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                    {ur ? "میزبان کو واٹس ایپ کریں" : "WhatsApp the hosts"}
                  </a>
                )}
              </section>
            </Screen>
          )}

          {content.rsvpEnabled && (
            <Screen tape scene={5}>
              <Rsvp inviteId={inviteId} demo={demo} guestName={guest} seats={seats} tape accent={t.accent} />
            </Screen>
          )}

          <Screen tape scene={5}>
            <div className={`rounded-md border p-5 text-center ${panel}`}>
              <p className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" aria-hidden>
                <span>■ Stop</span><span style={{ color: t.accent }}>End of tape</span>
              </p>
              <p className="pb-1 text-4xl leading-tight" style={ur ? { fontFamily: font } : goldScript}>{ur ? content.closing : "Thank you for watching, see you there"}</p>
              <p className="mt-2 pb-1 text-3xl" style={ur ? { fontFamily: font } : goldScript}>{names}</p>
              <button type="button" className={`${SMALL_BTN} mt-5 px-6 text-xs`} style={{ background: t.accent, color: t.bg, boxShadow: "0 4px 0 #A8531A" }} onClick={toTop}>◀◀ Rewind</button>
            </div>
          </Screen>
          <p className="pb-[calc(5rem+var(--frame-bottom,0px))] text-center text-xs text-white/70">Made with Digital Dawat</p>
        </div>
        ) : (
        <div className="mx-auto max-w-md space-y-6 px-4 pb-[calc(1.5rem+var(--frame-bottom,0px))] pt-[calc(1.5rem+var(--frame-top,0px))]">
          <div {...sceneAttr(0)} className="overflow-hidden rounded-2xl shadow-xl"><InviteCard template={template} content={content} chrome={!tape} clear={tape && !!template.backdrop} /></div>

          {(content.family1 || content.family2 || content.members1.length > 0 || content.members2.length > 0) && (
            <div {...sceneAttr(1)}><Tag tape={tape} label={ur ? "خاندان" : "Families"} /><Families content={content} ur={ur} glass={tape} /></div>
          )}

          {(guest || demo) && (
            <section {...sceneAttr(2)} className={`rounded-2xl border p-5 text-center ${panel}`}>
              <Tag tape={tape} label={ur ? "پیغام" : "Message"} />
              <p className="font-display text-2xl font-bold">
                {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "محترم مہمان،" : "Dear guest,"}
              </p>
              <p className={`mt-2 ${tape ? "text-white/85" : "text-foreground/80"}`}>
                {ur ? "ہمیں آپ کی میزبانی کا شرف ملے گا۔ ہم نے آپ کے لیے جگہ رکھی ہے۔" : "It would mean the world to have you with us. We have saved you a place."}
              </p>
              {ordered.length > 1 && (
                <nav aria-label={ur ? "تقاریب" : "Jump to an event"} className="mt-4 flex flex-wrap justify-center gap-2">
                  {ordered.map((e, i) => (
                    <button key={i} type="button" onClick={() => goTo(i)}
                      className={`press min-h-11 rounded-full border px-4 text-sm font-semibold ${tape ? "border-white/30 font-mono uppercase tracking-wider hover:bg-white/10" : "border-line bg-white hover:border-gold"}`}>
                      {e.title}
                    </button>
                  ))}
                </nav>
              )}
              {demo && !guest && <p className={`mt-3 text-xs ${muted}`}>Each guest can get a link that greets them by name.</p>}
            </section>
          )}

          <div {...sceneAttr(3)}>
            <Tag tape={tape} label={ur ? "الٹی گنتی" : "Countdown"} />
            <Countdown events={ordered} ur={ur} tape={tape} scratchKind={scratchKind} accent={t.accent} panel={panel} muted={muted} />
          </div>

          <section aria-label="Events" className="space-y-4">
            <h2 className="font-display text-3xl font-bold">{ur ? "تقاریب" : tape ? "Playlist" : ordered.length > 1 ? "Events" : "Event"}</h2>
            {ordered.map((e, i) => (
              <article id={`ev-${i}`} key={i} {...sceneAttr(3)} className={`rounded-2xl border p-5 ${panel}`}>
                <Tag tape={tape} label={`${tape ? "Tape " : ""}${pad(i + 1)} / ${pad(ordered.length)}`} />
                {!tape && ordered.length > 1 && <p className={`text-xs uppercase tracking-widest ${muted}`}>{pad(i + 1)} / {pad(ordered.length)}</p>}
                <h3 className="font-display text-2xl font-bold">{e.title}</h3>
                <p className="mt-1 font-semibold">{formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}</p>
                {e.venue && <p>{e.venue}</p>}
                {e.address && <p className={`text-sm ${muted}`}>{e.address}</p>}
                {seats && (
                  <p className={`mt-2 text-sm font-medium ${tape ? "font-mono uppercase text-amber-300" : "text-brand"}`}>{ur ? `${seats} مہمانوں کے لیے مدعو` : `${seats} ${seats === 1 ? "guest" : "guests"} invited`}</p>
                )}
                {e.dressCode && (
                  <p className="mt-2 flex items-center gap-2 text-sm"><Shirt className={`size-4 shrink-0 ${tape ? "text-amber-300" : "text-gold-deep"}`} aria-hidden />{ur ? "ڈریس کوڈ: " : "Dress code: "}{e.dressCode}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {e.mapUrl && (
                    <a className={`btn btn-ghost ${tape ? "!border-white/30 !bg-transparent !text-white" : ""}`} href={e.mapUrl} target="_blank" rel="noopener noreferrer"><MapPin className="size-4" aria-hidden />{ur ? "مقام دیکھیں" : "Open location"}</a>
                  )}
                  <button type="button" className={`btn btn-ghost ${tape ? "!border-white/30 !bg-transparent !text-white" : ""}`} onClick={() => downloadIcs(e, names)}>
                    <CalendarPlus className="size-4" aria-hidden />{ur ? "کیلنڈر میں شامل کریں" : "Add to calendar"}
                  </button>
                </div>
                <p className={`mt-3 text-center text-[11px] uppercase tracking-[0.2em] ${muted} ${mono}`}>{fxCaption}</p>
              </article>
            ))}
            {demo && !ordered.some((e) => e.mapUrl) && <p className={`text-center text-sm ${muted}`}>Your map links appear here.</p>}
          </section>

          {hasDress && ordered.length > 1 && (
            <section {...sceneAttr(4)} aria-label="Dress code" className={`rounded-2xl border p-5 ${panel}`}>
              <Tag tape={tape} label={ur ? "پروگرام" : "Programme"} />
              <h2 className="font-display text-2xl font-bold">{ur ? "ڈریس کوڈ" : "Dress code"}</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {ordered.filter((e) => e.dressCode).map((e, i) => (
                  <li key={i} className="flex justify-between gap-3"><span className="font-medium">{e.title}</span><span className={muted}>{e.dressCode}</span></li>
                ))}
              </ul>
            </section>
          )}

          {content.faq.length > 0 && (
            <section {...sceneAttr(4)} aria-label="Questions" className="space-y-2">
              <Tag tape={tape} label="Q & A" />
              <h2 className="font-display text-2xl font-bold">{ur ? "عام سوالات" : "Good to know"}</h2>
              {content.faq.map((f, i) => (
                <details key={i} className={`group rounded-xl border p-4 ${panel}`}>
                  <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-2 font-medium">
                    {f.q}<ChevronDown className="size-4 shrink-0 transition-transform duration-200 ease-out group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className={`mt-2 text-sm ${tape ? "text-white/85" : "text-foreground/80"}`}>{f.a}</p>
                </details>
              ))}
            </section>
          )}

          {wa && (
            <a className={`btn btn-ghost w-full ${tape ? "!border-white/30 !bg-black/45 !text-white" : ""}`} href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
              {ur ? "میزبان کو واٹس ایپ کریں" : "WhatsApp the hosts"}
            </a>
          )}

          {content.rsvpEnabled && <div {...sceneAttr(5)}><Rsvp inviteId={inviteId} demo={demo} guestName={guest} seats={seats} /></div>}

          {tape && (
            <div {...sceneAttr(5)} className="rounded-2xl border border-white/15 bg-black p-5 text-center font-mono text-sm text-white">
              <p className="tracking-widest" style={{ color: t.accent }}>■ STOP · END OF TAPE</p>
              <p className="mt-2 text-white/80">{ur ? content.closing : "Thank you for watching. See you there."}</p>
              <button type="button" className="btn mt-3 border border-white/30 text-white" onClick={toTop}>◀◀ Rewind</button>
            </div>
          )}
          {content.closing && !tape && (
            <p className="py-6 text-center font-display text-2xl" style={{ fontFamily: font }}>{content.closing}<br /><span className="text-lg text-gold-deep">{names}</span></p>
          )}
          <p className={`pb-16 text-center text-xs ${muted}`}>Made with Digital Dawat</p>
        </div>
        )}
      </div>

      {/* tape: on-screen display (play state, timecode, viewfinder corners, date stamp, scroll hint) */}
      {tape && opened && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 font-mono text-white" style={{ textShadow: `${VHS}, 0 0 6px rgba(0,0,0,0.8)` }}>
          <div className="absolute inset-x-0 top-0 h-[calc(4rem+var(--frame-top,0px))] bg-gradient-to-b from-black/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[calc(5rem+var(--frame-bottom,0px))] bg-gradient-to-t from-black/70 to-transparent" />
          <p className="absolute left-5 top-[calc(1rem+var(--frame-top,0px))] text-sm font-bold tracking-[0.2em]">PLAY ▶</p>
          <p className="absolute right-5 top-[calc(1rem+var(--frame-top,0px))] text-sm font-bold tracking-[0.15em]">SP {timecode(seconds)}</p>
          {["left-4 top-[calc(1rem+var(--frame-top,0px))] border-l-2 border-t-2", "right-4 top-[calc(1rem+var(--frame-top,0px))] border-r-2 border-t-2", "bottom-[calc(1rem+var(--frame-bottom,0px))] left-4 border-b-2 border-l-2", "bottom-[calc(1rem+var(--frame-bottom,0px))] right-4 border-b-2 border-r-2"].map((c) => (
            <span key={c} className={`absolute size-7 border-white/70 ${c}`} />
          ))}
          <p className="absolute bottom-[calc(1.5rem+var(--frame-bottom,0px))] right-7 rounded bg-black/55 px-2 py-0.5 text-sm font-bold tracking-[0.2em]" style={{ color: t.accent }}>{stamp}</p>
          {!atEnd && (
            <button type="button" tabIndex={-1} onClick={() => scroller.current?.scrollBy({ top: scroller.current.clientHeight * 0.8, behavior: reducedMotion() ? "auto" : "smooth" })}
              className="pointer-events-auto absolute bottom-[calc(1.5rem+var(--frame-bottom,0px))] left-1/2 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-black/60 px-5 text-xs font-bold tracking-[0.25em]">
              SCROLL DOWN <ChevronDown className="size-4" />
            </button>
          )}
        </div>
      )}

      {template.music && (
        <>
          <audio ref={song} src={template.music.src} loop preload="none" />
          {opened && (
            <button type="button" onClick={toggleSong} aria-pressed={!songOff} aria-label={songOff ? "Play music" : "Mute music"}
              className="press absolute bottom-[calc(3.5rem+var(--frame-bottom,0px))] left-4 z-30 grid size-11 place-items-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur">
              {songOff ? <VolumeX className="size-5" aria-hidden /> : <Music className="size-5" aria-hidden />}
            </button>
          )}
        </>
      )}

      {!gone && (
        <div
          data-open={opened}
          className={`cover absolute inset-0 z-20 flex flex-col items-center text-center ${template.art || tape ? "justify-end pb-28" : "justify-center"}`}
          style={{
            background: tape && template.backdrop
              ? `linear-gradient(to top, rgba(12,8,5,0.92) 18%, rgba(12,8,5,0.35) 62%, rgba(12,8,5,0.15)), url(${template.backdrop.src}) 50% 12% / cover no-repeat`
              : `linear-gradient(170deg, ${t.bg}, ${t.bg2})`,
            color: t.ink,
            fontFamily: ur ? "var(--nf-urdu), serif" : "var(--nf-sans), system-ui, sans-serif",
          }}
        >
          {!(tape && template.backdrop) && <Ornament kind={t.ornament} className={`pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2 opacity-30 ${tall ? "h-[88%] w-[88%]" : "w-[70%]"}`} />}
          {template.art && <ArtHero art={template.art} bg={t.bg} />}
          {tape && (
            <>
              <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)" }} />
              <p aria-hidden className="absolute left-5 top-[calc(1rem+var(--frame-top,0px))] font-mono text-sm font-bold tracking-[0.2em]">❚❚ PAUSE</p>
              {["left-4 top-[calc(3rem+var(--frame-top,0px))] border-l-2 border-t-2", "right-4 top-[calc(3rem+var(--frame-top,0px))] border-r-2 border-t-2", "bottom-[calc(3rem+var(--frame-bottom,0px))] left-4 border-b-2 border-l-2", "bottom-[calc(3rem+var(--frame-bottom,0px))] right-4 border-b-2 border-r-2"].map((c) => (
                <span key={c} aria-hidden className={`absolute size-7 border-white/60 ${c}`} />
              ))}
              <p aria-hidden className="absolute left-7 top-[calc(4rem+var(--frame-top,0px))] font-mono text-xs tracking-widest" style={{ color: t.accent }}><span className="animate-pulse text-red-400">●</span> REC</p>
            </>
          )}
          <div className="rise relative flex flex-col items-center gap-4 px-8" style={template.art ? { textShadow: `0 0 8px ${t.bg}, 0 0 18px ${t.bg}` } : undefined}>
            {content.bismillah && <p lang="ar" dir="rtl" className="text-2xl" style={{ color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>}
            <p className={`text-xs uppercase tracking-[0.3em] ${mono}`} style={{ color: t.accent, ...(tape ? { textShadow: VHS } : {}) }}>{tape && !ur ? "The wedding of" : content.headline}</p>
            {tape && !ur
              ? <h2 className="pb-2 text-7xl leading-[1.05]" style={{ fontFamily: "var(--nf-script), cursive", fontWeight: 400, backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{names}</h2>
              : <h2 className="text-5xl leading-tight" style={{ fontFamily: font, fontWeight: 600 }}>{names}</h2>}
            <div className="h-px w-16" style={{ background: t.accent }} />
            <p className={mono} style={{ color: tape ? t.accent : t.muted }}>{tape ? stamp : eventsDateText(content, loc)}</p>
            <button type="button" onClick={open} className={`btn mt-6 ${tape ? "font-mono uppercase tracking-[0.25em]" : ""}`} style={{ background: t.accent, color: t.bg, ...(tape ? { boxShadow: "0 4px 0 #A8531A" } : {}) }}>
              {ur ? "کھولنے کے لیے ٹیپ کریں" : tape ? "▶ Press play" : "Tap to open"}
            </button>
            <ChevronDown className="mt-2 size-5 opacity-60" aria-hidden />
          </div>
        </div>
      )}
    </div>
  );
}
