import type { CSSProperties } from "react";
import type { Template } from "@/lib/templates";
import { BISMILLAH, eventsDateText, eventsTitle, formatEventTime, type InviteContent } from "@/lib/content";
import { Ornament, isTallOrnament } from "./Ornament";
import { PrintCard } from "./PrintCard";
import { FlowCard } from "./FlowInvite";

/** Soft pink, violet and amber: the colours of the night-glow look. */
export const AURORA_TEXT = "linear-gradient(100deg, #FFD1E8 0%, #C9B8FF 35%, #FFFFFF 50%, #C9B8FF 65%, #FFE0B0 100%)";

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
        backgroundSize: art.zoom ? `${art.zoom * 100}% auto` : "cover",
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
  if (template.concept === "print" && template.print) return <PrintCard template={template} content={content} />;
  if (template.flow) return <FlowCard template={template} content={content} />;
  const t = template.theme;
  const ur = content.language === "ur";
  const e = content.events[0];
  const single = content.events.length === 1;
  const tall = isTallOrnament(t.ornament);
  // soft halo so text stays readable where it overlaps real artwork
  // a customer cover photo takes the place of the template artwork (or the tape backdrop)
  const art = content.coverPhoto && !template.concept ? { src: content.coverPhoto, position: "50% 30%", zoom: 0, credit: "" } : template.art;
  const backdrop = content.coverPhoto || template.backdrop?.src;
  const glow = art ? `0 0 6px ${t.bg}, 0 0 14px ${t.bg}, 0 0 22px ${t.bg}` : undefined;
  const gold = template.concept === "tape" && !ur; // gold script lettering, like a home-video title card
  // royal: gold-foil italic serif; ivory: gold-brown engraved capitals (the same lettering as the full invitation)
  const foilNames: CSSProperties | null = ur ? null
    : template.concept === "royal" ? { fontFamily: "var(--nf-display), Georgia, serif", fontStyle: "italic", fontWeight: 700, backgroundImage: GOLD, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
    : template.concept === "ivory" ? { fontFamily: "var(--nf-caps), var(--nf-display), serif", fontWeight: 500, letterSpacing: "0.08em", backgroundImage: "linear-gradient(180deg, #9a6b3c, #6b3d22)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
    : template.concept === "editorial" ? { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400, letterSpacing: "-0.01em" }
    : template.concept === "aurora" ? { fontFamily: "var(--nf-sans), system-ui", fontWeight: 300, letterSpacing: "-0.02em", backgroundImage: AURORA_TEXT, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
    : template.concept === "monogram" ? { fontFamily: "var(--nf-display), Georgia, serif", fontWeight: 400, fontStyle: "italic" }
    : template.concept === "embossed" ? { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: t.accent }
    : template.concept === "garden" ? { fontFamily: "var(--nf-script), cursive", fontWeight: 400, color: "#5F7466" }
    : null;
  const names = content.host2 ? `${content.host1} & ${content.host2}` : content.host1;
  const style: CSSProperties = {
    background: clear
      ? "linear-gradient(rgba(10,7,5,0.18), rgba(10,7,5,0.5))"
      // modern looks: a photo that fades into paper (Kahani), coloured light on night blue (Roshni), plain paper (Mohr)
      : template.concept === "editorial"
        ? `linear-gradient(rgba(245,241,234,0) 30%, ${t.bg} 58%)${backdrop ? `, url(${backdrop}) 50% 0 / 100% auto no-repeat` : ""}, ${t.bg}`
      : template.concept === "aurora"
        ? "radial-gradient(70% 45% at 15% 20%, #FF5FA266, transparent 70%), radial-gradient(70% 45% at 90% 55%, #7B61FF77, transparent 70%), radial-gradient(70% 40% at 35% 95%, #FFB34755, transparent 70%), #07060F"
      : template.concept === "monogram"
        ? `linear-gradient(170deg, ${t.bg}, ${t.bg2})`
      : template.concept === "embossed" || template.concept === "garden"
        ? `url(${template.backdrop?.src}) 50% 50% / cover no-repeat, ${t.bg}`
      : template.concept && backdrop
        ? `linear-gradient(${template.concept === "ivory" ? "rgba(251,246,238,0.55), rgba(251,246,238,0.85)" : template.concept === "royal" ? "rgba(42,10,14,0.45), rgba(42,10,14,0.8)" : "rgba(12,8,5,0.4), rgba(12,8,5,0.72)"}), url(${backdrop}) 50% 20% / cover no-repeat`
        : `linear-gradient(170deg, ${t.bg}, ${t.bg2})`,
    color: t.ink,
    containerType: "inline-size",
    aspectRatio: "9 / 16",
  };
  const body = ur ? "var(--nf-urdu), serif" : "var(--nf-sans), system-ui, sans-serif";
  const head = ur ? "var(--nf-urdu), serif" : HEADING[t.headingFont];

  return (
    <div className="relative w-full overflow-hidden" style={style} dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"}>
      {template.concept === "monogram" && <span aria-hidden className="pointer-events-none absolute inset-[4cqw] border" style={{ borderColor: `${t.accent}66` }} />}
      {!clear && !(template.concept && backdrop) && !(art && content.coverPhoto) && <Ornament
        kind={t.ornament}
        className={
          tall
            ? "absolute left-1/2 top-[3%] h-[94%] w-[88%] -translate-x-1/2 opacity-40"
            : "absolute left-1/2 top-[5%] w-[62%] -translate-x-1/2 opacity-30"
        }
      />}
      {art && <ArtHero art={art} bg={t.bg} />}
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
            ...(foilNames ?? {}),
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
