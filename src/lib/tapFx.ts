/** Small tap effects for event cards. Pure DOM + Web Animations; skipped when the user prefers reduced motion. */
export type TapFx = "flash" | "petals" | "sparkles";

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

/** Particles burst from the tap point: petals fall with a little drift, sparkles pop outward. */
function particles(kind: "petals" | "sparkles", x: number, y: number, colors: string[]) {
  const root = layer();
  const count = kind === "petals" ? 16 : 14;
  const anims: Promise<unknown>[] = [];
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    const size = kind === "petals" ? 9 + Math.random() * 9 : 8 + Math.random() * 8;
    const color = colors[i % colors.length];
    p.style.cssText =
      `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${kind === "petals" ? size * 1.5 : size}px;background:${color};` +
      (kind === "petals"
        ? "border-radius:60% 0 60% 0;"
        : "clip-path:polygon(50% 0,62% 38%,100% 50%,62% 62%,50% 100%,38% 62%,0 50%,38% 38%);");
    root.appendChild(p);
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 90;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const rot = (Math.random() - 0.5) * 540;
    const frames =
      kind === "petals"
        ? [
            { transform: "translate(0,0) rotate(0deg) scale(0.6)", opacity: 1 },
            { transform: `translate(${dx * 0.7}px, ${dy * 0.7 - 50}px) rotate(${rot * 0.5}deg) scale(1)`, opacity: 1, offset: 0.3 },
            { transform: `translate(${dx * 1.1}px, ${dy + 170}px) rotate(${rot}deg) scale(0.9)`, opacity: 0 },
          ]
        : [
            { transform: "translate(0,0) scale(0.2) rotate(0deg)", opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) scale(1.1) rotate(${rot / 2}deg)`, opacity: 1, offset: 0.45 },
            { transform: `translate(${dx * 1.2}px, ${dy * 1.2 - 24}px) scale(0.1) rotate(${rot}deg)`, opacity: 0 },
          ];
    anims.push(
      p.animate(frames, { duration: kind === "petals" ? 1300 + Math.random() * 500 : 800 + Math.random() * 300, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" })
        .finished.catch(() => {}),
    );
  }
  Promise.all(anims).finally(() => root.remove());
}

export function burst(kind: TapFx, x: number, y: number, colors: string[] = ["#e8b95c", "#f4d98a"]) {
  if (typeof document === "undefined" || reduced()) return;
  if (kind === "flash") flash();
  else particles(kind, x, y, colors);
}
