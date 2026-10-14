import type { CSSProperties, ReactNode } from "react";
import type { PrintArtId } from "@/lib/templates";

/*
 * Illustrated artwork for the printed-card designs, drawn as vectors. Each design is a set of pieces pinned to the
 * edges of the card (corners, top, bottom) plus stretchy frames made with CSS, so the same artwork fits a 9:16
 * thumbnail and a tall phone screen. No gradient or pattern ids: the same artwork appears many times on one page.
 */

type At = { left?: string; right?: string; top?: string; bottom?: string };

/** One drawing pinned to the card: `w` is its width in % of the card. */
function Piece({ at, w, vb, flip, children, style }: { at: At; w: number; vb: string; flip?: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox={vb} className="pointer-events-none absolute" style={{ ...at, width: `${w}%`, transform: flip ? "scaleX(-1)" : undefined, ...style }}>
      {children}
    </svg>
  );
}

/* ---------- drawing primitives (coordinates in the piece's own viewBox) ---------- */

function Balloon({ x, y, r, c, shade, rot = 0, string = "#b9a48a", heart = false }: { x: number; y: number; r: number; c: string; shade: string; rot?: number; string?: string; heart?: boolean }) {
  const h = r * 1.18;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 ${h + 3} q ${-r * 0.25} ${r * 0.5} ${r * 0.05} ${r} t ${-r * 0.1} ${r * 1.1}`} fill="none" stroke={string} strokeWidth={Math.max(0.6, r * 0.05)} />
      {heart ? (
        <path d={`M0 ${h} C ${-r * 1.6} ${r * 0.1} ${-r * 0.9} ${-h * 1.1} 0 ${-r * 0.35} C ${r * 0.9} ${-h * 1.1} ${r * 1.6} ${r * 0.1} 0 ${h}Z`} fill={c} />
      ) : (
        <ellipse rx={r} ry={h} fill={c} />
      )}
      <ellipse cx={r * 0.3} cy={r * 0.35} rx={r * 0.7} ry={h * 0.72} fill={shade} opacity=".35" />
      <ellipse cx={-r * 0.38} cy={-h * 0.42} rx={r * 0.2} ry={r * 0.34} fill="#fff" opacity=".6" transform={`rotate(-25 ${-r * 0.38} ${-h * 0.42})`} />
      <path d={`M${-r * 0.14} ${h - 1} h${r * 0.28} l${-r * 0.14} ${r * 0.2}z`} fill={shade} />
    </g>
  );
}

/** A full open rose seen from above: three rings of petals and a swirl in the middle. */
function Rose({ x, y, s, c, light, dark, rot = 0 }: { x: number; y: number; s: number; c: string; light: string; dark: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => <ellipse key={a} cx="0" cy="-11" rx="10" ry="12" transform={`rotate(${a})`} fill={light} />)}
      {[30, 102, 174, 246, 318].map((a) => <ellipse key={a} cx="0" cy="-7" rx="8" ry="9.5" transform={`rotate(${a})`} fill={c} />)}
      {[0, 90, 180, 270].map((a) => <ellipse key={a} cx="0" cy="-4" rx="5.5" ry="6" transform={`rotate(${a})`} fill={dark} opacity=".55" />)}
      <circle r="4.2" fill={dark} />
      <path d="M-2.6 -0.6a3 3 0 1 1 4.2 2.6M-1 1.8a2 2 0 0 1-1.6-2.4" fill="none" stroke={light} strokeWidth="1" strokeLinecap="round" />
    </g>
  );
}

/** A loose watercolour-ish peony: soft overlapping blobs. */
function Peony({ x, y, s, c, light, dark }: { x: number; y: number; s: number; c: string; light: string; dark: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-18 4C-24-10-10-20 0-16C10-22 25-12 19 4C24 14 10 22 0 18C-10 23-25 15-18 4Z" fill={light} opacity=".9" />
      <path d="M-12 2C-15-8-6-13 0-10C7-14 16-7 12 3C14 10 6 14 0 12C-7 15-15 9-12 2Z" fill={c} />
      <path d="M-6 1C-7-4-2-7 1-5C5-7 9-3 7 2C7 6 2 8 0 7C-4 8-8 5-6 1Z" fill={dark} opacity=".8" />
      <circle cx="0" cy="0" r="1.6" fill="#f3d27a" />
    </g>
  );
}

/** Five-petal blossom (white flowers, cherry blossom). */
function Blossom({ x, y, s, c, centre, line }: { x: number; y: number; s: number; c: string; centre: string; line?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="0" cy="-6.5" rx="5" ry="6.8" transform={`rotate(${a})`} fill={c} stroke={line} strokeWidth={line ? 0.4 : 0} />)}
      <circle r="2.4" fill={centre} />
      {[0, 60, 120, 180, 240, 300].map((a) => <circle key={a} cx="0" cy="-3.6" r=".55" transform={`rotate(${a})`} fill={centre} />)}
    </g>
  );
}

function Leaf({ x, y, len, rot, c, vein }: { x: number; y: number; len: number; rot: number; c: string; vein?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0Q${len * 0.45} ${-len * 0.32} ${len} 0Q${len * 0.45} ${len * 0.32} 0 0Z`} fill={c} />
      {vein && <path d={`M${len * 0.06} 0H${len * 0.9}`} stroke={vein} strokeWidth={len * 0.02} opacity=".6" />}
    </g>
  );
}

/** A curving stem with leaves along it. */
function Sprig({ x, y, len, rot, c, stem, n = 5, size = 0.3 }: { x: number; y: number; len: number; rot: number; c: string; stem: string; n?: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={`M0 0Q${len * 0.5} ${-len * 0.12} ${len} 0`} fill="none" stroke={stem} strokeWidth={len * 0.012} />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / (n + 1);
        return <Leaf key={i} x={len * t} y={-len * 0.06 * Math.sin(Math.PI * t)} len={len * size * (1 - t * 0.4)} rot={i % 2 ? 40 : -40} c={c} />;
      })}
    </g>
  );
}

function Butterfly({ x, y, s, c, dark, rot = 0 }: { x: number; y: number; s: number; c: string; dark: string; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0C-6-14-20-14-18-3C-17 4-8 4 0 0Z" fill={c} />
      <path d="M0 0C6-14 20-14 18-3C17 4 8 4 0 0Z" fill={c} />
      <path d="M0 1C-4 6-14 12-13 4C-12 0-5 0 0 1Z" fill={c} opacity=".8" />
      <path d="M0 1C4 6 14 12 13 4C12 0 5 0 0 1Z" fill={c} opacity=".8" />
      <path d="M0-4V5" stroke={dark} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M0-4q-2-4-4-5M0-4q2-4 4-5" stroke={dark} strokeWidth=".6" fill="none" />
    </g>
  );
}

function Bow({ x, y, s, c, dark }: { x: number; y: number; s: number; c: string; dark: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0C-8-10-22-10-20 0C-22 10-8 10 0 0Z" fill={c} />
      <path d="M0 0C8-10 22-10 20 0C22 10 8 10 0 0Z" fill={c} />
      <path d="M-2 2L-10 24L-5 21L-2 25ZM2 2L10 24L5 21L2 25Z" fill={c} />
      <ellipse rx="3.4" ry="4" fill={dark} />
    </g>
  );
}

/** Sitting teddy bear. */
function Teddy({ x, y, s, c, dark, light }: { x: number; y: number; s: number; c: string; dark: string; light: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="34" rx="22" ry="20" fill={c} />
      <ellipse cx="0" cy="38" rx="12" ry="12" fill={light} />
      <ellipse cx="-17" cy="50" rx="9" ry="7" fill={c} />
      <ellipse cx="17" cy="50" rx="9" ry="7" fill={c} />
      <ellipse cx="-17" cy="51" rx="5" ry="4" fill={light} />
      <ellipse cx="17" cy="51" rx="5" ry="4" fill={light} />
      <ellipse cx="-21" cy="28" rx="6" ry="11" fill={c} transform="rotate(25 -21 28)" />
      <ellipse cx="21" cy="28" rx="6" ry="11" fill={c} transform="rotate(-25 21 28)" />
      <circle cx="-15" cy="-14" r="8" fill={c} />
      <circle cx="15" cy="-14" r="8" fill={c} />
      <circle cx="-15" cy="-14" r="4.5" fill={light} />
      <circle cx="15" cy="-14" r="4.5" fill={light} />
      <circle cx="0" cy="0" r="19" fill={c} />
      <ellipse cx="0" cy="6" rx="8.5" ry="6.5" fill={light} />
      <ellipse cx="0" cy="3.5" rx="3" ry="2.2" fill={dark} />
      <path d="M0 5.5v3M-3 9q3 2 6 0" stroke={dark} strokeWidth="1" fill="none" strokeLinecap="round" />
      <circle cx="-7" cy="-3" r="1.9" fill={dark} />
      <circle cx="7" cy="-3" r="1.9" fill={dark} />
      <ellipse cx="0" cy="18" rx="9" ry="3" fill={dark} opacity=".25" />
    </g>
  );
}

function HotAirBalloon({ x, y, s, c, stripe, basket }: { x: number; y: number; s: number; c: string; stripe: string; basket: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0-30C-20-30-26-12-20 2C-15 13-6 18-5 24H5C6 18 15 13 20 2C26-12 20-30 0-30Z" fill={c} />
      <path d="M0-30C-9-30-12-12-9 2C-7 13-3 18-2.5 24H2.5C3 18 7 13 9 2C12-12 9-30 0-30Z" fill={stripe} />
      <path d="M-5 24L-4 31M5 24L4 31" stroke={basket} strokeWidth=".8" />
      <rect x="-5" y="31" width="10" height="7" rx="1.5" fill={basket} />
      <path d="M-18-10Q0-4 18-10" stroke="#fff" strokeOpacity=".5" fill="none" strokeWidth=".8" />
    </g>
  );
}

function Pram({ x, y, s, c, dark }: { x: number; y: number; s: number; c: string; dark: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 0H24C24 14 12 22 0 22C-12 22-22 14-22 0Z" fill={c} />
      <path d="M-22 0C-22-16-10-26 4-26V0Z" fill={dark} opacity=".85" />
      <path d="M-18-4C-17-14-10-21 0-22" stroke="#fff" strokeOpacity=".5" fill="none" strokeWidth="1" />
      <path d="M24 0L32-8H38" stroke={dark} strokeWidth="2" fill="none" strokeLinecap="round" />
      {[-12, 14].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="30" r="7.5" fill="none" stroke={dark} strokeWidth="2" />
          <circle cx={cx} cy="30" r="1.6" fill={dark} />
        </g>
      ))}
      <path d="M-6 22L-12 30M6 22L14 30" stroke={dark} strokeWidth="1.5" />
    </g>
  );
}

function Rings({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeWidth="2">
      <ellipse cx="-5" cy="0" rx="9" ry="8" />
      <ellipse cx="6" cy="1" rx="9" ry="8" />
      <path d="M-5-8l-2-4h4z" fill={c} stroke="none" />
    </g>
  );
}

function Cloud({ x, y, s, c }: { x: number; y: number; s: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
      <circle cx="-14" cy="4" r="9" /><circle cx="0" cy="-3" r="13" /><circle cx="15" cy="3" r="10" /><rect x="-23" y="3" width="47" height="10" rx="5" />
    </g>
  );
}

/** Gold sparkles: four-point stars. */
function Sparkles({ pts, c }: { pts: [number, number, number][]; c: string }) {
  return <>{pts.map(([x, y, r], i) => <path key={i} d={`M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`} fill={c} />)}</>;
}

/* ---------- reusable frames (CSS, so they stretch with the card) ---------- */

const archRadius = (v: number) => ({ borderTopLeftRadius: `50% ${v}%`, borderTopRightRadius: `50% ${v}%` });

function Frame({ inset, color, width = 1.5, arch, double, fill, radius = 0 }: { inset: { t: number; b: number; x: number }; color: string; width?: number; arch?: number; double?: string; fill?: string; radius?: number }) {
  const base: CSSProperties = { position: "absolute", left: `${inset.x}%`, right: `${inset.x}%`, top: `${inset.t}%`, bottom: `${inset.b}%`, border: `${width}px solid ${color}`, background: fill, borderRadius: radius, ...(arch ? archRadius(arch) : {}) };
  return (
    <>
      <div aria-hidden className="pointer-events-none" style={base} />
      {double && <div aria-hidden className="pointer-events-none" style={{ ...base, background: undefined, border: `1px solid ${double}`, left: `calc(${inset.x}% + 2.2cqw)`, right: `calc(${inset.x}% + 2.2cqw)`, top: `calc(${inset.t}% + 2.2cqw)`, bottom: `calc(${inset.b}% + 2.2cqw)` }} />}
    </>
  );
}

/* ---------- the ten designs ---------- */

const BG: Record<PrintArtId, string> = {
  lifafa: "radial-gradient(120% 80% at 50% 40%, #6e1a28, #3e0c15)",
  gubbara: "linear-gradient(180deg, #fde9ec, #f8d6dc)",
  neelam: "#ffffff",
  pehli: "linear-gradient(180deg, #fff8f1, #fdeee6)",
  gulnaar: "#ffffff",
  teddy: "radial-gradient(120% 70% at 40% 40%, #efe9df, #ddd3c4)",
  bhalu: "linear-gradient(180deg, #faf5ef, #f3ebe2)",
  saadgi: "#ffffff",
  zaitoon: "#f4efe4",
  surkh: "radial-gradient(90% 60% at 30% 30%, #fbf0ec, transparent 70%), radial-gradient(80% 60% at 80% 70%, #f6e2dc, transparent 70%), linear-gradient(160deg, #f7e7e2, #ecd2ca)",
};

function Lifafa() {
  const cream = "#efe6d6";
  // the scalloped lace edge of the card: little bumps along the top and down both sides
  const scallop = (dir: "top" | "left" | "right"): CSSProperties => dir === "top"
    ? { left: "6.2%", right: "6.2%", top: "calc(3% - 1.4cqw)", height: "1.5cqw", background: `radial-gradient(circle at 50% 100%, ${cream} 0 1.35cqw, transparent 1.4cqw) 0 0 / 2.8cqw 1.5cqw repeat-x` }
    : { [dir]: "calc(7% - 1.4cqw)", top: "3%", height: "64%", width: "1.5cqw", background: `radial-gradient(circle at ${dir === "left" ? "100%" : "0"} 50%, ${cream} 0 1.35cqw, transparent 1.4cqw) 0 0 / 1.5cqw 2.8cqw repeat-y` };
  return (
    <>
      {/* envelope flaps at the bottom */}
      <Piece at={{ left: "0", bottom: "0" }} w={100} vb="0 0 100 60">
        <path d="M0 6L50 44L100 6V60H0Z" fill="#4a0f19" />
        <path d="M0 6L50 44L100 6" fill="none" stroke="#7a2232" strokeWidth=".4" />
      </Piece>
      <div aria-hidden className="pointer-events-none absolute" style={{ left: "7%", right: "7%", top: "3%", bottom: "11%", filter: "drop-shadow(0 1.2cqw 1.6cqw rgba(0,0,0,.45))" }}>
        <div className="absolute inset-0" style={{ background: cream, clipPath: "polygon(0 0,100% 0,100% 76%,50% 100%,0 76%)" }} />
        <div className="absolute" style={{ inset: "2.2cqw", border: "1px dashed rgba(122,90,60,.45)", clipPath: "polygon(0 0,100% 0,100% 75.5%,50% 99%,0 75.5%)" }} />
      </div>
      {(["top", "left", "right"] as const).map((d) => <div key={d} aria-hidden className="pointer-events-none absolute" style={scallop(d)} />)}
      {/* gold wax seal where the flap comes to a point */}
      <Piece at={{ left: "39%", bottom: "7.5%" }} w={22} vb="-30 -30 60 60">
        <path d="M0-27C8-28 12-23 19-21C26-17 26-10 27-3C29 5 26 11 22 17C17 24 10 27 2 27C-6 29-12 25-18 21C-25 16-28 9-27 1C-29-7-25-13-20-19C-14-25-7-26 0-27Z" fill="#a7832f" />
        <circle r="19" fill="#c9a24a" />
        <circle r="19" fill="none" stroke="#8a6a22" strokeWidth="1.2" />
        <circle r="15.5" fill="none" stroke="#e8cf86" strokeWidth=".7" />
        <path d="M0 10V-6M0-6C-4-9-7-7-6-3M0-6C4-9 7-7 6-3M0 0C-4-2-7 0-6 3M0 0C4-2 7 0 6 3M0 5C-3 4-5 6-4 8M0 5C3 4 5 6 4 8" stroke="#7d5e1c" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx="-8" cy="-10" rx="5" ry="2.5" fill="#fff" opacity=".25" transform="rotate(-35 -8 -10)" />
      </Piece>
    </>
  );
}

function Gubbara() {
  const pink = "#f2a7b8", pinkS = "#c9617a", gold = "#e7c983", goldS = "#a8823a", rose = "#f6c9d2";
  return (
    <>
      <Frame inset={{ t: 11, b: 8, x: 13 }} color="#e9b1bf" arch={22} double="#d8b16c" fill="rgba(255,255,255,.35)" />
      <Piece at={{ left: "-8%", top: "-4%" }} w={64} vb="0 0 120 150">
        <Balloon x={38} y={40} r={20} c={pink} shade={pinkS} rot={-12} />
        <Balloon x={72} y={30} r={17} c={gold} shade={goldS} rot={8} />
        <Balloon x={20} y={78} r={15} c={rose} shade={pinkS} rot={-20} />
        <Balloon x={60} y={66} r={16} c={pink} shade={pinkS} heart rot={10} />
        <Balloon x={94} y={60} r={12} c={gold} shade={goldS} rot={18} />
        <Sparkles c="#d8b16c" pts={[[102, 20, 4], [12, 30, 3], [86, 98, 3]]} />
      </Piece>
      <Piece at={{ right: "4%", top: "5%" }} w={20} vb="-25 -20 50 40"><Butterfly x={0} y={0} s={1} c="#f3b3c2" dark="#a8586b" rot={18} /></Piece>
      <Piece at={{ left: "6%", top: "46%" }} w={11} vb="-25 -20 50 40"><Butterfly x={0} y={0} s={1} c="#f6c9d2" dark="#b5687a" rot={-14} /></Piece>
      <Piece at={{ left: "-10%", bottom: "-2%" }} w={56} vb="0 0 130 90">
        <Sprig x={10} y={70} len={70} rot={-40} c="#a9c29a" stem="#8aa47a" />
        <Rose x={40} y={62} s={1.25} c="#f2a7b8" light="#fbd6de" dark="#d5718a" />
        <Rose x={72} y={72} s={0.9} c="#f6c9d2" light="#fde7ec" dark="#e08ea2" rot={30} />
        <Rose x={18} y={78} s={0.8} c="#eeb6c3" light="#fbdde4" dark="#cf7389" />
        <Blossom x={92} y={58} s={0.7} c="#fde7ec" centre="#e7c983" />
      </Piece>
      <Piece at={{ right: "-8%", bottom: "-1%" }} w={50} vb="0 0 120 90" flip>
        <Sprig x={8} y={64} len={64} rot={-50} c="#b7cba8" stem="#8aa47a" />
        <Rose x={36} y={64} s={1.1} c="#f2a7b8" light="#fbd6de" dark="#d5718a" rot={15} />
        <Rose x={64} y={74} s={0.85} c="#f6c9d2" light="#fde7ec" dark="#e08ea2" />
        <rect x={80} y={58} width="24" height="20" rx="2" fill="#f7d9a8" />
        <rect x={78} y={53} width="28" height="7" rx="2" fill="#f2c98a" />
        <path d="M92 53V78" stroke="#d5718a" strokeWidth="3" />
        <Bow x={92} y={52} s={0.35} c="#e58aa0" dark="#c9617a" />
      </Piece>
    </>
  );
}

function Neelam() {
  const navy = "#24345a", mid = "#3f5384", light = "#8fa2c9", leaf = "#9aa9b8";
  const cluster = (
    <>
      <Sprig x={20} y={30} len={80} rot={18} c={leaf} stem="#7d8a98" n={6} />
      <Sprig x={50} y={20} len={60} rot={70} c="#b8c4cf" stem="#7d8a98" />
      <Leaf x={70} y={40} len={30} rot={120} c="#6f8199" />
      <Rose x={70} y={46} s={1.7} c={mid} light={light} dark={navy} />
      <Rose x={38} y={36} s={1.25} c={light} light="#d3dcef" dark={mid} rot={40} />
      <Rose x={96} y={70} s={1.15} c={navy} light={mid} dark="#141f38" rot={-20} />
      <Blossom x={24} y={58} s={0.9} c="#ffffff" centre="#c9a85a" line="#c7cfdc" />
      <Blossom x={100} y={34} s={0.7} c="#e6ebf4" centre="#c9a85a" />
    </>
  );
  return (
    <>
      <Frame inset={{ t: 6, b: 6, x: 8 }} color="#c9a227" width={2} double="#e0c66a" />
      <Piece at={{ right: "-12%", top: "-4%" }} w={58} vb="0 0 130 110">{cluster}</Piece>
      <Piece at={{ left: "-14%", bottom: "-4%" }} w={58} vb="0 0 130 110" style={{ transform: "rotate(180deg)" }}>{cluster}</Piece>
    </>
  );
}

function Pehli() {
  const pink = "#f4a9ba", pinkS = "#c9617a", gold = "#e9c97c", goldS = "#a8823a";
  return (
    <>
      <Piece at={{ right: "-10%", top: "-5%" }} w={60} vb="0 0 120 140">
        <Balloon x={80} y={36} r={21} c={pink} shade={pinkS} rot={10} />
        <Balloon x={46} y={28} r={17} c={gold} shade={goldS} rot={-8} />
        <Balloon x={98} y={78} r={16} c="#fde3e9" shade="#d58fa0" rot={16} />
        <Balloon x={62} y={70} r={14} c={pink} shade={pinkS} heart />
        {[[78, 26], [86, 44], [70, 40]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.2" fill="#fff" opacity=".7" />)}
        <Sparkles c="#d8b16c" pts={[[24, 50, 4], [34, 92, 3], [110, 12, 3]]} />
      </Piece>
      <Piece at={{ left: "-8%", top: "-3%" }} w={30} vb="0 0 70 60">
        <Sprig x={4} y={40} len={50} rot={-20} c="#b7cba8" stem="#8aa47a" />
        <Rose x={22} y={22} s={1} c="#f6c9d2" light="#fde7ec" dark="#e08ea2" />
        <Blossom x={44} y={30} s={0.6} c="#fde7ec" centre="#e7c983" />
      </Piece>
      <Piece at={{ left: "-10%", bottom: "-3%" }} w={48} vb="0 0 120 80">
        <Sprig x={6} y={60} len={70} rot={-35} c="#a9c29a" stem="#8aa47a" />
        <Rose x={36} y={56} s={1.3} c="#f2a7b8" light="#fbd6de" dark="#d5718a" />
        <Rose x={68} y={66} s={0.95} c="#f6c9d2" light="#fde7ec" dark="#e08ea2" rot={25} />
        <Blossom x={88} y={60} s={0.65} c="#fff" centre="#e7c983" line="#f0c9d3" />
      </Piece>
      <Piece at={{ right: "-10%", bottom: "-3%" }} w={46} vb="0 0 120 80" flip>
        <Sprig x={6} y={60} len={66} rot={-40} c="#b7cba8" stem="#8aa47a" />
        <Rose x={38} y={58} s={1.2} c="#f6c9d2" light="#fde7ec" dark="#e08ea2" />
        <Rose x={68} y={68} s={0.85} c="#f2a7b8" light="#fbd6de" dark="#d5718a" />
      </Piece>
    </>
  );
}

function Gulnaar() {
  const flowers = (
    <>
      <Sprig x={8} y={20} len={70} rot={25} c="#c9d7c2" stem="#a3b59a" />
      <Peony x={34} y={30} s={1.5} c="#e9a6bc" light="#f8dbe5" dark="#c46f8d" />
      <Peony x={66} y={20} s={1.05} c="#f1bfd0" light="#fce9ef" dark="#d48aa4" />
      <Blossom x={14} y={50} s={1} c="#f8dbe5" centre="#e2b45c" />
      <Blossom x={84} y={38} s={0.75} c="#fce9ef" centre="#e2b45c" />
      <Blossom x={52} y={52} s={0.6} c="#f4c8d6" centre="#e2b45c" />
    </>
  );
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 35% at 10% 8%, #fbe3ea, transparent 70%), radial-gradient(60% 30% at 95% 98%, #fbe3ea, transparent 70%)" }} />
      <Frame inset={{ t: 8, b: 6, x: 10 }} color="#e8c2cd" arch={20} />
      <Piece at={{ left: "-12%", top: "-4%" }} w={58} vb="0 0 110 80">{flowers}</Piece>
      <Piece at={{ left: "40%", top: "4%" }} w={12} vb="-25 -20 50 40"><Butterfly x={0} y={0} s={1} c="#f1b3c6" dark="#a8586b" rot={-10} /></Piece>
      <Piece at={{ right: "-14%", bottom: "-3%" }} w={62} vb="0 0 110 80" style={{ transform: "rotate(180deg)" }}>{flowers}</Piece>
      <Piece at={{ left: "6%", bottom: "2.5%" }} w={28} vb="-30 -30 75 72">
        <Pram x={0} y={0} s={1} c="#f6d3dd" dark="#d48aa4" />
        <Bow x={-4} y={4} s={0.25} c="#e58aa0" dark="#c9617a" />
      </Piece>
    </>
  );
}

function TeddyArt() {
  const tan = "#c9ae92", tanD = "#8a6c52", tanL = "#ead9c6";
  return (
    <>
      <Piece at={{ left: "-4%", top: "2%" }} w={36} vb="0 0 80 40">
        <Cloud x={24} y={18} s={0.8} c="#f6f2ec" />
        <Cloud x={58} y={26} s={0.55} c="#efe9e0" />
      </Piece>
      <Piece at={{ right: "-10%", top: "-6%" }} w={56} vb="0 0 120 120">
        <Balloon x={44} y={34} r={19} c="#bfa68c" shade="#7d6450" rot={-10} string="#9c8268" />
        <Balloon x={80} y={26} r={21} c="#efe7dc" shade="#b7a48d" rot={8} string="#9c8268" />
        <Balloon x={98} y={64} r={17} c="#8f7360" shade="#5f4838" rot={14} string="#9c8268" />
        <Balloon x={64} y={62} r={15} c="#d9c8b4" shade="#9c8268" string="#9c8268" />
        <Teddy x={64} y={92} s={0.42} c={tan} dark="#4a3628" light={tanL} />
      </Piece>
      <Piece at={{ right: "-8%", bottom: "-3%" }} w={60} vb="0 0 130 100">
        <Balloon x={90} y={30} r={20} c="#efe7dc" shade="#b7a48d" rot={10} string="#9c8268" />
        <Balloon x={116} y={48} r={18} c="#bfa68c" shade="#7d6450" rot={16} string="#9c8268" />
        <Balloon x={64} y={42} r={14} c="#8f7360" shade="#5f4838" rot={-8} string="#9c8268" />
        <Teddy x={92} y={62} s={0.55} c={tan} dark="#4a3628" light={tanL} />
        <Teddy x={44} y={74} s={0.38} c="#dcc6ad" dark="#4a3628" light="#f2e6d8" />
      </Piece>
      <Piece at={{ left: "-6%", bottom: "-2%" }} w={34} vb="0 0 70 50">
        <Balloon x={22} y={22} r={11} c="#d9c8b4" shade="#9c8268" rot={-12} string="#9c8268" />
        <Balloon x={42} y={30} r={9} c="#efe7dc" shade="#b7a48d" string="#9c8268" />
        <rect x={6} y={38} width="16" height="12" rx="2" fill={tanD} opacity=".55" />
      </Piece>
    </>
  );
}

function Bhalu() {
  return (
    <>
      <Piece at={{ left: "-6%", top: "8%" }} w={40} vb="0 0 80 40"><Cloud x={30} y={20} s={0.9} c="#fff" /></Piece>
      <Piece at={{ right: "-8%", top: "22%" }} w={36} vb="0 0 80 40"><Cloud x={40} y={20} s={0.8} c="#fff" /></Piece>
      <Frame inset={{ t: 4, b: 4, x: 9 }} color="rgba(255,255,255,.7)" width={1} arch={26} fill="#d9c3b3" />
      <Frame inset={{ t: 5.5, b: 5.5, x: 12 }} color="rgba(255,255,255,.55)" width={1} arch={25} />
      <Piece at={{ left: "30%", top: "3%" }} w={40} vb="0 0 100 120">
        {[[30, 30, "#c9ab8f"], [52, 18, "#e9dccb"], [72, 32, "#b59378"], [42, 52, "#ddcab6"], [64, 54, "#c9ab8f"], [24, 56, "#efe6da"], [80, 58, "#e9dccb"], [50, 36, "#b59378"]].map(([x, y, c], i) => (
          <g key={i}>
            <path d={`M${x} ${Number(y) + 12}L50 96`} stroke="#9c8268" strokeWidth=".5" />
            <Balloon x={Number(x)} y={Number(y)} r={11} c={String(c)} shade="#7d6450" string="none" />
          </g>
        ))}
        <Teddy x={50} y={94} s={0.42} c="#c3a183" dark="#4a3628" light="#ead9c6" />
      </Piece>
      <Piece at={{ left: "2%", bottom: "7%" }} w={20} vb="-30 -34 60 76"><HotAirBalloon x={0} y={0} s={1} c="#d9c3b3" stripe="#efe6da" basket="#9c8268" /></Piece>
      <Piece at={{ right: "2%", bottom: "13%" }} w={16} vb="-30 -34 60 76"><HotAirBalloon x={0} y={0} s={1} c="#c9ab8f" stripe="#e9dccb" basket="#9c8268" /></Piece>
    </>
  );
}

function Saadgi() {
  const flowers = (
    <>
      <Sprig x={4} y={24} len={80} rot={20} c="#a9b89b" stem="#8b9a7e" n={6} />
      <Sprig x={30} y={10} len={60} rot={60} c="#c6d1b9" stem="#8b9a7e" />
      <Rose x={34} y={34} s={1.35} c="#f7f4ee" light="#ffffff" dark="#e4dccd" />
      <Rose x={62} y={26} s={0.95} c="#f2ede3" light="#fffdf8" dark="#ddd3c1" rot={30} />
      <Blossom x={14} y={52} s={0.9} c="#ffffff" centre="#d8c68e" line="#ddd8cc" />
      <Blossom x={80} y={46} s={0.7} c="#f7f4ee" centre="#d8c68e" line="#ddd8cc" />
      <Leaf x={50} y={52} len={22} rot={70} c="#93a486" />
    </>
  );
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(55% 30% at 8% 6%, #eef2e8, transparent 70%), radial-gradient(55% 30% at 96% 96%, #eef2e8, transparent 70%)" }} />
      <Piece at={{ left: "-10%", top: "-3%" }} w={56} vb="0 0 110 80" style={{ filter: "drop-shadow(0 .6cqw .8cqw rgba(0,0,0,.08))" }}>{flowers}</Piece>
      <Piece at={{ right: "-10%", bottom: "-3%" }} w={56} vb="0 0 110 80" style={{ transform: "rotate(180deg)", filter: "drop-shadow(0 -.6cqw .8cqw rgba(0,0,0,.08))" }}>{flowers}</Piece>
      <Piece at={{ left: "4%", bottom: "4%" }} w={24} vb="0 0 60 50">
        <Sprig x={4} y={44} len={50} rot={-60} c="#b8c6a9" stem="#8b9a7e" />
        <Blossom x={30} y={18} s={0.6} c="#ffffff" centre="#d8c68e" line="#ddd8cc" />
      </Piece>
    </>
  );
}

function Zaitoon() {
  return (
    <>
      <Frame inset={{ t: 5, b: 3, x: 6 }} color="#4c4a24" width={1} arch={24} fill="linear-gradient(180deg, #67643a, #55532c)" />
      <Frame inset={{ t: 7, b: 5, x: 9.5 }} color="rgba(217,197,142,.55)" width={1} arch={23} />
      <Piece at={{ right: "-6%", top: "0%" }} w={48} vb="0 0 110 90">
        <Sprig x={10} y={30} len={80} rot={8} c="#a8ad86" stem="#8a8d66" n={6} />
        <Sprig x={50} y={20} len={50} rot={80} c="#c3c6a6" stem="#8a8d66" />
        <Rose x={62} y={36} s={1.35} c="#f6f1e6" light="#ffffff" dark="#e2d8c3" />
        <Rose x={88} y={58} s={1} c="#efe7d6" light="#fffaf0" dark="#d9cdb4" rot={40} />
        <Blossom x={34} y={44} s={0.85} c="#ffffff" centre="#d9c58e" />
        <Blossom x={96} y={26} s={0.65} c="#fbf7ee" centre="#d9c58e" />
      </Piece>
      <Piece at={{ left: "-4%", bottom: "-1%" }} w={32} vb="0 0 70 50">
        <Sprig x={4} y={44} len={56} rot={-50} c="#a8ad86" stem="#8a8d66" />
        <Blossom x={30} y={30} s={0.8} c="#ffffff" centre="#d9c58e" />
        <Blossom x={46} y={40} s={0.55} c="#f6f1e6" centre="#d9c58e" />
      </Piece>
    </>
  );
}

function Surkh() {
  const red = "#a3192c", redL = "#d2404f", redD = "#5e0b16", leaf = "#5f6f47";
  const cluster = (
    <>
      <Sprig x={4} y={30} len={80} rot={14} c={leaf} stem="#4b5838" n={6} size={0.26} />
      <Rose x={34} y={36} s={1.7} c={red} light={redL} dark={redD} />
      <Rose x={68} y={26} s={1.25} c={redL} light="#e7707a" dark={red} rot={40} />
      <Rose x={18} y={64} s={1.1} c={red} light={redL} dark={redD} rot={-30} />
      <Rose x={60} y={60} s={0.9} c="#c22b3c" light="#e25a66" dark={redD} />
      <Leaf x={84} y={46} len={20} rot={30} c={leaf} />
    </>
  );
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(115deg, rgba(255,255,255,.18) 0 3cqw, transparent 3cqw 9cqw)", opacity: 0.6 }} />
      <Piece at={{ left: "-14%", top: "-5%" }} w={60} vb="0 0 110 90">{cluster}</Piece>
      <Piece at={{ right: "-14%", top: "-3%" }} w={44} vb="0 0 110 90" flip>{cluster}</Piece>
      <Piece at={{ left: "-14%", bottom: "-3%" }} w={40} vb="0 0 110 90" style={{ transform: "rotate(160deg)" }}>{cluster}</Piece>
      {/* the bride and groom, in silhouette */}
      <Piece at={{ right: "3%", bottom: "0" }} w={30} vb="0 0 100 150">
        <ellipse cx="50" cy="146" rx="48" ry="4" fill="#5e0b16" opacity=".18" />
        {/* groom: sherwani and turban */}
        <circle cx="66" cy="22" r="8.5" fill="#2a1416" />
        <path d="M57 18Q66 6 75 18L74 22H58Z" fill="#7a1420" />
        <path d="M54 34Q66 28 78 34L82 98H50Z" fill="#2a1416" />
        <path d="M50 98H82L80 146H70L66 106L62 146H52Z" fill="#3a1d20" />
        <path d="M66 32V96" stroke="#c9a24a" strokeWidth="1" strokeDasharray="2 3" />
        {/* bride: red lehenga with a long dupatta */}
        <circle cx="38" cy="30" r="8" fill="#2a1416" />
        <path d="M26 30C26 14 50 14 50 30L58 70C46 64 34 66 22 74Z" fill="#a3192c" opacity=".92" />
        <path d="M30 40Q38 36 46 40L48 70H28Z" fill="#7a0f1d" />
        <path d="M28 66Q38 62 48 66L66 146H4Z" fill="#a3192c" />
        <path d="M14 120Q35 112 58 120M10 134Q35 126 62 134" stroke="#c9a24a" strokeWidth="1.2" fill="none" opacity=".8" />
        <path d="M22 74C14 96 10 120 6 144" stroke="#d2404f" strokeWidth="3" fill="none" opacity=".7" />
      </Piece>
    </>
  );
}

const ART: Record<PrintArtId, () => ReactNode> = {
  lifafa: Lifafa, gubbara: Gubbara, neelam: Neelam, pehli: Pehli, gulnaar: Gulnaar, teddy: TeddyArt, bhalu: Bhalu, saadgi: Saadgi, zaitoon: Zaitoon, surkh: Surkh,
};

/** The whole illustrated background of a printed-card design. Fills its (positioned) parent. */
export function PrintArt({ art, className = "" }: { art: PrintArtId; className?: string }) {
  const Art = ART[art];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ background: BG[art], containerType: "size" }}>
      <Art />
    </div>
  );
}

export { Rings };
