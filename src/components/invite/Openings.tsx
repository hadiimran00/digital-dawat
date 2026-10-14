import type { CSSProperties, ReactNode } from "react";
import { WaxSeal } from "./PrintArt";

/*
 * Pieces of the "Tap to open" covers that need their own markup. The motion itself is CSS (globals.css, .open-*),
 * driven by the cover's data-open attribute, so it runs off the main thread while the invitation loads behind it.
 */

/** Two copies of the cover's artwork, each showing one half, so the cover can part (doors, curtain, clouds). */
export function Halves({ dir, children }: { dir: "lr" | "tb"; children: ReactNode }) {
  const clip = dir === "lr" ? ["inset(0 50% 0 0)", "inset(0 0 0 50%)"] : ["inset(0 0 50% 0)", "inset(50% 0 0 0)"];
  return (
    <>
      {clip.map((c, i) => (
        <div key={i} aria-hidden className={`half ${i ? "half-b" : "half-a"} pointer-events-none absolute inset-0`} style={{ clipPath: c }}>{children}</div>
      ))}
    </>
  );
}

/**
 * A closed envelope: back, the card tucked inside, the front pocket, the top flap and a gold wax seal.
 * Opening: the seal lifts, the flap swings up and over, and the card slides out (see .open-envelope).
 */
export function Envelope({ env, flap, card, cardInk, children }: { env: string; flap: string; card: string; cardInk: string; children?: ReactNode }) {
  const edge: CSSProperties = { stroke: "rgba(0,0,0,.18)", strokeWidth: 0.35, vectorEffect: "non-scaling-stroke" };
  return (
    <div className="env relative mx-auto aspect-[4/3] w-[84%] max-w-[22rem]" style={{ perspective: "1100px" }}>
      <div className="absolute inset-0 rounded-[3px]" style={{ background: env, filter: "brightness(.82)" }} />
      <div className="env-card absolute inset-x-[6%] top-[5%] flex h-[90%] flex-col items-center justify-center rounded-[2px] px-[8%] text-center shadow-md"
        style={{ zIndex: 1, background: card, color: cardInk, outline: `1px dashed ${cardInk}33`, outlineOffset: "-7px" }}>
        {children}
      </div>
      <svg aria-hidden viewBox="0 0 100 75" preserveAspectRatio="none" className="absolute inset-0 z-[2] h-full w-full drop-shadow-[0_-2px_4px_rgba(0,0,0,.12)]">
        <path d="M0 0L47 43Q50 45.5 53 43L100 0V75H0Z" fill={env} style={edge} />
        <path d="M0 75L44 40Q50 36 56 40L100 75Z" fill={env} style={{ ...edge, filter: "brightness(1.06)" }} />
      </svg>
      <div className="env-flap absolute inset-x-0 top-0 h-[62%]" style={{ transformOrigin: "50% 0" }}>
        <svg aria-hidden viewBox="0 0 100 62" preserveAspectRatio="none" className="h-full w-full drop-shadow-[0_3px_5px_rgba(0,0,0,.25)]">
          <path d="M0 0H100L54 58Q50 61 46 58Z" fill={flap} style={edge} />
        </svg>
      </div>
      <WaxSeal className="env-seal absolute w-[19%]" style={{ left: "40.5%", top: "44%" }} />
    </div>
  );
}
