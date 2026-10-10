import type { CSSProperties } from "react";
import type { Template } from "@/lib/templates";
import { BISMILLAH, eventsDateText, eventsTitle, formatEventTime, type InviteContent } from "@/lib/content";
import { Ornament, isTallOrnament } from "./Ornament";

/** Warm see-through panel used by the video-tape concept. */
export const TAPE_GLASS = "border-[#f3cf9a]/25 bg-[#24130a]/60 text-white backdrop-blur-[3px]";

/** Brushed-gold fill for script names. */
export const GOLD = "linear-gradient(180deg, #fff1c9 0%, #e8c06a 45%, #b98a35 100%)";

const HEADING: Record<Template["theme"]["headingFont"], string> = {
  serif: "var(--nf-display), Georgia, serif",
  script: "var(--nf-display), Georgia, serif",
  sans: "var(--nf-sans), system-ui, sans-serif",
};

/** Real artwork across the top of the card, fading into the card background. */
export function ArtHero({ art, bg }: { art: NonNullable<Template["art"]>; bg: string }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0"
      style={{
        height: "64%",
        backgroundImage: `url(${art.src})`,
        backgroundSize: `${art.zoom * 100}% auto`,
        backgroundPosition: art.position,
        backgroundRepeat: "no-repeat",
        backgroundColor: bg,
        WebkitMaskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
        maskImage: "linear-gradient(to bottom, #000 55%, transparent 100%)",
      }}
    />
  );
}

/**
 * The invitation "card": a 9:16 panel that scales with its container width
 * (all sizes use container query units, so it is identical in thumbnails,
 * the editor preview and the public page).
 */
/** `clear` lets a photo behind the card show through (used when the template has a full-bleed backdrop). */
export function InviteCard({ template, content, chrome = true, clear = false }: { template: Template; content: InviteContent; chrome?: boolean; clear?: boolean }) {
  const t = template.theme;
  const ur = content.language === "ur";
  const e = content.events[0];
  const single = content.events.length === 1;
  const tall = isTallOrnament(t.ornament);
  // soft halo so text stays readable where it overlaps real artwork
  const glow = template.art ? `0 0 6px ${t.bg}, 0 0 14px ${t.bg}, 0 0 22px ${t.bg}` : undefined;
  const gold = template.concept === "tape" && !ur; // gold script lettering, like a home-video title card
  const names = content.host2 ? `${content.host1} & ${content.host2}` : content.host1;
  const style: CSSProperties = {
    background: clear
      ? "linear-gradient(rgba(10,7,5,0.18), rgba(10,7,5,0.5))"
      : template.backdrop
        ? `linear-gradient(rgba(12,8,5,0.4), rgba(12,8,5,0.72)), url(${template.backdrop.src}) 50% 20% / cover no-repeat`
        : `linear-gradient(170deg, ${t.bg}, ${t.bg2})`,
    color: t.ink,
    containerType: "inline-size",
    aspectRatio: "9 / 16",
  };
  const body = ur ? "var(--nf-urdu), serif" : "var(--nf-sans), system-ui, sans-serif";
  const head = ur ? "var(--nf-urdu), serif" : HEADING[t.headingFont];

  return (
    <div className="relative w-full overflow-hidden" style={style} dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"}>
      {!clear && !template.backdrop && <Ornament
        kind={t.ornament}
        className={
          tall
            ? "absolute left-1/2 top-[3%] h-[94%] w-[88%] -translate-x-1/2 opacity-40"
            : "absolute left-1/2 top-[5%] w-[62%] -translate-x-1/2 opacity-30"
        }
      />}
      {template.art && <ArtHero art={template.art} bg={t.bg} />}
      {template.concept === "tape" && (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10 opacity-30"
            style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 3px)" }} />
          {chrome && (
            <>
              <p aria-hidden className="absolute left-[6cqw] top-[5cqw] z-10 font-mono" style={{ fontSize: "3.2cqw", color: t.accent, letterSpacing: "0.1em" }}>● REC</p>
              <p aria-hidden className="absolute right-[6cqw] top-[5cqw] z-10 font-mono" style={{ fontSize: "3.2cqw", color: t.ink, letterSpacing: "0.1em" }}>SP 0:00:00</p>
            </>
          )}
        </>
      )}
      <div
        className={`absolute inset-0 flex flex-col items-center text-center ${tall ? "justify-center" : "justify-end"}`}
        style={{ padding: "12cqw", fontFamily: body, gap: "3cqw" }}
      >
        {content.bismillah && (
          <p lang="ar" dir="rtl" style={{ fontSize: "5cqw", color: t.accent, fontFamily: "var(--nf-naskh), serif", lineHeight: 1.9, textShadow: glow }}>{BISMILLAH}</p>
        )}
        <p className={template.concept === "tape" ? "font-mono" : ""} style={{ fontSize: "3.6cqw", letterSpacing: ur ? 0 : "0.25em", textTransform: ur ? "none" : "uppercase", color: t.accent, textShadow: glow }}>
          {content.headline}
        </p>
        <h2
          style={{
            fontFamily: gold ? "var(--nf-script), cursive" : head,
            ...(gold ? { backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", paddingBottom: "1cqw" } : {}),
            fontSize: gold ? (names.length > 22 ? "11cqw" : "15cqw") : names.length > 22 ? "9cqw" : content.bismillah ? "10.5cqw" : "12cqw",
            lineHeight: ur ? 1.8 : 1.05,
            fontWeight: gold ? 400 : 600,
            fontStyle: t.headingFont === "script" && !ur && !gold ? "italic" : "normal",
            overflowWrap: "anywhere",
          }}
        >
          {names}
        </h2>
        <div style={{ width: "18cqw", height: 1, background: t.accent }} />
        <p style={{ fontSize: "5cqw", color: t.accent, fontFamily: head, lineHeight: ur ? 1.8 : 1.2 }}>{eventsTitle(content)}</p>
        <p style={{ fontSize: "3.8cqw", lineHeight: 1.6, color: t.muted, maxWidth: "70cqw" }}>{content.message}</p>
        <div style={{ fontSize: "4cqw", lineHeight: 1.6, marginTop: "2cqw" }}>
          <p style={{ fontWeight: 700 }}>{eventsDateText(content, ur ? "ur-PK" : "en-GB")}</p>
          {single && e.time && <p>{formatEventTime(e.time)}</p>}
          {single && e.venue && <p style={{ color: t.muted }}>{e.venue}</p>}
        </div>
      </div>
    </div>
  );
}
