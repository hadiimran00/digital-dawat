"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, CalendarPlus, ChevronDown, MapPin, Music, Phone, Shirt, VolumeX } from "lucide-react";
import { openingOf, type Opening, type Template } from "@/lib/templates";
import { Envelope, Halves } from "./Openings";
import { Number3D } from "./KidsArt";
import { Stories, type StoryPage } from "./Stories";

/** how long each opening runs before the cover is removed (matches the transitions in globals.css) */
const OPENING_MS: Record<Opening, number> = {
  envelope: 2500, doors: 1900, curtain: 1600, split: 1600, fold: 1800, float: 1700, bloom: 1200, veil: 1200, settle: 1200, glide: 1300,
};
/** printed cards: when the invitation itself fades in behind the opening cover */
const REVEAL_MS: Record<Opening, number> = {
  envelope: 1900, doors: 1000, curtain: 700, split: 700, fold: 950, float: 500, bloom: 350, veil: 350, settle: 350, glide: 450,
};
import {
  BISMILLAH, downloadIcs, eventsDateText, formatEventDate, formatEventTime, mapLink, type InviteContent, type InviteEvent,
} from "@/lib/content";
import { FlowInvite } from "./FlowInvite";
import { Firdaus } from "./Firdaus";
import { burst, type TapFx } from "@/lib/tapFx";
import { ArtHero, AURORA_TEXT, GOLD, InviteCard, TAPE_GLASS } from "./InviteCard";
import { Families } from "./Families";
import { AuroraGlow, ModernCover, VideoGate } from "./ModernCover";
import { PrintArt } from "./PrintArt";
import { FUN, PrintText, ROUND, onColor, printBox, readable } from "./PrintCard";
import { Ornament, isTallOrnament } from "./Ornament";
import { Rsvp } from "./Rsvp";
import { ScratchReveal } from "./ScratchReveal";

const eventStart = (e: InviteEvent) => new Date(`${e.date}T${e.time || "00:00"}:00`).getTime();
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Glass panels for the video-tape concept, ordinary cards otherwise. */
const GLASS = TAPE_GLASS;
const PLAIN = "border-line bg-card";

function Countdown({
  events, ur, tape, scratchKind, accent, panel, muted, kind = "cells",
}: { events: InviteEvent[]; ur: boolean; tape: boolean; scratchKind: "static" | "foil" | null; accent: string; panel: string; muted: string; kind?: NonNullable<Template["print"]>["countdown"] }) {
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
      <div className={`grid grid-cols-3 text-center ${kind === "balloons" ? "gap-3" : "gap-2"}`} role="timer" aria-label={`${d} days ${h} hours ${m} minutes to ${upcoming.title}`}>
        {[d, h, m].map((v, i) => {
          const num = String(v).padStart(i === 0 ? 1 : 2, "0");
          const label = <p className={`text-xs uppercase tracking-widest ${muted}`}>{labels[i]}</p>;
          if (kind === "balloons") return (
            // each number floats in its own glossy balloon, bobbing a little out of step
            <div key={i} className="kid-anim kid-bob flex flex-col items-center" style={{ animationDelay: `${i * 0.5}s`, ["--sway" as string]: `${i % 2 ? -3 : 3}deg` }}>
              <div className="grid aspect-[5/6] w-full max-w-[5.5rem] place-items-center" style={{ borderRadius: "50% 50% 47% 47% / 55% 55% 45% 45%", background: "radial-gradient(circle at 32% 25%, #fff 0 5%, color-mix(in srgb, var(--p-accent) 45%, white) 16%, var(--p-accent) 52%, color-mix(in srgb, var(--p-accent) 70%, black))", color: "var(--p-on-accent)", boxShadow: "inset -6px -8px 14px rgba(0,0,0,.18)" }}>
                <p className="font-display text-3xl font-bold">{num}</p>
              </div>
              <span aria-hidden className="block h-4 w-px bg-current opacity-40" />
              {label}
            </div>
          );
          if (kind === "flip") return (
            // flip-clock tiles: dark, split across the middle
            <div key={i}>
              <div className="relative overflow-hidden rounded-lg bg-[#16131f] py-3 text-white shadow-[0_8px_18px_rgba(0,0,0,.35)]">
                <p className="font-mono text-3xl font-bold tracking-wider">{num}</p>
                <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-black/60" />
                <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-white/5" />
              </div>
              <div className="mt-1">{label}</div>
            </div>
          );
          if (kind === "rings") {
            const pct = Math.min(100, Math.round((v / [60, 24, 60][i]) * 100));
            return (
              // a ring that fills with what is left of the day, hour, minute
              <div key={i} className="flex flex-col items-center">
                <div className="relative grid aspect-square w-full max-w-[5.5rem] place-items-center">
                  <span aria-hidden className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(var(--p-accent) ${pct}%, color-mix(in srgb, var(--p-accent) 18%, transparent) 0)`, WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))", mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))" }} />
                  <p className="font-display text-3xl font-bold">{num}</p>
                </div>
                <div className="mt-1">{label}</div>
              </div>
            );
          }
          if (kind === "stamps") return (
            // postage stamps, each a little crooked
            <div key={i} className="bg-(--p-panel) p-1.5 shadow-md" style={{ rotate: `${[-3, 2, -1][i]}deg`, outline: "2px dashed color-mix(in srgb, var(--p-accent) 55%, transparent)", outlineOffset: "-5px" }}>
              <div className="py-3">
                <p className="font-display text-3xl font-bold" style={{ color: "var(--p-title)" }}>{num}</p>
                {label}
              </div>
            </div>
          );
          return (
            <div key={i} className={`rounded-xl border py-3 ${panel}`}>
              <p className={`text-3xl font-bold ${tape ? "font-mono" : "font-display"}`}>{num}</p>
              {label}
            </div>
          );
        })}
      </div>
      <p className={`mt-2 text-center text-sm ${muted}`}>{ur ? `${upcoming.title} تک` : `Until ${upcoming.title}`}</p>
    </section>
  );
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

function SceneBackdrop({ scene, t, photo, photos = [], active = "", look, tape, print }: { scene: number; t: Template["theme"]; photo?: string; photos?: string[]; active?: string; look: Look; tape: boolean; print?: Template["print"] }) {
  if (look.stage === "print" && print) return <PrintArt art={print.art} className="print-stage z-0" />;
  if (look.stage === "aurora") return <div aria-hidden className="pointer-events-none absolute inset-0 z-0"><AuroraGlow /></div>;
  if (look.stage === "frame") return <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ background: `${photo ? `url(${photo}) 50% 50% / cover no-repeat, ` : ""}${t.bg}` }} />;
  if (look.stage === "paper") {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0" style={{ background: `linear-gradient(180deg, ${t.bg}, ${t.bg2})` }}>
        {/* a fine gold frame around the page (monogram); plain paper for the editorial look */}
        {look.frame && <span className="absolute inset-x-[14px] border" style={{ borderColor: look.frame, top: "calc(14px + var(--frame-top,0px))", bottom: "calc(14px + var(--frame-bottom,0px))" }} />}
      </div>
    );
  }
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
function Screen({ tape, scene, id, section, photo, framed = true, above, align = "end", children }: { tape: boolean; scene: number; id?: string; section?: string; photo?: string; framed?: boolean; above?: React.ReactNode; align?: "start" | "end"; children: React.ReactNode }) {
  if (!tape) return <>{children}</>;
  return (
    // the opening is a full screen; every other section is as tall as its card plus breathing room, and stops in the
    // middle of the screen. (Full-screen sections left half a screen of empty photo between every pair of cards.)
    <div id={id} data-section={section} data-scene={scene} data-photo={photo || undefined}
      className={scene === 0
        ? `flex min-h-[100cqh] snap-start flex-col ${align === "end" ? "justify-end" : "justify-start"} pb-[calc(5.5rem+var(--frame-bottom,0px))] pt-[calc(4.5rem+var(--frame-top,0px))]`
        : "flex snap-center flex-col py-[12cqh] first:pt-[calc(4.5rem+var(--frame-top,0px))] last:pb-[calc(6rem+var(--frame-bottom,0px))]"}>
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
  /** what sits behind the screens: section photos, moving coloured light, or plain paper */
  stage: "photo" | "aurora" | "paper" | "frame" | "print";
  /** star dividers and other traditional ornaments (off for the modern looks, which use plain hairlines) */
  ornate: boolean;
}

const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";
/** Gold with a bright band that slowly sweeps across (see .foil-shine). */
const SHINE = "linear-gradient(110deg, #b98a35 0%, #e8c06a 28%, #fff6d8 42%, #e8c06a 56%, #b98a35 100%)";
const IVORY_FOIL = "linear-gradient(110deg, #6b3d22 0%, #9a6b3c 30%, #d9b27a 44%, #9a6b3c 58%, #6b3d22 100%)";
/**
 * Printed-card designs: the card's illustrated artwork stays behind every screen; panels are near-white (or the
 * card's own dark colour) and every colour comes from CSS variables set from the template (see printVars).
 */
/** each printed design's panel shape (classes are spelled out in full so Tailwind finds them) */
const PRINT_PANEL: Record<NonNullable<NonNullable<Template["print"]>["panel"]>, { panel: string; style?: React.CSSProperties }> = {
  rounded: { panel: "rounded-[22px] border border-(--p-line) bg-(--p-panel) text-(--p-ink) shadow-[0_12px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm" },
  arch: { panel: "rounded-b-[22px] border border-(--p-line) bg-(--p-panel) text-(--p-ink) shadow-[0_12px_40px_rgba(0,0,0,0.14)] backdrop-blur-sm", style: { borderTopLeftRadius: "50% 70px", borderTopRightRadius: "50% 70px" } },
  frame: { panel: "rounded-none border-[5px] border-double border-(--p-accent) bg-(--p-panel) text-(--p-ink) shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm" },
  ticket: {
    panel: "rounded-[16px] bg-(--p-panel) text-(--p-ink) drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)] backdrop-blur-sm",
    // half-moon notches either side, like a ticket
    style: { WebkitMask: "radial-gradient(circle 15px at 0 50%, #0000 98%, #000) 0 0 / 51% 100% no-repeat, radial-gradient(circle 15px at 100% 50%, #0000 98%, #000) 100% 0 / 51% 100% no-repeat", mask: "radial-gradient(circle 15px at 0 50%, #0000 98%, #000) 0 0 / 51% 100% no-repeat, radial-gradient(circle 15px at 100% 50%, #0000 98%, #000) 100% 0 / 51% 100% no-repeat" },
  },
  cloud: { panel: "rounded-[46px] border-2 border-dashed border-(--p-line) bg-(--p-panel) text-(--p-ink) shadow-[0_14px_40px_rgba(0,0,0,0.10)] backdrop-blur-sm" },
  line: { panel: "rounded-none border-x-0 border-y border-(--p-accent) bg-(--p-panel) text-(--p-ink) backdrop-blur-sm" },
  sticker: { panel: "rounded-[22px] border-[3px] border-(--p-title) bg-(--p-panel) text-(--p-ink) shadow-[7px_7px_0_var(--p-accent)]" },
  bubble: { panel: "rounded-[30px] border-2 border-(--p-line) bg-(--p-panel) text-(--p-ink) shadow-[0_0_38px_var(--p-glow)] backdrop-blur-md" },
};

const PRINT_LOOK = (dark: boolean, shape: keyof typeof PRINT_PANEL = "rounded", kids = false): Look => ({
  dark,
  panel: PRINT_PANEL[shape].panel,
  panelStyle: PRINT_PANEL[shape].style,
  ink: "text-(--p-ink)", muted: "text-(--p-ink)/75", cell: "rounded-xl border-(--p-line) bg-(--p-panel)",
  title: "text-center text-[12px] font-semibold uppercase tracking-[0.3em] text-(--p-accent) [text-wrap:balance]", titleStyle: { fontFamily: kids ? ROUND : CAPS, fontWeight: kids ? 800 : undefined },
  // the kids' designs speak in rounded, friendly type; the rest in the wedding script
  names: kids ? { fontFamily: FUN, fontWeight: 700, color: "var(--p-title)" } : { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "var(--p-title)" },
  greet: kids ? { fontFamily: FUN, fontWeight: 700, color: "var(--p-title)" } : { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "var(--p-title)" },
  solid: "press inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm",
  solidStyle: () => ({ background: "var(--p-accent)", color: "var(--p-on-accent)", fontFamily: CAPS }),
  ghost: "press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-(--p-line) bg-(--p-panel) px-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-(--p-ink) [font-family:var(--nf-caps)]",
  chip: "press inline-flex min-h-11 items-center rounded-full border border-(--p-line) bg-(--p-panel) px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-(--p-ink) [font-family:var(--nf-caps)]",
  label: "text-[11px] font-semibold uppercase tracking-[0.25em] text-(--p-accent) [font-family:var(--nf-caps)]",
  align: "start", scrim: ["rgba(0,0,0,0)", "rgba(0,0,0,0)"],
  pill: "rounded-full bg-(--p-panel) px-4 text-[11px] text-(--p-ink) shadow-md",
  prose: kids ? "text-[16px] font-semibold leading-relaxed text-(--p-ink)/90 [font-family:var(--nf-round)]" : "font-display text-[17px] italic leading-relaxed text-(--p-ink)/90",
  frame: null, tagline: "", shine: "", stage: "print", ornate: false,
});

/** The colours a printed-card design hands to its screens, adjusted so small text keeps 4.5:1 on the panels. */
function printVars(tpl: Template): React.CSSProperties {
  const p = tpl.print!;
  const panel = p.dark ? tpl.theme.bg2 : "#ffffff";
  const accent = readable(tpl.theme.accent, panel);
  return {
    "--p-panel": `${panel}eb`, "--p-line": `${tpl.theme.accent}66`, "--p-ink": readable(p.dark ? tpl.theme.ink : p.body, panel),
    "--p-accent": accent, "--p-on-accent": onColor(accent), "--p-title": readable(p.title, panel, 3), "--p-glow": `${tpl.theme.accent}66`,
  } as React.CSSProperties;
}

const LOOKS: Record<Exclude<Concept, "print">, Look> = {
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
    prose: "text-[15px] leading-relaxed text-white/90", frame: null, tagline: "", shine: "", stage: "photo", ornate: true,
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
    shine: "foil-shine", stage: "photo", ornate: true,
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
    shine: "foil-shine", stage: "photo", ornate: true,
  },
  // Kahani: a magazine feature. Paper, near-black type, one oxblood accent, square corners, hairline rules.
  editorial: {
    dark: false,
    panel: "rounded-none border-y border-[#141414] bg-[#F5F1EA] text-[#141414]",
    ink: "text-[#141414]", muted: "text-[#141414]/65", cell: "rounded-none border-[#141414]/25 bg-white/60",
    title: "text-center text-[12px] font-semibold uppercase tracking-[0.35em] text-[#141414]", titleStyle: { fontFamily: "var(--nf-sans), system-ui" },
    names: { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400, color: "#141414", letterSpacing: "-0.01em" },
    greet: { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400, fontStyle: "italic", color: "#8C1C13" },
    solid: "press inline-flex min-h-11 items-center gap-1.5 rounded-none px-4 text-[11px] font-semibold uppercase tracking-[0.2em]",
    solidStyle: () => ({ background: "#141414", color: "#F5F1EA" }),
    ghost: "press inline-flex min-h-11 items-center gap-1.5 rounded-none border border-[#141414] px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141414]",
    chip: "press inline-flex min-h-11 items-center border-b-2 border-[#141414] px-2 text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-black/5",
    label: "text-[11px] font-semibold uppercase tracking-[0.25em] text-[#8C1C13]",
    align: "start", scrim: ["rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    pill: "rounded-none border border-[#141414] bg-[#F5F1EA] px-5 text-[11px] font-semibold tracking-[0.3em] text-[#141414]",
    prose: "font-display text-[18px] leading-relaxed text-[#141414]/85",
    frame: null, tagline: "", shine: "", stage: "paper", ornate: false,
  },
  // Roshni: moving coloured light behind frosted glass; light sans-serif names with a soft gradient.
  aurora: {
    dark: true,
    panel: "rounded-[28px] border border-white/15 bg-white/[0.07] text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl",
    ink: "text-white", muted: "text-white/70", cell: "rounded-2xl border-white/15 bg-white/5",
    title: "text-center text-[12px] font-semibold uppercase tracking-[0.4em] text-white/80", titleStyle: { fontFamily: "var(--nf-sans), system-ui" },
    names: { fontFamily: "var(--nf-sans), system-ui", fontWeight: 300, letterSpacing: "-0.02em", backgroundImage: AURORA_TEXT, backgroundSize: "250% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" },
    greet: { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 600, fontStyle: "italic", color: "#F3E8FF" },
    solid: "press inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-[12px] font-semibold tracking-[0.06em] text-[#0B0B16]",
    solidStyle: () => ({ background: "linear-gradient(90deg, #FFD1E8, #C9B8FF)" }),
    ghost: "press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-5 text-[12px] font-semibold tracking-[0.06em] text-white",
    chip: "press inline-flex min-h-11 items-center rounded-full border border-white/20 bg-white/5 px-4 text-[12px] font-medium tracking-[0.05em] hover:bg-white/10",
    label: "text-[11px] font-semibold uppercase tracking-[0.3em] text-[#C9B8FF]",
    align: "start", scrim: ["rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    pill: "rounded-full border border-white/20 bg-white/10 px-5 text-[11px] font-semibold tracking-[0.3em] text-white backdrop-blur-md",
    prose: "text-[16px] leading-relaxed text-white/85",
    frame: null, tagline: "", shine: "foil-shine", stage: "aurora", ornate: false,
  },
  // Mohr: off-white, ink green-black, fine gold hairlines, italic serif; the monogram is the hero.
  monogram: {
    dark: false,
    panel: "rounded-none border border-[#B08D57]/50 bg-[#FAF8F3] text-[#1F2A28]",
    ink: "text-[#1F2A28]", muted: "text-[#1F2A28]/65", cell: "rounded-none border-[#B08D57]/35 bg-white/70",
    title: "text-center text-[12px] font-medium uppercase tracking-[0.45em] text-[#1F2A28]", titleStyle: { fontFamily: CAPS },
    names: { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400, fontStyle: "italic", color: "#1F2A28" },
    greet: { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400, fontStyle: "italic", color: "#B08D57" },
    solid: "press inline-flex min-h-11 items-center gap-1.5 px-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#FAF8F3]",
    solidStyle: () => ({ background: "#1F2A28", fontFamily: CAPS }),
    ghost: "press inline-flex min-h-11 items-center gap-1.5 border border-[#1F2A28]/40 px-5 text-[11px] font-medium uppercase tracking-[0.3em] text-[#1F2A28] [font-family:var(--nf-caps)]",
    chip: "press inline-flex min-h-11 items-center border border-[#B08D57]/50 px-4 text-[11px] uppercase tracking-[0.25em] text-[#1F2A28] [font-family:var(--nf-caps)] hover:bg-[#B08D57]/10",
    label: "text-[11px] font-medium uppercase tracking-[0.3em] text-[#B08D57] [font-family:var(--nf-caps)]",
    align: "start", scrim: ["rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    pill: "border border-[#1F2A28]/30 bg-[#FAF8F3]/90 px-5 text-[11px] tracking-[0.35em] text-[#1F2A28] [font-family:var(--nf-caps)]",
    prose: "font-display text-[18px] italic leading-relaxed text-[#1F2A28]/85",
    frame: "rgba(176,141,87,0.35)", tagline: "Two names, one story", shine: "", stage: "paper", ornate: false,
  },
  // Qabool: illustrated blush flower arch (scene photos); soft cream glass panels, sage-grey script and serif capitals
  garden: {
    dark: false,
    panel: "rounded-[26px] border border-[#A9BBAE]/70 bg-[#FBF6F4]/85 text-[#4F5F57] shadow-[0_12px_40px_rgba(79,95,87,0.15)] backdrop-blur-[2px]",
    ink: "text-[#4F5F57]", muted: "text-[#4F5F57]/75", cell: "rounded-xl border-[#A9BBAE]/50 bg-white/60",
    title: "text-center text-[13px] font-semibold uppercase tracking-[0.3em] text-[#4F5F57]", titleStyle: { fontFamily: "var(--nf-display), Georgia, serif" },
    names: { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "#5F7466" },
    greet: { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "#5F7466" },
    solid: "press inline-flex min-h-11 items-center gap-1.5 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-sm",
    solidStyle: () => ({ background: "#7F9A88" }),
    ghost: "press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#7F9A88]/70 bg-white/50 px-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4F5F57]",
    chip: "press inline-flex min-h-11 items-center rounded-full border border-[#7F9A88]/60 bg-white/60 px-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4F5F57]",
    label: "text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7F9A88]",
    align: "start", scrim: ["rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    pill: "rounded-full bg-[#FBF6F4]/95 px-4 text-[11px] text-[#4F5F57] shadow-md",
    prose: "font-display text-[17px] italic leading-relaxed text-[#4F5F57]/90",
    frame: null, tagline: "", shine: "", stage: "photo", ornate: false,
  },
  // Afreen: ivory embossed arch (the background art), no panels; script names and spaced capitals in soft taupe-gold
  embossed: {
    dark: false,
    panel: "bg-transparent text-[#6E5A43]",
    ink: "text-[#6E5A43]", muted: "text-[#6E5A43]/75", cell: "rounded-xl border-[#9C8462]/30 bg-[#FBF7F0]/60",
    title: "text-center text-[12px] font-medium uppercase tracking-[0.42em] text-[#8A7660]", titleStyle: { fontFamily: CAPS },
    names: { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "#9C8462" },
    greet: { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "#9C8462" },
    solid: "press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#9C8462]/60 px-5 text-[11px] uppercase tracking-[0.3em] text-[#6E5A43] [font-family:var(--nf-caps)] shadow-sm",
    solidStyle: () => ({ background: "linear-gradient(180deg, #FBF7F0, #EFE5D6)" }),
    ghost: "press inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#9C8462]/45 px-5 text-[11px] uppercase tracking-[0.3em] text-[#6E5A43] [font-family:var(--nf-caps)]",
    chip: "press inline-flex min-h-11 items-center rounded-full border border-[#9C8462]/45 bg-[#FBF7F0]/60 px-4 text-[11px] uppercase tracking-[0.25em] text-[#6E5A43] [font-family:var(--nf-caps)]",
    label: "text-[11px] font-medium uppercase tracking-[0.3em] text-[#9C8462] [font-family:var(--nf-caps)]",
    align: "start", scrim: ["rgba(0,0,0,0)", "rgba(0,0,0,0)"],
    pill: "rounded-full bg-[#FBF7F0]/95 px-4 text-[11px] text-[#6E5A43] shadow-md",
    prose: "font-display text-[17px] italic leading-relaxed text-[#6E5A43]/90",
    frame: null, tagline: "", shine: "", stage: "frame", ornate: false,
  },
};

/** The Mughal-arched card of the Qabool look: cream, with a sage outline and a fine inner line. */
function MughalPanel({ color, children }: { color: string; children: React.ReactNode }) {
  const shape = "M150 6C138 26 112 38 86 44C60 50 36 54 30 78C26 92 18 98 10 104V356C18 362 26 368 30 382C36 406 60 410 86 416C112 422 138 434 150 454C162 434 188 422 214 416C240 410 264 406 270 382C274 368 282 362 290 356V104C282 98 274 92 270 78C264 54 240 50 214 44C188 38 162 26 150 6Z";
  return (
    <div className="relative mx-auto w-[94%]">
      <svg viewBox="0 0 300 460" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full drop-shadow-[0_10px_30px_rgba(79,95,87,0.18)]">
        <path d={shape} fill="#FDF9F6" fillOpacity=".94" stroke={color} strokeWidth="3" />
        <path d={shape} fill="none" stroke={color} strokeOpacity=".45" strokeWidth="1" transform="translate(15 23) scale(.9)" />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/** A small drawn street map inside an arch, with a pin: the "directions" ornament of the Afreen look (decoration). */
function ArchMap({ color, label }: { color: string; label: string }) {
  return (
    <svg viewBox="0 0 160 180" aria-hidden className="mx-auto mt-3 w-36" fill="none" stroke={color}>
      <path d="M10 175V70C10 35 42 8 80 8s70 27 70 62v105Z" strokeWidth="1.2" fill="#FBF7F0" fillOpacity=".55" />
      <path d="M10 120 150 95M40 175 70 8M10 70 150 140M115 175 95 20M10 150h140" strokeWidth=".7" opacity=".45" />
      <path d="M80 62c-9 0-15 7-15 15 0 11 15 26 15 26s15-15 15-26c0-8-6-15-15-15Z" fill={color} stroke="none" />
      <circle cx="80" cy="77" r="5" fill="#FBF7F0" stroke="none" />
      <text x="80" y="126" textAnchor="middle" fontSize="9" fill={color} stroke="none" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontStyle: "italic" }}>{label.slice(0, 26)}</text>
    </svg>
  );
}

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
  template, content: fullContent, inviteId, demo = false, preview = false, autoplay = false, startOpen = false, focus,
}: { template: Template; content: InviteContent; inviteId?: string; demo?: boolean; preview?: boolean; autoplay?: boolean; startOpen?: boolean; focus?: string }) {
  // startOpen + focus = the editor's live preview: already opened, scrolled to whatever the customer is editing
  // autoplay = gallery hover preview: opens itself (silently) and steps through every screen, then replays
  // demo = a template showcase for buyers (sample data, explanatory notes, replies off)
  // preview = the owner or an admin viewing a real invitation before it is published: exactly what guests will see, replies off
  const t = template.theme;
  // A guest's private link (…&c=code) may invite them to only some events: everything below sees just those.
  const [allowed, setAllowed] = useState<number[] | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);
  const content = useMemo(
    () => (allowed ? { ...fullContent, events: fullContent.events.filter((_, i) => allowed.includes(i)) } : fullContent),
    [fullContent, allowed],
  );
  /** the events this guest can answer for, with their position in the full list (stored with the RSVP) */
  const rsvpEvents = useMemo(
    () => fullContent.events.map((e, i) => ({ i, title: e.title })).filter((x) => !allowed || allowed.includes(x.i)),
    [fullContent, allowed],
  );
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const concept = template.concept;
  const scenic = !!concept; // full-screen photo scenes, one section per screen
  const tape = concept === "tape";
  const print = concept === "print" ? template.print : undefined;
  const look = print ? PRINT_LOOK(!!print.dark, print.panel, print.fonts === "kids") : LOOKS[(concept === "print" ? undefined : concept) ?? "tape"];
  /** non-couple occasions (birthdays, aqiqah) get their own wording where the wedding looks speak of a couple */
  const coupleCat = !["birthday", "aqiqah", "baby-shower", "eid"].includes(template.category);
  const gated = concept === "royal" || concept === "ivory"; // doors or curtains instead of the sliding cover
  const modern = concept === "editorial" || concept === "aurora" || concept === "monogram"; // their own opening screens
  const videoGate = concept === "embossed" || concept === "garden"; // doors / a pearl curtain that open in a short video
  /** how the "Tap to open" cover leaves, for the designs that use it (printed cards and the classic cards) */
  const opening = openingOf(template);
  /** stories mode: full-screen pages, one at a time (Stories.tsx), instead of one long scroll */
  const stories = template.mode === "stories" && !!template.print;
  const [storyRun, setStoryRun] = useState(0);
  /** light backgrounds (paper, the embossed arch): dark lettering, no photo shadows */
  const onPaper = look.stage === "paper" || look.stage === "frame" || look.stage === "print";
  const [opened, setOpened] = useState(startOpen);
  const [gone, setGone] = useState(startOpen);
  const [guest, setGuest] = useState("");
  const [seats, setSeats] = useState<number | null>(null);
  const [scene, setScene] = useState(0);
  const [bgPhoto, setBgPhoto] = useState("");
  // the scroll-down hint is for the first screens only: once the guest is scrolling it would just cover content
  // (on small phones some screens are taller than the space above it); it comes back at the top
  const [atEnd, setAtEnd] = useState(false);
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
  // the gold scratch card belongs to the traditional looks (and Mohr's gold); Kahani and Roshni show a clean countdown
  /** the little round icons (dress code, questions) in each look's colours */
  const iconDisc: React.CSSProperties = concept === "editorial" ? { background: "#141414", color: "#F5F1EA" }
    : concept === "embossed" ? { background: "#9C8462", color: "#FBF7F0" }
    : concept === "garden" ? { background: "#7F9A88", color: "#FFFFFF" }
    : concept === "aurora" ? { backgroundImage: "linear-gradient(135deg, #FFD1E8, #C9B8FF)", color: "#0B0B16" }
    : print ? { background: "var(--p-accent)", color: "var(--p-on-accent)" }
    : { backgroundImage: GOLD, color: "#3a0c12" };
  const scratchKind: "static" | "foil" | null = tape ? "static" : concept === "editorial" || concept === "aurora" || concept === "embossed" || concept === "garden" ? null : scenic || template.motion === "scratch" ? "foil" : null;
  const fx: TapFx = print ? print.tap : tape ? "flash" : concept === "royal" ? "sparkles" : concept === "ivory" ? "petals" : template.motion === "sparkle" ? "sparkles" : "petals";
  const fxCaption = ur
    ? "کچھ دیکھنے کے لیے ٹیپ کریں"
    : fx === "flash" ? "Tap anywhere for a camera flash" : `Tap anywhere for ${fx}`;

  useEffect(() => {
    // personalised greeting: .../i?s=slug&g=Sarah%20%26%20Family and reserved places: ...&n=2
    const q = new URLSearchParams(window.location.search);
    const g = q.get("g");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the URL after mount (static export)
    if (g) setGuest(g.slice(0, 60));
    const n = Number(q.get("n"));
    if (Number.isInteger(n) && n >= 1 && n <= 20) setSeats(n);
    // guest-list link: …&c=code gives the guest's name, places and events (only that guest's row is readable)
    const code = q.get("c");
    const slug = q.get("s");
    if (demo || !code || !slug || !/^[a-z0-9]{8,16}$/.test(code)) return;
    let live = true;
    (async () => {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.rpc("guest_by_code", { p_slug: slug, p_code: code });
      const row = Array.isArray(data) ? data[0] : null;
      if (!live || !row) return;
      setGuest(String(row.name).slice(0, 80));
      setSeats(row.seats);
      setGuestId(row.id);
      const valid = (row.events as number[] | null)?.filter((i) => i >= 0 && i < fullContent.events.length);
      setAllowed(valid && valid.length ? valid : null);
      if (!preview) sb.rpc("mark_guest_opened", { p_slug: slug, p_code: code }).then(() => {}, () => {});
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read once on arrival
  }, []);
  useEffect(() => {
    if (!opened) return;
    // Kahani's opening runs about 1.5s; the printed and classic cards each have their own (OPENING_MS)
    const id = setTimeout(() => setGone(true), template.flow === "firdaus" ? 2500 : template.flow ? 2600 : videoGate ? 5000 : gated ? 1500 : concept === "editorial" ? 1600 : modern ? 1300 : OPENING_MS[opening]);
    return () => clearTimeout(id);
  }, [opened, gated, videoGate, concept, modern, opening, template.flow]);

  // autoplay: open after a beat (no music), then one screen at a time; at the end, close and start over
  useEffect(() => {
    if (!autoplay || opened) return;
    const id = setTimeout(() => setOpened(true), 1100);
    return () => clearTimeout(id);
  }, [autoplay, opened]);
  useEffect(() => {
    const el = scroller.current;
    if (!autoplay || !gone || !el || stories) return; // stories turn their own pages
    const id = setInterval(() => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
        el.scrollTo({ top: 0 });
        setSeconds(0);
        setGone(false);
        setOpened(false);
      } else el.scrollTo({ top: el.scrollTop + el.clientHeight, behavior: "smooth" });
    }, 2200);
    return () => clearInterval(id);
  }, [autoplay, gone, stories]);

  useEffect(() => {
    const root = scroller.current;
    const el = focus && root?.querySelector<HTMLElement>(`[data-section="${focus}"]`);
    if (!root || !el || stories) return; // stories jump to the page themselves
    // offsetTop, not getBoundingClientRect: the editor shows this scaled down, and on-screen pixels would be scaled too
    let top = 0;
    for (let n: HTMLElement | null = el; n && n !== root; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
    // an instant jump: a smooth scroll gets pulled back by the screens' scroll snapping before it arrives
    root.scrollTo({ top: focus === "cover" ? 0 : top, behavior: "instant" });
  }, [focus, stories]);

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

  // printed cards: on a short screen the opening card's words may need more room than there is; shrink them to fit
  useEffect(() => {
    const box = print && scroller.current?.querySelector<HTMLElement>("[data-section='cover'] [data-print-text]");
    const inner = box?.firstElementChild as HTMLElement | null | undefined;
    if (!box || !inner) return;
    const fit = () => {
      box.style.setProperty("--print-fit", "1");
      const s = Math.min(1, box.clientHeight / Math.max(1, inner.offsetHeight));
      box.style.setProperty("--print-fit", String(Math.floor(s * 100) / 100));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    document.fonts?.ready.then(fit).catch(() => {});
    return () => ro.disconnect();
  }, [print, content]);

  const hintRef = useRef<HTMLElement>(null);
  const [hintAway, setHintAway] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /** true when the hint would sit on top of words, a photo or a button (small phones, tall screens) */
  const hintCovers = useCallback(() => {
    const h = hintRef.current, root = scroller.current;
    if (!h || !root) return false;
    const r = h.getBoundingClientRect();
    for (const x of [r.left + 6, r.left + r.width / 2, r.right - 6]) {
      for (const y of [r.top + 4, r.top + r.height / 2, r.bottom - 4]) {
        for (const el of document.elementsFromPoint(x, y)) {
          if (h.contains(el) || !root.contains(el)) continue;
          if (el.matches("p,h1,h2,h3,li,img,figure,a,button,label,input,textarea,svg") || el.closest("a,button,label")) return true;
        }
      }
    }
    return false;
  }, []);
  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setAtEnd(el.scrollTop + el.clientHeight >= el.scrollHeight - 48);
    setHintAway(true);
    clearTimeout(idle.current);
    idle.current = setTimeout(() => setHintAway(hintCovers()), 450);
  }, [hintCovers]);
  useEffect(() => {
    if (!gone) return;
    const id = setTimeout(() => setHintAway(hintCovers()), 300);
    return () => clearTimeout(id);
  }, [gone, hintCovers]);
  useEffect(() => () => clearTimeout(idle.current), []);
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
    // printed cards throw petals in their artwork's own colours (Neelam's navy roses, Surkh's reds, ...)
    burst(fx, e.clientX, e.clientY, print ? print.petals : fx === "sparkles" ? [t.accent, "#fff3c4"] : [t.accent, "#c2185b", "#e8b95c"]);
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
  /** personal links greet the guest by name on the very first screen */
  const hello = guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : "";
  const invitedTo = ur ? "آپ کو شادی میں مدعو کیا جاتا ہے" : "you are warmly invited to the wedding of";
  const hasDress = ordered.some((e) => e.dressCode);
  const sceneAttr = (n: number) => (tape ? { "data-scene": n } : {});
  const stamp = new Date(`${ordered[0].date}T00:00:00`).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase().replace(/(\w+) (\d+) (\d+)/, "$1 $2 $3");

  // the printed cards' opening screen: the same readable colours and type as the card itself
  const kidsType = print?.fonts === "kids";
  const coverGround = print?.ground ?? (print?.dark ? "#1d1b16" : "#ffffff");
  const coverTitle = print ? readable(print.title, coverGround) : t.accent;
  const coverCaps = print ? readable(print.caps, coverGround) : t.ink;
  const coverNames = kidsType ? FUN : "var(--nf-script), cursive";

  /* ---------- stories mode: one full-screen page per part of the invitation, each laid out its own way ---------- */
  const storyInk = print?.dark ? "text-white [text-shadow:0_2px_14px_rgba(0,0,0,.55)]" : "text-[#1d1b16] [text-shadow:0_1px_10px_rgba(255,255,255,.7)]";
  const storyAge = print?.number ? (content.age || /(\d{1,3})/.exec(ordered[0]?.title ?? "")?.[1] || print.sampleAge) : undefined;
  const pageTop = "pt-[calc(4.5rem+var(--frame-top,0px))]";
  const pageBottom = "pb-[calc(5rem+var(--frame-bottom,0px))]";
  const panelCls = `story-block relative ${look.panel}`;
  const storyPages: StoryPage[] = !stories || !print ? [] : [
    {
      key: "cover", section: "cover", label: ur ? "دعوت نامہ" : "The invitation",
      node: (
        <div className="absolute inset-0" style={{ containerType: "inline-size" }}>
          <PrintText template={template} content={content} className="absolute" style={printBox(print, "calc(var(--frame-top, 0px) + 2.5rem)", "calc(var(--frame-bottom, 0px) + 3.5rem)")} />
        </div>
      ),
    },
    ...((guest || demo) ? [{
      // the greeting: big words resting at the bottom, over the picture
      key: "hello", section: "message", label: ur ? "پیغام" : "A message",
      node: (
        <div className={`absolute inset-0 flex flex-col justify-end bg-gradient-to-t ${print.dark ? "from-black/70 via-black/25" : "from-white/80 via-white/30"} to-transparent px-7 ${pageBottom} ${storyInk}`}>
          <p className="text-[2.6rem] leading-[1.05]" style={{ ...look.greet, color: "inherit" }}>{guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "محترم مہمان،" : "Dear guest,"}</p>
          <p className="mt-3 max-w-[22rem] text-lg font-semibold leading-snug" style={{ fontFamily: kidsType ? ROUND : "var(--nf-display), Georgia, serif" }}>
            {ur ? "ہماری خوشی میں شریک ہوں، ہم نے آپ کے لیے جگہ رکھی ہے۔" : "It wouldn't be a party without you. We've saved you a place."}
          </p>
          {demo && !guest && <p className="mt-3 text-sm opacity-80">Each guest can get a link that greets them by name.</p>}
        </div>
      ),
    }] : []),
    ...(storyAge ? [{
      // the age, huge and in the middle
      key: "age", section: "age", label: ur ? "عمر" : "The age",
      node: (
        // the age stands above the picture's party, clear of any face in it
        <div className={`absolute inset-x-0 top-0 flex flex-col items-center px-6 text-center ${pageTop} ${storyInk}`} style={{ containerType: "inline-size" }}>
          <p className="text-2xl font-bold" style={{ fontFamily: kidsType ? FUN : "var(--nf-display), serif" }}>{content.host1} {ur ? "ہو رہے ہیں" : "is turning"}</p>
          <div className="my-1"><Number3D value={storyAge} size={storyAge.length > 1 ? 34 : 44} face={print.dark ? "linear-gradient(180deg, #fff4c2, #ffd36e 45%, #f2a93b)" : "linear-gradient(180deg, #ffd1e4, #ff6fa8 50%, #e8457f)"} edge={print.dark ? "#a8661c" : "#a92a5c"} /></div>
          <p className="text-xl font-bold" style={{ fontFamily: kidsType ? FUN : "var(--nf-display), serif" }}>{ur ? "سال کے!" : "Let's celebrate!"}</p>
        </div>
      ),
    }] : []),
    {
      // the countdown at the top, the party picture showing below it
      key: "countdown", section: "countdown", label: ur ? "الٹی گنتی" : "Countdown",
      node: (
        <div className={`absolute inset-x-0 top-0 px-5 ${pageTop}`}>
          <div className={`${panelCls} px-4 pb-5 pt-6`} style={look.panelStyle}>
            <p className={look.title} style={look.titleStyle}>{ur ? "پارٹی شروع ہونے میں" : "The party starts in"}</p>
            <div className="mt-4"><Countdown events={ordered} ur={ur} tape={false} scratchKind={null} accent={t.accent} panel={look.cell} muted={look.muted} kind={print.countdown} /></div>
          </div>
        </div>
      ),
    },
    ...ordered.map((e, i) => {
      const d = new Date(`${e.date}T00:00:00`);
      return {
        // each event: a giant date on the left, the details and buttons in a panel at the bottom
        key: `event-${i}`, section: `event-${fullContent.events.indexOf(e)}`, label: e.title,
        node: (
          <div className={`absolute inset-0 flex flex-col justify-between px-6 ${pageTop} ${pageBottom}`}>
            <div className={storyInk}>
              <p className="text-sm font-bold uppercase tracking-[0.3em]" style={{ fontFamily: kidsType ? ROUND : CAPS }}>{Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(loc, { weekday: "long" })}</p>
              <p className="text-[7.5rem] font-bold leading-[0.9]" style={{ fontFamily: kidsType ? FUN : "var(--nf-display), serif" }}>{Number.isNaN(d.getTime()) ? "" : d.getDate()}</p>
              <p className="text-xl font-bold" style={{ fontFamily: kidsType ? FUN : "var(--nf-display), serif" }}>{Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(loc, { month: "long", year: "numeric" })}</p>
            </div>
            <div className={`${panelCls} px-5 pb-5 pt-5 text-center`} style={look.panelStyle}>
              <h3 className="text-3xl leading-tight" style={ur ? { fontFamily: font } : look.names}>{e.title}</h3>
              {seats && <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "var(--p-accent)" }}>{ur ? `${seats} مہمان مدعو` : `${seats} ${seats === 1 ? "guest" : "guests"} invited`}</p>}
              <p className="mt-2 font-semibold">{e.time && formatEventTime(e.time)}{e.time && e.venue && " · "}{e.venue}</p>
              {e.address && <p className={`text-sm ${look.muted}`}>{e.address}</p>}
              {e.dressCode && <p className={`mt-1 text-sm ${look.muted}`}>{ur ? "ڈریس کوڈ: " : "Dress code: "}{e.dressCode}</p>}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {mapLink(e) && <a className={look.solid} style={look.solidStyle(t.accent, t.bg)} href={mapLink(e)} target="_blank" rel="noopener noreferrer"><MapPin className="size-3.5" aria-hidden />{ur ? "مقام" : "Open location"}</a>}
                <button type="button" className={look.ghost} onClick={() => downloadIcs(e, names)}><CalendarPlus className="size-3.5" aria-hidden />{ur ? "کیلنڈر" : "Add to calendar"}</button>
              </div>
            </div>
          </div>
        ),
      };
    }),
    ...(content.faq.length > 0 ? [{
      key: "faq", section: "faq", label: ur ? "عام سوالات" : "Questions",
      node: (
        <div className={`absolute inset-0 overflow-y-auto px-5 ${pageTop} ${pageBottom}`}>
          <div className={`${panelCls} px-5 pb-5 pt-6`} style={look.panelStyle}>
            <p className={look.title} style={look.titleStyle}>{ur ? "عام سوالات" : "Good to know"}</p>
            <dl className="mt-4 space-y-3">
              {content.faq.map((f, i) => <div key={i}><dt className="font-bold">{f.q}</dt><dd className={`text-sm ${look.muted}`}>{f.a}</dd></div>)}
            </dl>
          </div>
        </div>
      ),
    }] : []),
    ...(content.rsvpEnabled ? [{
      // the reply form: this page waits for the guest
      key: "rsvp", section: "rsvp", label: ur ? "جواب" : "Reply", hold: true,
      node: (
        <div className={`story-block absolute inset-0 overflow-y-auto px-5 ${pageTop} ${pageBottom}`}>
          <Rsvp inviteId={inviteId} demo={demo || preview} showNote={demo} guestName={guest} seats={seats} guestId={guestId} events={rsvpEvents} tape={look.dark} accent={t.accent} titleClass={look.title} titleStyle={look.titleStyle} />
        </div>
      ),
    }] : []),
    ...((content.family1 || content.family2 || content.members1.length > 0 || content.members2.length > 0) ? [{
      key: "families", section: "families", label: ur ? "خاندان" : "The families",
      node: (
        <div className={`absolute inset-x-0 bottom-0 px-5 ${pageBottom}`}>
          <div className={`${panelCls} px-4 pb-5 pt-6`} style={look.panelStyle}>
            <p className={look.title} style={look.titleStyle}>{ur ? "دعاؤں کے ساتھ" : "With love from"}</p>
            <div className="mt-4"><FamilyColumns content={content} ur={ur} accent={t.accent} dark={look.dark} /></div>
          </div>
        </div>
      ),
    }] : []),
    {
      // the end: a big thank-you, and the way back to the start
      key: "closing", section: "closing", label: ur ? "آخر" : "See you there",
      node: (
        <div className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center ${storyInk}`}>
          <p className="text-[2.8rem] leading-[1.05]" style={{ ...look.names, color: "inherit" }}>{ur ? content.closing || "آپ کی آمد کے منتظر" : "See you at the party!"}</p>
          <p className="mt-3 text-xl font-bold" style={{ fontFamily: kidsType ? FUN : "var(--nf-display), serif" }}>{names}</p>
          <button type="button" className={`${look.solid} mt-6`} style={look.solidStyle(t.accent, t.bg)} onClick={() => setStoryRun((n) => n + 1)}>{ur ? "دوبارہ دیکھیں" : "Watch again"}</button>
          <p className="mt-6 text-xs opacity-80">Made with Digital Dawat</p>
        </div>
      ),
    },
  ];

  /** The envelope opening (Lifafa and the classic "envelope" cards): words above, the sealed envelope, the button below. */
  const envelopeCover = (ink: string) => (
    <div data-open={opened} className="cover open-envelope absolute inset-0 z-20 flex flex-col items-center justify-center gap-7 overflow-hidden px-6 text-center"
      style={{ background: `radial-gradient(120% 80% at 50% 40%, ${print ? "#6e1a28" : t.bg2}, ${print ? "#3e0c15" : t.bg})`, color: ink }}>
      <div className="cover-ui">
        {hello && <p className="mb-1 text-3xl leading-tight" style={{ fontFamily: ur ? font : "var(--nf-script), cursive" }}>{hello}</p>}
        <p className="text-[12px] uppercase tracking-[0.35em] opacity-85" style={{ fontFamily: CAPS }}>{ur ? "آپ کے لیے ایک دعوت نامہ" : "An invitation for you"}</p>
      </div>
      <Envelope env={print ? "#7d2030" : t.accent} flap={print ? "#8a2637" : t.accent} card={print ? "#efe6d6" : "#fbf7f0"} cardInk={print ? print.title : "#3a2a20"}>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-80" style={{ fontFamily: CAPS }}>{ordered[0]?.title}</p>
        <p className="mt-1 text-3xl leading-tight [overflow-wrap:anywhere]" style={{ fontFamily: ur ? font : "var(--nf-script), cursive" }}>{names}</p>
      </Envelope>
      <div className="cover-ui">
        <button type="button" onClick={open} className={print ? `${look.solid} min-h-12 px-7 text-xs shadow-xl` : "btn shadow-xl"}
          style={print ? { background: "#c9a24a", color: "#3e0c15", fontFamily: CAPS } : { background: t.accent, color: t.bg }}>
          {ur ? "لفافہ کھولیں" : "Open the envelope"}
        </button>
      </div>
    </div>
  );

  if (template.flow) {
    const flowProps = {
      content, ordered, allEvents: fullContent.events, names, hello, guest, seats, opened, gone, onOpen: open, scroller, onScroll,
      rsvp: { inviteId, demo: demo || preview, showNote: demo, guestId, events: rsvpEvents },
      song: template.music ? { node: <audio ref={song} src={template.music.src} loop preload="none" />, off: songOff, toggle: toggleSong } : undefined,
    };
    return template.flow === "firdaus" ? <Firdaus {...flowProps} /> : <FlowInvite skin={template.flow} {...flowProps} />;
  }

  return (
    // printed cards: the invitation waits on a dark "table" until its card has opened (otherwise the doors, fold and
    // curtain would part onto the very same artwork and the opening would be invisible)
    <div className="relative h-full w-full overflow-hidden bg-background" dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} onPointerDown={onTap}
      data-reveal={print ? (opened ? "in" : "wait") : undefined}
      style={print ? { ...printVars(template), background: "#2a2522", ["--reveal-delay" as string]: `${REVEAL_MS[opening]}ms` } : undefined}>
      {scenic && <SceneBackdrop scene={scene} t={t} photo={concept === "embossed" ? template.backdrop?.src : backdrop} photos={scenePhotos} active={bgPhoto} look={look} tape={tape} print={print} />}

      <div
        ref={scroller}
        onScroll={onScroll}
        style={scenic ? { scrollPaddingBottom: "3.5rem" } : undefined}
        className={`${print ? "print-stage" : ""} relative z-[1] h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${opened && !stories ? "" : "overflow-hidden"} ${scenic ? `snap-y snap-proximity ${look.ink} [container-type:size]` : ""}`}
      >
        {stories ? (
          <Stories key={storyRun} pages={storyPages} focus={focus} autoplay={autoplay && gone} light={!print?.dark}
            onEnd={() => { setSeconds(0); setGone(false); setOpened(false); setStoryRun((n) => n + 1); }} />
        ) : scenic ? (
        <div className="mx-auto max-w-md px-5">
          {tape ? (
            <Screen tape scene={0} section="cover" framed={false}>
              <div className="mx-auto w-full overflow-hidden rounded-md" style={{ maxWidth: "calc((100cqh - 10.5rem - var(--frame-top, 0px) - var(--frame-bottom, 0px)) * 0.5625)" }}><InviteCard template={template} content={content} chrome={false} clear={!!backdrop} /></div>
            </Screen>
          ) : print ? (
            // the printed card itself: the words in the artwork's clear space, the artwork behind (SceneBackdrop)
            <div data-section="cover" data-scene={0} className="relative -mx-5 h-[100cqh] snap-start">
              <div className="absolute inset-0" style={{ containerType: "inline-size" }}>
                <PrintText template={template} content={content} className="absolute"
                  style={printBox(print, "calc(var(--frame-top, 0px) + 0.5rem)", "calc(var(--frame-bottom, 0px) + 3rem)")} />
              </div>
            </div>
          ) : concept === "royal" || concept === "ivory" ? (
            <>
              <Screen tape scene={0} section="cover" framed={false} align={look.align}>
                {/* one focal point: the names, straight over the photo, with a soft glow behind them for contrast */}
                <section className={`relative px-6 py-[min(2.5rem,5cqh)] text-center ${look.dark ? "" : "rounded-[32px] border border-[#a8783a]/35 bg-[#fbf6ee]/82 shadow-[0_18px_50px_rgba(40,20,10,0.3)] backdrop-blur-sm"}`}>
                  {look.dark && <span aria-hidden className="absolute inset-x-[-10%] inset-y-0 -z-10 rounded-[50%] blur-2xl" style={{ background: "radial-gradient(closest-side, rgba(30,6,8,0.78), rgba(30,6,8,0))" }} />}
                  {content.bismillah && <p lang="ar" dir="rtl" className="ed-line text-2xl" style={{ color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>}
                  <p className="ed-line mt-2 text-[12px] uppercase tracking-[0.4em]" style={{ fontFamily: CAPS, color: look.dark ? "#f7e7c6" : t.ink, ["--d" as string]: "150ms" }}>{ur ? "شادی" : "The wedding of"}</p>
                  <h2 className={`ed-line mt-4 text-[min(3.6rem,8cqh)] leading-[1.02] [overflow-wrap:anywhere] ${ur ? "" : look.shine}`} style={{ ...(ur ? { fontFamily: font, color: t.accent } : look.names), ["--d" as string]: "300ms" }}>
                    {content.host1}
                    {content.host2 && <><span className="my-1 block text-2xl" style={ur ? undefined : { ...look.greet, fontFamily: "var(--nf-display), Georgia, serif", fontStyle: "italic" }}>{ur ? "اور" : "and"}</span>{content.host2}</>}
                  </h2>
                  <span aria-hidden className="mx-auto mt-4 block h-px w-24" style={{ background: t.accent }} />
                  <p className="ed-line mt-4 text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: CAPS, color: look.dark ? "#f7e7c6" : t.ink, ["--d" as string]: "450ms" }}>{eventsDateText(content, loc)}</p>
                </section>
              </Screen>
              <Screen tape scene={1} section="intro" framed={false} align={look.align}>
                <section className={`relative px-6 pb-7 pt-12 text-center ${look.panel}`} style={look.panelStyle}>
                  {concept === "royal" && <Finial />}<PanelFrame look={look} />
                  <p className="mx-auto max-w-[16rem] text-xs uppercase leading-6 tracking-[0.2em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.accent }}>
                    {ur ? content.headline : "Together with their families, we joyfully invite you"}
                  </p>
                  {(content.family1 || content.family2) && (
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      {[content.family1, content.family2].filter(Boolean).map((f, i) => (
                        <p key={i} className="font-display text-[15px] font-bold leading-snug">{f}</p>
                      ))}
                    </div>
                  )}
                  <Divider color={t.accent} />
                  {!ur && look.tagline && <p className="text-[11px] uppercase tracking-[0.3em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.accent }}>{look.tagline}</p>}
                  <p className={`mt-3 ${look.prose}`}>{content.message}</p>
                </section>
              </Screen>
            </>
          ) : concept === "garden" ? (
            <>
              <Screen tape scene={0} section="cover" framed={false} align={look.align}>
                <section className="px-6 pt-[24cqh] text-center" style={{ color: t.ink }}>
                  {content.bismillah && (template.bismillahArt && !ur
                    // eslint-disable-next-line @next/next/no-img-element -- static export
                    ? <img src={template.bismillahArt} alt={BISMILLAH} className="ed-line mx-auto w-[72%]" />
                    : <p lang="ar" dir="rtl" className="text-2xl" style={{ fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>)}
                  <p className="ed-line mt-4 text-[13px] font-semibold uppercase leading-6 tracking-[0.12em]" style={{ fontFamily: "var(--nf-display), Georgia, serif", ["--d" as string]: "250ms" }}>
                    {ur ? "اور ہم نے تمہیں جوڑوں میں پیدا کیا" : "And We created you in pairs"}<br /><span className="tracking-[0.2em]">{ur ? "القرآن ۷۸:۸" : "Quran 78:8"}</span>
                  </p>
                  <p className="ed-line mt-8 text-[2.1rem] leading-[1.25]" style={{ ...look.names, ["--d" as string]: "500ms" }}>
                    {ur ? "دو روحوں کے ملاپ میں شامل ہوں" : <>Join us for the union<br />of two souls</>}
                  </p>
                </section>
              </Screen>
              <Screen tape scene={1} section="intro" framed={false} align={look.align} photo={sc.couple}>
                {/* the couple illustration fills the lower half of this screen's picture: keep the words above it */}
                <section className="flex min-h-[86cqh] flex-col items-center px-6 pt-[17cqh] text-center" style={{ color: t.ink }}>
                  <h2 className="text-[min(2.6rem,7cqh)] leading-[1.02] [overflow-wrap:anywhere]" style={ur ? { fontFamily: font, color: t.accent } : look.names}>
                    {content.host1}
                    {content.host2 && <><span className="block text-xl">&amp;</span><span className="pl-10">{content.host2}</span></>}
                  </h2>
                  <span aria-hidden className="mx-auto my-2 flex w-40 items-center gap-2" style={{ color: t.accent }}>
                    <span className="h-px flex-1" style={{ background: t.accent }} /><span className="text-[10px]">❦</span><span className="h-px flex-1" style={{ background: t.accent }} />
                  </span>
                  <p className="whitespace-nowrap text-[clamp(11px,2.3cqh,15px)] uppercase leading-6 tracking-[0.1em]" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 600 }}>
                    {ur ? "قبول ہے کہہ رہے ہیں" : <>&ldquo;Are saying Qabool Hai&rdquo;</>}
                  </p>
                </section>
              </Screen>
              <Screen tape scene={2} section="panel" framed={false} align={look.align} photo={sc.couple}>
                <MughalPanel color={t.accent}>
                  <div className="px-9 pb-12 pt-16 text-center" style={{ color: t.ink }}>
                    <p className="text-[12px] leading-5" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 600 }}>
                      {content.family1 || content.family2
                        ? <>The family members of<br /><span className="uppercase tracking-[0.06em]">{content.family1 || content.family2}</span><br />cordially invite you to attend the</>
                        : <>{content.headline || "Together with their families"},<br />we cordially invite you to the</>}
                    </p>
                    <p className="mt-2 text-xl uppercase tracking-[0.06em]" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 600 }}>{ordered[0]?.title ?? "Nikkah"} ceremony</p>
                    <p className="mt-2 text-[2rem] leading-tight" style={look.names}>{content.host1}</p>
                    {content.host2 && <>
                      <p className="text-[12px]" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 600 }}>With</p>
                      <p className="text-[2rem] leading-tight" style={look.names}>{content.host2}</p>
                      {content.family2 && content.family1 && <p className="text-[11px]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>{content.family2}</p>}
                    </>}
                    {ordered[0] && <>
                      <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.12em]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>Insha Allah</p>
                      <p className="text-[11px]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>to be held on</p>
                      <p className="mt-1 text-[14px] font-semibold uppercase tracking-[0.06em]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>{formatEventDate(ordered[0].date, loc)}</p>
                      {ordered[0].time && <p className="text-[12px]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>{formatEventTime(ordered[0].time)} onwards</p>}
                      {ordered[0].venue && <><p className="mt-1 text-[11px]">At</p><p className="text-[14px] font-semibold uppercase tracking-[0.08em]" style={{ fontFamily: "var(--nf-display), Georgia, serif" }}>{ordered[0].venue}</p></>}
                    </>}
                  </div>
                </MughalPanel>
              </Screen>
            </>
          ) : concept === "embossed" ? (
            <>
              <Screen tape scene={0} section="cover" framed={false} align={look.align}>
                <section className="px-6 text-center">
                  {content.bismillah && <p lang="ar" dir="rtl" className="text-xl" style={{ color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>}
                  <h2 className="ed-line mt-4 text-[4.2rem] leading-[1.05] [overflow-wrap:anywhere]" style={ur ? { fontFamily: font, color: t.accent } : look.names}>
                    {content.host1}
                    {content.host2 && <><span className="block text-3xl">&amp;</span>{content.host2}</>}
                  </h2>
                </section>
              </Screen>
              <Screen tape scene={1} section="intro" framed={false} align={look.align}>
                <section className="px-6 text-center">
                  <p className="text-2xl uppercase leading-snug tracking-[0.3em]" style={{ fontFamily: CAPS, color: t.ink }}>
                    {content.host1}{content.host2 && <><br /><span className="text-base normal-case italic tracking-normal" style={{ fontFamily: "var(--nf-display), Georgia, serif", color: t.accent }}>{ur ? "اور" : "and"}</span><br />{content.host2}</>}
                  </p>
                  <span aria-hidden className="mx-auto my-5 block h-px w-14" style={{ background: t.accent }} />
                  <p className="mx-auto max-w-[17rem] text-[12px] uppercase leading-6 tracking-[0.22em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.ink }}>
                    {ur ? content.headline : "Together with our families, we invite you to celebrate with us"}
                  </p>
                  {(content.family1 || content.family2) && (
                    <div className="mt-6 grid grid-cols-2 gap-4 text-[11px] uppercase leading-5 tracking-[0.18em]" style={{ fontFamily: CAPS, color: t.muted }}>
                      <p>{content.family1}</p><p>{content.family2}</p>
                    </div>
                  )}
                  <p className={`mt-6 ${look.prose}`}>{content.message}</p>
                </section>
              </Screen>
            </>
          ) : (
            <Screen tape scene={0} section="cover" framed={false} align={look.align}>
              <section className={`relative mt-4 px-6 pb-7 pt-12 text-center ${look.panel}`} style={look.panelStyle}>
                <PanelFrame look={look} />
                {content.bismillah && <p lang="ar" dir="rtl" className="text-2xl" style={{ color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>}
                <p className="mx-auto mt-1 max-w-[16rem] text-xs uppercase leading-6 tracking-[0.2em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.accent }}>
                  {ur ? content.headline : "Together with their families, we joyfully invite you to the wedding of"}
                </p>
                <h2 className={`mt-3 text-5xl leading-[1.05] ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : look.names}>
                  {content.host1}
                  {content.host2 && <><span className="my-1 block text-2xl" style={ur ? undefined : { ...look.greet, fontFamily: "var(--nf-display), Georgia, serif", fontStyle: "italic" }}>{ur ? "اور" : "and"}</span>{content.host2}</>}
                </h2>
                {look.ornate ? <Divider color={t.accent} /> : <span aria-hidden className="mx-auto my-4 block h-px w-16" style={{ background: t.accent }} />}
                {!ur && look.tagline && <p className="text-[11px] uppercase tracking-[0.3em] [text-wrap:balance]" style={{ fontFamily: CAPS, color: t.accent }}>{look.tagline}</p>}
                <p className={`mt-3 ${look.prose}`}>{content.message}</p>
                <p className="mt-3 text-[11px] uppercase tracking-[0.25em]" style={{ fontFamily: CAPS }}>{eventsDateText(content, loc)}</p>
              </section>
            </Screen>
          )}

          {(guest || demo) && (
            <Screen tape scene={2} section="message" framed={tape} align={look.align} photo={sc.message}>
              <section
                className={print?.message === "letter"
                  // a handwritten note on lined paper, set down a little crooked
                  ? "relative rotate-[-1.2deg] rounded-[3px] px-6 pb-6 pt-9 text-start text-[#3a2e28] shadow-[0_14px_34px_rgba(0,0,0,.22)]"
                  : `relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} text-center ${look.panel}`}
                style={print?.message === "letter"
                  ? { background: "repeating-linear-gradient(180deg, transparent 0 29px, rgba(70,90,140,.16) 29px 30px), linear-gradient(90deg, transparent 34px, rgba(200,60,60,.25) 34px 35px, transparent 35px), #fffdf6" }
                  : look.panelStyle}>
                {concept === "royal" && <Finial />}{print?.message !== "letter" && <PanelFrame look={look} />}
                {/* the speech bubble's tail */}
                {print?.message === "bubble" && <span aria-hidden className="absolute -bottom-3 left-10 size-7 rotate-45 rounded-[4px] bg-(--p-panel)" />}
                {tape && <Tag tape label={ur ? "پیغام" : "Message"} accent={t.accent} />}
                <p className={`pb-1 text-4xl leading-tight ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : print?.message === "letter" ? { ...look.greet, color: "#3a2e28" } : look.greet}>
                  {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "محترم مہمان،" : "Dear guest,"}
                </p>
                <p className={`mt-3 ${print?.message === "letter" ? "font-display text-[17px] italic leading-[30px] text-[#3a2e28]" : look.prose}`}>
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
                {print?.message === "letter" && <p className="mt-4 text-end text-3xl text-[#3a2e28]" style={{ fontFamily: ur ? font : "var(--nf-script), cursive" }}>{ur ? "محبت کے ساتھ، " : "With love, "}{content.host1}</p>}
                {demo && !guest && <p className={`mt-3 text-xs ${print?.message === "letter" ? "text-[#3a2e28]/70" : look.muted}`}>Each guest can get a link that greets them by name.</p>}
              </section>
            </Screen>
          )}

          {concept === "embossed" && template.dateFrame && ordered[0] && (() => {
            const d = new Date(`${ordered[0].date}T00:00:00`);
            return (
              <Screen tape scene={3} section="date" framed={false} align={look.align}>
                <section className="text-center">
                  <SceneTitle look={look} concept={concept}>{ur ? "تاریخ اور وقت" : "Date & time"}</SceneTitle>
                  <div className="relative mx-auto mt-4 w-[62%]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                    <img src={template.dateFrame} alt="" className="w-full" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: t.ink }}>
                      <p className="text-6xl leading-none" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400 }}>{String(d.getDate()).padStart(2, "0")}</p>
                      <p className="mt-2 text-[13px] uppercase tracking-[0.35em]" style={{ fontFamily: CAPS }}>{d.toLocaleDateString(loc, { month: "long" })}</p>
                      <p className="mt-1 text-[12px] tracking-[0.3em]" style={{ fontFamily: CAPS, color: t.muted }}>{d.getFullYear()}</p>
                      <p className="mt-3 text-[11px] uppercase tracking-[0.25em]" style={{ fontFamily: CAPS, color: t.accent }}>{d.toLocaleDateString(loc, { weekday: "long" })}</p>
                      {ordered[0].time && <p className="mt-1 font-display text-lg italic">{formatEventTime(ordered[0].time)}</p>}
                    </div>
                  </div>
                  <button type="button" className={`${look.solid} mt-4`} style={look.solidStyle(t.accent, t.bg)} onClick={() => downloadIcs(ordered[0], names)}>
                    <CalendarPlus className="size-3.5" aria-hidden />{ur ? "کیلنڈر میں شامل کریں" : "Add to calendar"}
                  </button>
                </section>
              </Screen>
            );
          })()}

          <Screen tape scene={3} section="countdown" framed={tape} align={look.align} photo={sc.countdown}>
            <div className={`relative ${tape ? "p-4" : "px-4 pb-5 pt-12"} ${look.panel}`} style={look.panelStyle}>
              {concept === "royal" && <Finial />}<PanelFrame look={look} />
              {tape ? <Tag tape label={ur ? "الٹی گنتی" : "Countdown"} accent={t.accent} /> : <SceneTitle look={look} concept={concept!}>{ur ? "الٹی گنتی" : "Counting the days"}</SceneTitle>}
              <div className={tape ? "" : "mt-4"}>
                <Countdown events={ordered} ur={ur} tape={tape} scratchKind={scratchKind} accent={t.accent} panel={look.cell} muted={look.muted} kind={print?.countdown} />
              </div>
            </div>
          </Screen>

          {ordered.map((e, i) => (
            <Screen
              key={i}
              tape
              scene={3}
              id={`ev-${i}`}
              section={`event-${fullContent.events.indexOf(e)}`}
              photo={eventScene(e)}
              framed={tape}
              align={look.align}
              above={tape ? (
                <p aria-hidden className="mx-auto mb-5 w-fit rounded-sm border border-white/40 bg-black/55 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-white/90">
                  ✦ {ur ? fxCaption : "Tap anywhere for a photo flash"}
                </p>
              ) : concept === "editorial" && eventScene(e) ? (
                // eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage
                <img src={eventScene(e)} alt="" className="aspect-[16/10] w-full object-cover" />
              ) : undefined}
            >
              <article
                className={print?.eventStyle === "polaroid"
                  // a polaroid: white frame, the event as its picture, the date written underneath
                  ? `relative bg-white px-3 pb-5 pt-3 text-center text-[#2b2b2b] shadow-[0_16px_36px_rgba(0,0,0,.25)] ${i % 2 ? "rotate-[1.6deg]" : "rotate-[-1.6deg]"}`
                  : `relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} text-center ${look.panel}`}
                style={print?.eventStyle === "polaroid" ? undefined : look.panelStyle}>
                {concept === "royal" && <Finial />}{print?.eventStyle !== "polaroid" && <PanelFrame look={look} />}
                {print?.eventStyle === "polaroid" && (
                  <div className="relative mb-3 grid aspect-[4/3] place-items-center overflow-hidden" style={{ background: eventScene(e) || content.couplePhoto ? undefined : "radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--p-accent) 35%, white), var(--p-accent))" }}>
                    {(eventScene(e) || content.couplePhoto) && (
                      // eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage
                      <img src={eventScene(e) || content.couplePhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <p className={`relative px-4 leading-tight text-white [text-shadow:0_2px_12px_rgba(0,0,0,.35)] [text-wrap:balance] ${e.title.length > 12 ? "text-4xl" : "text-5xl"}`} style={{ fontFamily: ur ? font : coverNames, fontWeight: kidsType ? 700 : undefined }}>{e.title}</p>
                  </div>
                )}
                {print?.eventStyle === "ticket" && (
                  <p className="mx-auto mb-2 w-fit rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: CAPS, background: "var(--p-accent)", color: "var(--p-on-accent)" }}>
                    {ur ? "داخلہ" : "Admit"} · {seats ?? (ur ? "سب" : "all")}
                  </p>
                )}
                {print?.eventStyle === "polaroid" ? (
                  <p className={kidsType ? "text-lg font-bold" : "text-2xl"} style={{ fontFamily: ur ? font : coverNames }}>{formatEventDate(e.date, loc)}</p>
                ) : tape ? (
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
                {print?.eventStyle === "polaroid"
                  ? <h3 className="sr-only">{e.title}</h3>
                  : tape ? <TapeTitle as="h3">{e.title}</TapeTitle> : <h3 className={`text-5xl leading-tight ${ur ? "" : look.shine}`} style={ur ? { fontFamily: font } : look.names}>{e.title}</h3>}
                {!tape && print?.eventStyle !== "polaroid" && (look.ornate ? <Divider color={t.accent} /> : <span aria-hidden className="mx-auto my-3 block h-px w-12" style={{ background: t.accent }} />)}
                {concept === "embossed" && <ArchMap color={t.accent} label={e.venue || e.title} />}
                {print?.eventStyle === "polaroid" ? (
                  e.time && <p className="text-sm font-semibold">{formatEventTime(e.time)}</p>
                ) : (
                  <p className="mt-2 flex items-center justify-center gap-1.5 font-display text-lg font-semibold">
                    {!tape && <CalendarDays className="size-4 shrink-0" style={{ color: t.accent }} aria-hidden />}
                    {formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}
                  </p>
                )}
                {e.venue && <p className="mt-1 flex items-center justify-center gap-1.5 text-sm">{!tape && <MapPin className="size-3.5 shrink-0" style={{ color: t.accent }} aria-hidden />}{e.venue}</p>}
                {e.address && <p className={`text-xs ${look.muted}`}>{e.address}</p>}
                {e.dressCode && <p className={`mt-1 text-xs ${look.muted}`}>{ur ? "ڈریس کوڈ: " : "Dress code: "}{e.dressCode}</p>}
                {/* the ticket's tear-off line */}
                {print?.eventStyle === "ticket" && <span aria-hidden className="-mx-5 mt-4 block border-t-2 border-dashed border-(--p-line)" />}
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

          {(concept === "embossed" || concept === "royal" || concept === "ivory") && content.timeline.length > 0 && (
            <Screen tape scene={4} section="timeline" framed={false} align={look.align} photo={sc.dress}>
              <section className={concept === "embossed" ? "px-4 text-center" : `relative px-5 pb-6 pt-12 text-center ${look.panel}`} style={concept === "embossed" ? undefined : look.panelStyle}>
                {concept === "royal" && <Finial />}{concept !== "embossed" && <PanelFrame look={look} />}
                <SceneTitle look={look} concept={concept}>{ur ? "دن کا پروگرام" : "The day's programme"}</SceneTitle>
                <ol className={`mt-5 ${concept === "embossed" ? "space-y-5" : "space-y-3"}`}>
                  {content.timeline.map((it, i) => (
                    <li key={i}>
                      {it.time && <p className="text-[12px] tracking-[0.3em]" style={{ fontFamily: CAPS, color: t.accent }}>{formatEventTime(it.time)}</p>}
                      <p className="font-display text-2xl italic" style={{ color: look.dark ? "#f7e7c6" : t.ink }}>{it.title}</p>
                      {it.note && <p className={`mx-auto mt-0.5 max-w-[17rem] leading-snug ${concept === "embossed" ? "text-[13px]" : "text-[12px]"} ${look.muted}`}>{it.note}</p>}
                      {i < content.timeline.length - 1 && <span aria-hidden className={`mx-auto block size-1.5 rotate-45 ${concept === "embossed" ? "mt-4" : "mt-3"}`} style={{ background: t.accent }} />}
                    </li>
                  ))}
                </ol>
              </section>
            </Screen>
          )}

          {couple && (tape ? (
            <Screen tape scene={4} section="couple" framed={false} photo={couple}>
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
            <Screen tape scene={4} section="couple" framed={false} align={look.align} photo={sc.couple}>
              <SceneTitle look={look} concept={concept!}>
                {template.category === "birthday" ? (ur ? "سالگرہ مبارک" : "The birthday star")
                  : template.category === "aqiqah" ? (ur ? "ہماری ننھی نعمت" : "Our little blessing")
                  : ur ? "دولہا دلہن" : "The couple"}
              </SceneTitle>
              <figure className={`mx-auto mt-4 overflow-hidden ${onPaper ? "w-[86%]" : look.dark ? "w-[64%] border-[3px] shadow-2xl" : "w-[56%] border-[3px] shadow-2xl"}`}
                style={look.stage === "paper" ? undefined : concept === "embossed" ? { borderTopLeftRadius: "50% 24%", borderTopRightRadius: "50% 24%" } : { borderColor: t.accent, borderTopLeftRadius: "50% 28%", borderTopRightRadius: "50% 28%" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
                <img src={couple} alt={ur ? "دولہا دلہن کی تصویر" : `Photo of ${names}`} className="aspect-[4/5] w-full object-cover" />
              </figure>
              <p className="mt-4 pb-1 text-center text-4xl" style={ur ? { fontFamily: font } : look.dark || onPaper ? look.names : { ...look.names, color: "#fbf1dc", textShadow: "0 2px 12px rgba(0,0,0,.7)" }}>{names}</p>
              <p className={`text-center text-sm italic ${onPaper ? look.muted : look.dark ? "text-white/85" : "text-white"}`} style={{ fontFamily: "var(--nf-display), Georgia, serif", textShadow: onPaper ? undefined : "0 1px 6px rgba(0,0,0,.6)" }}>{coupleCat ? "Two hearts, one promise" : template.category === "aqiqah" ? "Alhamdulillah" : ""}</p>
            </Screen>
          ))}

          {hasDress && ordered.length > 1 && (
            <Screen tape scene={4} section="dress" framed={tape} align={look.align} photo={sc.dress}>
              <section aria-label="Dress code" className={`relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} text-center ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape && <Tag tape label={ur ? "پروگرام" : "Programme"} accent={t.accent} />}
                {tape ? <TapeTitle>{ur ? "ڈریس کوڈ" : "Dress code"}</TapeTitle> : <SceneTitle look={look} concept={concept!}>{ur ? "ڈریس کوڈ" : "Dress code"}</SceneTitle>}
                <ul className={`mt-4 space-y-3 ${tape ? "" : "text-start"}`}>
                  {ordered.filter((e) => e.dressCode).map((e, i) => (
                    <li key={i} className={tape ? "" : "flex items-center gap-3"}>
                      {!tape && <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full" style={iconDisc}><Shirt className="size-4" /></span>}
                      <span>
                        <span className={`block ${look.label}`} style={tape ? { color: t.accent } : undefined}>{e.title}</span>
                        <span className={`block font-display text-[15px] ${look.dark ? "text-white/90" : print ? "text-(--p-ink)" : "text-[#4a1c20]/90"}`}>{e.dressCode}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </Screen>
          )}

          {content.faq.length > 0 && (
            <Screen tape scene={4} section="faq" framed={tape} align={look.align} photo={sc.faq}>
              <section aria-label="Questions" className={`relative px-5 pb-5 ${tape ? "pt-5" : "pt-12"} ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape && <Tag tape label="Q & A" accent={t.accent} />}
                {tape ? <TapeTitle>{ur ? "عام سوالات" : "A few questions"}</TapeTitle> : <SceneTitle look={look} concept={concept!}>{ur ? "عام سوالات" : "A few questions"}</SceneTitle>}
                <div className={`mt-4 divide-y border-t ${look.dark ? "divide-white/15 border-white/15" : print ? "divide-(--p-line) border-(--p-line)" : "divide-[#4a1c20]/15 border-[#4a1c20]/15"}`}>
                  {content.faq.map((f, i) => (
                    <details key={i} className="group py-3">
                      <summary className="flex min-h-8 cursor-pointer list-none items-center gap-3 text-sm font-medium">
                        {tape
                          ? <span className="font-mono text-[11px] font-bold" style={{ color: t.accent }}>A{i + 1}</span>
                          : <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold" style={iconDisc}>?</span>}
                        <span className="flex-1">{f.q}</span>
                        <span aria-hidden className={`grid size-6 shrink-0 place-items-center border text-xs transition-transform duration-200 ease-out group-open:rotate-45 ${tape ? "rounded-sm border-white/50 font-mono" : "rounded-full border-current/40"}`}>+</span>
                      </summary>
                      <p className={`mt-2 pl-10 font-display text-[15px] ${look.dark ? "text-white/85" : print ? "text-(--p-ink)" : "text-[#4a1c20]/85"}`}>{f.a}</p>
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
            <Screen tape scene={5} section="rsvp" framed={tape} align={look.align} photo={sc.rsvp}>
              <Rsvp inviteId={inviteId} demo={demo || preview} showNote={demo} guestName={guest} seats={seats} guestId={guestId} events={rsvpEvents} tape={look.dark} accent={t.accent} titleClass={look.title} titleStyle={look.titleStyle} />
            </Screen>
          )}

          {/* family contacts sit near the end: guests look for them when they have a question */}
          {(content.family1 || content.family2 || content.members1.length > 0 || content.members2.length > 0) && (
            <Screen tape scene={5} section="families" framed={tape} align={look.align} photo={sc.families}>
              <div className={`relative ${tape ? "p-4" : "px-4 pb-5 pt-12"} ${look.panel}`} style={look.panelStyle}>
                {concept === "royal" && <Finial />}<PanelFrame look={look} />
                {tape ? <Tag tape label={ur ? "خاندان" : "Families"} accent={t.accent} /> : <SceneTitle look={look} concept={concept!}>{ur ? "دعاؤں کے ساتھ" : "With the blessings of"}</SceneTitle>}
                <div className={tape ? "" : "mt-4"}>
                  {tape ? <Families content={content} ur={ur} glass={look.dark} /> : <FamilyColumns content={content} ur={ur} accent={t.accent} dark={look.dark} />}
                </div>
              </div>
            </Screen>
          )}

          <Screen tape scene={5} section="closing" framed={tape} align={look.align} photo={sc.closing}>
            {concept === "garden" ? (
              <section className="flex min-h-[86cqh] flex-col items-center px-6 pt-[25cqh] text-center" style={{ color: t.ink }}>
                <p className="text-[2.3rem] leading-[1.2]" style={look.names}>{ur ? content.closing || "آپ کی آمد کے منتظر" : <>Looking forward to<br />your presence!</>}</p>
                <p className="mt-3 text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 600 }}>{names}</p>
                <button type="button" className={`${look.ghost} mt-5`} onClick={toTop}>{ur ? "شروع پر جائیں" : "Back to the start"}</button>
              </section>
            ) : tape ? (
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
          <p className={`pb-[calc(5rem+var(--frame-bottom,0px))] text-center text-xs ${print ? "" : onPaper ? look.muted : look.dark ? "text-white/70" : "text-white [text-shadow:0_1px_4px_rgba(0,0,0,.6)]"}`}>
            {/* the printed cards' artwork can be dark or busy at the very bottom: the credit sits on a small panel */}
            {print ? <span className="rounded-full bg-(--p-panel) px-3 py-1 text-(--p-ink)">Made with Digital Dawat</span> : "Made with Digital Dawat"}
          </p>
        </div>
        ) : (
        <div className="mx-auto max-w-md space-y-6 px-4 pb-[calc(1.5rem+var(--frame-bottom,0px))] pt-[calc(1.5rem+var(--frame-top,0px))]">
          <div {...sceneAttr(0)} data-section="cover" className="overflow-hidden rounded-2xl shadow-xl"><InviteCard template={template} content={content} chrome={!tape} clear={tape && !!backdrop} /></div>
          {couple && (
            <figure className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
              <img src={couple} alt={ur ? "تصویر" : `Photo of ${names}`} className="aspect-[4/5] w-full object-cover" />
            </figure>
          )}

          {(guest || demo) && (
            <section {...sceneAttr(2)} data-section="message" className={`rounded-2xl border p-5 text-center ${panel}`}>
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
              <article id={`ev-${i}`} key={i} {...sceneAttr(3)} data-section={`event-${fullContent.events.indexOf(e)}`} className={`rounded-2xl border p-5 ${panel}`}>
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
            <section {...sceneAttr(4)} data-section="dress" aria-label="Dress code" className={`rounded-2xl border p-5 ${panel}`}>
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
            <section {...sceneAttr(4)} data-section="faq" aria-label="Questions" className="space-y-2">
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

          {content.rsvpEnabled && <div {...sceneAttr(5)} data-section="rsvp"><Rsvp inviteId={inviteId} demo={demo || preview} showNote={demo} guestName={guest} seats={seats} guestId={guestId} events={rsvpEvents} /></div>}
          {(content.family1 || content.family2 || content.members1.length > 0 || content.members2.length > 0) && (
            <div {...sceneAttr(5)} data-section="families"><Tag tape={tape} label={ur ? "خاندان" : "Families"} /><Families content={content} ur={ur} glass={tape} /></div>
          )}


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
            <button ref={hintRef as React.RefObject<HTMLButtonElement>} type="button" tabIndex={-1} aria-hidden onClick={() => scroller.current?.scrollBy({ top: scroller.current.clientHeight * 0.8, behavior: reducedMotion() ? "auto" : "smooth" })}
              className={`pointer-events-auto absolute bottom-[calc(0.75rem+var(--frame-bottom,0px))] left-1/2 grid min-h-11 min-w-11 -translate-x-1/2 place-items-center transition-opacity duration-300 ${hintAway ? "pointer-events-none opacity-0" : ""}`}>
              <span className="flex items-center gap-1 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-[10px] font-bold tracking-[0.2em]">SCROLL <ChevronDown className="size-3" /></span>
            </button>
          )}
        </div>
      )}

      {scenic && !tape && !stories && opened && !atEnd && (
        <button ref={hintRef as React.RefObject<HTMLButtonElement>} type="button" tabIndex={-1} aria-hidden onClick={() => scroller.current?.scrollBy({ top: scroller.current.clientHeight * 0.8, behavior: reducedMotion() ? "auto" : "smooth" })}
          className={`press absolute bottom-[calc(0.5rem+var(--frame-bottom,0px))] left-1/2 z-10 grid min-h-11 min-w-11 -translate-x-1/2 place-items-center outline-none transition-opacity duration-300 ${hintAway ? "pointer-events-none opacity-0" : ""}`}>
          {print ? (
            <span className="scroll-nudge flex items-center gap-1 rounded-full bg-(--p-panel) px-3 py-1 text-[11px] text-(--p-ink) shadow-md">{ur ? "نیچے" : "Scroll"}<ChevronDown className="size-3.5" /></span>
          ) : concept === "embossed" || concept === "garden" ? (
            <span className="scroll-nudge flex items-center gap-1 rounded-full bg-[#FBF7F0]/95 px-3 py-1 text-[11px] text-[#6E5A43] shadow-md">{ur ? "نیچے" : "Scroll"}<ChevronDown className="size-3.5" /></span>
          ) : (
            <span className={`scroll-nudge grid size-8 place-items-center rounded-full border ${concept === "editorial" ? "border-[#141414] bg-[#F5F1EA]/90 text-[#141414]" : concept === "aurora" ? "border-white/40 bg-white/10 text-white backdrop-blur-md" : concept === "monogram" ? "border-[#B08D57]/70 bg-[#FAF8F3]/90 text-[#1F2A28]" : look.dark ? "border-[#e8c06a]/80 bg-[#2a0a0e]/60 text-[#e8c06a]" : "border-[#a8783a]/70 bg-[#fbf6ee]/80 text-[#7a2a2e]"}`}>
              <ChevronDown className="size-4" />
            </span>
          )}
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
              <div className="flex flex-col items-center gap-2">
                {hello && (
                  <div className="rounded-2xl bg-[#2a120a]/75 px-5 py-2 shadow-xl backdrop-blur-sm">
                    <p className="text-3xl leading-tight" style={ur ? { fontFamily: font, color: t.accent } : look.greet}>{hello}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#f7e7c6]/85" style={{ fontFamily: CAPS }}>{invitedTo}</p>
                  </div>
                )}
                <div className="rounded-2xl border border-[#e8c06a]/50 bg-[#2a120a]/80 px-6 py-3 shadow-2xl backdrop-blur-sm">
                  <p className="text-4xl" style={ur ? { fontFamily: font, color: t.accent } : look.names}>{names}</p>
                </div>
              </div>
            ) : (
              <div className="rounded-[28px] border border-[#a8783a]/40 bg-[#fbf6ee]/80 px-7 py-5 shadow-[0_10px_40px_rgba(40,20,10,0.25)] backdrop-blur-sm">
                {hello && (
                  <>
                    <p className="text-4xl" style={ur ? { fontFamily: font, color: "#7a2a2e" } : { fontFamily: "var(--nf-script), cursive", color: "#7a2a2e", textShadow: "0 1px 10px rgba(255,250,240,.95)" }}>{hello}</p>
                    <p className="mb-3 mt-1 text-[10px] uppercase tracking-[0.25em] text-[#7a2a2e]" style={{ fontFamily: CAPS, textShadow: "0 1px 8px rgba(255,250,240,.95)" }}>{invitedTo}</p>
                  </>
                )}
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

      {!gone && modern && (
        <ModernCover concept={concept as "editorial" | "aurora" | "monogram"} template={template} content={content} opened={opened} onOpen={open}
          hello={hello} dateText={eventsDateText(content, loc)} photo={backdrop} />
      )}

      {!gone && videoGate && template.gate && (
        <VideoGate poster={template.gate} video={template.gateVideo} opened={opened} onOpen={open} hello={hello} accent={t.accent} />
      )}

      {!gone && print && (
        // the printed card's opening: its artwork (whole, in halves, or an envelope), the names, and one button
        opening === "envelope" ? envelopeCover("#f5e9d6") : (
        <div data-open={opened} className={`cover open-${opening} absolute inset-0 z-20 overflow-hidden`} style={{ containerType: "size" }}>
          {opening === "doors" || opening === "curtain" || opening === "split"
            ? <Halves dir={opening === "split" ? "tb" : "lr"}><PrintArt art={print.art} /></Halves>
            : <PrintArt art={print.art} />}
          <div className={`cover-ui relative flex h-full flex-col items-center gap-3 px-12 text-center ${print.coverAt ? "justify-start" : "justify-center"}`}
            style={{ containerType: "inline-size", paddingTop: print.coverAt ? `${print.coverAt}cqh` : undefined }}>
            {hello && <p className="text-3xl leading-tight" style={{ fontFamily: ur ? font : coverNames, fontWeight: kidsType ? 700 : undefined, color: coverTitle }}>{hello}</p>}
            <p className="text-[12px] uppercase tracking-[0.35em]" style={{ fontFamily: kidsType ? ROUND : CAPS, fontWeight: kidsType ? 800 : undefined, color: coverCaps }}>{ur ? "آپ مدعو ہیں" : hello ? "you are invited" : "You're invited"}</p>
            <p className="text-[min(14cqw,3.6rem)] leading-[1.1] [overflow-wrap:anywhere]" style={{ fontFamily: ur ? font : coverNames, fontWeight: kidsType ? 700 : undefined, color: coverTitle }}>
              {content.host1}{content.host2 && <><span className="block text-[0.5em]">&amp;</span>{content.host2}</>}
            </p>
            <p className="text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: kidsType ? ROUND : CAPS, fontWeight: kidsType ? 800 : undefined, color: coverCaps }}>{ordered[0]?.title}</p>
            <button type="button" onClick={open} className={`${look.solid} mt-4 min-h-12 px-7 text-xs shadow-xl`} style={look.solidStyle(t.accent, t.bg)}>
              {ur ? "کھولنے کے لیے ٹیپ کریں" : "Tap to open"}
            </button>
          </div>
        </div>
        )
      )}

      {!gone && !gated && !modern && !videoGate && !print && opening === "envelope" && !tape && envelopeCover(t.ink)}

      {!gone && !gated && !modern && !videoGate && !print && !(opening === "envelope" && !tape) && (
        <div
          data-open={opened}
          className={`cover ${tape ? "" : `open-${opening}`} absolute inset-0 z-20 flex flex-col items-center text-center ${coverArt || tape ? (hello ? "justify-end pb-20" : "justify-end pb-28") : "justify-center"}`}
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
              {!hello && <p aria-hidden className="absolute left-7 top-[calc(4rem+var(--frame-top,0px))] font-mono text-xs tracking-widest" style={{ color: t.accent }}><span className="animate-pulse text-red-400">●</span> REC</p>}
            </>
          )}
          {/* the entrance (rise) and the opening fade (cover-ui) sit on separate elements so neither overrides the other */}
          <div className="cover-ui relative">
          <div className="rise relative flex flex-col items-center gap-4 px-8" style={coverArt ? { textShadow: `0 0 8px ${t.bg}, 0 0 18px ${t.bg}` } : undefined}>
            {hello && (
              <p className={`-mb-1 leading-tight ${tape ? "text-2xl" : "text-3xl"}`} style={ur ? { fontFamily: font, color: t.accent } : tape ? goldScript : { fontFamily: "var(--nf-script), cursive", color: t.accent }}>{hello}</p>
            )}
            {content.bismillah && <p lang="ar" dir="rtl" className="text-2xl" style={{ color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9 }}>{BISMILLAH}</p>}
            <p className={`text-xs uppercase tracking-[0.3em] ${mono}`} style={{ color: t.accent, ...(tape ? { textShadow: VHS } : {}) }}>{tape && !ur ? "The wedding of" : content.headline}</p>
            {tape && !ur
              ? <h2 className={`pb-2 leading-[1.05] ${hello ? "text-[3.4rem]" : "text-7xl"}`} style={{ fontFamily: "var(--nf-script), cursive", fontWeight: 400, backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{names}</h2>
              : <h2 className="text-5xl leading-tight" style={{ fontFamily: font, fontWeight: 600 }}>{names}</h2>}
            <div className="h-px w-16" style={{ background: t.accent }} />
            <p className={mono} style={{ color: tape ? t.accent : t.muted }}>{tape ? stamp : eventsDateText(content, loc)}</p>
            <button type="button" onClick={open} className={`btn mt-6 ${tape ? "font-mono uppercase tracking-[0.25em]" : ""}`} style={{ background: t.accent, color: t.bg, ...(tape ? { boxShadow: "0 4px 0 #A8531A" } : {}) }}>
              {ur ? "کھولنے کے لیے ٹیپ کریں" : tape ? "▶ Press play" : "Tap to open"}
            </button>
            <ChevronDown className="mt-2 size-5 opacity-60" aria-hidden />
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
