/** Small tap effects for event cards. Pure DOM + Web Animations; skipped when the user prefers reduced motion. */
export type TapFx = "flash" | "petals" | "sparkles" | "hearts" | "confetti" | "balloons" | "stars" | "bubbles" | "glitter";
type Particle = Exclude<TapFx, "flash">;

/** the shape of each kind of particle */
const SHAPE: Record<Particle, (size: number, color: string) => string> = {
  petals: (s, c) => `width:${s}px;height:${s * 1.5}px;background:${c};border-radius:60% 0 60% 0;`,
  sparkles: (s, c) => `width:${s}px;height:${s}px;background:${c};clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);`,
  stars: (s, c) => `width:${s * 1.3}px;height:${s * 1.3}px;background:${c};clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%);`,
  hearts: (s, c) => `width:${s * 1.2}px;height:${s * 1.1}px;background:${c};clip-path:path('M${s * 0.6} ${s * 1.1}C${-s * 0.3} ${s * 0.45} ${s * 0.05} ${-s * 0.15} ${s * 0.6} ${s * 0.3}C${s * 1.15} ${-s * 0.15} ${s * 1.5} ${s * 0.45} ${s * 0.6} ${s * 1.1}Z');`,
  confetti: (s, c) => `width:${s * 0.55}px;height:${s * 1.1}px;background:${c};border-radius:2px;`,
  balloons: (s, c) => `width:${s * 1.3}px;height:${s * 1.6}px;background:radial-gradient(circle at 32% 28%, #ffffffaa 0 12%, transparent 13%), ${c};border-radius:50% 50% 48% 48% / 55% 55% 45% 45%;box-shadow:inset -3px -4px 6px rgba(0,0,0,.18);`,
  bubbles: (s, c) => `width:${s * 1.4}px;height:${s * 1.4}px;border-radius:50%;border:1.5px solid ${c};background:radial-gradient(circle at 30% 30%, #ffffffcc 0 14%, transparent 15%), ${c}22;`,
  glitter: (s, c) => `width:${s * 0.45}px;height:${s * 0.45}px;border-radius:50%;background:${c};box-shadow:0 0 6px ${c};`,
};

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function layer() {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;z-index:60;pointer-events:none;overflow:visible";
  document.body.appendChild(el);
  return el;
}

/** A white "camera flash": the whole screen blinks bright and fades out. */
function flash() {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = "position:fixed;inset:0;z-index:60;pointer-events:none;background:#fff";
  document.body.appendChild(el);
  el.animate([{ opacity: 0.9 }, { opacity: 0.35, offset: 0.25 }, { opacity: 0 }], { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" }).finished
    .catch(() => {})
    .finally(() => el.remove());
}

/**
 * Particles from the tap point. Three ways to move: things that fall (petals, confetti), things that rise and drift
 * (balloons, bubbles, hearts) and things that pop outward and fade (sparkles, stars, glitter).
 */
function particles(kind: Particle, x: number, y: number, colors: string[]) {
  const root = layer();
  const falls = kind === "petals" || kind === "confetti";
  const rises = kind === "balloons" || kind === "bubbles" || kind === "hearts";
  const count = kind === "balloons" ? 7 : kind === "glitter" ? 26 : kind === "confetti" ? 22 : 14;
  const anims: Promise<unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = (kind === "balloons" ? 14 : 8) + Math.random() * (kind === "balloons" ? 10 : 9);
    p.style.cssText = `position:absolute;left:${x}px;top:${y}px;` + SHAPE[kind](size, colors[i % colors.length]);
    root.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * (rises ? 60 : 540);
    const frames = falls
      ? [
          { transform: "translate(0,0) rotate(0deg) scale(0.6)", opacity: 1 },
          { transform: `translate(${dx * 0.7}px, ${dy * 0.7 - 50}px) rotate(${rot * 0.5}deg) scale(1)`, opacity: 1, offset: 0.3 },
          { transform: `translate(${dx * 1.1}px, ${dy + 170}px) rotate(${rot}deg) scale(0.9)`, opacity: 0 },
        ]
      : rises
        ? [
            { transform: "translate(0,0) scale(0.4)", opacity: 0 },
            { transform: `translate(${dx * 0.4}px, ${-30 - Math.random() * 30}px) scale(1) rotate(${rot * 0.3}deg)`, opacity: 1, offset: 0.2 },
            { transform: `translate(${dx * 0.9 + Math.sin(i) * 20}px, ${-220 - Math.random() * 120}px) scale(1) rotate(${rot}deg)`, opacity: 0 },
          ]
        : [
            { transform: "translate(0,0) scale(0.2) rotate(0deg)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${dx * 1.2}px, ${dy * 1.2 - 24}px) scale(0.1) rotate(${rot}deg)`, opacity: 0 },
          ];
    const duration = falls ? 1300 + Math.random() * 500 : rises ? 1600 + Math.random() * 700 : 800 + Math.random() * 300;
    anims.push(p.animate(frames, { duration, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" }).finished.catch(() => {}));
  }
  Promise.all(anims).finally(() => root.remove());
}

const CHEERS = ["Wah!", "Mubarak!", "MashaAllah!", "Subhan Allah!"];
const FLASH_STARS = ["#ffffff", "#fff1c4", "#9ff3ff", "#ffd27a", "#ffc6f2"];

/** A short cheer that floats up from the tap point, in the tape's monospaced lettering. */
function cheer(x: number, y: number) {
  const el = document.createElement("span");
  el.setAttribute("aria-hidden", "true");
  el.textContent = CHEERS[Math.floor(Math.random() * CHEERS.length)];
  el.style.cssText =
    `position:fixed;left:${Math.min(Math.max(x, 70), window.innerWidth - 70)}px;top:${y}px;z-index:61;pointer-events:none;` +
    "transform:translate(-50%,-50%);font:700 18px/1 ui-monospace,monospace;letter-spacing:.08em;color:#fff;" +
    "text-shadow:0 0 8px #ff9a3c,0 0 18px #ff9a3c;white-space:nowrap";
  document.body.appendChild(el);
  const drift = reduced() ? 0 : -80;
  el.animate(
    [{ opacity: 0, transform: "translate(-50%,-50%) scale(.7)" }, { opacity: 1, transform: "translate(-50%,-70%) scale(1)", offset: 0.2 }, { opacity: 0, transform: `translate(-50%,calc(-50% + ${drift}px)) scale(1)` }],
    { duration: 1100, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
  ).finished.catch(() => {}).finally(() => el.remove());
}

export function burst(kind: TapFx, x: number, y: number, colors: string[] = ["#e8b95c", "#f4d98a"]) {
  if (typeof document === "undefined") return;
  // a flash tap is a camera flash, stars from the finger and a cheer; with reduced motion only the cheer remains
  if (kind === "flash") {
    cheer(x, y);
    if (reduced()) return;
    flash();
    particles("sparkles", x, y, FLASH_STARS);
    return;
  }
  if (reduced()) return;
  particles(kind, x, y, colors);
}
