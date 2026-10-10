import type { Ornament as OrnamentKind } from "@/lib/templates";

/** Tall ornaments frame the whole card; the others sit in the top area above the text. */
export const isTallOrnament = (k: OrnamentKind) => k === "arch" || k === "jharokha";

/** Original, code-drawn decorative artwork. Sized by parent; colours via currentColor. */
export function Ornament({ kind, className = "" }: { kind: OrnamentKind; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const };
  switch (kind) {
    case "none":
      return null;
    case "arch":
      return (
        <svg viewBox="0 0 300 420" preserveAspectRatio="none" className={className} aria-hidden {...common}>
          <path d="M20 410V170a130 130 0 0 1 260 0v240" />
          <path d="M38 410V172a112 112 0 0 1 224 0v238" opacity=".6" />
          <path d="M150 20v28M150 20l-8 12M150 20l8 12" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={70 + i * 40} cy={410} r={4} fill="currentColor" stroke="none" />
          ))}
          <path d="M120 60q30 22 60 0" opacity=".7" />
        </svg>
      );
    case "bars":
      // Test-pattern colour bars, like the start of an old video tape
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden>
          {["#F4F1FF", "#F2D24B", "#3DD6D0", "#4CD964", "#FF4D7E", "#E5484D", "#4B6BFF"].map((c, i) => (
            <rect key={c} x={i * 42.8} y="40" width="42.8" height="150" fill={c} />
          ))}
          {["#4B6BFF", "#111", "#FF4D7E", "#111", "#3DD6D0", "#111", "#F4F1FF"].map((c, i) => (
            <rect key={i} x={i * 42.8} y="190" width="42.8" height="26" fill={c} />
          ))}
        </svg>
      );
    case "jharokha":
      // Mughal-style pointed, cusped window arch with side pillars and a lotus finial
      return (
        <svg viewBox="0 0 300 420" preserveAspectRatio="none" className={className} aria-hidden {...common}>
          <path d="M22 412V210C22 130 80 90 150 28c70 62 128 102 128 182v202" />
          <path d="M42 412V214C42 144 90 108 150 56c60 52 108 88 108 158v198" opacity=".6" />
          <path d="M70 412V230c0-40 30-66 80-104 50 38 80 64 80 104v182" opacity=".35" />
          <path d="M150 28c-8-10-8-20 0-26 8 6 8 16 0 26z" fill="currentColor" fillOpacity=".5" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${40 + i * 44} 412v-16a22 22 0 0 1 22 -22`} opacity=".5" />
          ))}
          <path d="M22 412h256" />
        </svg>
      );
    case "rosette":
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden {...common}>
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx="150" cy="92" r="40" transform={`rotate(${i * 30} 150 150)`} opacity=".7" />
          ))}
          <circle cx="150" cy="150" r="30" />
          <circle cx="150" cy="150" r="10" fill="currentColor" stroke="none" opacity=".8" />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx="150" cy="22" r="3" fill="currentColor" stroke="none" transform={`rotate(${i * 30} 150 150)`} />
          ))}
        </svg>
      );
    case "jali":
      // Lattice of eight-pointed stars, like a carved stone screen
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden {...common}>
          {[0, 1, 2, 3].flatMap((r) =>
            [0, 1, 2, 3].map((c) => {
              const x = 38 + c * 75;
              const y = 38 + r * 75;
              return (
                <g key={`${r}-${c}`} transform={`translate(${x} ${y})`} opacity={0.9}>
                  <rect x="-24" y="-24" width="48" height="48" />
                  <rect x="-24" y="-24" width="48" height="48" transform="rotate(45)" />
                  <circle r="7" />
                </g>
              );
            }),
          )}
        </svg>
      );
    case "geometric":
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden {...common}>
          {[0, 45, 90, 135].map((r) => (
            <rect key={r} x="75" y="75" width="150" height="150" transform={`rotate(${r} 150 150)`} opacity={0.9 - r / 400} />
          ))}
          <circle cx="150" cy="150" r="28" />
          <circle cx="150" cy="150" r="8" fill="currentColor" stroke="none" />
        </svg>
      );
    case "floral":
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden {...common}>
          {Array.from({ length: 8 }, (_, i) => (
            <ellipse key={i} cx="150" cy="82" rx="22" ry="52" transform={`rotate(${i * 45} 150 150)`} opacity=".85" />
          ))}
          <circle cx="150" cy="150" r="16" fill="currentColor" stroke="none" opacity=".8" />
          <path d="M150 210q-10 50-60 70M150 210q10 50 60 70" opacity=".6" />
        </svg>
      );
    case "crescent":
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden {...common}>
          <path d="M190 40a110 110 0 1 0 0 220a90 90 0 1 1 0-220z" fill="currentColor" fillOpacity=".15" />
          <path d="M215 95l6 16 17 1-13 11 5 17-15-10-15 10 5-17-13-11 17-1z" fill="currentColor" stroke="none" />
          <circle cx="70" cy="60" r="3" fill="currentColor" stroke="none" />
          <circle cx="250" cy="220" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="40" cy="190" r="2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "confetti":
      return (
        <svg viewBox="0 0 300 300" className={className} aria-hidden {...common}>
          {Array.from({ length: 22 }, (_, i) => {
            const x = ((i * 97) % 280) + 10;
            const y = ((i * 53) % 280) + 10;
            return i % 3 === 0 ? (
              <circle key={i} cx={x} cy={y} r={5} fill="currentColor" stroke="none" opacity=".8" />
            ) : i % 3 === 1 ? (
              <rect key={i} x={x} y={y} width="10" height="10" transform={`rotate(${i * 20} ${x} ${y})`} />
            ) : (
              <path key={i} d={`M${x} ${y}l9 5l-9 5z`} fill="currentColor" stroke="none" opacity=".7" />
            );
          })}
        </svg>
      );
  }
}
