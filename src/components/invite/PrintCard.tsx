import type { CSSProperties } from "react";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import type { CategoryId, Template } from "@/lib/templates";
import { BISMILLAH, defaultContent, formatEventTime, type InviteContent } from "@/lib/content";
import { PrintArt } from "./PrintArt";
import { Number3D } from "./KidsArt";

const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";
const SCRIPT = "var(--nf-script), cursive";
const SERIF = "var(--nf-display), Georgia, serif";
/** the kids' designs: rounded, friendly type */
export const FUN = "var(--nf-fun), var(--nf-sans), system-ui, sans-serif";
export const ROUND = "var(--nf-round), var(--nf-sans), system-ui, sans-serif";

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
  birthday: ["You're invited to the", "Ø¢Ù¾ Ú©Ùˆ Ø¯Ø¹ÙˆØª ÛÛ’"],
  aqiqah: ["With the blessings of Allah, we invite you to the", "Ø§Ù„Ù„Û Ú©Û’ ÙØ¶Ù„ Ùˆ Ú©Ø±Ù… Ø³Û’ Ø¢Ù¾ Ú©Ùˆ Ù…Ø¯Ø¹Ùˆ Ú©ÛŒØ§ Ø¬Ø§ØªØ§ ÛÛ’"],
  engagement: ["Please join us to celebrate the", "Ø¢Ù¾ Ú©Ùˆ Ø¯Ù„ÛŒ Ø¯Ø¹ÙˆØª ÛÛ’"],
  nikkah: ["With the blessings of Allah, we invite you to the", "Ø§Ù„Ù„Û Ú©Û’ ÙØ¶Ù„ Ùˆ Ú©Ø±Ù… Ø³Û’ Ø¢Ù¾ Ú©Ùˆ Ù…Ø¯Ø¹Ùˆ Ú©ÛŒØ§ Ø¬Ø§ØªØ§ ÛÛ’"],
};
const CONNECT: Partial<Record<CategoryId, [string, string]>> = {
  birthday: ["of", ""],
  aqiqah: ["of our beloved", "ÛÙ…Ø§Ø±Û’ Ù¾ÛŒØ§Ø±Û’"],
  engagement: ["of", ""],
  nikkah: ["of", ""],
};

/** "Birthday Celebration" -> ["Birthday", "Celebration"]: the last word goes underneath in small capitals, like the cards. */
function splitTitle(title: string): [string, string] {
  const m = /^(.+?)\s+(celebration|party|ceremony)$/i.exec(title.trim());
  return m ? [m[1], m[2]] : [title, ""];
}

export function PrintText({ template, content, className = "", style }: { template: Template; content: InviteContent; className?: string; style?: CSSProperties }) {
  const raw = template.print!;
  // every colour is checked against the colour the words sit on, and darkened (or lightened) until it reads:
  // 4.5:1 throughout (the title colour also sets small words such as the time and the ribbon)
  const ground = raw.ground ?? (raw.dark ? "#1d1b16" : "#ffffff");
  const p = { ...raw, title: readable(raw.title, ground), caps: readable(raw.caps, ground), body: readable(raw.body, ground) };
  const kids = raw.fonts === "kids";
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const ev = [...content.events].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))[0];
  const d = ev ? new Date(`${ev.date}T00:00:00`) : null;
  const valid = d && !Number.isNaN(d.getTime());
  const [title, sub] = splitTitle(ev?.title || "");
  // the big age number: the age the customer typed, else one in the event title ("2nd Birthday"), else the design's sample
  const age = p.number ? (content.age || /(\d{1,3})/.exec(ev?.title ?? "")?.[1] || p.sampleAge) : undefined;
  // the customer's own line above the names wins; the sample wording is swapped for the card's own phrasing
  const edited = content.headline && content.headline !== defaultContent(template.category, content.language).headline;
  const eyebrow = (edited ? content.headline : EYEBROW[template.category]?.[ur ? 1 : 0]) ?? content.headline;
  const connect = CONNECT[template.category]?.[ur ? 1 : 0] ?? "";
  const titleFont = ur ? "var(--nf-urdu), serif" : kids ? FUN : p.titleFont === "serif" ? SERIF : SCRIPT;
  const nameFont = ur ? "var(--nf-urdu), serif" : kids ? FUN : SCRIPT;
  const caps: CSSProperties = ur ? { fontFamily: "var(--nf-urdu), serif", color: p.caps }
    : kids ? { fontFamily: ROUND, fontWeight: 800, color: p.caps, letterSpacing: "0.12em", textTransform: "uppercase" }
    : { fontFamily: CAPS, color: p.caps, letterSpacing: "0.22em", textTransform: "uppercase" };
  const long = (content.host1 + content.host2).length > 22;
  const photo = p.photo && content.coverPhoto;
  const rule = <span aria-hidden className="block self-stretch" style={{ width: 1, background: p.caps, opacity: 0.5 }} />;

  /* the title: script or engraved capitals; the small word under it plain, or on a ribbon; or a chunky outlined toy title */
  const titleEl = p.titleDeco === "outline" && !ur ? (
    <p style={{ fontFamily: FUN, fontWeight: 700, fontSize: title.length > 12 ? "10cqw" : "13cqw", lineHeight: 0.95, color: "#fff", WebkitTextStroke: `0.9cqw ${p.title}`, paintOrder: "stroke fill", textShadow: `0.8cqw 0.9cqw 0 ${p.title}`, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
      {title}{sub && <span className="block" style={{ fontSize: "0.55em", color: "#ffd23f" }}>{sub}!</span>}
    </p>
  ) : (
    <div style={{ lineHeight: 1 }}>
      <p style={{ fontFamily: titleFont, fontWeight: kids ? 700 : undefined, color: p.title, fontSize: kids ? (title.length > 12 ? "10cqw" : "13cqw") : p.titleFont === "serif" ? "9cqw" : title.length > 12 ? "12cqw" : "16cqw", lineHeight: ur ? 1.6 : 1.05, letterSpacing: p.titleFont === "serif" ? "0.12em" : 0, textTransform: p.titleFont === "serif" && !ur ? "uppercase" : "none", textShadow: p.dark ? `0 0 3cqw ${p.title}66` : undefined }}>{title}</p>
      {sub && (p.titleDeco === "ribbon"
        ? <p className="mx-auto mt-[1.4cqw] w-fit" style={{ ...caps, fontSize: "3.2cqw", letterSpacing: "0.3em", color: "#fff", background: p.title, padding: "1cqw 6cqw", clipPath: "polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%)" }}>{sub}</p>
        : <p style={{ ...caps, fontSize: "3.4cqw", marginTop: "1.2cqw", letterSpacing: "0.35em", color: p.title }}>{sub}</p>)}
    </div>
  );

  const namesEl = (
    <p style={{ fontFamily: nameFont, fontWeight: kids ? 700 : undefined, color: p.title, fontSize: p.namesFirst ? (long ? "11cqw" : "15cqw") : long ? "10cqw" : "13cqw", lineHeight: ur ? 1.6 : 1.1, overflowWrap: "anywhere" }}>
      {content.host1}
      {/* short pairs share a line ("Ayesha & Hamza"); longer ones stack */}
      {content.host2 && ((content.host1 + content.host2).length <= 14
        ? <> <span style={{ fontSize: "0.6em" }}>&amp;</span> {content.host2}</>
        : <><span className="block" style={{ fontSize: "0.55em", lineHeight: 1.3 }}>&amp;</span>{content.host2}</>)}
    </p>
  );

  /* the date, in the design's own style */
  const dateKind = p.date ?? "bars";
  const time = ev?.time ? formatEventTime(ev.time) : "";
  const weekday = d ? d.toLocaleDateString(loc, { weekday: "long" }) : "";
  const month = d ? d.toLocaleDateString(loc, { month: "long" }) : "";
  const iconDisc = (Icon: typeof CalendarDays) => (
    <span className="grid place-items-center rounded-full" style={{ width: "7cqw", height: "7cqw", background: p.dark ? "#ffffff22" : `${p.title}1f`, color: p.title }}><Icon style={{ width: "3.6cqw", height: "3.6cqw" }} aria-hidden /></span>
  );
  const dateEl = () => {
    if (!d) return null;
    const day = d.getDate();
    switch (dateKind) {
      case "list":
        return (
          <div className="flex flex-col items-center" style={{ gap: "1.4cqw", marginTop: "1cqw" }}>
            {[[ur ? "وقت" : "Time", time], [ur ? "تاریخ" : "Date", `${weekday}, ${day} ${month} ${d.getFullYear()}`], [ur ? "مقام" : "Venue", ev?.venue ?? ""]].filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <p style={{ ...caps, fontSize: "3cqw", color: p.title }}>♦ {k} ♦</p>
                <p style={{ fontSize: "3.3cqw", fontWeight: 600 }}>{v}</p>
              </div>
            ))}
          </div>
        );
      case "icons":
        return (
          <div className="grid grid-cols-3" style={{ gap: "2cqw", marginTop: "1.5cqw", width: "70cqw" }}>
            {([[CalendarDays, `${day} ${month.slice(0, 3)}`], [Clock, time || weekday], [MapPin, ev?.venue || weekday]] as const).map(([Icon, v], i) => (
              <div key={i} className="flex flex-col items-center" style={{ gap: "1cqw" }}>{iconDisc(Icon)}<p style={{ fontSize: "3cqw", lineHeight: 1.25, fontWeight: 600 }}>{v}</p></div>
            ))}
          </div>
        );
      case "columns":
        return (
          <div className="flex items-stretch" style={{ gap: "3cqw", marginTop: "1.5cqw" }}>
            <div><p style={{ ...caps, fontSize: "3cqw" }}>{weekday}</p><p style={{ fontFamily: SERIF, fontSize: "8cqw", lineHeight: 1, color: p.title }}>{day}</p><p style={{ ...caps, fontSize: "3cqw" }}>{month} {d.getFullYear()}</p></div>
            {rule}
            <div className="flex flex-col justify-center"><p style={{ ...caps, fontSize: "3cqw" }}>{ur ? "وقت" : "At"}</p><p style={{ fontSize: "4cqw", fontWeight: 700, color: p.title }}>{time}</p></div>
          </div>
        );
      case "badge":
        return (
          <div className="flex flex-col items-center" style={{ gap: "1.2cqw", marginTop: "1.5cqw" }}>
            {/* a ringed medallion; Pari's is a filled, glowing sweet */}
            <div className="grid place-items-center rounded-full text-center" style={p.art === "pari"
              ? { width: "24cqw", height: "24cqw", background: `radial-gradient(circle at 35% 30%, #ffd1e4, ${p.title} 70%)`, color: "#fff", boxShadow: `0 0 0 1cqw #ffffffaa, 0 1.5cqw 4cqw ${p.title}66` }
              : { width: "24cqw", height: "24cqw", border: `0.6cqw double ${p.title}`, background: p.dark ? "#ffffff14" : "#ffffffaa", color: p.title }}>
              <div>
                <p style={{ ...caps, fontSize: "3cqw", color: "inherit" }}>{month.slice(0, 3)}</p>
                <p style={{ fontFamily: SERIF, fontSize: "9cqw", lineHeight: 0.95, fontWeight: 600 }}>{day}</p>
                <p style={{ ...caps, fontSize: "3cqw", color: "inherit" }}>{d.getFullYear()}</p>
              </div>
            </div>
            <p style={{ ...caps, fontSize: "3cqw" }}>{weekday}{time && ` · ${time}`}</p>
          </div>
        );
      case "stamp":
        return (
          <div style={{ marginTop: "1.5cqw" }}>
            <p style={{ fontFamily: SERIF, fontSize: "9cqw", lineHeight: 1, color: p.title, letterSpacing: "0.05em" }}>{String(day).padStart(2, "0")}<span style={{ opacity: 0.5 }}> · </span>{String(d.getMonth() + 1).padStart(2, "0")}<span style={{ opacity: 0.5 }}> · </span>{String(d.getFullYear()).slice(2)}</p>
            <p style={{ ...caps, fontSize: "3cqw", marginTop: "1cqw" }}>{weekday}{time && ` · ${time}`}</p>
          </div>
        );
      case "chips":
        return (
          <div className="flex flex-wrap justify-center" style={{ gap: "1.6cqw", marginTop: "1.5cqw", maxWidth: "78cqw" }}>
            {([[CalendarDays, `${weekday.slice(0, 3)} ${day} ${month.slice(0, 3)}`], [Clock, time], [MapPin, ev?.venue ?? ""]] as const).filter(([, v]) => v).map(([Icon, v], i) => (
              <span key={i} className="inline-flex items-center rounded-full font-semibold" style={{ gap: "1.2cqw", padding: "1.2cqw 3cqw", fontSize: "3cqw", background: p.dark ? "#ffffff1f" : "#ffffffd9", color: p.dark ? "#fff" : p.title, boxShadow: p.dark ? `0 0 0 0.3cqw ${p.title}66` : `0.5cqw 0.6cqw 0 ${p.title}55`, fontFamily: kids ? ROUND : "var(--nf-sans), system-ui" }}>
                <Icon style={{ width: "3.4cqw", height: "3.4cqw" }} aria-hidden />{v}
              </span>
            ))}
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center" style={{ marginTop: "1cqw", gap: "0.8cqw" }}>
            <p style={{ ...caps, fontSize: "3cqw" }}>{month}</p>
            <div className="flex items-center" style={{ gap: "3cqw" }}>
              <p style={{ ...caps, fontSize: "3cqw", minWidth: "18cqw" }}>{weekday}</p>
              {rule}
              <p style={{ fontFamily: SERIF, fontSize: "9cqw", lineHeight: 1, color: p.title }}>{day}</p>
              {rule}
              <p style={{ ...caps, fontSize: "3cqw", minWidth: "18cqw" }}>{time ? `${ur ? "" : "At "}${time}` : ""}</p>
            </div>
            <p style={{ ...caps, fontSize: "3cqw" }}>{d.getFullYear()}</p>
          </div>
        );
    }
  };

  return (
    // "safe center": when a long invitation is taller than the clear space it runs on downwards, never up into the artwork
    <div data-print-text dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} className={`flex flex-col items-center justify-[safe_center] text-center ${className}`}
      style={{ color: p.body, fontVariantNumeric: "lining-nums", fontFamily: ur ? "var(--nf-urdu), serif" : kids ? ROUND : SERIF, ...style }}>
      {/* --print-fit shrinks the words when a short screen has less room than the card (set by InviteExperience) */}
      <div className="flex flex-col items-center" style={{ gap: "1.1cqw", zoom: "var(--print-fit, 1)" }}>
      {template.category === "aqiqah" && content.family1 && <p style={{ ...caps, fontSize: "3cqw", fontWeight: 600 }}>{content.family1}</p>}
      {content.bismillah && (
        <p lang="ar" dir="rtl" style={{ fontFamily: "var(--nf-naskh), serif", color: p.title, lineHeight: 1.6, whiteSpace: "nowrap", fontSize: p.art === "teddy" ? "7.6cqw" : "5.6cqw" }}>{BISMILLAH}</p>
      )}
      <p style={{ ...caps, fontSize: "3cqw", lineHeight: 1.5, maxWidth: "62cqw" }}>{p.namesFirst ? (ur ? "آپ مدعو ہیں" : "You're invited to") : eyebrow}</p>
      {p.namesFirst && namesEl}
      {titleEl}
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage
        <img src={content.coverPhoto} alt="" className="rounded-full object-cover" style={{ width: "30cqw", height: "30cqw", border: `1cqw solid #fff`, boxShadow: `0 0 0 0.5cqw ${p.title}, 0 1.5cqw 3cqw rgba(0,0,0,.15)` }} />
      )}
      {!p.namesFirst && connect && <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: "3.6cqw", color: p.caps }}>{connect}</p>}
      {!p.namesFirst && namesEl}
      {p.number === "3d" && age && (
        <Number3D value={age} size={age.length > 1 ? 19 : 24} face={p.dark ? "linear-gradient(180deg, #fff4c2, #ffd36e 45%, #f2a93b)" : "linear-gradient(180deg, #ffd1e4, #ff6fa8 50%, #e8457f)"} edge={p.dark ? "#a8661c" : "#a92a5c"} />
      )}
      {p.number === "gold" && age && (
        <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "26cqw", lineHeight: 0.9, flexShrink: 0, backgroundImage: "linear-gradient(180deg, #f6dd9a, #d0a54a 55%, #a87d2c)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{age}</p>
      )}
      {content.message && <p style={{ fontSize: "3.3cqw", lineHeight: 1.45, maxWidth: "64cqw", fontStyle: "italic" }}>{content.message}</p>}
      {valid && dateEl()}
      {/* the list and chips styles carry the venue themselves */}
      {ev?.venue && dateKind !== "list" && dateKind !== "chips" && <p style={{ ...caps, fontSize: "3cqw", fontWeight: 600, maxWidth: "66cqw" }}>{ev.venue}</p>}
      {ev?.address && <p style={{ fontSize: "3cqw", maxWidth: "62cqw", lineHeight: 1.4 }}>{ev.address}</p>}
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
