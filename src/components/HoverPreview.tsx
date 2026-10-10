"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import type { Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import type { Animator } from "@/lib/videoExport";

/**
 * Plays the template's animation live on a canvas (no video file needed) over its thumbnail.
 * Starts on mouse hover; touch and keyboard users get a play button. Respects reduced motion.
 */
export function HoverPreview({ template, children }: { template: Template; children: React.ReactNode }) {
  const [playing, setPlaying] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const loading = useRef<Promise<Animator> | null>(null);
  const raf = useRef(0);
  const token = useRef(0); // invalidates a start() that was stopped while still loading

  const stop = useCallback(() => {
    token.current++;
    cancelAnimationFrame(raf.current);
    host.current?.querySelector("canvas")?.remove();
    setPlaying(false);
  }, []);

  const start = useCallback(async () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
    a.canvas.className = "pointer-events-none absolute inset-0 h-full w-full";
    host.current?.querySelector("canvas")?.remove();
    host.current?.appendChild(a.canvas);
    a.reset();
    let t0 = performance.now();
    const loop = (now: number) => {
      let sec = (now - t0) / 1000;
      if (sec >= a.seconds) {
        a.reset();
        t0 = now;
        sec = 0;
      }
      a.draw(sec);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
  }, [template]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div
      ref={host}
      className="relative"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") start(); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") stop(); }}
    >
      {children}
      <button
        type="button"
        onClick={() => (playing ? stop() : start())}
        aria-label={playing ? `Stop ${template.name} preview` : `Play ${template.name} preview`}
        aria-pressed={playing}
        className="absolute bottom-2 right-2 z-10 grid size-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
