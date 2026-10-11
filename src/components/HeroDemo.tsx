"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";

const PHONE_W = 393;
const InviteExperience = dynamic(() => import("@/components/invite/InviteExperience").then((m) => m.InviteExperience), { ssr: false });

/**
 * The home page's hero: the static card renders first (fast, no layout shift), then the real invitation plays over it
 * while it is on screen. Skipped for reduced motion and data saver, where the static card stays.
 */
export function HeroDemo({ template, children }: { template: Template; children: React.ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [shown, setShown] = useState(false);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return;
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / PHONE_W));
    ro.observe(el);
    // play only while visible, so it never runs (or downloads photos) off screen
    const io = new IntersectionObserver(([e]) => {
      setLive(e.isIntersecting);
      if (!e.isIntersecting) setShown(false);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { ro.disconnect(); io.disconnect(); };
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = setTimeout(() => setShown(true), 400); // let the first screen paint before fading in
    return () => clearTimeout(id);
  }, [live]);

  return (
    <div ref={host} className="relative">
      {children}
      {live && scale > 0 && (
        <div
          aria-hidden
          inert
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ opacity: shown ? 1 : 0, transition: "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1)", background: template.theme.bg }}
        >
          <div className="origin-top-left" style={{ width: PHONE_W, height: `${100 / scale}%`, transform: `scale(${scale})` }}>
            <InviteExperience template={template} content={defaultContent(template.category)} demo autoplay />
          </div>
        </div>
      )}
    </div>
  );
}
