"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { CalendarPlus, ChevronDown, MapPin, Music, VolumeX } from "lucide-react";
import { BISMILLAH, downloadIcs, formatEventDate, formatEventTime, mapLink, type InviteContent, type InviteEvent } from "@/lib/content";
import { burst } from "@/lib/tapFx";
import type { Template } from "@/lib/templates";
import { Families } from "./Families";
import { Rsvp } from "./Rsvp";
import { Blossom, Rose } from "./PrintArt";
import { Chandelier, Damask, Divider, GardenArch, InitialSeal, MoorishArch, MosqueSketch, PalaceGate, RoseCluster, TornEdge } from "./FlowArt";

/*
 * The flowing-page designs: an envelope the guest opens, then one long illustrated page (no screens to snap
 * between) where each part fades up as it scrolls into view. Two skins share the structure and differ in
 * everything a guest sees: Hadiqa (rose garden, swans, maroon wax) and Ambar (ivory damask, gold Bismillah, olive).
 */

type Skin = NonNullable<Template["flow"]>;

/** Each skin's colours. `goldText` is the darker gold for small words (4.5:1 on the paper); `gold` is for big script. */
const SKINS: Record<Skin, {
  paper: string; paper2: string; ink: string; gold: string; goldText: string; button: string; onButton: string; petals: string[];
}> = {
  hadiqa: { paper: "#FBF4E8", paper2: "#F4EAD8", ink: "#5B4A36", gold: "#9A7643", goldText: "#7D5F33", button: "#6E1E2A", onButton: "#FBF4E8", petals: ["#f4c9a8", "#fbe3d0", "#ffffff", "#d9946d"] },
  ambar: { paper: "#F8F0E3", paper2: "#F3E3CC", ink: "#5A4630", gold: "#9A7438", goldText: "#74552A", button: "#5F6B3A", onButton: "#FFFFFF", petals: ["#d9b46a", "#f3e2b8", "#ffffff"] },
};

const SCRIPT = "var(--nf-script), cursive";
const SERIF = "var(--nf-display), Georgia, serif";
const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";

/** Live countdown to the next event, down to the second: "52 : 11 : 36 : 08". */
function Ticker({ events, ur, color, label }: { events: InviteEvent[]; ur: boolean; color: string; label: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const first = setTimeout(() => setNow(Date.now()), 0);
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearTimeout(first); clearInterval(i); };
  }, []);
  if (now === null) return null;
  const at = (e: InviteEvent) => new Date(`${e.date}T${e.time || "00:00"}:00`).getTime();
  const next = events.filter((e) => at(e) > now).sort((a, b) => at(a) - at(b))[0];
  if (!next) return null;
  const s = Math.floor((at(next) - now) / 1000);
  const parts = [Math.floor(s / 86400), Math.floor(s / 3600) % 24, Math.floor(s / 60) % 60, s % 60];
  const names = ur ? ["دن", "گھنٹے", "منٹ", "سیکنڈ"] : ["Days", "Hours", "Minutes", "Seconds"];
  return (
    <div role="timer" aria-label={`${parts[0]} days ${parts[1]} hours ${parts[2]} minutes until ${next.title}`}>
      <p className="text-[13px] uppercase tracking-[0.3em]" style={{ fontFamily: CAPS, color }}>{label}</p>
      <div aria-hidden className="mt-3 flex items-start justify-center gap-1.5 tabular-nums" dir="ltr">
        {parts.map((v, i) => (
          <div key={i} className="flex items-start gap-1.5">
            <div className="w-[4.2rem] text-center">
              <p className="text-[2.6rem] leading-none" style={{ fontFamily: SERIF }}>{String(v).padStart(2, "0")}</p>
              <p className="mt-1.5 text-[12px]" style={{ color }}>{names[i]}</p>
            </div>
            {i < 3 && <span className="text-3xl leading-none opacity-60" style={{ fontFamily: SERIF }}>:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** A section heading in the skin's gold script. */
function Title({ children, gold, className = "" }: { children: ReactNode; gold: string; className?: string }) {
  return <h2 className={`text-[2.6rem] leading-tight ${className}`} style={{ fontFamily: SCRIPT, color: gold }}>{children}</h2>;
}

/** An illustrated map card (no live map: nothing from Google loads until the guest asks for directions). */
function MapCard({ e, gold, ink, paper, ur }: { e: InviteEvent; gold: string; ink: string; paper: string; ur: boolean }) {
  const href = mapLink(e);
  return (
    <div className="relative mx-auto mt-6 w-full max-w-[19rem] rounded-[1.4rem] p-2" style={{ background: paper, boxShadow: `0 0 0 1px ${gold}, 0 0 0 5px ${paper}, 0 0 0 6px ${gold}55, 0 14px 30px rgba(80,55,25,.18)` }}>
      <div aria-hidden className="relative h-36 overflow-hidden rounded-[1rem]" style={{ background: "#efe6d4" }}>
        <svg viewBox="0 0 300 150" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <path d="M-10 110C60 96 110 120 170 92S270 60 320 70" stroke="#fff" strokeWidth="12" fill="none" />
          <path d="M-10 110C60 96 110 120 170 92S270 60 320 70" stroke="#d9cbb0" strokeWidth="1" fill="none" />
          <path d="M120 -10L150 160M30 -10C50 50 40 100 70 160M230 -10C210 40 250 110 240 160" stroke="#fbf6ec" strokeWidth="6" fill="none" />
          <path d="M0 40H300M0 132H300" stroke="#fbf6ec" strokeWidth="3" />
          <circle cx="200" cy="34" r="16" fill="#d8e0c8" /><rect x="40" y="62" width="40" height="22" rx="4" fill="#e3d8c2" />
        </svg>
        <MapPin className="absolute left-1/2 top-[38%] size-9 -translate-x-1/2 -translate-y-1/2 drop-shadow" style={{ color: "#b3261e", fill: "#e8a29b" }} />
      </div>
      {href && (
        <a href={href} target="_blank" rel="noopener noreferrer" className="press mt-2 flex min-h-11 items-center justify-center gap-2 rounded-[0.9rem] text-sm font-semibold" style={{ color: ink, background: `${gold}22` }}>
          <MapPin className="size-4" aria-hidden />{ur ? "نقشے میں کھولیں" : "Open in Google Maps"}
        </a>
      )}
    </div>
  );
}

export type FlowProps = {
  skin: Skin;
  content: InviteContent;
  /** the guest's events, in date order */
  ordered: InviteEvent[];
  names: string;
  /** "Dear Sana," from a personal link, else "" */
  hello: string;
  guest: string;
  seats: number | null;
  opened: boolean;
  gone: boolean;
  onOpen: () => void;
  scroller: RefObject<HTMLDivElement | null>;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  rsvp: { inviteId?: string; demo: boolean; showNote: boolean; guestId: string | null; events: { i: number; title: string }[] };
  allEvents: InviteEvent[];
  song?: { node: ReactNode; off: boolean; toggle: () => void };
};

export function FlowInvite({ skin, content, ordered, names, hello, guest, seats, opened, gone, onOpen, scroller, onScroll, rsvp, allEvents, song }: FlowProps) {
  const S = SKINS[skin];
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const font = ur ? "var(--nf-urdu), serif" : SERIF;
  const couple = !!content.host2;
  const first = ordered[0];
  const initials = [content.host1, content.host2].filter(Boolean).map((n) => n.trim()[0]?.toUpperCase() ?? "").join("&");
  const shortDate = first ? first.date.slice(2).split("-").reverse().join(".") : ""; // 2026-09-27 -> 27.09.26
  const hasDress = ordered.some((e) => e.dressCode);
  const timeline = content.timeline.length
    ? content.timeline.map((it) => ({ time: it.time, title: it.title, note: it.note }))
    : ordered.filter((e) => e.time).map((e) => ({ time: e.time, title: e.title, note: ordered.length > 1 ? formatEventDate(e.date, loc) : "" }));
  const [rsvpOpen, setRsvpOpen] = useState(false);

  // each part fades up the first time it scrolls into view
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = scroller.current;
    if (!root || !page.current) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).dataset.in = "1"; io.unobserve(e.target); }
    }, { root, rootMargin: "0px 0px -8% 0px" });
    page.current.querySelectorAll(".flow-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [scroller, content]);

  const onTap = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("a,button,summary,input,textarea,select,label")) return;
    if (gone) burst(skin === "hadiqa" ? "petals" : "glitter", e.clientX, e.clientY, S.petals);
  };

  const ink: CSSProperties = { color: S.ink };
  const body = "text-[17px] leading-relaxed";
  const ghostBtn = "press inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold";

  /* ---------- the opening: an envelope ---------- */
  const envelope = skin === "hadiqa" ? (
    // cream embossed envelope folded in four, the couple's initials in maroon wax; the flaps part on a golden light
    <div data-open={opened} className="flow-env fenv-hadiqa absolute inset-0 z-20 overflow-hidden" style={{ background: "#efe5d3" }}>
      <div aria-hidden className="fenv-light absolute inset-0" style={{ background: "radial-gradient(40% 32% at 50% 50%, #fff8de, #f1cf86 45%, rgba(241,207,134,0) 75%)" }} />
      {(["t", "b", "l", "r"] as const).map((f) => (
        <div key={f} aria-hidden className={`fenv-flap fenv-${f} absolute inset-0`} style={{ filter: "drop-shadow(0 1px 1.5px rgba(110,80,40,.28))" }}>
          <div className="absolute inset-0 overflow-hidden" style={{
            clipPath: { t: "polygon(0 0,100% 0,50% 50%)", b: "polygon(0 100%,100% 100%,50% 50%)", l: "polygon(0 0,0 100%,50% 50%)", r: "polygon(100% 0,100% 100%,50% 50%)" }[f],
            background: { t: "#f6eee0", b: "#efe4d0", l: "#f2e8d7", r: "#f1e6d4" }[f],
          }}>
            {/* embossed roses: the flowers in the paper's own colour, lit from the top left */}
            <div className="absolute inset-0" style={{ filter: "drop-shadow(-1px -1px 0 rgba(255,255,255,.85)) drop-shadow(1px 1px 0 rgba(140,105,60,.22))" }}>
              {f === "t" && <><RoseCluster className="absolute left-[4%] top-[3%] w-[42%]" tone="emboss" /><RoseCluster className="absolute right-[4%] top-[5%] w-[40%] -scale-x-100" tone="emboss" /></>}
              {f === "b" && <><RoseCluster className="absolute bottom-[4%] left-[8%] w-[40%]" tone="emboss" /><RoseCluster className="absolute bottom-[3%] right-[6%] w-[42%] -scale-x-100" tone="emboss" /></>}
              {f === "l" && <RoseCluster className="absolute left-[2%] top-[40%] w-[30%] rotate-90" tone="emboss" />}
              {f === "r" && <RoseCluster className="absolute right-[2%] top-[42%] w-[30%] -rotate-90" tone="emboss" />}
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={onOpen} aria-label={ur ? "دعوت نامہ کھولیں" : "Open the invitation"}
        className="fenv-ui absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center outline-none">
        {hello && <span className="text-[2rem] leading-tight" style={{ fontFamily: ur ? font : SCRIPT, color: S.goldText }}>{hello}</span>}
        <InitialSeal initials={initials} wax="#7a1f2b" rim="#e9b9a4" ink="#f3cdb7" className="fenv-seal w-[min(34vw,8.5rem)] drop-shadow-[0_8px_14px_rgba(70,20,20,.35)]" />
        <span className="text-[12px] uppercase tracking-[0.35em]" style={{ fontFamily: CAPS, color: S.goldText }}>{ur ? "کھولنے کے لیے ٹیپ کریں" : "Tap to open"}</span>
      </button>
    </div>
  ) : (
    // ivory envelope, its flap embossed with a damask flourish and sealed in gold with the Bismillah
    <div data-open={opened} className="flow-env fenv-ambar absolute inset-0 z-20 overflow-hidden" style={{ background: "#efe4d2", perspective: "1200px" }}>
      <div aria-hidden className="fenv-body absolute inset-0">
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 18%,50% 64%,0 100%)", background: "#f3eadb" }} />
        <div className="absolute inset-0" style={{ clipPath: "polygon(100% 18%,50% 64%,100% 100%)", background: "#f1e6d5" }} />
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 100%,50% 58%,100% 100%)", background: "#f6eee1", filter: "drop-shadow(0 -1px 1px rgba(120,90,50,.2))" }} />
      </div>
      <div aria-hidden className="fenv-top absolute inset-x-0 top-0 h-[60%] origin-top" style={{ filter: "drop-shadow(0 3px 4px rgba(110,80,40,.25))" }}>
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0,100% 0,100% 30%,50% 100%,0 30%)", background: "linear-gradient(180deg,#faf4ea,#f2e8d8)" }}>
          <Damask color="#e4d5ba" className="absolute left-1/2 top-[4%] w-[78%] -translate-x-1/2" style={{ filter: "drop-shadow(-1px -1px 0 #fff) drop-shadow(1px 1px 0 rgba(150,115,65,.3))" }} />
        </div>
      </div>
      <button type="button" onClick={onOpen} aria-label={ur ? "دعوت نامہ کھولیں" : "Open the invitation"}
        className="fenv-ui absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 pt-[22%] text-center outline-none">
        {hello && <span className="text-[2rem] leading-tight" style={{ fontFamily: ur ? font : SCRIPT, color: S.goldText }}>{hello}</span>}
        <InitialSeal initials="بِسْمِ اللّٰه" wax="#c9a04e" rim="#fff1c4" ink="#7a5520" font="var(--nf-naskh), serif" size={9}
          className="fenv-seal w-[min(32vw,7.5rem)] drop-shadow-[0_8px_14px_rgba(110,80,30,.35)]" />
        <span className="text-lg italic" style={{ fontFamily: SERIF, color: S.goldText }}>{ur ? "کھولنے کے لیے ٹیپ کریں" : "Tap to open"}</span>
        <Divider color={S.gold} />
      </button>
    </div>
  );

  /* ---------- the page ---------- */
  const cover = skin === "hadiqa" ? (
    <section data-section="cover" className="relative h-[100cqh] min-h-[34rem] overflow-hidden">
      <GardenArch />
      <div className="relative flex h-full flex-col items-center px-10 pt-[17cqh] text-center">
        <p className="text-[2rem]" style={{ fontFamily: ur ? font : SCRIPT, color: S.goldText, textShadow: "0 1px 10px #fff8ea" }}>
          {ur ? first?.title : ordered.length > 1 ? "Wedding Day" : first?.title}
        </p>
        <p className="text-lg tracking-[0.2em]" style={{ fontFamily: SERIF, color: S.goldText }} dir="ltr">{shortDate}</p>
        <h1 className="mt-[5cqh] text-[min(17cqw,4.6rem)] leading-[1.05] [overflow-wrap:anywhere]" style={{ fontFamily: ur ? font : SCRIPT, color: S.gold, textShadow: "0 1px 0 #fff, 0 2px 14px #fff8ea" }}>
          {content.host1}{couple && <><span className="block text-[0.55em]">&amp;</span>{content.host2}</>}
        </h1>
        <p className="mt-[6cqh] flex flex-col items-center text-[13px]" style={{ fontFamily: SERIF, color: S.goldText }}>{ur ? "نیچے دیکھیں" : "Scroll down"}<ChevronDown className="scroll-nudge size-4" aria-hidden /></p>
      </div>
    </section>
  ) : (
    <section data-section="cover" className="relative min-h-[100cqh] overflow-hidden px-6 pb-10 pt-[calc(2.5rem+var(--frame-top,0px))] text-center">
      <div className="relative mx-auto max-w-[22rem] px-8 pb-10 pt-[5.5rem]">
        <MoorishArch className="absolute inset-0 size-full" color={S.gold} />
        {content.bismillah && <p lang="ar" dir="rtl" className="text-[1.7rem]" style={{ fontFamily: "var(--nf-naskh), serif", color: S.goldText, lineHeight: 1.9 }}>{BISMILLAH}</p>}
        <Divider color={S.gold} className="my-3" />
        <p className="text-[12px] uppercase tracking-[0.3em]" style={{ fontFamily: ur ? font : CAPS, color: S.goldText }}>{content.headline}</p>
        <h1 className="mt-4 text-[min(15cqw,4rem)] leading-[1.05] [overflow-wrap:anywhere]" style={{ fontFamily: ur ? font : SCRIPT, color: S.gold }}>
          {content.host1}{couple && <><span className="block text-[0.5em]">&amp;</span>{content.host2}</>}
        </h1>
        {first && (
          <>
            <p className="mt-5 text-xl" style={{ fontFamily: SERIF, ...ink }}>{formatEventDate(first.date, loc)}</p>
            {first.time && <p className="text-lg italic" style={{ fontFamily: SERIF, ...ink }}>{ur ? `${formatEventTime(first.time)} بجے سے` : `from ${formatEventTime(first.time)}`}</p>}
            {first.venue && <p className="mt-3 text-[13px] uppercase tracking-[0.25em]" style={{ fontFamily: CAPS, color: S.goldText }}>{first.venue}</p>}
          </>
        )}
        <Divider color={S.gold} className="mt-6" />
      </div>
      <p className="mt-6 flex flex-col items-center text-[13px]" style={{ fontFamily: SERIF, color: S.goldText }}>{ur ? "نیچے دیکھیں" : "Scroll down"}<ChevronDown className="scroll-nudge size-4" aria-hidden /></p>
    </section>
  );

  const message = (
    <section data-section="message" className="relative overflow-hidden px-7 pb-12 pt-10 text-center" style={{ background: S.paper }}>
      {skin === "hadiqa" && <><RoseCluster className="absolute -left-6 -top-4 w-40" tone="peach" /><RoseCluster className="absolute -right-6 -top-4 w-40 -scale-x-100" tone="cream" /></>}
      <div className="flow-reveal relative pt-8">
        {skin === "hadiqa" && content.bismillah && <p lang="ar" dir="rtl" className="text-[1.6rem]" style={{ fontFamily: "var(--nf-naskh), serif", color: S.goldText, lineHeight: 1.9 }}>{BISMILLAH}</p>}
        {skin === "hadiqa" && couple && !ur ? (
          <p className="mt-4 text-[2.1rem] leading-[1.25]" style={{ fontFamily: SCRIPT, color: S.gold }}>Two souls<br />One destiny<br />A lifetime written by Allah</p>
        ) : skin === "hadiqa" ? (
          <p className="mt-4 text-[2.1rem] leading-[1.25]" style={{ fontFamily: ur ? font : SCRIPT, color: S.gold }}>{content.headline}</p>
        ) : null}
        <p className="mt-6 text-[1.35rem]" style={{ fontFamily: ur ? font : SERIF, fontWeight: 600, ...ink }}>
          {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "عزیز دوستو اور اہلِ خانہ" : "Dear Friends and Family"}
        </p>
        <p className={`mx-auto mt-2 max-w-[22rem] ${body}`} style={{ fontFamily: font, ...ink }}>{content.message}</p>
        {seats && <p className="mt-3 text-[15px] italic" style={{ fontFamily: SERIF, color: S.goldText }}>{ur ? `${seats} مہمانوں کے لیے مدعو` : `We have saved ${seats === 1 ? "a place" : `${seats} places`} for you`}</p>}
        {(content.family1 || content.family2) && (
          <p className="mt-5 text-[15px]" style={{ fontFamily: SERIF, color: S.goldText }}>
            {[content.family1, content.family2].filter(Boolean).join(ur ? " اور " : " & ")}
          </p>
        )}
      </div>
    </section>
  );

  const countdown = (
    <section data-section="countdown" className="relative text-center" style={{ background: S.paper2 }}>
      <TornEdge color={S.paper} flip />
      <div className="flow-reveal px-4 pb-10 pt-8" style={ink}>
        {skin === "ambar" && <Title gold={S.gold} className="mb-2">{ur ? "جشن شروع ہوتا ہے" : "The Celebration Begins"}</Title>}
        <Ticker events={ordered} ur={ur} color={S.goldText} label={skin === "hadiqa" ? (ur ? "جشن شروع ہونے میں" : "The celebration begins in") : ur ? "باقی وقت" : "Counting down"} />
        {first && <p className="mt-5 text-lg" style={{ fontFamily: SERIF }}>{formatEventDate(first.date, loc)}</p>}
      </div>
      <TornEdge color={S.paper} />
    </section>
  );

  const schedule = timeline.length > 0 && (
    <section data-section="timeline" className="px-6 py-12 text-center" style={{ background: S.paper }}>
      <div className="flow-reveal">
        <Title gold={S.gold}>{ur ? "تقریبات کا شیڈول" : skin === "hadiqa" ? "Schedule of Events" : "The Day's Timeline"}</Title>
        <Divider color={S.gold} className="mt-2" />
      </div>
      <ol className="relative mx-auto mt-8 max-w-[21rem]">
        <span aria-hidden className="absolute bottom-3 left-1/2 top-3 w-px -translate-x-1/2" style={{ background: `${S.gold}88` }} />
        {timeline.map((it, i) => (
          <li key={i} className="flow-reveal relative grid grid-cols-[1fr_2.5rem_1fr] items-center py-4" style={{ ["--d" as string]: `${i * 70}ms` }}>
            <p className="text-right text-[1.45rem]" style={{ fontFamily: SERIF, ...ink }} dir="ltr">{it.time ? formatEventTime(it.time).replace(":00 ", " ") : ""}</p>
            <span aria-hidden className="relative z-[1] mx-auto grid size-9 place-items-center rounded-full" style={{ background: S.paper }}>
              <svg viewBox="-14 -14 28 28" className="size-8">
                {skin === "hadiqa"
                  ? (i === Math.floor(timeline.length / 2) ? <Rose x={0} y={0} s={0.55} c="#f2bfa4" light="#fbe3d0" dark="#cf8a6a" /> : <circle r="2.6" fill={S.gold} />)
                  : <Blossom x={0} y={0} s={1.2} c="none" centre={S.gold} line={S.gold} />}
              </svg>
            </span>
            <div className="text-left">
              <p className="text-[1.05rem] font-semibold leading-snug" style={{ fontFamily: font, ...ink }}>{it.title}</p>
              {it.note && <p className="mt-0.5 text-[14px] leading-snug" style={{ fontFamily: font, color: S.goldText }}>{it.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );

  const venues = ordered.map((e, i) => (
    <section key={i} id={`ev-${i}`} data-section={`event-${allEvents.indexOf(e)}`} className="px-6 py-12 text-center" style={{ background: i % 2 ? S.paper2 : S.paper }}>
      <div className="flow-reveal">
        {skin === "hadiqa" ? <MosqueSketch className="mx-auto w-[min(80%,17rem)]" color={S.gold} /> : <PalaceGate className="mx-auto w-[min(80%,17rem)]" color={S.gold} />}
        <Title gold={S.gold} className="mt-3">{ordered.length > 1 ? e.title : ur ? "مقام" : "Location"}</Title>
        <p className="mt-1 text-lg" style={{ fontFamily: SERIF, ...ink }}>{formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}</p>
        {e.venue && <p className="mt-3 text-[1.3rem] font-semibold" style={{ fontFamily: font, ...ink }}>{e.venue}</p>}
        {e.address && <p className={`mx-auto max-w-[20rem] ${body}`} style={{ fontFamily: font, color: S.goldText }}>{e.address}</p>}
        {(e.venue || e.address || e.mapUrl) && <MapCard e={e} gold={S.gold} ink={S.ink} paper={S.paper} ur={ur} />}
        <button type="button" className={`${ghostBtn} mt-4`} style={{ borderColor: `${S.gold}aa`, color: S.ink }} onClick={() => downloadIcs(e, names)}>
          <CalendarPlus className="size-4" aria-hidden />{ur ? "کیلنڈر میں شامل کریں" : "Add to calendar"}
        </button>
      </div>
    </section>
  ));

  const notes = (hasDress || content.faq.length > 0) && (
    <section data-section="faq" className="relative overflow-hidden px-7 py-12 text-center" style={{ background: S.paper }}>
      {skin === "hadiqa" && <><RoseCluster className="absolute -right-10 top-6 w-36 rotate-[-70deg]" tone="cream" /><RoseCluster className="absolute -left-10 bottom-4 w-36 rotate-[70deg]" tone="peach" /></>}
      {hasDress && (
        <div data-section="dress" className="flow-reveal relative">
          <Title gold={S.gold}>{ur ? "ڈریس کوڈ" : "Dress Code"}</Title>
          <ul className="mx-auto mt-3 max-w-[21rem] space-y-2">
            {ordered.filter((e) => e.dressCode).map((e, i) => (
              <li key={i} className={body} style={{ fontFamily: font, ...ink }}>
                {ordered.length > 1 && <span className="block text-[12px] uppercase tracking-[0.25em]" style={{ fontFamily: ur ? font : CAPS, color: S.goldText }}>{e.title}</span>}
                {e.dressCode}
              </li>
            ))}
          </ul>
        </div>
      )}
      {content.faq.map((f, i) => (
        <div key={i} className="flow-reveal relative mt-10">
          <Title gold={S.gold} className="!text-[2.2rem]">{f.q}</Title>
          <p className={`mx-auto mt-2 max-w-[21rem] ${body}`} style={{ fontFamily: font, ...ink }}>{f.a}</p>
        </div>
      ))}
    </section>
  );

  const rsvpTitle = ur ? "اپنی آمد کی تصدیق کریں" : skin === "hadiqa" ? "Confirm Your Attendance" : "Kindly Reply";
  const reply = content.rsvpEnabled && (
    <section data-section="rsvp" className="px-5 py-12 text-center" style={{ background: S.paper2 }}>
      <div className="flow-reveal">
        <Title gold={S.gold}>{rsvpTitle}</Title>
        <p className={`mx-auto mt-2 max-w-[21rem] ${body}`} style={{ fontFamily: font, ...ink }}>
          {ur ? "تیاری میں ہماری مدد کے لیے براہِ کرم اپنی آمد کی تصدیق کریں۔" : "To help us prepare for a joyful celebration, kindly let us know if you can join us."}
        </p>
      </div>
      {skin === "hadiqa" && !rsvpOpen ? (
        // a little envelope: the reply card is inside
        <button type="button" onClick={() => setRsvpOpen(true)} aria-expanded={false} className="flow-reveal press group mx-auto mt-6 block w-[min(78%,17rem)]">
          <span aria-hidden className="relative block aspect-[3/2] rounded-md shadow-[0_12px_26px_rgba(80,50,25,.22)]" style={{ background: "#f1e5cf" }}>
            <span className="absolute inset-0" style={{ clipPath: "polygon(0 0,100% 0,50% 58%)", background: "#f7eedd", filter: "drop-shadow(0 1px 1px rgba(110,80,40,.3))" }} />
            <InitialSeal initials={initials} wax="#7a1f2b" rim="#e9b9a4" ink="#f3cdb7" className="absolute left-1/2 top-[58%] w-14 -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ease-out group-hover:scale-105" />
          </span>
          <span className="mt-3 flex items-center justify-center gap-1 text-[15px] italic" style={{ fontFamily: SERIF, color: S.goldText }}>
            <ChevronDown className="size-4 rotate-180" aria-hidden />{ur ? "کھولنے کے لیے ٹیپ کریں" : "Tap to open your reply card"}
          </span>
        </button>
      ) : (
        <div className="flow-rsvp mx-auto mt-6 max-w-sm text-left" data-in={skin === "hadiqa" ? "1" : undefined}>
          <Rsvp inviteId={rsvp.inviteId} demo={rsvp.demo} showNote={rsvp.showNote} guestName={guest} seats={seats} guestId={rsvp.guestId} events={rsvp.events}
            accent={S.button} titleClass="text-center text-[2rem] leading-tight" titleStyle={{ fontFamily: ur ? font : SCRIPT, color: S.gold }} />
        </div>
      )}
      {content.contactPhone.replace(/\D/g, "") && (
        <a className={`${ghostBtn} mt-5`} style={{ borderColor: `${S.gold}aa`, color: S.ink }} href={`https://wa.me/${content.contactPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
          {ur ? "میزبان کو واٹس ایپ کریں" : "WhatsApp the hosts"}
        </a>
      )}
    </section>
  );

  const families = (content.members1.length > 0 || content.members2.length > 0) && (
    <section data-section="families" className="flow-families px-5 py-12" style={{ background: S.paper }}>
      <div className="flow-reveal text-center"><Title gold={S.gold}>{ur ? "دعاؤں کے ساتھ" : "With Love From"}</Title></div>
      <div className="flow-reveal mt-4"><Families content={content} ur={ur} glass={false} accent={S.button} /></div>
    </section>
  );

  const photo = content.couplePhoto;
  const closing = (
    <section data-section="closing" className="relative overflow-hidden px-6 pb-[calc(6rem+var(--frame-bottom,0px))] pt-12 text-center" style={{ background: S.paper }}>
      <div className="flow-reveal relative">
        {skin === "ambar" && <Chandelier className="mx-auto mb-2 w-32" color={S.gold} />}
        <Title gold={S.gold}>{content.closing || (ur ? "آپ کی آمد کے منتظر" : "Hope to see you there!")}</Title>
        <p className="mt-1 text-[1.6rem]" style={{ fontFamily: ur ? font : SERIF, ...ink }}>{content.host2 ? `${content.host1} ${ur ? "اور" : "and"} ${content.host2}` : content.host1}</p>
        {skin === "ambar" && <Divider color={S.gold} className="mt-4" />}
      </div>
      {photo && (
        <figure className="flow-reveal relative mx-auto mt-8 max-w-[20rem]">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
          <img src={photo} alt={ur ? "تصویر" : `Photo of ${names}`} className={`aspect-[4/5] w-full object-cover shadow-[0_18px_40px_rgba(80,55,25,.25)] ${skin === "ambar" ? "rounded-t-full" : "rounded-[1.5rem]"}`} />
          {skin === "hadiqa" && <><RoseCluster className="absolute -bottom-6 -left-8 w-40" tone="peach" /><RoseCluster className="absolute -bottom-6 -right-8 w-40 -scale-x-100" tone="cream" /></>}
        </figure>
      )}
      {skin === "hadiqa" && !photo && <RoseCluster className="mx-auto mt-6 w-48" tone="peach" />}
      <p className="relative mt-10 text-xs" style={{ color: S.goldText }}>Made with Digital Dawat</p>
    </section>
  );

  return (
    <div className="relative h-full w-full overflow-hidden" dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} onPointerDown={onTap} style={{ background: S.paper, color: S.ink }}>
      <div ref={scroller} onScroll={onScroll}
        className={`relative h-full overflow-y-auto overscroll-contain [container-type:size] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${opened ? "" : "overflow-hidden"}`}>
        <div ref={page} className="mx-auto max-w-md" data-flow={skin} style={{ background: S.paper }}>
          {cover}{message}{countdown}{schedule}{venues}{notes}{reply}{families}{closing}
        </div>
      </div>
      {song && opened && (
        <>
          <button type="button" onClick={song.toggle} aria-pressed={!song.off} aria-label={song.off ? "Play music" : "Mute music"}
            className="press absolute bottom-[calc(1rem+var(--frame-bottom,0px))] right-4 z-30 grid size-11 place-items-center rounded-full shadow-lg" style={{ background: S.button, color: S.onButton }}>
            {song.off ? <VolumeX className="size-5" aria-hidden /> : <Music className="size-5" aria-hidden />}
          </button>
        </>
      )}
      {song?.node}
      {!gone && envelope}
    </div>
  );
}

/** The opening page at 9:16, for thumbnails, the editor and the gallery (sizes in cqw, so it scales with the card). */
export function FlowCard({ template, content }: { template: Template; content: InviteContent }) {
  const skin = template.flow!;
  const S = SKINS[skin];
  const ur = content.language === "ur";
  const font = ur ? "var(--nf-urdu), serif" : SCRIPT;
  const e = [...content.events].sort((a, b) => a.date.localeCompare(b.date))[0];
  const names = <>{content.host1}{content.host2 && <><span className="block text-[0.55em]">&amp;</span>{content.host2}</>}</>;
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "9 / 16", containerType: "inline-size", background: S.paper, color: S.ink }}>
      {skin === "hadiqa" ? (
        <>
          <GardenArch />
          <div className="absolute inset-x-[12%] top-[17%] text-center">
            <p className="text-[8cqw]" style={{ fontFamily: font, color: S.goldText }}>{content.events.length > 1 ? (ur ? "شادی" : "Wedding Day") : e?.title}</p>
            {e && <p className="text-[4.6cqw] tracking-[0.2em]" style={{ fontFamily: SERIF, color: S.goldText }} dir="ltr">{e.date.slice(2).split("-").reverse().join(".")}</p>}
            <p className="mt-[7cqw] text-[16cqw] leading-[1.05] [overflow-wrap:anywhere]" style={{ fontFamily: font, color: S.gold, textShadow: "0 1px 0 #fff" }}>{names}</p>
          </div>
        </>
      ) : (
        <div className="absolute inset-[7%_8%_5%] px-[8%] pt-[24%] text-center">
          <MoorishArch className="absolute inset-0 size-full" color={S.gold} />
          {content.bismillah && <p lang="ar" dir="rtl" className="text-[6.4cqw]" style={{ fontFamily: "var(--nf-naskh), serif", color: S.goldText, lineHeight: 1.9 }}>{BISMILLAH}</p>}
          <p className="mt-[2cqw] text-[3.2cqw] uppercase tracking-[0.3em]" style={{ fontFamily: ur ? font : CAPS, color: S.goldText }}>{content.headline}</p>
          <p className="mt-[5cqw] text-[14cqw] leading-[1.05] [overflow-wrap:anywhere]" style={{ fontFamily: font, color: S.gold }}>{names}</p>
          {e && <p className="mt-[5cqw] text-[5cqw]" style={{ fontFamily: SERIF }}>{formatEventDate(e.date, ur ? "ur-PK" : "en-GB")}</p>}
          <Chandelier className="mx-auto mt-[6cqw] w-[26cqw]" color={S.gold} />
        </div>
      )}
    </div>
  );
}