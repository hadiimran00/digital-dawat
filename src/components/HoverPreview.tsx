"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Pause, Play } from "lucide-react";
import type { Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import type { Animator } from "@/lib/videoExport";

const FADE_MS = 220;
const HOVER_INTENT_MS = 120;
const HOLD_SECS = 1.2; // the finished card stays on screen before the loop restarts

/** Only one preview plays at a time, across the whole page. */
let active: { owner: object; stop: () => void } | null = null;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/**
 * Plays the template's animation live on a canvas (no video file needed) over its thumbnail.
 * Mouse: starts after a short hover, cross-fades in and out. Touch screens: the card most in view plays on its own.
 * Keyboard and touch users also get a play button. Respects reduced motion and data saver.
 */
export function HoverPreview({ template, children }: { template: Template; children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const loading = useRef<Promise<Animator> | null>(null);
  const raf = useRef(0);
  const intent = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const token = useRef(0); // invalidates a start() that was stopped while still loading
  const me = useRef({}); // identifies this card as the page's active preview

  const stop = useCallback(() => {
    clearTimeout(intent.current);
    token.current++;
    const canvas = host.current?.querySelector("canvas");
    if (canvas) {
      canvas.style.opacity = "0"; // fade back to the thumbnail, then stop drawing
      const mine = token.current;
      setTimeout(() => {
        if (token.current !== mine) return;
        cancelAnimationFrame(raf.current);
        canvas.remove();
      }, FADE_MS);
    } else cancelAnimationFrame(raf.current);
    if (bar.current) bar.current.style.transform = "scaleX(0)";
    if (active?.owner === me.current) active = null;
    setPlaying(false);
  }, []);

  const start = useCallback(async () => {
    if (reducedMotion()) return;
    if (active && active.owner !== me.current) active.stop();
    active = { owner: me.current, stop };
    const mine = ++token.current;
    setPlaying(true);
    loading.current ??= import("@/lib/videoExport").then((m) =>
      m.createAnimator(template, defaultContent(template.category), template.motion),
    );
    let a: Animator;
    try {
      a = await loading.current;
    } catch {
      loading.current = null;
      if (token.current === mine) setPlaying(false);
      return;
    }
    if (token.current !== mine) return; // stopped while loading
    cancelAnimationFrame(raf.current);
    const canvas = a.canvas;
    canvas.className = "pointer-events-none absolute inset-0 h-full w-full";
    canvas.style.transition = `opacity ${FADE_MS}ms cubic-bezier(0.23, 1, 0.32, 1)`;
    canvas.style.opacity = "0";
    if (canvas.parentElement !== host.current) host.current?.insertBefore(canvas, bar.current?.parentElement ?? null);
    a.reset();
    a.draw(0);
    requestAnimationFrame(() => { canvas.style.opacity = "1"; });
    const cycle = a.seconds + HOLD_SECS;
    let t0 = performance.now();
    let fadedForLoop = false;
    const loop = (now: number) => {
      let sec = (now - t0) / 1000;
      if (sec >= cycle) {
        a.reset();
        t0 = now;
        sec = 0;
        fadedForLoop = false;
        canvas.style.opacity = "1";
      } else if (!fadedForLoop && sec >= cycle - FADE_MS / 1000) {
        fadedForLoop = true;
        canvas.style.opacity = "0.15"; // a soft dip instead of a hard cut back to the start
      }
      a.draw(Math.min(sec, a.seconds));
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, sec / a.seconds)})`;
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [template, stop]);

  // Touch screens have no hover: play the card that is most in view, one at a time.
  useEffect(() => {
    const el = host.current;
    if (!el || window.matchMedia("(hover: hover)").matches || reducedMotion() || saveData()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.85) start();
        else if (entry.intersectionRatio < 0.5 && active?.owner === me.current) stop();
      },
      { threshold: [0, 0.5, 0.85], rootMargin: "-15% 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [start, stop]);

  useEffect(() => () => {
    clearTimeout(intent.current);
    cancelAnimationFrame(raf.current);
    if (active?.owner === me.current) active = null;
  }, []);

  return (
    <div
      ref={host}
      className="relative"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(intent.current);
        intent.current = setTimeout(start, HOVER_INTENT_MS);
      }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") stop(); }}
    >
      {children}
      {template.music && (
        <span className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <Music className="size-3" aria-hidden /> Music
        </span>
      )}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] bg-black/20">
        <div ref={bar} className="h-full origin-left bg-white/90" style={{ transform: "scaleX(0)" }} />
      </div>
      <button
        type="button"
        onClick={() => (playing ? stop() : start())}
        aria-label={playing ? `Stop ${template.name} preview` : `Play ${template.name} preview`}
        aria-pressed={playing}
        className="absolute bottom-2 right-2 z-10 grid size-11 place-items-center press rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/75"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
