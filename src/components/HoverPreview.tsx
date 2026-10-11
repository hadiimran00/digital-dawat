"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Music, Pause, Play } from "lucide-react";
import type { Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";

const FADE_MS = 220;
const HOVER_INTENT_MS = 150;
/** the invitation is laid out at iPhone width, then scaled down to the card */
const PHONE_W = 393;

// loaded on first hover, so the gallery itself stays light
const InviteExperience = dynamic(() => import("@/components/invite/InviteExperience").then((m) => m.InviteExperience), { ssr: false });

/** Only one preview plays at a time, across the whole page. */
let active: { owner: object; stop: () => void } | null = null;

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveData = () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);

/**
 * Plays the real invitation over the card's thumbnail: it opens itself and steps through every screen, silently.
 * Mouse: starts after a short hover, cross-fades in and out. Touch screens: the card most in view plays on its own.
 * Keyboard and touch users also get a play button. Respects reduced motion and data saver.
 */
export function HoverPreview({ template, children }: { template: Template; children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const [shown, setShown] = useState(false);
  const [scale, setScale] = useState(0);
  const host = useRef<HTMLDivElement>(null);
  const intent = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const fade = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const me = useRef({}); // identifies this card as the page's active preview

  const stop = useCallback(() => {
    clearTimeout(intent.current);
    setShown(false); // fade back to the thumbnail, then unmount
    clearTimeout(fade.current);
    fade.current = setTimeout(() => setPlaying(false), FADE_MS);
    if (active?.owner === me.current) active = null;
  }, []);

  const start = useCallback(() => {
    if (reducedMotion()) return;
    if (active && active.owner !== me.current) active.stop();
    active = { owner: me.current, stop };
    clearTimeout(fade.current);
    setPlaying(true);
    // give the invitation a moment to lay out before it fades in
    fade.current = setTimeout(() => setShown(true), 60);
  }, [stop]);

  // keep the phone-width invitation scaled to the card's width
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / PHONE_W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
    clearTimeout(fade.current);
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
      {playing && scale > 0 && (
        <div
          aria-hidden
          inert
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ opacity: shown ? 1 : 0, transition: `opacity ${FADE_MS}ms cubic-bezier(0.23, 1, 0.32, 1)`, background: template.theme.bg }}
        >
          <div className="origin-top-left" style={{ width: PHONE_W, height: `${100 / scale}%`, transform: `scale(${scale})` }}>
            <InviteExperience template={template} content={defaultContent(template.category)} demo autoplay />
          </div>
        </div>
      )}
      {template.music && (
        <span className="pointer-events-none absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
          <Music className="size-3" aria-hidden /> Music
        </span>
      )}
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
