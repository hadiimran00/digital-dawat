"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties, type ReactNode } from "react";

// iPhone 15 proportions: a 393 x 852 screen inside a 12px bezel.
const BEZEL = 12;
const SCREEN_W = 393;
const SCREEN_H = 852;
const W = SCREEN_W + BEZEL * 2;
const H = SCREEN_H + BEZEL * 2;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Shows its children inside an iPhone-shaped frame from the `md` breakpoint up, scaled down (never squashed) to fit
 * the window height. Below `md` there is no frame: the children fill the box given by `plainClassName`, which is
 * what a real phone shows. The screen exposes --frame-top / --frame-bottom so content can clear the status bar
 * and the home indicator.
 */
export function PhoneFrame({
  children, margin = 48, plainClassName = "h-full w-full", className = "",
}: { children: ReactNode; margin?: number; plainClassName?: string; className?: string }) {
  const [scale, setScale] = useState(1);
  useIsoLayoutEffect(() => {
    const fit = () => setScale(Math.max(0.35, Math.min(1, (window.innerHeight - margin) / H)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [margin]);

  return (
    <div
      className={`${plainClassName} md:[height:calc(var(--h)*var(--s))] md:[width:calc(var(--w)*var(--s))] ${className}`}
      style={{ "--s": scale, "--w": `${W}px`, "--h": `${H}px` } as CSSProperties}
    >
      <div
        className="relative h-full w-full md:h-[var(--h)] md:w-[var(--w)] md:origin-top-left md:[transform:scale(var(--s))] md:rounded-[58px] md:bg-[#0b0b0d] md:p-3 md:shadow-2xl md:ring-1 md:ring-white/15"
      >
        {/* side buttons */}
        <span aria-hidden className="absolute -left-[3px] top-[118px] hidden h-9 w-[3px] rounded-l bg-[#26262b] md:block" />
        <span aria-hidden className="absolute -left-[3px] top-[178px] hidden h-14 w-[3px] rounded-l bg-[#26262b] md:block" />
        <span aria-hidden className="absolute -left-[3px] top-[248px] hidden h-14 w-[3px] rounded-l bg-[#26262b] md:block" />
        <span aria-hidden className="absolute -right-[3px] top-[200px] hidden h-20 w-[3px] rounded-r bg-[#26262b] md:block" />

        <div className="relative h-full w-full overflow-hidden bg-black md:rounded-[46px] md:[--frame-bottom:30px] md:[--frame-top:50px]">
          {children}

          {/* status bar, Dynamic Island and home indicator (decoration only, hidden on real phones) */}
          <div aria-hidden className="pointer-events-none absolute inset-0 z-50 hidden md:block">
            <div className="absolute left-1/2 top-[11px] h-[34px] w-[122px] -translate-x-1/2 rounded-full bg-black" />
            <p className="absolute left-[34px] top-[16px] text-[16px] font-semibold leading-none text-white mix-blend-difference">9:41</p>
            <div className="absolute right-[30px] top-[17px] flex items-center gap-[6px] text-white mix-blend-difference">
              <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.4c2.3 0 4.4.9 6 2.4l1-1.1C13.1 1.8 10.7.8 8 .8S2.9 1.8 1 3.7l1 1.1c1.6-1.5 3.700-2.400 6-2.400zm0 3.400c1.400 0 2.700.5 3.700 1.400l1-1.100C11.400 4.900 9.800 4.200 8 4.200s-3.400.7-4.700 1.900l1 1.100C5.300 6.300 6.600 5.800 8 5.800zM8 9.200c.7 0 1.300.3 1.800.7L8 11.800 6.200 9.900c.5-.4 1.100-.7 1.800-.7z" /></svg>
              <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x="0.5" y="0.5" width="23" height="12" rx="3.500" stroke="currentColor" opacity=".45" /><rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor" /><path d="M25 4.500v4c.8-.3 1.500-1.100 1.500-2s-.7-1.700-1.500-2z" fill="currentColor" opacity=".5" /></svg>
            </div>
            <div className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-white mix-blend-difference" />
          </div>
        </div>
      </div>
    </div>
  );
}
