"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

/*
 * "Stories" mode: the invitation as full-screen pages, one at a time, like phone stories. Progress bars at the top,
 * tap the right of the screen for the next page and the left third for the previous one, with labelled Previous,
 * Next and Pause buttons too. Pages advance by themselves (except the reply form), and stop when the guest pauses,
 * types, or prefers reduced motion. No horizontal swipe: it would fight the phone's own back gesture.
 */

export type StoryPage = { key: string; section: string; label: string; node: ReactNode; hold?: boolean };

const PAGE_MS = 6000;
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Stories({ pages, focus, autoplay = false, onEnd, light = false }: {
  pages: StoryPage[]; focus?: string; autoplay?: boolean; onEnd?: () => void; light?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typing, setTyping] = useState(false);
  const [still, setStill] = useState(false); // reduced motion: no auto-advance
  const root = useRef<HTMLDivElement>(null);
  const last = pages.length - 1;
  const page = pages[Math.min(idx, last)];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read the user's motion setting after mount
    setStill(reducedMotion());
  }, []);
  // the editor's live preview: jump to the page of whatever the customer is editing
  // (keyed on the list of sections, not the pages themselves, which are rebuilt on every render)
  const sections = pages.map((p) => p.section).join("|");
  useEffect(() => {
    if (!focus) return;
    const i = sections.split("|").indexOf(focus);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- follow the editor
    if (i >= 0) setIdx(i);
  }, [focus, sections]);

  const go = useCallback((n: number) => {
    if (n > last) { if (autoplay && onEnd) onEnd(); else setIdx(last); return; }
    setIdx(Math.max(0, n));
  }, [last, autoplay, onEnd]);
  const next = useCallback(() => go(idx + 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);

  // pause while the page is hidden (another tab, the phone locked)
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  const auto = autoplay || (!still && !paused && !typing && !hidden && !page.hold);
  const ms = autoplay ? 2200 : PAGE_MS;
  // the timer that turns the page; the progress bar runs on the same clock (CSS, so it stays smooth)
  useEffect(() => {
    if (!auto || (idx === last && !autoplay)) return;
    const id = setTimeout(next, ms);
    return () => clearTimeout(id);
  }, [auto, idx, last, autoplay, ms, next]);

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("input,textarea,select")) return;
    if (e.key === "ArrowRight") { e.preventDefault(); next(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
  };
  const ink = light ? "text-[#1d1b16]" : "text-white";
  const chip = light ? "bg-white/75 text-[#1d1b16]" : "bg-black/35 text-white";

  return (
    <div ref={root} className="relative h-full w-full" onKeyDown={onKey}
      // stop the clock while the guest is typing a reply
      onFocusCapture={(e) => setTyping(!!(e.target as HTMLElement).closest("input,textarea,select"))}
      onBlurCapture={() => setTyping(false)}>
      {/* the pages, stacked; only the current one can be reached */}
      {pages.map((p, i) => (
        <section key={p.key} data-section={p.section} aria-label={p.label} aria-hidden={i !== idx} inert={i !== idx}
          className={`story-page absolute inset-0 ${i === idx ? "is-on" : i < idx ? "is-past" : ""}`}>
          {p.node}
        </section>
      ))}

      {/* tap zones under the page's own buttons and links: left third back, the rest forward */}
      <button type="button" tabIndex={-1} aria-hidden onClick={prev} className="absolute inset-y-0 left-0 z-[5] w-1/3 cursor-w-resize" />
      <button type="button" tabIndex={-1} aria-hidden onClick={next} className="absolute inset-y-0 right-0 z-[5] w-2/3 cursor-e-resize" />

      {/* progress bars */}
      <div aria-hidden className="pointer-events-none absolute inset-x-3 top-[calc(0.6rem+var(--frame-top,0px))] z-20 flex gap-1">
        {pages.map((p, i) => (
          <span key={p.key} className={`h-[3px] flex-1 overflow-hidden rounded-full ${light ? "bg-black/15" : "bg-white/30"}`}>
            <span className={`story-bar block h-full rounded-full ${light ? "bg-[#1d1b16]" : "bg-white"}`}
              key={i === idx ? `on-${idx}` : "off"}
              style={i < idx || (i === idx && (still || (idx === last && !autoplay)))
                ? { transform: "scaleX(1)", animation: "none" }
                : i === idx
                  ? { animationDuration: `${ms}ms`, animationPlayState: auto ? "running" : "paused" }
                  : { transform: "scaleX(0)", animation: "none" }} />
          </span>
        ))}
      </div>

      {/* the controls, labelled for everyone */}
      <div className={`absolute inset-x-3 top-[calc(1.2rem+var(--frame-top,0px))] z-20 flex items-center justify-between text-xs font-semibold ${ink}`}>
        <span className={`rounded-full px-2.5 py-1 ${chip}`} aria-live="polite">{idx + 1} / {pages.length}<span className="sr-only">: {page.label}</span></span>
        {!still && !autoplay && (
          <button type="button" onClick={() => setPaused((v) => !v)} aria-pressed={paused} aria-label={paused ? "Play pages" : "Pause pages"}
            className={`press grid size-11 place-items-center rounded-full ${chip}`}>
            {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
          </button>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-3 bottom-[calc(0.75rem+var(--frame-bottom,0px))] z-20 flex justify-between">
        <button type="button" onClick={prev} disabled={idx === 0} aria-label="Previous page"
          className={`press pointer-events-auto grid size-11 place-items-center rounded-full disabled:opacity-0 ${chip}`}><ChevronLeft className="size-5" aria-hidden /></button>
        <button type="button" onClick={next} disabled={idx === last} aria-label="Next page"
          className={`press pointer-events-auto grid size-11 place-items-center rounded-full disabled:opacity-0 ${chip}`}><ChevronRight className="size-5" aria-hidden /></button>
      </div>
    </div>
  );
}
