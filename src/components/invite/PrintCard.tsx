import type { CSSProperties } from "react";
import type { CategoryId, Template } from "@/lib/templates";
import { BISMILLAH, defaultContent, formatEventTime, type InviteContent } from "@/lib/content";
import { PrintArt } from "./PrintArt";

const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";
const SCRIPT = "var(--nf-script), cursive";
const SERIF = "var(--nf-display), Georgia, serif";

/* ---------- colour helpers: keep small text readable on the panels ---------- */

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const toHex = (c: number[]) => `#${c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
/** The same hue, darkened (or lightened on a dark background) until it reaches 4.5:1 against `bg`. */
export function readable(color: string, bg: string, min = 4.5) {
  const towards = lum(bg) > 0.4 ? 0 : 255;
  let c = rgb(color);
  for (let i = 0; i < 20 && contrast(toHex(c), bg) < min; i++) c = c.map((v) => v + (towards - v) * 0.12);
  return toHex(c);
}
/** White or near-black lettering, whichever reads better on `bg`. */
export const onColor = (bg: string) => (contrast("#ffffff", bg) >= contrast("#1d1d1d", bg) ? "#ffffff" : "#1d1d1d");

/* ---------- the words, laid out like the printed card ---------- */

const EYEBROW: Partial<Record<CategoryId, [string, string]>> = {
  birthday: ["You're invited to the", "آپ کو دعوت ہے"],
  aqiqah: ["With the blessings of Allah, we invite you to the", "اللہ کے فضل و کرم سے آپ کو مدعو کیا جاتا ہے"],
  engagement: ["Please join us to celebrate the", "آپ کو دلی دعوت ہے"],
  nikkah: ["With the blessings of Allah, we invite you to the", "اللہ کے فضل و کرم سے آپ کو مدعو کیا جاتا ہے"],
};
const CONNECT: Partial<Record<CategoryId, [string, string]>> = {
  birthday: ["of", ""],
  aqiqah: ["of our beloved", "ہمارے پیارے"],
  engagement: ["of", ""],
  nikkah: ["of", ""],
};

/** "Birthday Celebration" -> ["Birthday", "Celebration"]: the last word goes underneath in small capitals, like the cards. */
function splitTitle(title: string): [string, string] {
  const m = /^(.+?)\s+(celebration|party|ceremony)$/i.exec(title.trim());
  return m ? [m[1], m[2]] : [title, ""];
}

export function PrintText({ template, content, className = "", style }: { template: Template; content: InviteContent; className?: string; style?: CSSProperties }) {
  const p = template.print!;
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const ev = [...content.events].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const d = ev ? new Date(`${ev.date}T00:00:00`) : null;
  const valid = d && !Number.isNaN(d.getTime());
  const [title, sub] = splitTitle(ev?.title || "");
  // the big gold number of a first-birthday card: from the event title ("2nd Birthday"), else the design's own
  const age = /(\d{1,3})/.exec(ev?.title ?? "")?.[1] ?? (p.art === "pehli" ? "1" : undefined);
  // the customer's own line above the names wins; the sample wording is swapped for the card's own phrasing
  const edited = content.headline && content.headline !== defaultContent(template.category, content.language).headline;
  const eyebrow = (edited ? content.headline : EYEBROW[template.category]?.[ur ? 1 : 0]) ?? content.headline;
  const connect = CONNECT[template.category]?.[ur ? 1 : 0] ?? "";
  const titleFont = ur ? "var(--nf-urdu), serif" : p.titleFont === "serif" ? SERIF : SCRIPT;
  const nameFont = ur ? "var(--nf-urdu), serif" : SCRIPT;
  const caps: CSSProperties = { fontFamily: ur ? "var(--nf-urdu), serif" : CAPS, color: p.caps, letterSpacing: ur ? 0 : "0.22em", textTransform: ur ? "none" : "uppercase" };
  const long = (content.host1 + content.host2).length > 22;
  const photo = p.photo && content.coverPhoto;
  const rule = <span aria-hidden className="block self-stretch" style={{ width: 1, background: p.caps, opacity: 0.5 }} />;

  return (
    // "safe center": when a long invitation is taller than the clear space it runs on downwards, never up into the artwork
    <div data-print-text dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} className={`flex flex-col items-center justify-[safe_center] text-center ${className}`}
      style={{ color: p.body, fontVariantNumeric: "lining-nums", fontFamily: ur ? "var(--nf-urdu), serif" : SERIF, ...style }}>
      {/* --print-fit shrinks the words when a short screen has less room than the card (set by InviteExperience) */}
      <div className="flex flex-col items-center" style={{ gap: "1.1cqw", zoom: "var(--print-fit, 1)" }}>
      {template.category === "aqiqah" && content.family1 && <p style={{ ...caps, fontSize: "3cqw", fontWeight: 600 }}>{content.family1}</p>}
      {content.bismillah && (
        <p lang="ar" dir="rtl" style={{ fontFamily: "var(--nf-naskh), serif", color: p.title, lineHeight: 1.6, whiteSpace: "nowrap", fontSize: p.art === "teddy" ? "7.6cqw" : "5.6cqw" }}>{BISMILLAH}</p>
      )}
      <p style={{ ...caps, fontSize: "2.9cqw", lineHeight: 1.5, maxWidth: "62cqw" }}>{eyebrow}</p>
      <div style={{ lineHeight: 1 }}>
        <p style={{ fontFamily: titleFont, color: p.title, fontSize: p.titleFont === "serif" ? "9cqw" : title.length > 12 ? "12cqw" : "16cqw", lineHeight: ur ? 1.6 : 1.05, letterSpacing: p.titleFont === "serif" ? "0.12em" : 0, textTransform: p.titleFont === "serif" && !ur ? "uppercase" : "none" }}>{title}</p>
        {sub && <p style={{ ...caps, fontSize: "3.4cqw", marginTop: "1.2cqw", letterSpacing: "0.35em", color: p.title }}>{sub}</p>}
      </div>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage
        <img src={content.coverPhoto} alt="" className="rounded-full object-cover" style={{ width: "30cqw", height: "30cqw", border: `1cqw solid #fff`, boxShadow: `0 0 0 0.5cqw ${p.title}, 0 1.5cqw 3cqw rgba(0,0,0,.15)` }} />
      )}
      {connect && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3.6cqw", color: p.caps }}>{connect}</p>}
      <p style={{ fontFamily: nameFont, color: p.title, fontSize: long ? "10cqw" : "13cqw", lineHeight: ur ? 1.6 : 1.1, overflowWrap: "anywhere" }}>
        {content.host1}
        {/* short pairs share a line ("Ayesha & Hamza"); longer ones stack */}
        {content.host2 && ((content.host1 + content.host2).length <= 14
          ? <> <span style={{ fontSize: "0.6em" }}>&amp;</span> {content.host2}</>
          : <><span className="block" style={{ fontSize: "0.55em", lineHeight: 1.3 }}>&amp;</span>{content.host2}</>)}
      </p>
      {p.art === "pehli" && age && (
        <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "26cqw", lineHeight: 0.9, flexShrink: 0, backgroundImage: "linear-gradient(180deg, #f6dd9a, #d0a54a 55%, #a87d2c)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{age}</p>
      )}
      {content.message && <p style={{ fontSize: "3.1cqw", lineHeight: 1.45, maxWidth: "64cqw", fontStyle: "italic" }}>{content.message}</p>}
      {valid && (
        <div className="flex flex-col items-center" style={{ marginTop: "1cqw", gap: "0.8cqw" }}>
          <p style={{ ...caps, fontSize: "3cqw" }}>{d.toLocaleDateString(loc, { month: "long" })}</p>
          <div className="flex items-center" style={{ gap: "3cqw" }}>
            <p style={{ ...caps, fontSize: "2.8cqw", minWidth: "18cqw" }}>{d.toLocaleDateString(loc, { weekday: "long" })}</p>
            {rule}
            <p style={{ fontFamily: SERIF, fontSize: "9cqw", lineHeight: 1, color: p.title }}>{d.getDate()}</p>
            {rule}
            <p style={{ ...caps, fontSize: "2.8cqw", minWidth: "18cqw" }}>{ev.time ? `${ur ? "" : "At "}${formatEventTime(ev.time)}` : ""}</p>
          </div>
          <p style={{ ...caps, fontSize: "3cqw" }}>{d.getFullYear()}</p>
        </div>
      )}
      {ev?.venue && <p style={{ ...caps, fontSize: "3cqw", fontWeight: 600, maxWidth: "66cqw" }}>{ev.venue}</p>}
      {ev?.address && <p style={{ fontSize: "2.9cqw", maxWidth: "62cqw", lineHeight: 1.4 }}>{ev.address}</p>}
      </div>
    </div>
  );
}

/** Where the words go: the design's clear space, never less than its width-based minimums. `top`/`bottom` add to the edges (a phone's notch and bar). */
export function printBox(p: NonNullable<Template["print"]>, top = "0px", bottom = "0px"): CSSProperties {
  const edge = (pct: number, w: number | undefined, extra: string) => `max(${pct}%, ${w ?? 0}cqw, ${extra})`;
  return { top: edge(p.box.top, p.box.topW, top), bottom: edge(p.box.bottom, p.box.bottomW, bottom), left: `${p.box.x}%`, right: `${p.box.x}%` };
}

/** The printed card at 9:16: artwork with the words in its clear space. Used for thumbnails, the editor and the gallery. */
export function PrintCard({ template, content }: { template: Template; content: InviteContent }) {
  const p = template.print!;
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "9 / 16", containerType: "inline-size" }}>
      <PrintArt art={p.art} />
      <PrintText template={template} content={content} className="absolute" style={printBox(p)} />
    </div>
  );
}
