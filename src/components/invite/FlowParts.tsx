"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { mapLink, type InviteEvent } from "@/lib/content";

/* Pieces shared by the flowing-page designs (FlowInvite.tsx, Firdaus.tsx). */
export const SCRIPT = "var(--nf-script), cursive";
export const SERIF = "var(--nf-display), Georgia, serif";
export const CAPS = "var(--nf-caps), var(--nf-display), Georgia, serif";

/** Live countdown to the next event, down to the second: "52 : 11 : 36 : 08". */
export function Ticker({ events, ur, color, label }: { events: InviteEvent[]; ur: boolean; color: string; label: string }) {
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
export function Title({ children, gold, className = "" }: { children: ReactNode; gold: string; className?: string }) {
  return <h2 className={`text-[2.6rem] leading-tight ${className}`} style={{ fontFamily: SCRIPT, color: gold }}>{children}</h2>;
}

/** An illustrated map card (no live map: nothing from Google loads until the guest asks for directions). */
export function MapCard({ e, gold, ink, paper, ur }: { e: InviteEvent; gold: string; ink: string; paper: string; ur: boolean }) {
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

