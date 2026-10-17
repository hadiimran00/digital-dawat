import type { CSSProperties } from "react";
import { Blossom, Leaf, Peony, Rose, Sprig } from "./PrintArt";

/*
 * Drawings for the flowing-page designs (Hadiqa, Ambar): our own vector art in the look of an illustrated garden
 * wedding. No gradient or pattern ids (the same drawing can appear many times on a page); shading is layered opacity.
 */

const svg = (vb: string, style: CSSProperties | undefined, className: string | undefined, children: React.ReactNode) => (
  <svg aria-hidden viewBox={vb} className={`pointer-events-none ${className ?? ""}`} style={style}>{children}</svg>
);

/** A cluster of cream and peach roses with sage leaves (corners, the arch, section edges). "emboss": all in the paper's own tints, like a pressed pattern. */
export function RoseCluster({ className, style, tone = "peach" }: { className?: string; style?: CSSProperties; tone?: "peach" | "cream" | "blush" | "emboss" }) {
  const T = {
    peach: ["#f4c9a8", "#fbe3d0", "#d9946d"],
    cream: ["#f3e7d3", "#fffaf1", "#d8c2a0"],
    blush: ["#f2c4c9", "#fde6e8", "#d48a95"],
    emboss: ["#ece0cb", "#f9f2e6", "#dccdb3"],
  }[tone];
  const L = tone === "emboss" ? ["#e9dcc5", "#efe5d3", "#dccdb3", "#e4d6be", "#f9f2e6", "#e6d8bf"] : ["#b8c3a2", "#c9d2b4", "#93a07c", "#a9b590", "#ffffff", "#e2c27a"];
  return svg("0 0 140 100", style, className, (
    <>
      <Sprig x={6} y={70} len={80} rot={-28} c={L[0]} stem={L[2]} n={6} />
      <Sprig x={60} y={30} len={70} rot={20} c={L[1]} stem={L[2]} />
      <Leaf x={100} y={62} len={30} rot={30} c={L[3]} />
      <Rose x={52} y={56} s={1.6} c={T[0]} light={T[1]} dark={T[2]} />
      <Rose x={88} y={44} s={1.1} c={T[1]} light={L[4]} dark={T[0]} rot={30} />
      <Peony x={24} y={44} s={1.05} c={T[0]} light={T[1]} dark={T[2]} />
      <Blossom x={110} y={72} s={0.9} c={L[4]} centre={L[5]} />
      <Blossom x={72} y={80} s={0.7} c={T[1]} centre={L[5]} />
    </>
  ));
}

/** The garden arch: two slim pillars and a pointed arch, roses climbing it, a lake with swans below (Hadiqa's cover). */
export function GardenArch({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      {/* warm sky through the arch, and the lake */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 45% at 50% 40%, #fff8ea, #f3e6cf 60%, #e9d8bb)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: "linear-gradient(180deg, #e8e4d2, #cfd6c4 40%, #bfcab6)" }} />
      <div className="absolute inset-x-0 bottom-[30%] h-[6%]" style={{ background: "linear-gradient(180deg, transparent, #d9dcc8)" }} />
      {/* the arch: pillars and a pointed top, in pale stone */}
      {svg("0 0 100 160", { position: "absolute", inset: 0, width: "100%", height: "100%" }, undefined, (
        <>
          <path d="M6 160V58C6 28 26 10 50 4C74 10 94 28 94 58V160H84V60C84 36 70 20 50 15C30 20 16 36 16 60V160Z" fill="#efe2c9" />
          <path d="M16 160V60C16 36 30 20 50 15C70 20 84 36 84 60V160" fill="none" stroke="#d8c4a0" strokeWidth=".6" />
          <path d="M6 160V58C6 28 26 10 50 4C74 10 94 28 94 58V160" fill="none" stroke="#cdb48b" strokeWidth=".5" />
          {[38, 70, 102, 134].map((y) => <path key={y} d={`M6 ${y}H16M84 ${y}H94`} stroke="#d8c4a0" strokeWidth=".4" />)}
        </>
      ))}
      {/* roses climbing the arch */}
      <RoseCluster className="absolute" style={{ left: "-10%", top: "1%", width: "58%" }} tone="cream" />
      <RoseCluster className="absolute" style={{ right: "-10%", top: "6%", width: "52%", transform: "scaleX(-1)" }} tone="peach" />
      <RoseCluster className="absolute" style={{ left: "-12%", top: "34%", width: "38%", transform: "rotate(80deg)" }} tone="cream" />
      <RoseCluster className="absolute" style={{ right: "-12%", top: "40%", width: "38%", transform: "rotate(-80deg) scaleX(-1)" }} tone="peach" />
      <RoseCluster className="absolute" style={{ left: "-14%", bottom: "-3%", width: "60%" }} tone="peach" />
      <RoseCluster className="absolute" style={{ right: "-14%", bottom: "-2%", width: "56%", transform: "scaleX(-1)" }} tone="cream" />
      <Swans className="flow-swim absolute left-1/2 bottom-[4%] w-[52%] -translate-x-1/2" />
    </div>
  );
}

/** Two swans facing each other, their necks making a heart, with ripples. */
export function Swans({ className, style }: { className?: string; style?: CSSProperties }) {
  const swan = (flip: boolean) => (
    <g transform={flip ? "translate(200 0) scale(-1 1)" : undefined}>
      <ellipse cx="60" cy="88" rx="34" ry="5" fill="#9fb0a6" opacity=".35" />
      {/* body and folded wing */}
      <path d="M30 84C30 66 50 58 72 62C86 64 96 72 98 84Z" fill="#fbfaf6" />
      <path d="M40 80C46 66 64 62 82 68C72 70 60 76 52 84Z" fill="#ece8df" />
      <path d="M44 76C52 70 62 68 72 70" fill="none" stroke="#d8d2c4" strokeWidth="1" />
      {/* neck curving toward the other swan, head and beak */}
      <path d="M86 70C96 58 100 40 92 28C86 18 74 20 74 30C74 36 80 38 84 36" fill="none" stroke="#fbfaf6" strokeWidth="7" strokeLinecap="round" />
      <path d="M86 70C96 58 100 40 92 28" fill="none" stroke="#e5e0d4" strokeWidth="1" />
      <path d="M76 30L68 33L76 35Z" fill="#e88a3a" />
      <circle cx="80" cy="29" r="1.3" fill="#2a2420" />
    </g>
  );
  return svg("0 0 200 100", style, className, (
    <>
      {swan(false)}{swan(true)}
      <path d="M20 94Q60 90 100 94T180 94" fill="none" stroke="#ffffff" strokeOpacity=".6" strokeWidth="1" />
      <path d="M40 98Q80 95 120 98T170 98" fill="none" stroke="#ffffff" strokeOpacity=".4" strokeWidth=".8" />
    </>
  ));
}

/** A line drawing of a mosque: domes, minarets and arched windows (the venue). */
export function MosqueSketch({ className, color = "#a88a5c" }: { className?: string; color?: string }) {
  return svg("0 0 240 130", undefined, className, (
    <g fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round">
      <path d="M8 124H232" />
      {/* minarets */}
      {[22, 218].map((x) => (
        <g key={x}>
          <path d={`M${x - 5} 124V44H${x + 5}V124`} /><path d={`M${x - 7} 44H${x + 7}M${x - 7} 70H${x + 7}M${x - 7} 96H${x + 7}`} />
          <path d={`M${x - 5} 44Q${x} 24 ${x + 5} 44`} /><path d={`M${x} 24V16`} />
        </g>
      ))}
      {/* the main hall and big dome */}
      <path d="M48 124V74H192V124" />
      <path d="M78 74C78 40 162 40 162 74" /><path d="M120 46V34M116 34Q120 28 124 34" />
      <path d="M66 74C66 58 92 58 92 74M148 74C148 58 174 58 174 74" />
      {/* arches along the front */}
      {[62, 86, 110, 134, 158].map((x) => <path key={x} d={`M${x} 124V100C${x} 90 ${x + 20} 90 ${x + 20} 100V124`} />)}
      <path d="M48 86H192" />
      {/* a little planting either side */}
      <path d="M36 124C34 116 40 110 44 116M206 124C208 116 202 110 198 116" />
    </g>
  ));
}

/** A crystal chandelier in fine gold line (Ambar's last screen). */
export function Chandelier({ className, color = "#c2a066" }: { className?: string; color?: string }) {
  const drops = [-48, -32, -16, 0, 16, 32, 48];
  return svg("-70 0 140 130", undefined, className, (
    <g fill="none" stroke={color} strokeWidth=".9">
      <path d="M0 0V22" />
      <ellipse cx="0" cy="26" rx="6" ry="4" />
      {[-54, -36, -18, 18, 36, 54].map((x) => <path key={x} d={`M0 30Q${x * 0.6} 30 ${x} 54`} />)}
      <path d="M-58 56Q0 70 58 56" /><path d="M-40 76Q0 88 40 76" />
      {drops.map((x, i) => (
        <g key={x}>
          <path d={`M${x} ${58 + Math.abs(x) * -0.05} V${84 + (i % 2) * 8}`} strokeOpacity=".6" />
          <path d={`M${x} ${86 + (i % 2) * 8}l-3 6l3 6l3 -6z`} fill={color} fillOpacity=".35" />
        </g>
      ))}
      {[-58, -40, -20, 0, 20, 40, 58].map((x) => <circle key={x} cx={x} cy={56 + (Math.abs(x) < 30 ? 6 : 0)} r="1.8" fill={color} />)}
      <path d="M0 96V116M-4 116l4 10 4 -10z" />
    </g>
  ));
}

/** A symmetric embossed flourish (Ambar's envelope flap and section breaks). */
export function Damask({ className, color = "#d8c7a8", style }: { className?: string; color?: string; style?: CSSProperties }) {
  const half = (
    <g fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round">
      <path d="M100 70C88 50 70 44 54 52C40 60 42 78 56 80C66 82 70 72 64 66" />
      <path d="M100 70C92 86 74 92 60 88" />
      <path d="M100 40C90 26 78 22 70 28C64 34 70 42 76 40" />
      <path d="M54 52C40 40 22 42 16 54C12 64 22 70 28 64" />
      <path d="M60 88C50 98 34 98 28 92" />
      <circle cx="40" cy="74" r="3" fill={color} stroke="none" />
    </g>
  );
  return svg("0 0 200 110", style, className, (
    <>
      {half}<g transform="translate(200 0) scale(-1 1)">{half}</g>
      <path d="M100 18C94 30 94 44 100 56C106 44 106 30 100 18Z" fill={color} />
      <circle cx="100" cy="74" r="6" fill="none" stroke={color} strokeWidth="2.2" />
    </>
  ));
}

/** A torn deckled paper edge, to sit along the top or bottom of a section. */
export function TornEdge({ color, flip = false, className }: { color: string; flip?: boolean; className?: string }) {
  return svg("0 0 400 24", { width: "100%", height: "18px", display: "block", transform: flip ? "scaleY(-1)" : undefined }, className, (
    <path d="M0 24V10L14 14L26 6L40 12L58 4L72 11L88 7L104 13L120 5L138 12L152 6L170 13L186 8L202 14L218 5L234 11L250 6L266 13L282 7L298 12L316 4L330 11L346 6L362 13L378 7L400 12V24Z" fill={color} />
  ));
}

/** A wax seal with the couple's initials stamped in it. */
export function InitialSeal({ initials, wax, rim, ink, className, style, font = "var(--nf-script), cursive", size = 15 }: {
  initials: string; wax: string; rim: string; ink: string; className?: string; style?: CSSProperties; font?: string; size?: number;
}) {
  return svg("-30 -30 60 60", style, className, (
    <>
      <path d="M0-28C9-29 13-23 20-21C27-17 27-10 28-3C30 6 26 12 22 18C17 25 10 28 2 28C-7 30-13 25-19 21C-26 16-29 9-28 1C-30-8-25-14-20-20C-14-26-7-27 0-28Z" fill={wax} />
      <circle r="19.5" fill={wax} />
      <circle r="19.5" fill="none" stroke={rim} strokeOpacity=".55" strokeWidth="1.4" />
      <circle r="16" fill="none" stroke={rim} strokeOpacity=".4" strokeWidth=".6" />
      <ellipse cx="-9" cy="-11" rx="6" ry="3" fill="#fff" opacity=".18" transform="rotate(-35 -9 -11)" />
      <text y={size * 0.37} textAnchor="middle" fontSize={size} fill={ink} style={{ fontFamily: font }}>{initials}</text>
    </>
  ));
}

/** A Moorish ogee arch drawn as a fine double line: Ambar's frame for the opening words. Stretches to its box. */
export function MoorishArch({ className, color = "#c2a066" }: { className?: string; color?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 100 160" preserveAspectRatio="none" className={`pointer-events-none ${className ?? ""}`}>
      <g fill="none" stroke={color} vectorEffect="non-scaling-stroke">
        <path d="M4 160V44C4 30 18 24 30 20C40 16 46 10 50 2C54 10 60 16 70 20C82 24 96 30 96 44V160" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <path d="M8 160V46C8 34 20 28 32 24C42 20 47 15 50 9C53 15 58 20 68 24C80 28 92 34 92 46V160" strokeWidth=".7" strokeOpacity=".7" vectorEffect="non-scaling-stroke" />
      </g>
    </svg>
  );
}

/** A thin gold divider with a little diamond flower in the middle. */
export function Divider({ color = "#b48a4a", className }: { color?: string; className?: string }) {
  return svg("0 0 120 12", { width: "7.5rem", height: "0.75rem" }, `mx-auto block ${className ?? ""}`, (
    <g fill={color}>
      <path d="M2 6H48M72 6H118" stroke={color} strokeWidth=".6" />
      <path d="M60 0L64 6L60 12L56 6Z" />
      <circle cx="51" cy="6" r="1.4" /><circle cx="69" cy="6" r="1.4" />
    </g>
  ));
}
/** A Moorish palace gateway with palms either side, in fine line (Ambar's venue). */
export function PalaceGate({ className, color = "#9a7438" }: { className?: string; color?: string }) {
  const palm = (x: number, flip: boolean) => (
    <g transform={`translate(${x} 0)${flip ? " scale(-1 1)" : ""}`}>
      <path d="M0 124C2 100 4 80 2 58" />
      {[[-22, 52], [-18, 64], [20, 50], [24, 62], [0, 40]].map(([dx, dy], i) => <path key={i} d={`M2 58Q${dx / 2} ${dy - 14} ${dx} ${dy}`} />)}
    </g>
  );
  return svg("0 0 240 130", undefined, className, (
    <g fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round">
      <path d="M6 124H234" />
      <path d="M66 124V58H174V124" /><path d="M60 58H180M64 52H176" />
      {[76, 92, 108, 124, 140, 156].map((x) => <path key={x} d={`M${x} 52V46H${x + 8}V52`} />)}
      {/* the great door: an ogee arch */}
      <path d="M98 124V92C98 80 108 74 120 64C132 74 142 80 142 92V124" />
      <path d="M104 124V94C104 85 112 80 120 72C128 80 136 85 136 94V124" strokeOpacity=".6" />
      {/* side windows and lanterns */}
      {[78, 152].map((x) => <path key={x} d={`M${x} 110V90C${x} 84 ${x + 10} 84 ${x + 10} 90V110Z`} />)}
      <path d="M120 64V56" /><circle cx="120" cy="54" r="2" fill={color} />
      {palm(34, false)}{palm(206, true)}
      <path d="M90 124l-10 4M150 124l10 4" strokeOpacity=".5" />
    </g>
  ));
}