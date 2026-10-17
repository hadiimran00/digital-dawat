"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CalendarPlus, Music, VolumeX } from "lucide-react";
import { BISMILLAH, downloadIcs, formatEventDate, formatEventTime, type InviteContent } from "@/lib/content";
import { burst } from "@/lib/tapFx";
import { Families } from "./Families";
import { Rsvp } from "./Rsvp";
import { Rose } from "./PrintArt";
import { TornEdge } from "./FlowArt";
import { ChateauSketch, Courtyard, FlowerSeal, RoseBank } from "./FirdausArt";
import { CAPS, MapCard, SCRIPT, SERIF, Ticker, Title } from "./FlowParts";
import type { FlowProps } from "./FlowInvite";

/*
 * Firdaus (after Webgency's template 5): a white envelope with a gold flower seal opens on a painted chateau
 * courtyard; below it the page alternates deep wine and ivory paper, joined by torn edges.
 */

const WINE = "#6A0E22";
const ON_WINE = "#FBF3EA";
const PAPER = "#FBF7F2";
const INK = "#3D2A2A";
const PETALS = ["#f2b8bf", "#f8d4d6", "#ffffff", "#b0162f"];

/** A deep wine section; `torn` adds the ripped paper edge above and/or below it. */
function Wine({ children, section, top = true, bottom = true, className = "" }: { children: React.ReactNode; section: string; top?: boolean; bottom?: boolean; className?: string }) {
  return (
    <section data-section={section} className="relative" style={{ background: WINE, color: ON_WINE }}>
      {top && <TornEdge color={PAPER} flip />}
      <div className={`px-7 py-12 text-center ${className}`}>{children}</div>
      {bottom && <TornEdge color={PAPER} />}
    </section>
  );
}

export function Firdaus({ content, ordered, names, hello, guest, seats, opened, gone, onOpen, scroller, onScroll, rsvp, allEvents, song }: Omit<FlowProps, "skin">) {
  const ur = content.language === "ur";
  const loc = ur ? "ur-PK" : "en-GB";
  const font = ur ? "var(--nf-urdu), serif" : SERIF;
  const first = ordered[0];
  const shortDate = first ? first.date.slice(2).split("-").reverse().join(".") : "";
  const hasDress = ordered.some((e) => e.dressCode);
  const timeline = content.timeline.length
    ? content.timeline.map((it) => ({ time: it.time, title: it.title, note: it.note }))
    : ordered.filter((e) => e.time).map((e) => ({ time: e.time, title: e.title, note: ordered.length > 1 ? formatEventDate(e.date, loc) : "" }));
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const wa = content.contactPhone.replace(/\D/g, "");
  const photo = content.couplePhoto;

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
    if (gone) burst("petals", e.clientX, e.clientY, PETALS);
  };

  const body = "text-[17px] leading-relaxed";
  const onPaper: CSSProperties = { color: INK };
  const pill = "press inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold";

  /* ---------- the envelope: white paper, a gold flower seal; the seal fades, the flap lifts, the paper falls away ---------- */
  const envelope = (
    <div data-open={opened} className="fd-env absolute inset-0 z-20 overflow-hidden" style={{ background: "#f3f2ef", perspective: "1200px" }}>
      <div aria-hidden className="absolute inset-0 opacity-60" style={{ background: "radial-gradient(circle at 20% 30%, #e4e2dd 0 1px, transparent 1.5px) 0 0 / 9px 9px, radial-gradient(circle at 70% 60%, #e9e7e2 0 1px, transparent 1.5px) 0 0 / 13px 13px" }} />
      {/* the folds: faint shadowed diagonals meeting under the seal */}
      <div aria-hidden className="fd-paper absolute inset-0">
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 100%,50% 52%,100% 100%)", background: "#f6f5f2", filter: "drop-shadow(0 -1px 1px rgba(0,0,0,.08))" }} />
      </div>
      <div aria-hidden className="fd-flap absolute inset-x-0 top-0 h-[54%] origin-top" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.12))" }}>
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0,100% 0,100% 8%,50% 100%,0 8%)", background: "linear-gradient(180deg,#f8f7f4,#f1f0ec)" }} />
      </div>
      <button type="button" onClick={onOpen} aria-label={ur ? "دعوت نامہ کھولیں" : "Open the invitation"}
        className="fd-ui absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center outline-none">
        {hello && <span className="text-[2rem] leading-tight" style={{ fontFamily: ur ? font : SCRIPT, color: WINE }}>{hello}</span>}
        <FlowerSeal className="fd-seal w-[min(34vw,8.5rem)] drop-shadow-[0_8px_12px_rgba(110,80,30,.3)]" />
        <span className="text-[15px] tracking-wide" style={{ fontFamily: SERIF, color: WINE }}>{ur ? "کھولنے کے لیے ٹیپ کریں" : "Tap to open"}</span>
      </button>
    </div>
  );

  const cover = (
    <section data-section="cover" className="relative h-[100cqh] min-h-[34rem] overflow-hidden">
      <div data-open={opened} className="fd-zoom absolute inset-0"><Courtyard /></div>
      <div className="relative flex h-full flex-col items-center px-8 pt-[9cqh] text-center text-white" style={{ textShadow: "0 2px 14px rgba(20,35,70,.6), 0 0 2px rgba(20,35,70,.4)" }}>
        {content.bismillah && <p lang="ar" dir="rtl" className="mb-1 text-[1.25rem]" style={{ fontFamily: "var(--nf-naskh), serif", lineHeight: 1.8 }}>{BISMILLAH}</p>}
        <p className="text-[2.1rem]" style={{ fontFamily: ur ? font : SCRIPT }}>{ordered.length > 1 ? (ur ? "شادی" : "Wedding Day") : first?.title}</p>
        <p className="text-xl tracking-[0.12em]" style={{ fontFamily: SERIF }} dir="ltr">{shortDate}</p>
        <h1 className="mt-[3cqh] text-[min(16cqw,4.4rem)] leading-[1.02] [overflow-wrap:anywhere]" style={{ fontFamily: ur ? font : SCRIPT }}>
          {content.host1}{content.host2 && <><span className="block text-[0.5em]">&amp;</span>{content.host2}</>}
        </h1>
      </div>
    </section>
  );

  const message = (
    <Wine section="message" top={false}>
      <div className="flow-reveal">
        <p className="text-[2.2rem] leading-tight" style={{ fontFamily: ur ? font : SCRIPT }}>
          {guest ? (ur ? `محترم ${guest}،` : `Dear ${guest},`) : ur ? "عزیز دوستو اور اہلِ خانہ" : "Dear Friends and Family,"}
        </p>
        <p className={`mx-auto mt-4 max-w-[21rem] ${body}`} style={{ fontFamily: font }}>{content.message}</p>
        {seats && <p className="mt-4 text-[15px] italic" style={{ fontFamily: SERIF }}>{ur ? `${seats} مہمانوں کے لیے مدعو` : `We have saved ${seats === 1 ? "a place" : `${seats} places`} for you`}</p>}
        {(content.family1 || content.family2) && (
          <p className="mt-5 text-[15px] opacity-90" style={{ fontFamily: SERIF }}>{[content.family1, content.family2].filter(Boolean).join(ur ? " اور " : " & ")}</p>
        )}
      </div>
    </Wine>
  );

  const countdown = (
    <section data-section="countdown" className="px-4 py-10 text-center" style={{ background: PAPER, ...onPaper }}>
      <div className="flow-reveal">
        <Title gold={WINE} className="mb-1 !text-[2.15rem]">{ur ? "جشن شروع ہونے میں" : "The Celebration Begins In"}</Title>
        <Ticker events={ordered} ur={ur} color={WINE} label="" />
        {first && <p className="mt-4 text-lg" style={{ fontFamily: SERIF }}>{formatEventDate(first.date, loc)}</p>}
      </div>
    </section>
  );

  const schedule = timeline.length > 0 && (
    <Wine section="timeline">
      <div className="flow-reveal"><Title gold={ON_WINE}>{ur ? "تقریبات کا شیڈول" : "Schedule of Events"}</Title></div>
      <ol className="relative mx-auto mt-8 max-w-[21rem]">
        <span aria-hidden className="absolute bottom-3 left-1/2 top-3 w-px -translate-x-1/2 bg-[#FBF3EA]/60" />
        {timeline.map((it, i) => (
          <li key={i} className="flow-reveal relative grid grid-cols-[1fr_2.5rem_1fr] items-center py-4" style={{ ["--d" as string]: `${i * 70}ms` }}>
            <p className="text-right text-[1.5rem]" style={{ fontFamily: SERIF }} dir="ltr">{it.time ? formatEventTime(it.time).replace(":00 ", " ") : ""}</p>
            <span aria-hidden className="relative z-[1] mx-auto grid size-9 place-items-center">
              {i === timeline.length - 1
                ? <svg viewBox="-14 -14 28 28" className="size-9"><Rose x={0} y={0} s={0.6} c="#f3ead8" light="#ffffff" dark="#d8c9a8" /></svg>
                : <span className="block size-2 rounded-full bg-[#FBF3EA]" />}
            </span>
            <div className="text-left">
              <p className="text-[1.05rem] font-semibold leading-snug" style={{ fontFamily: font }}>{it.title}</p>
              {it.note && <p className="mt-0.5 text-[14px] leading-snug opacity-90" style={{ fontFamily: font }}>{it.note}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Wine>
  );

  const venues = ordered.map((e, i) => (
    <section key={i} id={`ev-${i}`} data-section={`event-${allEvents.indexOf(e)}`} className="px-6 py-12 text-center" style={{ background: PAPER, ...onPaper }}>
      <div className="flow-reveal">
        <Title gold={WINE}>{ordered.length > 1 ? e.title : ur ? "مقام" : "Location"}</Title>
        <p className="mt-1 text-lg" style={{ fontFamily: SERIF }}>{formatEventDate(e.date, loc)}{e.time && ` · ${formatEventTime(e.time)}`}</p>
        {e.venue && <p className="mt-3 text-[1.3rem] font-semibold" style={{ fontFamily: font }}>{e.venue}</p>}
        {e.address && <p className={`mx-auto max-w-[20rem] ${body}`} style={{ fontFamily: font }}>{e.address}</p>}
        <ChateauSketch className="mx-auto mt-5 w-[min(92%,20rem)]" />
        {(e.venue || e.address || e.mapUrl) && <MapCard e={e} gold="#b08a4a" ink={INK} paper="#ffffff" ur={ur} />}
        <button type="button" className={`${pill} mt-4 border`} style={{ borderColor: `${WINE}66`, color: WINE }} onClick={() => downloadIcs(e, names)}>
          <CalendarPlus className="size-4" aria-hidden />{ur ? "کیلنڈر میں شامل کریں" : "Add to calendar"}
        </button>
      </div>
    </section>
  ));

  const dress = hasDress && (
    <Wine section="dress">
      <div className="flow-reveal">
        <Title gold={ON_WINE}>{ur ? "ڈریس کوڈ" : "Dress Code"}</Title>
        <ul className="mx-auto mt-4 max-w-[21rem] space-y-3">
          {ordered.filter((e) => e.dressCode).map((e, i) => (
            <li key={i} className={body} style={{ fontFamily: font }}>
              {ordered.length > 1 && <span className="block text-[12px] uppercase tracking-[0.25em]" style={{ fontFamily: ur ? font : CAPS }}>{e.title}</span>}
              {e.dressCode}
            </li>
          ))}
        </ul>
      </div>
    </Wine>
  );

  const details = (content.faq.length > 0 || wa) && (
    <section data-section="faq" className="relative overflow-hidden px-7 pb-0 pt-12 text-center" style={{ background: PAPER, ...onPaper }}>
      <div className="flow-reveal">
        <Title gold={WINE}>{ur ? "تفصیلات" : "Details"}</Title>
      </div>
      {content.faq.map((f, i) => (
        <div key={i} className="flow-reveal mx-auto mt-6 max-w-[21rem]">
          <p className="text-[1.15rem] font-semibold" style={{ fontFamily: font }}>{f.q}</p>
          <p className={`mt-1 ${body}`} style={{ fontFamily: font }}>{f.a}</p>
        </div>
      ))}
      {wa && (
        <div className="flow-reveal mt-7">
          <p className={body} style={{ fontFamily: font }}>{ur ? "مزید معلومات کے لیے میزبان سے رابطہ کریں" : "For any questions, message the hosts:"}</p>
          <a className={`${pill} mt-3`} style={{ background: WINE, color: ON_WINE }} href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" dir="ltr">
            {ur ? "واٹس ایپ کریں" : "WhatsApp"} {content.contactPhone}
          </a>
        </div>
      )}
      <RoseBank className="relative -mx-7 mt-10 block w-[calc(100%+3.5rem)]" />
    </section>
  );

  const reply = content.rsvpEnabled && (
    <Wine section="rsvp" top={!details}>
      <div className="flow-reveal">
        <Title gold={ON_WINE}>{ur ? "اپنی آمد کی تصدیق کریں" : "Confirm Your Attendance"}</Title>
        <p className={`mx-auto mt-2 max-w-[21rem] ${body}`} style={{ fontFamily: font }}>
          {ur ? "تیاری میں ہماری مدد کے لیے براہِ کرم اپنی آمد کی تصدیق کریں۔" : "To help us prepare for a joyful celebration, kindly confirm your attendance."}
        </p>
        {!rsvpOpen && (
          <button type="button" onClick={() => setRsvpOpen(true)} aria-expanded={false} className={`${pill} mt-6 min-w-[8rem] tracking-[0.2em]`} style={{ background: ON_WINE, color: WINE, fontFamily: CAPS }}>
            RSVP
          </button>
        )}
      </div>
      {rsvpOpen && (
        <div className="flow-rsvp fd-rsvp mx-auto mt-6 max-w-sm text-left" style={{ color: INK }}>
          <Rsvp inviteId={rsvp.inviteId} demo={rsvp.demo} showNote={rsvp.showNote} guestName={guest} seats={seats} guestId={rsvp.guestId} events={rsvp.events}
            accent={WINE} titleClass="text-center text-[2rem] leading-tight" titleStyle={{ fontFamily: ur ? font : SCRIPT, color: WINE }} />
        </div>
      )}
    </Wine>
  );

  const families = (content.members1.length > 0 || content.members2.length > 0) && (
    <section data-section="families" className="px-5 py-12" style={{ background: PAPER, ...onPaper }}>
      <div className="flow-reveal text-center"><Title gold={WINE}>{ur ? "دعاؤں کے ساتھ" : "With Love From"}</Title></div>
      <div className="flow-reveal mt-4"><Families content={content} ur={ur} glass={false} accent={WINE} /></div>
    </section>
  );

  const closing = (
    <section data-section="closing" className="relative overflow-hidden text-center" style={{ background: WINE, color: ON_WINE }}>
      {families && <TornEdge color={PAPER} flip />}
      <div className="flow-reveal relative px-6 pt-12">
        <Title gold={ON_WINE}>{content.closing || (ur ? "آپ کی آمد کے منتظر" : "Hope to see you there!")}</Title>
        <p className="mt-1 text-[1.6rem]" style={{ fontFamily: ur ? font : SERIF }}>{content.host2 ? `${content.host1} ${ur ? "اور" : "and"} ${content.host2}` : content.host1}</p>
      </div>
      {photo ? (
        <figure className="flow-reveal relative mt-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage */}
          <img src={photo} alt={ur ? "تصویر" : `Photo of ${names}`} className="aspect-[4/5] w-full object-cover" />
          <span aria-hidden className="absolute inset-x-0 top-0 h-1/3" style={{ background: `linear-gradient(${WINE}, transparent)` }} />
          <RoseBank className="absolute bottom-[-3%] left-[-4%] w-[108%]" />
        </figure>
      ) : (
        <RoseBank className="relative mt-8 block w-full" />
      )}
      <p className="pb-[calc(1.5rem+var(--frame-bottom,0px))] pt-4 text-xs">Delivered by Kabootar Post</p>
    </section>
  );

  return (
    <div className="relative h-full w-full overflow-hidden" dir={ur ? "rtl" : "ltr"} lang={ur ? "ur" : "en"} onPointerDown={onTap} style={{ background: WINE, color: ON_WINE }}>
      <div ref={scroller} onScroll={onScroll}
        className={`relative h-full overflow-y-auto overscroll-contain [container-type:size] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${opened ? "" : "overflow-hidden"}`}>
        <div ref={page} className="mx-auto max-w-md" data-flow="firdaus" style={{ background: WINE }}>
          {cover}{message}{countdown}{schedule}{venues}{dress}{details}{reply}{families}{closing}
        </div>
      </div>
      {song && opened && (
        <button type="button" onClick={song.toggle} aria-pressed={!song.off} aria-label={song.off ? "Play music" : "Mute music"}
          className="press absolute bottom-[calc(1rem+var(--frame-bottom,0px))] right-4 z-30 grid size-11 place-items-center rounded-full shadow-lg" style={{ background: WINE, color: ON_WINE }}>
          {song.off ? <VolumeX className="size-5" aria-hidden /> : <Music className="size-5" aria-hidden />}
        </button>
      )}
      {song?.node}
      {!gone && envelope}
    </div>
  );
}

/** The opening page at 9:16 for thumbnails, the editor and the gallery. */
export function FirdausCard({ content }: { content: InviteContent }) {
  const ur = content.language === "ur";
  const font = ur ? "var(--nf-urdu), serif" : SCRIPT;
  const e = [...content.events].sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "9 / 16", containerType: "inline-size", background: WINE }}>
      <Courtyard />
      <div className="absolute inset-x-[8%] top-[13%] text-center text-white" style={{ textShadow: "0 2px 12px rgba(20,35,70,.55)" }}>
        <p className="text-[8.5cqw]" style={{ fontFamily: font }}>{content.events.length > 1 ? (ur ? "شادی" : "Wedding Day") : e?.title}</p>
        {e && <p className="text-[5cqw] tracking-[0.12em]" style={{ fontFamily: SERIF }} dir="ltr">{e.date.slice(2).split("-").reverse().join(".")}</p>}
        <p className="mt-[8cqw] text-[16cqw] leading-[1.02] [overflow-wrap:anywhere]" style={{ fontFamily: font }}>
          {content.host1}{content.host2 && <><span className="block text-[0.5em]">&amp;</span>{content.host2}</>}
        </p>
      </div>
    </div>
  );
}