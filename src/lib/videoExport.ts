import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { BufferTarget, CanvasSource, Mp4OutputFormat, Output, QUALITY_HIGH, canEncodeVideo } from "mediabunny";
import type { Template, VideoStyle } from "./templates";
import { BISMILLAH, eventsDateText, eventsTitle, formatEventTime, type InviteContent } from "./content";
import { Ornament, isTallOrnament } from "@/components/invite/Ornament";

const W = 720;
const H = 1280;
const FPS = 30;

export type { VideoStyle };

export const VIDEO_STYLES: { id: VideoStyle; label: string; hint: string; seconds: number }[] = [
  { id: "rise", label: "Classic", hint: "Text fades in line by line", seconds: 8 },
  { id: "envelope", label: "Envelope", hint: "An envelope opens to reveal your card", seconds: 11 },
  { id: "scratch", label: "Scratch reveal", hint: "The date is scratched off a gold foil", seconds: 10 },
  { id: "sparkle", label: "Sparkle", hint: "Golden sparkles drift over your card", seconds: 8 },
];

/** Can this browser encode H.264 video? Checked at runtime, never assumed. */
export async function canExportMp4(): Promise<boolean> {
  try {
    if (typeof VideoEncoder === "undefined") return false;
    return await canEncodeVideo("avc", { width: W, height: H, bitrate: QUALITY_HIGH });
  } catch {
    return false;
  }
}

const cssVar = (name: string, fallback: string) =>
  (typeof document !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue(name).trim()) || fallback;

function loadOrnament(t: Template): Promise<HTMLImageElement> {
  const arch = isTallOrnament(t.theme.ornament);
  const svg = renderToStaticMarkup(createElement(Ornament, { kind: t.theme.ornament })).replace(
    "<svg",
    `<svg xmlns="http://www.w3.org/2000/svg" color="${t.theme.accent}" width="${arch ? 634 : 800}" height="${arch ? 1203 : 800}"`,
  );
  const img = new Image();
  return new Promise((res, rej) => {
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("ornament failed to load"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  return new Promise((res, rej) => {
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("artwork failed to load"));
    img.src = src;
  });
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export interface Animator {
  canvas: HTMLCanvasElement;
  /** Paint the frame at `sec` seconds. Frames must be requested in increasing order; call `reset()` to loop. */
  draw: (sec: number) => void;
  reset: () => void;
  seconds: number;
}

/** Shared by the live hover preview and the MP4 export, so both always look identical. */
export async function createAnimator(template: Template, content: InviteContent, style: VideoStyle): Promise<Animator> {
  const t = template.theme;
  const ur = content.language === "ur";
  const e = content.events[0];
  const single = content.events.length === 1;
  const display = ur ? cssVar("--nf-urdu", "serif") : cssVar("--nf-display", "Georgia, serif");
  const body = ur ? cssVar("--nf-urdu", "serif") : cssVar("--nf-sans", "system-ui, sans-serif");
  const headFam = t.headingFont === "sans" && !ur ? body : display;

  await Promise.all([
    document.fonts.load(`600 48px ${headFam}`, content.host1),
    document.fonts.load(`400 24px ${body}`, content.message),
    content.bismillah ? document.fonts.load(`400 38px ${cssVar("--nf-naskh", "serif")}`, BISMILLAH) : Promise.resolve([]),
  ]).catch(() => {});

  const orn = t.ornament === "none" ? null : await loadOrnament(template);
  const artImg = template.art ? await loadImage(template.art.src).catch(() => null) : null;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.direction = ur ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const names = content.host2 ? `${content.host1} & ${content.host2}` : content.host1;
  const dateStr = eventsDateText(content, ur ? "ur-PK" : "en-GB");
  const timeStr = single && e.time ? formatEventTime(e.time) : "";
  const arch = isTallOrnament(t.ornament);
  const seconds = VIDEO_STYLES.find((v) => v.id === style)?.seconds ?? 8;
  /** Seconds the intro takes before the card's own text starts animating in. */
  const t0 = style === "envelope" ? 3.2 : 0;
  let dateRect = { x: 90, y: 900, w: W - 180, h: 160 };

  let artLayer: HTMLCanvasElement | null = null;
  const drawBackground = () => {
    const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
    g.addColorStop(0, t.bg);
    g.addColorStop(1, t.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    if (artImg && template.art) {
      // same placement as the on-screen card: top 64%, zoomed, fading out at the bottom
      const a = template.art;
      const hh = Math.round(H * 0.64);
      if (!artLayer) {
        artLayer = document.createElement("canvas");
        artLayer.width = W;
        artLayer.height = hh;
        const c = artLayer.getContext("2d")!;
        const iw = W * a.zoom;
        const ih = (artImg.height / artImg.width) * iw;
        const [px, py] = a.position.split(" ").map((v) => parseFloat(v) / 100);
        c.drawImage(artImg, (W - iw) * px, (hh - ih) * py, iw, ih);
        c.globalCompositeOperation = "destination-in";
        const m = c.createLinearGradient(0, 0, 0, hh);
        m.addColorStop(0, "#000");
        m.addColorStop(0.55, "#000");
        m.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = m;
        c.fillRect(0, 0, W, hh);
      }
      ctx.drawImage(artLayer, 0, 0);
    }
  };

  const drawCard = (sec: number) => {
    // ornament fades in and slowly breathes (same placement as the on-screen card)
    const oa = ease(sec / 1.2) * (arch ? 0.4 : 0.3);
    const scale = 1 + Math.sin(sec * 0.8) * 0.012;
    const ow = arch ? W * 0.88 : W * 0.62;
    const oh = arch ? H * 0.94 : W * 0.62;
    ctx.save();
    ctx.globalAlpha = oa;
    ctx.translate(W / 2, (arch ? H * 0.03 : H * 0.05) + oh / 2);
    ctx.scale(scale, scale);
    if (orn) ctx.drawImage(orn, -ow / 2, -oh / 2, ow, oh);
    ctx.restore();

    // staggered text blocks
    let y = arch ? 470 : 600;
    const block = (start: number, fn: () => number, instant = false) => {
      const a = instant ? 1 : ease((sec - start) / 0.9);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(0, (1 - a) * 24);
      y = fn();
      ctx.restore();
    };
    const textW = arch ? W - 270 : W - 150;
    const lines = (txt: string, font: string, color: string, lh: number, maxW = textW) => {
      ctx.font = font;
      ctx.fillStyle = color;
      // soft halo so text stays readable where it overlaps real artwork
      ctx.shadowColor = template.art ? t.bg : "transparent";
      ctx.shadowBlur = template.art ? 18 : 0;
      for (const l of wrap(ctx, txt, maxW)) {
        ctx.fillText(l, W / 2, y);
        y += lh;
      }
    };

    block(0.6, () => {
      if (content.bismillah) {
        const save = ctx.direction;
        ctx.direction = "rtl";
        lines(BISMILLAH, `400 38px ${cssVar("--nf-naskh", "serif")}`, t.accent, 64);
        ctx.direction = save;
      }
      lines(ur ? content.headline : content.headline.toUpperCase(), `500 ${ur ? 26 : 22}px ${body}`, t.accent, 40);
      return y;
    });
    block(1.4, () => {
      y += 70;
      const size = names.length > 22 ? 60 : 84;
      lines(names, `600 ${size}px ${headFam}`, t.ink, size * (ur ? 1.9 : 1.1));
      return y;
    });
    block(2.3, () => {
      y += 6;
      ctx.fillStyle = t.accent;
      ctx.fillRect(W / 2 - 60, y, 120, 2);
      y += 56;
      lines(eventsTitle(content), `600 40px ${headFam}`, t.accent, ur ? 72 : 52);
      return y;
    });
    block(3.2, () => {
      y += 14;
      lines(content.message, `400 28px ${body}`, t.muted, ur ? 54 : 42, textW - 20);
      return y;
    });
    block(
      4.4,
      () => {
        y += 40;
        const top = y;
        lines(dateStr, `700 32px ${body}`, t.ink, ur ? 56 : 46);
        if (timeStr) lines(timeStr, `400 30px ${body}`, t.ink, 44);
        if (single && e.venue) lines(e.venue, `400 28px ${body}`, t.muted, 42);
        dateRect = { x: 90, y: top - 48, w: W - 180, h: y - top + 24 };
        return y;
      },
      style === "scratch",
    );
  };

  // ---- Sparkle: deterministic golden particles drifting upward ---------------------------
  const drawSparkles = (sec: number) => {
    for (let i = 0; i < 38; i++) {
      const seed = (i * 7919) % 1000;
      const x = ((seed * 37) % W) + Math.sin(sec * 0.7 + i) * 14;
      const speed = 40 + (seed % 60);
      const y = H - (((sec * speed + seed * 3) % (H + 80)) - 40);
      const tw = 0.5 + 0.5 * Math.sin(sec * 3 + i * 1.7);
      const r = 2 + (seed % 5) * 1.2;
      ctx.save();
      ctx.globalAlpha = Math.min(1, sec / 1.5) * tw * 0.9;
      ctx.fillStyle = t.accent;
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4 + sec * 0.5);
      ctx.fillRect(-r, -r / 3, r * 2, (r * 2) / 3);
      ctx.fillRect(-r / 3, -r, (r * 2) / 3, r * 2);
      ctx.restore();
    }
  };

  // ---- Envelope: flap opens, card slides out, then the full card fades in ----------------
  const drawEnvelope = (sec: number) => {
    const fadeOut = 1 - ease((sec - 2.5) / 0.7);
    if (fadeOut <= 0) return;
    const cx = W / 2;
    const ew = 520;
    const eh = 340;
    const top = H * 0.42 - eh / 2;
    const appear = ease(sec / 0.7);
    const flapOpen = ease((sec - 0.9) / 0.7);
    const slide = ease((sec - 1.5) / 0.9);
    const paper = t.accent;
    ctx.save();
    ctx.globalAlpha = appear * fadeOut;
    ctx.translate(0, (1 - appear) * 40);
    // back of envelope
    ctx.fillStyle = paper;
    ctx.fillRect(cx - ew / 2, top, ew, eh);
    // inner flap, visible once open
    if (flapOpen > 0.5) {
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.beginPath();
      ctx.moveTo(cx - ew / 2, top);
      ctx.lineTo(cx + ew / 2, top);
      ctx.lineTo(cx, top - 150 * (flapOpen - 0.5) * 2);
      ctx.closePath();
      ctx.fill();
    }
    // the card sliding out
    const cw = ew - 60;
    const ch = 300;
    const cardY = top + 30 - slide * 250;
    ctx.fillStyle = t.ink;
    ctx.beginPath();
    ctx.roundRect(cx - cw / 2, cardY, cw, ch, 10);
    ctx.fill();
    ctx.fillStyle = t.accent;
    ctx.font = `500 20px ${body}`;
    ctx.fillText(ur ? content.headline : content.headline.toUpperCase(), cx, cardY + 56);
    ctx.fillStyle = t.bg;
    ctx.font = `600 ${names.length > 18 ? 34 : 46}px ${headFam}`;
    let ny = cardY + 120;
    for (const l of wrap(ctx, names, cw - 60)) {
      ctx.fillText(l, cx, ny);
      ny += 54;
    }
    // front pocket over the card
    ctx.fillStyle = paper;
    ctx.beginPath();
    ctx.moveTo(cx - ew / 2, top + eh);
    ctx.lineTo(cx, top + eh * 0.55);
    ctx.lineTo(cx + ew / 2, top + eh);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // closed top flap, flattening as it rotates open about its top edge
    if (flapOpen < 0.5) {
      ctx.save();
      ctx.translate(0, top);
      ctx.scale(1, Math.max(0.02, 1 - flapOpen * 2));
      ctx.fillStyle = paper;
      ctx.beginPath();
      ctx.moveTo(cx - ew / 2, 0);
      ctx.lineTo(cx + ew / 2, 0);
      ctx.lineTo(cx, 190);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  // ---- Scratch: gold foil over the date, wiped away along a zig-zag path -----------------
  let foil: HTMLCanvasElement | null = null;
  let foilCtx: CanvasRenderingContext2D | null = null;
  let foilFrom = 0;
  const SCRATCH_START = 3.0;
  const SCRATCH_END = 6.5;
  const pathAt = (p: number) => {
    const r = dateRect;
    const rows = 4;
    const f = p * rows;
    const row = Math.min(rows - 1, Math.floor(f));
    const along = f - row;
    const x = row % 2 === 0 ? r.x + along * r.w : r.x + (1 - along) * r.w;
    return { x, y: r.y + (row + 0.5) * (r.h / rows) };
  };
  const initFoil = () => {
    foil = document.createElement("canvas");
    foil.width = W;
    foil.height = H;
    const fc = foil.getContext("2d")!;
    foilCtx = fc;
    const r = dateRect;
    const g = fc.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
    g.addColorStop(0, "#9a7a2e");
    g.addColorStop(0.5, "#f1d98a");
    g.addColorStop(1, "#b8924a");
    fc.fillStyle = g;
    fc.beginPath();
    fc.roundRect(r.x, r.y, r.w, r.h, 18);
    fc.fill();
    fc.fillStyle = "rgba(60,40,0,0.55)";
    fc.font = `600 30px ${body}`;
    fc.textAlign = "center";
    fc.fillText(ur ? "کھرچیں" : "SCRATCH TO REVEAL", W / 2, r.y + r.h / 2 + 10);
  };
  const drawScratch = (sec: number) => {
    if (!foil || !foilCtx) initFoil();
    const target = Math.min(1, Math.max(0, (sec - SCRATCH_START) / (SCRATCH_END - SCRATCH_START)));
    if (target > foilFrom) {
      const fc = foilCtx!;
      fc.save();
      fc.globalCompositeOperation = "destination-out";
      fc.lineCap = "round";
      fc.lineJoin = "round";
      fc.lineWidth = dateRect.h / 3.2;
      fc.beginPath();
      const a = pathAt(foilFrom);
      fc.moveTo(a.x, a.y);
      for (let k = 1; k <= 12; k++) {
        const q = pathAt(foilFrom + ((target - foilFrom) * k) / 12);
        fc.lineTo(q.x, q.y);
      }
      fc.stroke();
      fc.restore();
      foilFrom = target;
    }
    ctx.save();
    ctx.globalAlpha = ease((sec - 0.8) / 0.8) * (1 - ease((sec - 7.2) / 0.8));
    ctx.drawImage(foil!, 0, 0);
    ctx.restore();
  };

  const draw = (sec: number) => {
    drawBackground();
    if (style === "envelope") {
      drawEnvelope(sec);
      if (sec > t0 - 0.4) {
        ctx.save();
        ctx.globalAlpha = ease((sec - (t0 - 0.4)) / 0.6);
        drawCard(Math.max(0, sec - t0));
        ctx.restore();
      }
      return;
    }
    drawCard(sec);
    if (style === "sparkle") drawSparkles(sec);
    if (style === "scratch") drawScratch(sec);
  };

  const reset = () => {
    foil = null;
    foilCtx = null;
    foilFrom = 0;
  };
  // Dry run so the date block's position is known before the foil is created.
  draw(20);
  reset();
  return { canvas, draw, reset, seconds };
}

export async function renderInviteVideo(
  template: Template,
  content: InviteContent,
  onProgress?: (p: number) => void,
  style: VideoStyle = template.motion,
): Promise<Blob> {
  const { canvas, draw, seconds } = await createAnimator(template, content, style);
  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec: "avc", bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: FPS });
  await output.start();
  const total = FPS * seconds;
  for (let i = 0; i < total; i++) {
    draw(i / FPS);
    await source.add(i / FPS, 1 / FPS);
    if (i % 10 === 0) onProgress?.(i / total);
  }
  source.close();
  await output.finalize();
  onProgress?.(1);
  const buf = (output.target as BufferTarget).buffer;
  if (!buf) throw new Error("Video encoding produced no data.");
  return new Blob([buf], { type: "video/mp4" });
}
