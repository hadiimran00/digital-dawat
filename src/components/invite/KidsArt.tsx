import type { CSSProperties, ReactNode } from "react";

/*
 * The kids' party designs: the owner's 3D characters (public/art/kids) with soft "3D toy" artwork made of shaded CSS
 * shapes around them, brought to life with CSS animations (.kid-* in globals.css): balloons bob, the candles in the
 * pictures flicker, confetti falls, lights twinkle.
 * Positions are in % of the card, sizes in cqw (the card is a size container), so it fits a thumbnail and a phone.
 * Every moving piece carries .kid-anim, which reduced-motion turns off.
 */

const A = (s: CSSProperties) => s;
/** a tiny deterministic random, so the server and the browser draw the same scene */
const rnd = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };

function Balloon3D({ x, y, size, c, light, dark, delay = 0, dur = 5, sway = 3 }: { x: number; y: number; size: number; c: string; light: string; dark: string; delay?: number; dur?: number; sway?: number }) {
  return (
    <div className="kid-anim kid-bob absolute" style={A({ left: `${x}%`, top: `${y}%`, width: `${size}cqw`, height: `${size * 2.3}cqw`, animationDelay: `${delay}s`, animationDuration: `${dur}s`, ["--sway" as string]: `${sway}deg`, transformOrigin: "50% 100%" })}>
      <svg aria-hidden viewBox="0 0 20 30" preserveAspectRatio="none" className="absolute left-1/2 top-[50%] h-[50%] w-[40%] -translate-x-1/2">
        <path d="M10 0Q4 8 10 15T10 30" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth=".6" />
      </svg>
      <div className="absolute inset-x-0 top-0" style={{ height: `${size * 1.2}cqw`, borderRadius: "50% 50% 47% 47% / 55% 55% 45% 45%", background: `radial-gradient(circle at 32% 25%, #fff 0 5%, ${light} 15%, ${c} 48%, ${dark} 100%)`, boxShadow: `inset -${size * 0.08}cqw -${size * 0.1}cqw ${size * 0.18}cqw rgba(0,0,0,.18)` }} />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: `${size * 1.17}cqw`, width: 0, height: 0, borderLeft: `${size * 0.07}cqw solid transparent`, borderRight: `${size * 0.07}cqw solid transparent`, borderBottom: `${size * 0.1}cqw solid ${dark}` }} />
    </div>
  );
}

function Bokeh({ n, colors, seed }: { n: number; colors: string[]; seed: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const s = 4 + rnd(seed + i) * 12;
        return <span key={i} className="kid-anim kid-twinkle absolute rounded-full" style={{ left: `${rnd(seed + i * 3) * 100}%`, top: `${rnd(seed + i * 7) * 70}%`, width: `${s}cqw`, height: `${s}cqw`, background: `radial-gradient(circle, ${colors[i % colors.length]}, transparent 70%)`, animationDelay: `${rnd(seed + i * 11) * 4}s`, animationDuration: `${3 + rnd(seed + i) * 3}s` }} />;
      })}
    </>
  );
}

function Confetti({ n, colors, seed }: { n: number; colors: string[]; seed: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="kid-anim kid-fall absolute top-0" style={{ left: `${rnd(seed + i) * 100}%`, width: `${1 + rnd(seed + i * 5)}cqw`, height: `${2 + rnd(seed + i * 9) * 1.5}cqw`, background: colors[i % colors.length], borderRadius: "0.3cqw", animationDelay: `${-rnd(seed + i * 13) * 9}s`, animationDuration: `${6 + rnd(seed + i * 17) * 5}s` }} />
      ))}
    </>
  );
}

function Firework({ x, y, size, c, delay }: { x: number; y: number; size: number; c: string; delay: number }) {
  return (
    <div className="kid-anim kid-burst absolute" style={{ left: `${x}%`, top: `${y}%`, width: `${size}cqw`, height: `${size}cqw`, animationDelay: `${delay}s` }}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} className="absolute left-1/2 top-1/2 rounded-full" style={{ width: `${size * 0.05}cqw`, height: `${size * 0.32}cqw`, background: `linear-gradient(${c}, transparent)`, transform: `translate(-50%, -100%) rotate(${i * 30}deg)`, transformOrigin: "50% 100%" }} />
      ))}
    </div>
  );
}

function Bunting({ colors, top = 2 }: { colors: string[]; top?: number }) {
  const flags = 11;
  return (
    <div className="absolute inset-x-[-4%]" style={{ top: `${top}%`, height: "14cqw" }}>
      <svg aria-hidden viewBox="0 0 100 14" preserveAspectRatio="none" className="absolute inset-0 h-full w-full"><path d="M0 2Q50 12 100 2" fill="none" stroke="#fff" strokeWidth=".5" /></svg>
      {Array.from({ length: flags }, (_, i) => {
        const t = (i + 0.5) / flags;
        const y = 2 + 20 * t * (1 - t) * 2; // follows the curve
        return <span key={i} className="kid-anim kid-swing absolute" style={{ left: `${t * 100}%`, top: `${y * 7}%`, width: 0, height: 0, borderLeft: "3cqw solid transparent", borderRight: "3cqw solid transparent", borderTop: `6cqw solid ${colors[i % colors.length]}`, transform: "translateX(-50%)", transformOrigin: "50% 0", animationDelay: `${i * 0.2}s`, filter: "drop-shadow(0 .4cqw .3cqw rgba(0,0,0,.15))" }} />;
      })}
    </div>
  );
}

function Cloud({ y, size, dur, delay }: { y: number; size: number; dur: number; delay: number }) {
  return (
    <div className="kid-anim kid-drift absolute left-0" style={{ top: `${y}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
      <div className="relative" style={{ width: `${size}cqw`, height: `${size * 0.45}cqw` }}>
        {[[0, 40, 50], [25, 10, 60], [55, 30, 45]].map(([l, t, s], i) => <span key={i} className="absolute rounded-full" style={{ left: `${l}%`, top: `${t}%`, width: `${s}%`, height: `${s * 2.2}%`, background: "radial-gradient(circle at 40% 35%, #fff, #e8f6ff 70%)" }} />)}
      </div>
    </div>
  );
}

function Heart({ x, delay, size, c }: { x: number; delay: number; size: number; c: string }) {
  return (
    <span className="kid-anim kid-rise absolute bottom-0" style={{ left: `${x}%`, width: `${size}cqw`, height: `${size}cqw`, animationDelay: `${delay}s`, background: `radial-gradient(circle at 35% 30%, #fff8 0 15%, transparent 16%), ${c}`, clipPath: "path('M50 92C10 62 0 40 12 22C24 4 46 10 50 28C54 10 76 4 88 22C100 40 90 62 50 92Z')", transform: "scale(var(--s,1))" }} />
  );
}

/** A live candle glow laid over a flame in a picture (x, y in % of the picture), so the photo's candles flicker. */
function Glow({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <span className="kid-anim kid-glow absolute rounded-full mix-blend-screen" style={{ left: `${x}%`, top: `${y}%`, width: `${size}cqw`, height: `${size * 1.3}cqw`, translate: "-50% -50%", background: "radial-gradient(closest-side, rgba(255,236,170,.95), rgba(255,170,60,.45) 45%, rgba(255,140,40,0))", animationDuration: `${1.1 + (x % 7) / 10}s` }} />
  );
}

/** The owner's 3D character scenes (public/art/kids), blended into the design with live candle glows. */
function Scene({ src, style, imgStyle, flames, className = "" }: { src: string; style: CSSProperties; imgStyle?: CSSProperties; flames: [number, number][]; className?: string }) {
  return (
    <div className={`absolute overflow-hidden ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export; decorative artwork */}
      <img src={src} alt="" className="block h-full w-full object-cover" style={imgStyle} />
      {flames.map(([x, y], i) => <Glow key={i} x={x} y={y} size={7} />)}
    </div>
  );
}

/** The big age number: a glossy toy number with a deep 3D edge, bobbing gently. */
export function Number3D({ value, face, edge, size = 30 }: { value: string; face: string; edge: string; size?: number }) {
  const depth = Array.from({ length: 9 }, (_, i) => `${(i + 1) * size * 0.006}cqw ${(i + 1) * size * 0.007}cqw 0 ${edge}`).join(", ");
  const font: CSSProperties = { fontFamily: "var(--nf-fun), var(--nf-sans), system-ui", fontWeight: 700, fontSize: `${size}cqw`, lineHeight: 0.95, letterSpacing: "-0.04em" };
  return (
    <div aria-hidden className="kid-anim kid-bob relative inline-block" style={{ ["--sway" as string]: "2deg", animationDuration: "4.5s" }}>
      <span className="absolute inset-0" style={{ ...font, color: edge, textShadow: `${depth}, 0 ${size * 0.08}cqw ${size * 0.1}cqw rgba(0,0,0,.3)` }}>{value}</span>
      <span className="relative" style={{ ...font, backgroundImage: face, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{value}</span>
    </div>
  );
}

/* ---------- the three designs ---------- */

function Jashn() {
  return (
    <>
      <Bokeh n={16} colors={["#ffb347aa", "#5ec8ffaa", "#ff6fb0aa", "#fff3b0aa"]} seed={3} />
      <Firework x={12} y={10} size={26} c="#ffd36e" delay={0} />
      <Firework x={62} y={6} size={22} c="#7fe3ff" delay={1.6} />
      <Firework x={40} y={22} size={18} c="#ff8fc8" delay={3.1} />
      <Balloon3D x={-4} y={4} size={20} c="#3fa9f5" light="#9fd6ff" dark="#1b5f9e" delay={0} dur={5.5} />
      <Balloon3D x={13} y={13} size={16} c="#ff8a3d" light="#ffc49b" dark="#b4521a" delay={0.8} dur={4.6} />
      <Balloon3D x={78} y={3} size={21} c="#36d1b5" light="#a2f0e2" dark="#13806c" delay={0.4} dur={5.2} sway={-3} />
      <Balloon3D x={68} y={16} size={14} c="#ff5f9e" light="#ffb1cf" dark="#a8295b" delay={1.3} dur={4.2} sway={-3} />
      <Scene src="/art/kids/jashn-scene.webp" flames={[[33, 70], [41, 69], [50, 68], [59, 69], [66, 70]]}
        style={{ left: "50%", bottom: 0, width: "84cqw", aspectRatio: "928 / 1152", translate: "-50% 0", WebkitMaskImage: "radial-gradient(75% 70% at 50% 62%, #000 55%, transparent 100%)", maskImage: "radial-gradient(75% 70% at 50% 62%, #000 55%, transparent 100%)" }} />
    </>
  );
}

function Khilona() {
  return (
    <>
      <div className="absolute rounded-full" style={{ right: "-14%", top: "-8%", width: "60cqw", height: "60cqw", background: "radial-gradient(circle, rgba(255,246,190,.9), rgba(255,246,190,0) 65%)" }} />
      <Cloud y={14} size={30} dur={38} delay={-6} />
      <Cloud y={26} size={22} dur={46} delay={-28} />
      <Bunting colors={["#ff4d8d", "#ffd23f", "#3ec1d3", "#7b5cff", "#43d17a"]} />
      <Confetti n={18} colors={["#ff4d8d", "#ffd23f", "#7b5cff", "#43d17a", "#ffffff"]} seed={7} />
      <Balloon3D x={-5} y={16} size={19} c="#ff4d8d" light="#ffb0cc" dark="#b3245c" delay={0.2} dur={5} />
      <Balloon3D x={8} y={30} size={15} c="#ffd23f" light="#fff0a8" dark="#b38b10" delay={1.1} dur={4.4} />
      <Balloon3D x={80} y={15} size={19} c="#7b5cff" light="#c7b8ff" dark="#4a2fb8" delay={0.6} dur={5.4} sway={-3} />
      <Balloon3D x={70} y={30} size={14} c="#43d17a" light="#aef0c8" dark="#1f8a4a" delay={1.6} dur={4.8} sway={-3} />
      {/* a grassy hill for the cake to stand on */}
      <div className="absolute left-[-20%] right-[-20%] bottom-[-14%] h-[26%] rounded-[50%]" style={{ background: "radial-gradient(ellipse at 50% 20%, #8fe388, #4fb85a 60%, #2f8a40)" }} />
      <div className="absolute" style={{ left: "50%", bottom: "5cqw", height: "64cqw", translate: "-50% 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; decorative artwork */}
        <img src="/art/kids/khilona-boy.webp" alt="" className="h-full w-auto drop-shadow-[0_1.5cqw_1.5cqw_rgba(0,60,20,.35)]" />
        <Glow x={50} y={33} size={14} />
      </div>
    </>
  );
}

function Pari() {
  return (
    <>
      <Bokeh n={14} colors={["#ffe3a3aa", "#ffffffaa", "#ffc1d6aa"]} seed={11} />
      {[8, 22, 70, 86, 46].map((x, i) => <Heart key={x} x={x} delay={i * 1.7} size={6 + (i % 3) * 2} c={["#ff7aa8", "#ffb3cd", "#ff5c95"][i % 3]} />)}
      <Balloon3D x={-4} y={5} size={18} c="#ffb3cd" light="#ffe1ec" dark="#d1668f" delay={0.3} dur={5.2} />
      <Balloon3D x={80} y={6} size={18} c="#f5d08a" light="#fff0cc" dark="#b8913f" delay={1} dur={4.8} sway={-3} />
      <Scene src="/art/kids/pari-scene.webp" flames={[[36, 86], [50, 83], [62, 86]]} imgStyle={{ objectPosition: "50% 30%" }}
        className="border-[1.2cqw] border-white shadow-[0_2cqw_5cqw_rgba(194,24,91,.35)]"
        style={{ left: "50%", top: "4%", width: "42cqw", height: "56cqw", translate: "-50% 0", borderRadius: "21cqw 21cqw 5cqw 5cqw" }} />
    </>
  );
}

export const KIDS_BG: Record<"jashn" | "khilona" | "pari", string> = {
  jashn: "radial-gradient(120% 80% at 50% 30%, #3a2466, #170f33 70%, #0b0820)",
  khilona: "linear-gradient(180deg, #38c4e6 0%, #7fdcec 45%, #c9f3e6 100%)",
  pari: "radial-gradient(110% 80% at 50% 70%, #ffe6ee, #ffc3d6 55%, #f59ab8)",
};
export const KIDS_ART: Record<"jashn" | "khilona" | "pari", () => ReactNode> = { jashn: Jashn, khilona: Khilona, pari: Pari };
