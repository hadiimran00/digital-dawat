"use client";

import { ArrowRight } from "lucide-react";
import type { InviteContent } from "@/lib/content";
import type { Template } from "@/lib/templates";
import { AURORA_TEXT } from "./InviteCard";

const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";
const DISPLAY = "var(--nf-display), Georgia, serif";

/** Three blurred, slowly drifting pools of colour (the "aurora" behind the night-glow look). Still under reduced motion. */
export function AuroraGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: "radial-gradient(120% 80% at 50% 0%, #1B1540, #07060F 70%)" }}>
      <span className="aurora-a absolute -left-[30%] top-[-10%] size-[90%] rounded-full opacity-60 blur-3xl" style={{ background: "#FF5FA2" }} />
      <span className="aurora-b absolute -right-[35%] top-[25%] size-[95%] rounded-full opacity-50 blur-3xl" style={{ background: "#7B61FF" }} />
      <span className="aurora-c absolute -bottom-[25%] left-[5%] size-[80%] rounded-full opacity-40 blur-3xl" style={{ background: "#FFB347" }} />
      {/* fine grain so the gradients don't band */}
      <span className="absolute inset-0 opacity-[0.07] mix-blend-overlay" style={{ backgroundImage: "repeating-radial-gradient(circle at 30% 30%, #fff 0 1px, transparent 1px 3px)" }} />
    </div>
  );
}

/** First letters for the monogram: "A" and "H" from Ayesha & Hamza. */
const initial = (name: string) => (name.trim().match(/\p{L}/u)?.[0] ?? "").toUpperCase();

/**
 * The opening screen of the three modern looks. It slides away on "open" like the other covers (.cover[data-open]).
 * `hello` is the personal greeting ("Dear Sarah & Family,") on guest-list links.
 */
export function ModernCover({
  concept, template, content, opened, onOpen, hello, dateText, photo,
}: {
  concept: "editorial" | "aurora" | "monogram";
  template: Template;
  content: InviteContent;
  opened: boolean;
  onOpen: () => void;
  hello: string;
  dateText: string;
  photo?: string;
}) {
  const t = template.theme;
  const events = content.events.map((e) => e.title).join(" · ");

  if (concept === "editorial") {
    return (
      <div data-open={opened} className="cover absolute inset-0 z-20 flex flex-col" style={{ background: t.bg, color: t.ink }}>
        {photo && (
          <div className="relative h-[44%] w-full shrink-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img src={photo} alt="" className="ed-zoom h-full w-full object-cover" />
          </div>
        )}
        <div className={`flex flex-1 flex-col justify-between px-7 pb-[calc(1.75rem+var(--frame-bottom,0px))] ${photo ? "pt-5" : "pt-[calc(3.5rem+var(--frame-top,0px))]"}`}>
          <p className="ed-line flex items-baseline justify-between border-b pb-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ borderColor: t.ink, ["--d" as string]: "0ms" }}>
            <span>The wedding of</span><span>{dateText}</span>
          </p>
          <div>
            {hello && <p className="ed-line mb-1 text-2xl italic" style={{ fontFamily: DISPLAY, color: t.accent, ["--d" as string]: "80ms" }}>{hello}</p>}
            <h1 className="leading-[0.92] [overflow-wrap:anywhere]" style={{ fontFamily: DISPLAY, fontWeight: 400 }}>
              <span className="ed-line block text-[3.4rem]" style={{ ["--d" as string]: "160ms" }}>{content.host1}</span>
              {content.host2 && (
                <span className="ed-line block pl-8 text-[3.4rem]" style={{ ["--d" as string]: "280ms" }}>
                  <span className="italic" style={{ color: t.accent }}>&amp;</span> {content.host2}
                </span>
              )}
            </h1>
          </div>
          <div className="ed-line" style={{ ["--d" as string]: "420ms" }}>
            <p className="text-[11px] font-semibold uppercase leading-5 tracking-[0.22em]" style={{ color: t.muted }}>{events}</p>
            <button type="button" onClick={onOpen} className="press mt-4 flex min-h-12 w-full items-center justify-between px-5 text-xs font-semibold uppercase tracking-[0.25em]" style={{ background: t.ink, color: t.bg }}>
              Open the invitation <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (concept === "aurora") {
    return (
      <div data-open={opened} className="cover absolute inset-0 z-20 overflow-hidden text-white">
        <AuroraGlow />
        <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
          {hello && <p className="rise mb-3 text-2xl italic text-white/90" style={{ fontFamily: DISPLAY }}>{hello}</p>}
          <p className="rise text-[11px] font-medium uppercase tracking-[0.4em] text-white/70">You&apos;re invited to the wedding of</p>
          <h1 className="rise foil-shine mt-6 text-[3.6rem] font-light leading-[1.02] tracking-tight [overflow-wrap:anywhere]"
            style={{ fontFamily: "var(--nf-sans), system-ui", backgroundImage: AURORA_TEXT, backgroundSize: "250% 100%", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", animationDelay: "120ms" }}>
            {content.host1}
            {content.host2 && <><span className="my-2 block text-2xl italic text-white/70" style={{ fontFamily: DISPLAY, WebkitTextFillColor: "rgba(255,255,255,0.7)" }}>&amp;</span>{content.host2}</>}
          </h1>
          <p className="rise mt-7 text-sm tracking-[0.18em] text-white/80" style={{ animationDelay: "240ms" }}>{dateText}</p>
          <p className="rise mt-1 text-xs tracking-[0.12em] text-white/60" style={{ animationDelay: "280ms" }}>{events}</p>
          <button type="button" onClick={onOpen} className="press rise mt-10 min-h-12 rounded-full border border-white/25 bg-white/10 px-9 text-sm font-semibold tracking-[0.12em] shadow-[0_0_40px_rgba(201,184,255,0.25)] backdrop-blur-md" style={{ animationDelay: "360ms" }}>
            Tap to open
          </button>
        </div>
      </div>
    );
  }

  // monogram: the couple's initials drawn in fine gold, then filled
  const a = initial(content.host1);
  const b = content.host2 ? initial(content.host2) : "";
  return (
    <div data-open={opened} className="cover absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center" style={{ background: t.bg, color: t.ink }}>
      <span aria-hidden className="pointer-events-none absolute inset-[14px] border" style={{ borderColor: `${t.accent}66`, top: "calc(14px + var(--frame-top,0px))", bottom: "calc(14px + var(--frame-bottom,0px))" }} />
      {hello && <p className="rise mb-4 text-2xl italic" style={{ fontFamily: DISPLAY, color: t.accent }}>{hello}</p>}
      <svg viewBox="0 0 300 210" className="w-[82%] max-w-[320px]" role="img" aria-label={b ? `${a} and ${b}` : a}>
        <text x={b ? 92 : 150} y="155" textAnchor="middle" className="mono-draw" style={{ fontFamily: DISPLAY, fontSize: 168, fontWeight: 400, fontStyle: "italic" }} stroke={t.accent} strokeWidth="1.2">{a}</text>
        {b && <line x1="150" y1="34" x2="150" y2="186" stroke={t.accent} strokeWidth="1" className="mono-line" />}
        {b && <text x="208" y="155" textAnchor="middle" className="mono-draw" style={{ fontFamily: DISPLAY, fontSize: 168, fontWeight: 400, fontStyle: "italic", ["--d" as string]: "350ms" }} stroke={t.accent} strokeWidth="1.2">{b}</text>}
      </svg>
      <p className="rise mt-6 text-[13px] uppercase tracking-[0.42em] [overflow-wrap:anywhere]" style={{ fontFamily: CAPS, animationDelay: "1200ms" }}>
        {content.host1}{content.host2 && <> &amp; {content.host2}</>}
      </p>
      <p className="rise mt-2 text-lg italic" style={{ fontFamily: DISPLAY, color: t.muted, animationDelay: "1300ms" }}>{dateText}</p>
      <button type="button" onClick={onOpen} className="press rise mt-10 min-h-12 border px-9 text-[11px] uppercase tracking-[0.35em]" style={{ borderColor: `${t.ink}55`, fontFamily: CAPS, animationDelay: "1450ms" }}>
        Open
      </button>
    </div>
  );
}
