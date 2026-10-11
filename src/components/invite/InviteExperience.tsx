"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CalendarPlus, ChevronDown, MapPin, Music, Phone, Shirt, VolumeX } from "lucide-react";
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

/** The customer's map link, or a Google Maps search for the venue and address when they did not give one. */
function mapLink(e: InviteEvent) {
  if (e.mapUrl) return e.mapUrl;
  const q = [e.venue, e.address].filter(Boolean).join(", ");
  return q ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}` : "";
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

function SceneBackdrop({ scene, t, photo, photos = [], active = "", look, tape }: { scene: number; t: Template["theme"]; photo?: string; photos?: string[]; active?: string; look: Look; tape: boolean }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${tape ? "" : "scene-drift"}`} style={{ background: t.bg }}>
      {SCENES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: scene === i && !active ? 1 : 0,
            background: photo
              ? `linear-gradient(${look.scrim[0]}, ${look.scrim[1]}), url(${photo}) ${tape ? PHOTO_POS[i] : "50% 50%"} / cover no-repeat`
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
      {photos.map((src) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{ opacity: active === src ? 1 : 0, background: `linear-gradient(${look.scrim[0]}, ${look.scrim[1]}), url(${src}) 50% 40% / cover no-repeat` }}
        />
      ))}
      {/* tape look: grain, scan lines and a vignette */}
      {tape && <div className="absolute inset-0 opacity-30" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 3px)" }} />}
      {tape && <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, transparent 45%, rgba(0,0,0,0.65))" }} />}
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
function Screen({ tape, scene, id, photo, framed = true, above, align = "end", children }: { tape: boolean; scene: number; id?: string; photo?: string; framed?: boolean; above?: React.ReactNode; align?: "start" | "end"; children: React.ReactNode }) {
  if (!tape) return <>{children}</>;
  return (
    <div id={id} data-scene={scene} data-photo={photo || undefined} className={`flex min-h-[100cqh] snap-start flex-col ${align === "end" ? "justify-end" : "justify-start"} pb-[calc(5.5rem+var(--frame-bottom,0px))] pt-[calc(4.5rem+var(--frame-top,0px))]`}>
      {above}
      <div className="scene-reveal relative">
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

type Concept = NonNullable<Template["concept"]>;

/** Gold foil fill, clipped to text. */
const foil = (font: string, weight = 400, italic = false) =>
  ({ fontFamily: font, fontWeight: weight, fontStyle: italic ? "italic" : "normal", backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }) as const;

/**
 * How each scene concept looks. The structure (one screen per section, photo stage behind) is shared;
 * panels, lettering, buttons and the opening gate differ.
 */
interface Look {
  dark: boolean;
  panel: string;
  panelStyle?: React.CSSProperties;
  ink: string;
  muted: string;
  cell: string; // countdown cells
  title: string;
  titleStyle?: React.CSSProperties;
  names: React.CSSProperties;
  greet: React.CSSProperties;
  solid: string;
  solidStyle: (accent: string, bg: string) => React.CSSProperties;
  ghost: string;
  chip: string;
  label: string; // small labels such as event names in the dress code
  /** where the panel sits on its screen */
  align: "start" | "end";
  scrim: [string, string];
  pill: string;
  /** body copy inside panels */
  prose: string;
  /** thin inner frame drawn just inside each panel (null = none) */
  frame: string | null;
  /** a line under the names on the opening screen */
  tagline: string;
  /** extra class on gold lettering (the moving shine) */
  shine: string;
}

const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";
/** Gold with a bright band that slowly sweeps across (see .foil-shine). */
const SHINE = "linear-gradient(110deg, #b98a35 0%, #e8c06a 28%, #fff6d8 42%, #e8c06a 56%, #b98a35 100%)";
const IVORY_FOIL = "linear-gradient(110deg, #6b3d22 0%, #9a6b3c 30%, #d9b27a 44%, #9a6b3c 58%, #6b3d22 100%)";
const LOOKS: Record<Concept, Look> = {
  tape: {
    dark: true,
    panel: `rounded-md border ${TAPE_GLASS}`,
    ink: "text-white", muted: "text-white/75", cell: "border-white/15 bg-black/30",
    title: "text-center font-mono text-2xl font-bold uppercase tracking-[0.16em]", titleStyle: { textShadow: "-1.5px 0 rgba(255,40,90,0.55), 1.5px 0 rgba(0,220,255,0.55)" },
    names: foil("var(--nf-script), cursive"), greet: foil("var(--nf-script), cursive"),
    solid: "press inline-flex min-h-10 items-center gap-1.5 rounded-sm px-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em]",
    solidStyle: (accent, bg) => ({ background: accent, color: bg }),
    ghost: "press inline-flex min-h-10 items-center gap-1.5 rounded-sm border border-white/60 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em]",
    chip: "press inline-flex min-h-10 items-center rounded-sm border border-white/50 px-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-white/10",
    label: "font-mono text-[11px] font-bold uppercase tracking-[0.2em]",
    align: "end", scrim: ["rgba(12,8,5,0.52)", "rgba(12,8,5,0.68)"],
    pill: "rounded-full border border-white/30 bg-black/60 px-5 font-mono text-xs font-bold tracking-[0.25em] text-white",
    prose: "text-[15px] leading-relaxed text-white/90", frame: null, tagline: "", shine: "",
  },
  royal: {
    dark: true,
    panel: "rounded-b-[26px] border border-[#e8c06a]/55 bg-[#3a0c12]/[0.62] text-[#f7e7c6] shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-md",
    panelStyle: { borderTopLeftRadius: "50% 64px", borderTopRightRadius: "50% 64px" },
    ink: "text-[#f7e7c6]", muted: "text-[#f7e7c6]/75", cell: "border-[#e8c06a]/30 bg-black/25",
    title: "text-center text-lg font-bold uppercase tracking-[0.28em] text-[#e8c06a] [text-wrap:balance]", titleStyle: { fontFamily: CAPS },
    names: { ...foil("var(--nf-display), Georgia, serif", 700, true), backgroundImage: SHINE, backgroundSize: "250% 100%" },
    greet: { ...foil("var(--nf-display), Georgia, serif", 700, true), backgroundImage: SHINE, backgroundSize: "250% 100%" },
    solid: "press inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a0c12]",
    solidStyle: () => ({ backgroundImage: GOLD, fontFamily: CAPS }),
    ghost: "press inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#e8c06a]/60 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7e7c6] [font-family:var(--nf-caps)]",
    chip: "press inline-flex min-h-11 items-center rounded-full border border-[#e8c06a]/50 px-4 text-[11px] font-bold uppercase tracking-[0.18em] [font-family:var(--nf-caps)] hover:bg-white/10",
    label: "text-[11px] font-bold uppercase tracking-[0.25em] text-[#e8c06a] [font-family:var(--nf-caps)]",
    align: "start", scrim: ["rgba(20,5,6,0.15)", "rgba(20,5,6,0.45)"],
    pill: "rounded-full border border-[#e8c06a]/50 bg-[#2a0a0e]/70 px-5 text-[11px] font-bold tracking-[0.3em] text-[#f7e7c6] [font-family:var(--nf-caps)]",
    prose: "font-display text-[17px] italic leading-relaxed text-[#f7e7c6]/90",
    frame: "rgba(232,192,106,0.45)",
    tagline: "A royal celebration of two families",
    shine: "foil-shine",
  },
  ivory: {
    dark: false,
    panel: "rounded-[22px] border border-[#e6d3b0] bg-[#fbf6ee]/[0.86] text-[#4a1c20] shadow-[0_18px_50px_rgba(40,20,10,0.35)] backdrop-blur-md",
    ink: "text-[#4a1c20]", muted: "text-[#4a1c20]/75", cell: "border-[#a8783a]/30 bg-white/60",
    title: "text-center text-lg font-bold uppercase tracking-[0.28em] text-[#4a1c20] [text-wrap:balance]", titleStyle: { fontFamily: CAPS },
    names: { fontFamily: CAPS, fontWeight: 500, letterSpacing: "0.12em", backgroundImage: IVORY_FOIL, backgroundSize: "250% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" },
    greet: { fontFamily: "var(--nf-script), cursive", color: "#9a6b3c" },
    solid: "press inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3a1a10]",
    solidStyle: () => ({ backgroundImage: GOLD, fontFamily: CAPS }),
    ghost: "press inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[#4a1c20]/30 bg-white/70 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a1c20] [font-family:var(--nf-caps)]",
    chip: "press inline-flex min-h-11 items-center rounded-full border border-[#a8783a]/50 bg-white/60 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a1c20] [font-family:var(--nf-caps)]",
    label: "text-[11px] font-bold uppercase tracking-[0.25em] text-[#a8783a] [font-family:var(--nf-caps)]",
    align: "start", scrim: ["rgba(30,15,10,0.0)", "rgba(30,15,10,0.35)"],
    pill: "rounded-full border border-white/60 bg-[#fbf6ee]/80 px-5 text-[11px] font-bold tracking-[0.3em] text-[#4a1c20] [font-family:var(--nf-caps)]",
    prose: "font-display text-[17px] italic leading-relaxed text-[#4a1c20]/90",
    frame: "rgba(168,120,58,0.35)",
    tagline: "A new chapter in our dastaan",
    shine: "foil-shine",
  },
};

/** The section title of a scene concept, with the royal look's little diamonds either side. */
function SceneTitle({ look, concept, children, as: As = "h2" }: { look: Look; concept: Concept; children: React.ReactNode; as?: "h2" | "h3" }) {
  return (
    <As className={look.title} style={look.titleStyle}>
      {concept === "royal" ? <><span aria-hidden className="mr-2 text-xs">✦</span>{children}<span aria-hidden className="ml-2 text-xs">✦</span></> : children}
    </As>
  );
}

/** The thin inner frame just inside a royal / ivory panel (it follows the panel's arched corners). */
function PanelFrame({ look }: { look: Look }) {
  if (!look.frame) return null;
  return <span aria-hidden className="pointer-events-none absolute inset-[7px] border" style={{ borderColor: look.frame, borderRadius: "inherit" }} />;
}

/** Gold rule with a small star in the middle: — ✦ — */
function Divider({ color }: { color: string }) {
  return (
    <div aria-hidden className="mx-auto my-3 flex w-40 items-center gap-2" style={{ color }}>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <span className="text-xs">✦</span>
      <span className="h-px flex-1" style={{ background: `linear-gradient(270deg, transparent, ${color})` }} />
    </div>
  );
}

/** Both families side by side, each person a pill guests can tap to call (royal / ivory looks). */
function FamilyColumns({ content, ur, accent, dark }: { content: InviteContent; ur: boolean; accent: string; dark: boolean }) {
  const sides = [
    { label: content.side1Label || (ur ? "پہلا گھرانہ" : "Family"), family: content.family1, members: content.members1 },
    { label: content.side2Label || (ur ? "دوسرا گھرانہ" : "Family"), family: content.family2, members: content.members2 },
  ].filter((x) => x.family || x.members.length > 0);
  if (sides.length === 0) return null;
  const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
  return (
    <div className={`grid gap-3 ${sides.length > 1 ? "grid-cols-2" : ""}`}>
      {sides.map((x, i) => (
        <div key={i} className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ fontFamily: CAPS, color: accent }}>♡ {x.label}</p>
          {x.family && <p className="mt-1 font-display text-[15px] font-bold leading-snug">{x.family}</p>}
          <ul className="mt-2 space-y-1.5">
            {x.members.map((m, j) => {
              const pill = `block rounded-xl border px-2 py-1.5 text-[13px] leading-tight ${dark ? "border-[#e8c06a]/35 bg-black/20" : "border-[#a8783a]/35 bg-white/70"}`;
              return (
                <li key={j}>
                  {m.phone ? (
                    <a href={tel(m.phone)} className={`press ${pill}`} aria-label={`${ur ? "کال کریں" : "Call"} ${m.name}`}>
                      <span className="font-display font-semibold">{m.name}</span>
                      <span className="mt-0.5 flex items-center justify-center gap-1 text-[11px] opacity-80"><Phone className="size-3" aria-hidden />{m.phone}</span>
                    </a>
                  ) : (
                    <span className={pill}><span className="font-display font-semibold">{m.name}</span></span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The small gold diamond at the top of a royal arch panel. */
function Finial() {
  return <span aria-hidden className="absolute left-1/2 top-4 size-4 -translate-x-1/2 rotate-45 shadow" style={{ backgroundImage: GOLD }} />;
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
  template, content, inviteId, demo = false, preview = false,
}: { template: Template; content: InviteContent; inviteId?: string; demo?: boolean; preview?: boolean }) {
  // demo = a template showcase for buyers (sample data, explanatory notes, replies off)
  // preview = the owner or an admin viewing a real invitation before it is published: exactly what guests will see, replies off
  const t = template.theme;
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const concept = template.concept;
  const scenic = !!concept; // full-screen photo scenes, one section per screen
  const tape = concept === "tape";
  const look = LOOKS[concept ?? "tape"];
  const gated = concept === "royal" || concept === "ivory"; // doors or curtains instead of the sliding cover
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const [guest, setGuest] = useState("");
  const [seats, setSeats] = useState<number | null>(null);
  const [scene, setScene] = useState(0);
  const [bgPhoto, setBgPhoto] = useState("");
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
  const scratchKind: "static" | "foil" | null = tape ? "static" : scenic || template.motion === "scratch" ? "foil" : null;
  const fx: TapFx = tape ? "flash" : concept === "royal" ? "sparkles" : concept === "ivory" ? "petals" : template.motion === "sparkle" ? "sparkles" : "petals";
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
    const id = setTimeout(() => setGone(true), gated ? 1500 : 560);
    return () => clearTimeout(id);
  }, [opened, gated]);

  // tape: timecode runs once the guest presses play
  useEffect(() => {
    if (!tape || !opened) return;
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [tape, opened]);

  // tape: switch the background scene as sections scroll into view
  useEffect(() => {
    if (!scenic || !scroller.current) return;
    const root = scroller.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) (e.target as HTMLElement).dataset.in = "1"; // one-time entrance (see .scene-reveal)
        const best = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) {
          const el = best.target as HTMLElement;
          setScene(Number(el.dataset.scene ?? 0));
          setBgPhoto(el.dataset.photo ?? "");
        }
      },
      { root, threshold: [0.2, 0.5, 0.8], rootMargin: "-25% 0px -25% 0px" },
    );
    root.querySelectorAll("[data-scene]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scenic]);

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

  // customer photos take the place of the template's own artwork
  const backdrop = content.coverPhoto || template.backdrop?.src;
  const coverArt = content.coverPhoto && !tape ? { src: content.coverPhoto, position: "50% 30%", zoom: 0, credit: "" } : template.art;
  const couple = content.couplePhoto || template.sample?.couple || ""; // the customer's photo, or the template's own
  const sc = template.scenes ?? {};
  /** the photo behind an event's screen: the customer's, else the template's for that kind of event */
  const eventScene = (e: InviteEvent) => e.photo || sc.events?.[e.title.trim().toLowerCase()] || "";
  const scenePhotos = [...new Set([...ordered.map(eventScene), tape ? couple : sc.couple ?? "", sc.families, sc.message, sc.countdown, sc.dress, sc.faq, sc.rsvp, sc.closing].filter(Boolean) as string[])];

  const font = ur ? "var(--nf-urdu), serif" : "var(--nf-display), Georgia, serif";
  const hasDress = ordered.some((e) => e.dressCode);
  const sceneAttr = (n: number) => (tape ? { "data-scene": n } : {});
  const stamp = new Date(`${ordered[0].date}T00:00:00`).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase().replace(/(\w+) (\d+) (\d+)/, "$1 $2 $3");

  return (
    <div className="relative h-full w-full overflow-hidden bg-background" dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} onPointerDown={onTap}>
      {scenic && <SceneBackdrop scene={scene} t={t} photo={backdrop} photos={scenePhotos} active={bgPhoto} look={look} tape={tape} />}

      <div
        ref={scroller}
        onScroll={onScroll}
        className={`relative z-[1] h-full overflow-y-auto overscroll-contain ${opened ? "" : "overflow-hidden"} ${scenic ? `snap-y snap-proximity ${look.ink} [container-type:size]` : ""}`}
      >
        {scenic ? (
        <div className="mx-auto max-w-md px-5">
          {tape ? (
            <Screen tape scene={0} framed={false}>
              <div className="mx-auto w-full overflow-hidden rounded-md" style={{ maxWidth: "calc((100cqh - 10.5rem - var(--frame-top, 0px) - var(--frame-bottom, 0px)) * 0.5625)" }}><InviteCard template={template} content={content} chrome={false} clear={!!backdrop} /></div>
            </Screen>
          ) : (
            <Screen tape scene={0} framed={false} align={look.align}>
              <section className={`relative mt-4 px-6 pb-7 pt-12 text-center ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {content.bismillah && <p lang="ar" dir="rtl" className="text-2xl" style={{ color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>}
                <p className="mx-auto mt-1 max-w-[16rem] text-xs uppercase leading-6 tracking-[0.2em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.accent }}>
                  {ur ? content.headline : "Together with their families, we joyfully invite you to the wedding of"}
                </p>
                <h2 className={`mt-3 text-5xl leading-[1.05] ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : look.names}>
                  {content.host1}
                  {content.host2 && <><span className="my-1 block text-2xl" style={ur ? undefined : { ...look.greet, fontFamily: "var(--nf-display), Georgia, serif", fontStyle: "italic" }}>{ur ? "اور" : "and"}</span>{content.host2}</>}
                </h2>
                <Divider color={t.accent} />
                {!ur && look.tagline && <p className="text-[11px] uppercase tracking-[0.3em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.accent }}>{look.tagline}</p>}
                <p className={`mt-3 ${look.prose}`}>{content.message}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.25em]" style={{ fontFamily: CAPS }}>{eventsDateText(content, loc)}</p>
              </section>
            </Screen>
          )}

          {(content.family1 || content.family2 || content.members1.length > 0 || content.members2.length > 0) && (
            <Screen tape scene={1} framed={tape} align={look.align} photo={sc.families}>
              <div className={`relative ${tape ? "p-4" : "px-4 pb-5 pt-12"} ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape ? <Tag tape label={ur ? "خاندان" : "Families"} accent={t.accent} /> : <SceneTitle look={look} concept={concept!}>{ur ? "دعاؤں کے ساتھ" : "With the blessings of"}</SceneTitle>}
                <div className={tape ? "" : "mt-4"}>
                  {tape ? <Families content={content} ur={ur} glass={look.dark} /> : <FamilyColumns content={content} ur={ur} accent={t.accent} dark={look.dark} />}
                </div>
              </div>
            </Screen>
          )}

          {(guest || demo) && (
            <Screen tape scene={2} framed={tape} align={look.align} photo={sc.message}>
              <section className={`relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} text-center ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape && <Tag tape label={ur ? "پیغام" : "Message"} accent={t.accent} />}
                <p className={`pb-1 text-4xl leading-tight ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : look.greet}>
                  {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "محترم مہمان،" : "Dear guest,"}
                </p>
                <p className={`mt-3 ${look.prose}`}>
                  {ur
                    ? "ہمیں آپ کی میزبانی کا شرف ملے گا۔ ہم نے آپ کے لیے جگہ رکھی ہے۔"
                    : "Your presence is the blessing we are asking for. It would not be complete without the people who have loved us all our lives. We have saved you a place."}
                </p>
                {ordered.length > 1 && (
                  <nav aria-label={ur ? "تقاریب" : "Jump to an event"} className="mt-4 flex flex-wrap justify-center gap-2">
                    {ordered.map((e, i) => (
                      <button key={i} type="button" onClick={() => goTo(i)} className={look.chip}>{e.title}</button>
                    ))}
                  </nav>
                )}
                {demo && !guest && <p className={`mt-3 text-xs ${look.muted}`}>Each guest can get a link that greets them by name.</p>}
              </section>
            </Screen>
          )}

          <Screen tape scene={3} framed={tape} align={look.align} photo={sc.countdown}>
            <div className={`relative ${tape ? "p-4" : "px-4 pb-5 pt-12"} ${look.panel}`} style={look.panelStyle}>
              {concept === "royal" && <Finial />}<PanelFrame look={look} />
              {tape ? <Tag tape label={ur ? "الٹی گنتی" : "Countdown"} accent={t.accent} /> : <SceneTitle look={look} concept={concept!}>{ur ? "الٹی گنتی" : "Counting the days"}</SceneTitle>}
              <div className={tape ? "" : "mt-4"}>
                <Countdown events={ordered} ur={ur} tape={tape} scratchKind={scratchKind} accent={t.accent} panel={look.cell} muted={look.muted} />
              </div>
            </div>
          </Screen>

          {ordered.map((e, i) => (
            <Screen
              key={i}
              tape
              scene={3}
              id={`ev-${i}`}
              photo={eventScene(e)}
              framed={tape}
              align={look.align}
              above={tape ? (
                <p aria-hidden className="mx-auto mb-5 w-fit rounded-sm border border-white/40 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
                  ✦ {ur ? fxCaption : "Tap anywhere for a photo flash"}
                </p>
              ) : undefined}
            >
              <article className={`relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} text-center ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape ? (
                  <Tag tape label={`Tape ${pad(i + 1)} / ${pad(ordered.length)}`} accent={t.accent} />
                ) : (
                  <p className="mb-1 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: CAPS }}>
                    <span>{pad(i + 1)} / {pad(ordered.length)}</span>
                    {seats && <span className="rounded-full border px-2 py-0.5" style={{ borderColor: t.accent, color: t.accent }}>{ur ? `${seats} مہمان مدعو` : `${seats} ${seats === 1 ? "guest" : "guests"} invited`}</span>}
                  </p>
                )}
                {tape && seats && (
                  <p className="mx-auto -mt-1 mb-2 w-fit rounded-sm px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em]" style={{ background: t.accent, color: t.bg }}>
                    {ur ? `${seats} مہمان مدعو` : `${seats} ${seats === 1 ? "guest" : "guests"} invited`}
                  </p>
                )}
                {tape ? <TapeTitle as="h3">{e.title}</TapeTitle> : <h3 className={`text-5xl leading-tight ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : look.names}>{e.title}</h3>}
                {!tape && <Divider color={t.accent} />}
                <p className="mt-2 flex items-center justify-center gap-1.5 font-display text-lg font-semibold">
                  {!tape && <CalendarDays className="size-4 shrink-0" style={{ color: t.accent }} aria-hidden />}
                  {formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}
                </p>
                {e.venue && <p className="mt-1 flex items-center justify-center gap-1.5 text-sm">{!tape && <MapPin className="size-3.5 shrink-0" style={{ color: t.accent }} aria-hidden />}{e.venue}</p>}
                {e.address && <p className={`text-xs ${look.muted}`}>{e.address}</p>}
                {e.dressCode && <p className={`mt-1 text-xs ${look.muted}`}>{ur ? "ڈریس کوڈ: " : "Dress code: "}{e.dressCode}</p>}
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {mapLink(e) && (
                    <a className={look.solid} style={look.solidStyle(t.accent, t.bg)} href={mapLink(e)} target="_blank" rel="noopener noreferrer">
                      <MapPin className="size-3.5" aria-hidden />{ur ? "مقام" : "Open location"}
                    </a>
                  )}
                  <button type="button" className={look.ghost} onClick={() => downloadIcs(e, names)}>
                    <CalendarPlus className="size-3.5" aria-hidden />{ur ? "کیلنڈر" : "Add to calendar"}
                  </button>
                </div>
                {!tape && i === 0 && <p className={`mt-3 text-[10px] uppercase tracking-[0.2em] ${look.muted}`} style={{ fontFamily: CAPS }}>✦ {fxCaption}</p>}
              </article>
            </Screen>
          ))}

          {couple && (tape ? (
            <Screen tape scene={4} framed={false} photo={couple}>
              <h2 className="mb-4 text-center font-mono text-2xl font-bold uppercase tracking-[0.2em]" style={{ textShadow: VHS }}>{ur ? "دولہا دلہن" : "The couple"}</h2>
              <figure className="relative mx-auto w-[86%] rotate-[-1.5deg] border-[6px] border-[#efe3cc] bg-black shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
                <img src={couple} alt={ur ? "دولہا دلہن کی تصویر" : `Photo of ${names}`} className="aspect-[4/5] w-full object-cover" />
                <span aria-hidden className="absolute left-3 top-2 font-mono text-[11px] font-bold tracking-[0.15em] text-white [text-shadow:0_0_4px_#000]"><span className="text-red-500">●</span> REC</span>
                <span aria-hidden className="absolute bottom-2 left-3 font-mono text-[11px] font-bold text-white [text-shadow:0_0_4px_#000]">SP</span>
                <span aria-hidden className="absolute bottom-2 right-3 font-mono text-[11px] font-bold tracking-[0.15em] [text-shadow:0_0_4px_#000]" style={{ color: t.accent }}>{stamp}</span>
              </figure>
              {!ur && <p className="mt-5 pb-1 text-center text-4xl" style={goldScript}>{names}</p>}
            </Screen>
          ) : (
            <Screen tape scene={4} framed={false} align={look.align} photo={sc.couple}>
              <SceneTitle look={look} concept={concept!}>{ur ? "دولہا دلہن" : "The couple"}</SceneTitle>
              <figure className="mx-auto mt-4 w-[74%] overflow-hidden border-[3px] shadow-2xl" style={{ borderColor: t.accent, borderTopLeftRadius: "50% 28%", borderTopRightRadius: "50% 28%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
                <img src={couple} alt={ur ? "دولہا دلہن کی تصویر" : `Photo of ${names}`} className="aspect-[4/5] w-full object-cover" />
              </figure>
              <p className="mt-4 pb-1 text-center text-4xl" style={ur ? { fontFamily: font } : look.dark ? look.names : { ...look.names, color: "#fbf1dc", textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{names}</p>
              <p className={`text-center text-sm italic ${look.dark ? "text-white/85" : "text-white"}`} style={{ fontFamily: "var(--nf-display), Georgia, serif", textShadow: "0 1px 6px rgba(0,0,0,.6)" }}>Two hearts, one promise</p>
            </Screen>
          ))}

          {hasDress && ordered.length > 1 && (
            <Screen tape scene={4} framed={tape} align={look.align} photo={sc.dress}>
              <section aria-label="Dress code" className={`relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} text-center ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape && <Tag tape label={ur ? "پروگرام" : "Programme"} accent={t.accent} />}
                {tape ? <TapeTitle>{ur ? "ڈریس کوڈ" : "Dress code"}</TapeTitle> : <SceneTitle look={look} concept={concept!}>{ur ? "ڈریس کوڈ" : "Dress code"}</SceneTitle>}
                <ul className={`mt-4 space-y-3 ${tape ? "" : "text-start"}`}>
                  {ordered.filter((e) => e.dressCode).map((e, i) => (
                    <li key={i} className={tape ? "" : "flex items-center gap-3"}>
                      {!tape && <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full" style={{ backgroundImage: GOLD }}><Shirt className="size-4 text-[#3a0c12]" /></span>}
                      <span>
                        <span className={`block ${look.label}`} style={tape ? { color: t.accent } : undefined}>{e.title}</span>
                        <span className={`block font-display text-[15px] ${look.dark ? "text-white/90" : "text-[#4a1c20]/90"}`}>{e.dressCode}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Screen>
          )}

          {content.faq.length > 0 && (
            <Screen tape scene={4} framed={tape} align={look.align} photo={sc.faq}>
              <section aria-label="Questions" className={`relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape && <Tag tape label="Q & A" accent={t.accent} />}
                {tape ? <TapeTitle>{ur ? "عام سوالات" : "A few questions"}</TapeTitle> : <SceneTitle look={look} concept={concept!}>{ur ? "عام سوالات" : "A few questions"}</SceneTitle>}
                <div className={`mt-4 divide-y border-t ${look.dark ? "divide-white/15 border-white/15" : "divide-[#4a1c20]/15 border-[#4a1c20]/15"}`}>
                  {content.faq.map((f, i) => (
                    <details key={i} className="group py-3">
                      <summary className="flex min-h-8 cursor-pointer list-none items-center gap-3 text-sm font-medium">
                        {tape
                          ? <span className="font-mono text-[11px] font-bold" style={{ color: t.accent }}>A{i + 1}</span>
                          : <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold text-[#3a0c12]" style={{ backgroundImage: GOLD }}>?</span>}
                        <span className="flex-1">{f.q}</span>
                        <span aria-hidden className={`grid size-6 shrink-0 place-items-center border text-xs transition-transform duration-200 ease-out group-open:rotate-45 ${tape ? "rounded-sm border-white/50 font-mono" : "rounded-full border-current/40"}`}>+</span>
                      </summary>
                      <p className={`mt-2 pl-10 font-display text-[15px] ${look.dark ? "text-white/85" : "text-[#4a1c20]/85"}`}>{f.a}</p>
                    </details>
                  ))}
                </div>
                {wa && (
                  <a className={`${look.ghost} mt-4 w-full justify-center`} href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                    {ur ? "میزبان کو واٹس ایپ کریں" : "WhatsApp the hosts"}
                  </a>
                )}
              </section>
            </Screen>
          )}

          {content.rsvpEnabled && (
            <Screen tape scene={5} framed={tape} align={look.align} photo={sc.rsvp}>
              <Rsvp inviteId={inviteId} demo={demo || preview} showNote={demo} guestName={guest} seats={seats} tape={look.dark} accent={t.accent} titleClass={look.title} titleStyle={look.titleStyle} />
            </Screen>
          )}

          <Screen tape scene={5} framed={tape} align={look.align} photo={sc.closing}>
            {tape ? (
              <div className={`p-5 text-center ${look.panel}`}>
                <p className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]" aria-hidden>
                  <span>■ Stop</span><span style={{ color: t.accent }}>End of tape</span>
                </p>
                <p className="pb-1 text-4xl leading-tight" style={ur ? { fontFamily: font } : goldScript}>{ur ? content.closing : "Thank you for watching, see you there"}</p>
                <p className="mt-2 pb-1 text-3xl" style={ur ? { fontFamily: font } : goldScript}>{names}</p>
                <button type="button" className={`${SMALL_BTN} mt-5 px-6 text-xs`} style={{ background: t.accent, color: t.bg, boxShadow: "0 4px 0 #A8531A" }} onClick={toTop}>◀◀ Rewind</button>
              </div>
            ) : (
              <div className={`relative px-5 pb-6 pt-12 text-center ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                <p className="text-lg italic" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>{content.closing || "We cannot wait to see you there."}</p>
                <p className={`mt-3 text-5xl leading-[1.05] ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : look.names}>
                  {content.host1}
                  {content.host2 && <><span className="my-1 block text-2xl" style={ur ? undefined : { ...look.greet, fontFamily: "var(--nf-display), Georgia, serif", fontStyle: "italic" }}>{ur ? "اور" : "and"}</span>{content.host2}</>}
                </p>
                <button type="button" className={`${look.ghost} mt-5`} onClick={toTop}>{ur ? "شروع پر جائیں" : "Back to the start"}</button>
              </div>
            )}
          </Screen>
          <p className={`pb-[calc(5rem+var(--frame-bottom,0px))] text-center text-xs ${look.dark ? "text-white/70" : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,.6)]"}`}>Made with Digital Dawat</p>
        </div>
        ) : (
        <div className="mx-auto max-w-md space-y-6 px-4 pb-[calc(1.5rem+var(--frame-bottom,0px))] pt-[calc(1.5rem+var(--frame-top,0px))]">
          <div {...sceneAttr(0)} className="overflow-hidden rounded-2xl shadow-xl"><InviteCard template={template} content={content} chrome={!tape} clear={tape && !!backdrop} /></div>
          {couple && (
            <figure className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
              <img src={couple} alt={ur ? "تصویر" : `Photo of ${names}`} className="aspect-[4/5] w-full object-cover" />
            </figure>
          )}

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
                  {mapLink(e) && (
                    <a className={`btn btn-ghost ${tape ? "!border-white/30 !bg-transparent !text-white" : ""}`} href={mapLink(e)} target="_blank" rel="noopener noreferrer"><MapPin className="size-4" aria-hidden />{ur ? "مقام دیکھیں" : "Open location"}</a>
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

          {content.rsvpEnabled && <div {...sceneAttr(5)}><Rsvp inviteId={inviteId} demo={demo || preview} showNote={demo} guestName={guest} seats={seats} /></div>}

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
          <p className="absolute bottom-[calc(4.75rem+var(--frame-bottom,0px))] right-5 rounded bg-black/55 px-2 py-0.5 text-sm font-bold tracking-[0.2em]" style={{ color: t.accent }}>{stamp}</p>
          {!atEnd && (
            <button type="button" tabIndex={-1} onClick={() => scroller.current?.scrollBy({ top: scroller.current.clientHeight * 0.8, behavior: reducedMotion() ? "auto" : "smooth" })}
              className="pointer-events-auto absolute bottom-[calc(1.5rem+var(--frame-bottom,0px))] left-1/2 flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-black/60 px-5 text-xs font-bold tracking-[0.25em]">
              SCROLL DOWN <ChevronDown className="size-4" />
            </button>
          )}
        </div>
      )}

      {scenic && !tape && opened && !atEnd && (
        <button type="button" tabIndex={-1} aria-hidden onClick={() => scroller.current?.scrollBy({ top: scroller.current.clientHeight * 0.8, behavior: reducedMotion() ? "auto" : "smooth" })}
          className="press absolute bottom-[calc(0.75rem+var(--frame-bottom,0px))] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 outline-none">
          <span className={`scroll-nudge grid size-11 place-items-center rounded-full border-2 ${look.dark ? "border-[#e8c06a]/80 bg-[#2a0a0e]/60 text-[#e8c06a]" : "border-[#a8783a]/70 bg-[#fbf6ee]/80 text-[#7a2a2e]"}`}>
            <ChevronDown className="size-5" />
          </span>
          <span className={`text-[9px] font-bold tracking-[0.3em] ${look.dark ? "text-[#f7e7c6]" : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,.7)]"}`} style={{ fontFamily: CAPS }}>SCROLL DOWN</span>
        </button>
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

      {!gone && gated && (
        <div data-open={opened} className="gate absolute inset-0 z-20 overflow-hidden" style={{ perspective: "1400px" }}>
          {(["l", "r"] as const).map((side) => (
            <div key={side} className={`absolute inset-y-0 w-1/2 overflow-hidden ${side === "l" ? "left-0" : "right-0"} ${concept === "royal" ? `gate-${side}` : `curtain-${side}`}`}>
              <div
                className={`absolute inset-y-0 w-[200%] ${side === "l" ? "left-0" : "right-0"}`}
                style={{
                  background: `url(${template.gate}) 50% 50% / cover no-repeat`,
                  // the ivory curtain is one fabric photo, mirrored for the right half
                  transform: concept === "ivory" && side === "r" ? "scaleX(-1)" : undefined,
                }}
              />
              <div className="absolute inset-0" style={{ background: side === "l" ? "linear-gradient(90deg, transparent 80%, rgba(0,0,0,.35))" : "linear-gradient(270deg, transparent 80%, rgba(0,0,0,.35))" }} />
            </div>
          ))}
          <div className="gate-ui absolute inset-0 flex flex-col items-center justify-between px-6 pb-[calc(3.5rem+var(--frame-bottom,0px))] pt-[calc(4rem+var(--frame-top,0px))] text-center">
            {concept === "royal" ? (
              <div className="rounded-2xl border border-[#e8c06a]/50 bg-[#2a120a]/80 px-6 py-3 shadow-2xl backdrop-blur-sm">
                <p className="text-4xl" style={ur ? { fontFamily: font, color: t.accent } : look.names}>{names}</p>
              </div>
            ) : (
              <div>
                <p className="text-4xl" style={ur ? { fontFamily: font, color: "#7a2a2e" } : { ...look.names, color: "#7a2a2e", textShadow: "0 1px 10px rgba(255,250,240,.9)" }}>{content.host1}</p>
                {content.host2 && <><p className="text-xl italic text-[#a8783a]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>{ur ? "اور" : "and"}</p>
                <p className="text-4xl" style={ur ? { fontFamily: font, color: "#7a2a2e" } : { ...look.names, color: "#7a2a2e", textShadow: "0 1px 10px rgba(255,250,240,.9)" }}>{content.host2}</p></>}
              </div>
            )}
            <button type="button" onClick={open} className={`${look.solid} min-h-12 px-7 text-xs shadow-xl`} style={look.solidStyle(t.accent, t.bg)}>
              {ur ? "کھولنے کے لیے ٹیپ کریں" : concept === "royal" ? "Open the doors" : "Tap to open"}
            </button>
          </div>
        </div>
      )}

      {!gone && !gated && (
        <div
          data-open={opened}
          className={`cover absolute inset-0 z-20 flex flex-col items-center text-center ${coverArt || tape ? "justify-end pb-28" : "justify-center"}`}
          style={{
            background: tape && backdrop
              ? `linear-gradient(to top, rgba(12,8,5,0.92) 18%, rgba(12,8,5,0.35) 62%, rgba(12,8,5,0.15)), url(${backdrop}) 50% 12% / cover no-repeat`
              : `linear-gradient(170deg, ${t.bg}, ${t.bg2})`,
            color: t.ink,
            fontFamily: ur ? "var(--nf-urdu), serif" : "var(--nf-sans), system-ui, sans-serif",
          }}
        >
          {!(tape && backdrop) && !(coverArt && content.coverPhoto) && <Ornament kind={t.ornament} className={`pointer-events-none absolute left-1/2 top-[6%] -translate-x-1/2 opacity-30 ${tall ? "h-[88%] w-[88%]" : "w-[70%]"}`} />}
          {coverArt && <ArtHero art={coverArt} bg={t.bg} />}
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
          <div className="rise relative flex flex-col items-center gap-4 px-8" style={coverArt ? { textShadow: `0 0 8px ${t.bg}, 0 0 18px ${t.bg}` } : undefined}>
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
