import type { CSSProperties } from "react";
import { Leaf, Peony, Rose } from "./PrintArt";

/*
 * Drawings for Firdaus (after Webgency's template 5): a painted palace courtyard with a fountain, doves and falling
 * petals, red and ivory roses, a gold flower wax seal and a pencil sketch of a chateau. Our own vector art; no ids.
 */

/** Red and ivory garden roses in a bank along an edge. `flip` mirrors it. */
export function RoseBank({ className, style, flip = false }: { className?: string; style?: CSSProperties; flip?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 400 120" className={`pointer-events-none ${className ?? ""}`} style={{ ...style, transform: flip ? "scaleX(-1)" : undefined }}>
      <Leaf x={20} y={92} len={46} rot={-30} c="#3f6b3a" />
      <Leaf x={150} y={96} len={40} rot={-160} c="#4d7a44" />
      <Leaf x={250} y={90} len={44} rot={-20} c="#3f6b3a" />
      <Leaf x={360} y={94} len={40} rot={-150} c="#4d7a44" />
      <Rose x={40} y={104} s={2.5} c="#a3112c" light="#d1324a" dark="#6e0718" />
      <Peony x={120} y={112} s={2.1} c="#efe6d2" light="#fffaf0" dark="#d6c7a6" />
      <Rose x={205} y={108} s={2.2} c="#fbf3e2" light="#ffffff" dark="#dccfb0" rot={20} />
      <Rose x={300} y={100} s={2.8} c="#b0162f" light="#da3d55" dark="#760a1c" rot={-15} />
      <Peony x={385} y={110} s={1.9} c="#f2eadb" light="#ffffff" dark="#d8caa8" />
    </svg>
  );
}

/** A white dove in flight; its wings beat (CSS .fd-wing). */
function Dove({ x, y, s, delay }: { x: number; y: number; s: number; delay: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="fd-dove" style={{ animationDelay: delay }}>
        <path className="fd-wing" style={{ animationDelay: delay }} d="M0 0C-8-22-30-30-44-26C-30-18-20-6-4 4Z" fill="#f4f4f2" />
        <path d="M-18 6C-4 -4 18 -4 30 2C36 5 40 2 44 4C40 8 34 10 28 10C14 16-4 16-18 6Z" fill="#ffffff" />
        <path d="M-18 6L-34 12L-30 4Z" fill="#ececea" />
        <circle cx="34" cy="4" r="1.3" fill="#3a3a3a" /><path d="M43 4L48 5L43 7Z" fill="#e0a49b" />
        <path className="fd-wing" style={{ animationDelay: delay }} d="M4 2C10-20 30-34 46-32C34-22 26-8 12 6Z" fill="#ffffff" />
      </g>
    </g>
  );
}

/** One wing of the chateau courtyard: two storeys of arches with a balustrade. */
function Wing({ x, flip }: { x: number; flip?: boolean }) {
  const arches = [0, 1, 2];
  return (
    <g transform={`translate(${x} 0)${flip ? " scale(-1 1)" : ""}`}>
      <path d="M0 470H150V700H0Z" fill="#d8cab0" />
      <path d="M0 470H150V478H0Z" fill="#c4b494" />
      <path d="M150 470L150 700L132 700L132 470Z" fill="#c8b998" />
      {/* the roof line and balustrade */}
      <path d="M-4 462H156V470H-4Z" fill="#e6dbc5" />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={2 + i * 11} y={444} width="4" height="18" rx="2" fill="#e2d6be" />)}
      <path d="M-4 440H156V446H-4Z" fill="#e9dfcb" />
      {/* upper arches */}
      {arches.map((i) => <path key={`u${i}`} d={`M${12 + i * 46} 560V520C${12 + i * 46} 500 ${46 + i * 46} 500 ${46 + i * 46} 520V560Z`} fill="#8f8572" opacity=".75" />)}
      <path d="M0 568H150V576H0Z" fill="#e6dbc5" />
      {Array.from({ length: 14 }, (_, i) => <rect key={`b${i}`} x={2 + i * 11} y={576} width="4" height="16" rx="2" fill="#e2d6be" />)}
      {/* lower arches, deeper in shadow */}
      {arches.map((i) => <path key={`l${i}`} d={`M${10 + i * 46} 700V632C${10 + i * 46} 606 ${48 + i * 46} 606 ${48 + i * 46} 632V700Z`} fill="#6f6656" opacity=".8" />)}
      <path d="M0 600H150V606H0Z" fill="#cfc0a3" />
    </g>
  );
}

/**
 * Firdaus's opening page: a painted sky, a chateau courtyard, a three-tier fountain with running water, two doves,
 * petals drifting down and roses along the bottom. Fills its (relative) parent; the words sit on the sky.
 */
export function Courtyard({ className }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #3f64a0 0%, #557bb5 28%, #7d9cc8 48%, #b9cbe1 62%, #dfe5ea 72%)" }} />
      {/* painted clouds: soft white strokes, blurred */}
      <div className="absolute inset-0" style={{ filter: "blur(10px)", opacity: 0.55 }}>
        <span className="absolute left-[-10%] top-[8%] h-[7%] w-[60%] rounded-full bg-white/50" />
        <span className="absolute right-[-8%] top-[20%] h-[6%] w-[55%] rounded-full bg-white/40" />
        <span className="absolute left-[10%] top-[44%] h-[8%] w-[85%] rounded-full bg-white/70" />
      </div>
      {/* the doves, up in the sky */}
      <svg viewBox="0 0 390 300" className="absolute left-0 top-[1%] w-[70%]">
        <Dove x={90} y={70} s={0.85} delay="0s" />
        <Dove x={46} y={150} s={0.6} delay="-.4s" />
      </svg>
      {/* the courtyard sits on the bottom edge at a fixed shape, so the sky above takes up whatever height is left */}
      <svg viewBox="0 430 390 414" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[50%] w-full">
        {/* the far house behind the fountain */}
        <path d="M100 450H290V700H100Z" fill="#e3d7bf" />
        <path d="M92 440H298V452H92Z" fill="#efe6d4" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M${116 + i * 42} 560V510C${116 + i * 42} 492 ${144 + i * 42} 492 ${144 + i * 42} 510V560Z`} fill="#9d927d" opacity=".55" />)}
        <Wing x={-30} />
        <Wing x={420} flip />
        {/* the pool */}
        <ellipse cx="195" cy="760" rx="240" ry="70" fill="#5f7f9c" />
        <ellipse cx="195" cy="752" rx="230" ry="58" fill="#7c9bb5" />
        <path d="M-20 740Q195 700 410 740" fill="none" stroke="#e8eef3" strokeOpacity=".5" strokeWidth="2" />
        {/* the fountain: base, stem and three bowls */}
        <path d="M150 760H240L230 720H160Z" fill="#b9aa8d" />
        <path d="M150 760H240V770H150Z" fill="#a1937a" />
        <path d="M178 720C170 690 180 650 186 620H204C210 650 220 690 212 720Z" fill="#c9bb9e" />
        <path d="M110 640Q195 668 280 640L270 652Q195 690 120 652Z" fill="#cdbfa3" />
        <ellipse cx="195" cy="640" rx="85" ry="12" fill="#ddd2bb" />
        <path d="M188 620C184 600 188 580 192 562H198C202 580 206 600 202 620Z" fill="#c9bb9e" />
        <path d="M140 562Q195 582 250 562L242 572Q195 598 148 572Z" fill="#cdbfa3" />
        <ellipse cx="195" cy="562" rx="55" ry="9" fill="#ddd2bb" />
        <path d="M190 548C188 534 190 520 194 506H196C200 520 202 534 200 548Z" fill="#c9bb9e" />
        <path d="M168 506Q195 518 222 506L216 514Q195 528 174 514Z" fill="#cdbfa3" />
        <path d="M195 470C188 480 188 494 195 500C202 494 202 480 195 470Z" fill="#d8ccb3" />
        {/* running water: dashed strokes that flow (CSS .fd-water) */}
        <g className="fd-water" fill="none" stroke="#ffffff" strokeLinecap="round" strokeOpacity=".85">
          {[[-26, 506, 600], [26, 506, 600], [-58, 562, 680], [58, 562, 680], [-88, 640, 750], [88, 640, 750], [-70, 640, 748], [70, 640, 748]].map(([dx, y0, y1], i) => (
            <path key={i} d={`M${195 + dx * 0.95} ${y0 + 4}Q${195 + dx * 1.25} ${y0 + 20} ${195 + dx * 1.3} ${y1}`} strokeWidth={i < 2 ? 1.1 : 1.5} strokeDasharray="3 5" />
          ))}
          <path d="M195 470V440" strokeWidth="1.4" strokeDasharray="3 4" />
        </g>
        <g fill="none" stroke="#ffffff" strokeOpacity=".35" strokeLinecap="round">
          {[[-26, 506, 600], [26, 506, 600], [-58, 562, 680], [58, 562, 680], [-88, 640, 750], [88, 640, 750]].map(([dx, y0, y1], i) => (
            <path key={i} d={`M${195 + dx * 0.95} ${y0 + 4}Q${195 + dx * 1.25} ${y0 + 20} ${195 + dx * 1.3} ${y1}`} strokeWidth="3" />
          ))}
        </g>
        <g className="fd-mist" fill="#ffffff" opacity=".35">
          <ellipse cx="195" cy="742" rx="120" ry="16" />
        </g>
      </svg>
      {/* petals drifting down (CSS .fd-petal) */}
      {[8, 22, 37, 52, 66, 79, 91].map((left, i) => (
        <span key={i} className="fd-petal absolute top-[-4%] block h-3 w-2.5 rounded-[60%_40%_60%_40%]"
          style={{ left: `${left}%`, background: i % 2 ? "#f2b8bf" : "#f8d4d6", animationDelay: `${-i * 1.7}s`, animationDuration: `${9 + (i % 3) * 2}s` }} />
      ))}
      <RoseBank className="absolute bottom-[-2%] left-[-6%] w-[112%]" />
    </div>
  );
}

/** A gold wax seal stamped with a flower (Firdaus's envelope). */
export function FlowerSeal({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden viewBox="-32 -32 64 64" className={className} style={style}>
      <path d="M0-30C9-31 14-25 21-22C28-18 29-10 30-2C31 7 27 13 23 19C18 26 10 30 1 30C-8 31-14 26-20 22C-27 17-31 9-30 0C-31-9-26-15-21-21C-15-27-8-29 0-30Z" fill="#c7a46c" />
      <circle r="21" fill="#d6b67f" />
      <circle r="21" fill="none" stroke="#a5824d" strokeWidth="1.6" />
      <circle r="18" fill="none" stroke="#efdcae" strokeOpacity=".6" strokeWidth=".6" />
      {/* the stamped flower: raised petals with a light edge and a shadow edge */}
      <g>
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a})`}>
            <path d="M0-2C-5-7-5-14 0-15C5-14 5-7 0-2Z" fill="#c9a66e" stroke="#a5824d" strokeWidth=".6" />
            <path d="M-2.5-12C-1.2-14 1.2-14 2.5-12" fill="none" stroke="#f3e2ba" strokeWidth=".6" />
          </g>
        ))}
        {[36, 108, 180, 252, 324].map((a) => <path key={a} transform={`rotate(${a})`} d="M0-9L-1.5-16M0-9L1.5-16" stroke="#a5824d" strokeWidth=".5" />)}
        <circle r="3.2" fill="#b8955e" stroke="#f0ddb2" strokeWidth=".5" />
      </g>
      <ellipse cx="-10" cy="-13" rx="7" ry="3" fill="#fff" opacity=".22" transform="rotate(-35 -10 -13)" />
    </svg>
  );
}

/** A pencil sketch of a chateau with a mansard roof and tall windows (the venue). */
export function ChateauSketch({ className, color = "#3d3a36" }: { className?: string; color?: string }) {
  const win = (x: number, y: number) => <path key={`${x}-${y}`} d={`M${x} ${y + 22}V${y + 4}C${x} ${y} ${x + 8} ${y} ${x + 8} ${y + 4}V${y + 22}ZM${x + 4} ${y + 1}V${y + 22}M${x} ${y + 11}H${x + 8}`} />;
  return (
    <svg aria-hidden viewBox="0 0 300 130" className={className}>
      <g fill="none" stroke={color} strokeWidth=".8" strokeLinejoin="round" opacity=".85">
        <path d="M4 124H296" strokeWidth="1" />
        {/* the main block, its roof and dormers */}
        <path d="M70 124V60H230V124" /><path d="M66 60H234L222 36H78Z" /><path d="M150 36V22M144 22H156" />
        {[96, 128, 160, 192].map((x) => <path key={x} d={`M${x} 48V40L${x + 6} 34L${x + 12} 40V48Z`} />)}
        {[80, 104, 128, 164, 188, 212].map((x) => win(x, 68))}
        {[80, 104, 128, 164, 188, 212].map((x) => win(x, 96))}
        <path d="M140 124V100C140 92 160 92 160 100V124" />
        {/* the two side pavilions */}
        {[[20, 70], [230, 280]].map(([a, b]) => (
          <g key={a}><path d={`M${a} 124V74H${b}V124`} /><path d={`M${a - 3} 74H${b + 3}L${b - 6} 56H${a + 6}Z`} />{win(a + 10, 84)}{win(a + 32, 84)}</g>
        ))}
        {/* hatching for the pencil look */}
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${78 + i * 12} 36L${70 + i * 12} 52`} strokeOpacity=".35" />)}
        <path d="M30 124C26 112 34 104 40 110M262 124C266 112 258 104 252 110" />
      </g>
    </svg>
  );
}
