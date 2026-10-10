"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scratch-to-reveal. The real content is always in the page (visible to screen readers and search),
 * and a canvas "cover" sits on top until the guest scratches enough of it away or taps "Reveal".
 */
export function ScratchReveal({
  children, label, kind, accent, revealLabel = "Reveal", onReveal,
}: {
  children: React.ReactNode;
  label: string;
  kind: "static" | "foil";
  accent: string;
  revealLabel?: string;
  onReveal?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cells = useRef<Set<number>>(new Set());
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [gone, setGone] = useState(false);

  const draw = useCallback(() => {
    const c = canvas.current;
    const b = box.current;
    if (!c || !b) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = b.getBoundingClientRect();
    c.width = Math.round(width * dpr);
    c.height = Math.round(height * dpr);
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "source-over";
    if (kind === "static") {
      // TV static: random grey noise drawn small and scaled up, with scan lines
      const nw = Math.max(1, Math.round(width / 3));
      const nh = Math.max(1, Math.round(height / 3));
      const n = document.createElement("canvas");
      n.width = nw;
      n.height = nh;
      const nctx = n.getContext("2d")!;
      const img = nctx.createImageData(nw, nh);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = 30 + Math.random() * 150;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(n, 0, 0, c.width, c.height);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let y = 0; y < c.height; y += 4 * dpr) ctx.fillRect(0, y, c.width, 1.5 * dpr);
    } else {
      const g = ctx.createLinearGradient(0, 0, c.width, c.height);
      g.addColorStop(0, "#9a7a2e");
      g.addColorStop(0.5, "#f1d98a");
      g.addColorStop(1, "#b8924a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, c.width, c.height);
    }
    ctx.fillStyle = kind === "static" ? "rgba(0,0,0,0.65)" : "rgba(60,40,0,0.6)";
    const fs = Math.max(11, Math.min(15, width / 22)) * dpr;
    ctx.font = `700 ${fs}px ui-monospace, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(kind === "static" ? "NO SIGNAL" : "SCRATCH HERE", c.width / 2, c.height / 2 - fs * 0.7);
    ctx.font = `500 ${fs * 0.8}px ui-monospace, Menlo, monospace`;
    ctx.fillStyle = kind === "static" ? accent : "rgba(60,40,0,0.8)";
    ctx.fillText(label, c.width / 2, c.height / 2 + fs * 0.9);
  }, [kind, label, accent]);

  useEffect(() => {
    if (revealed) return; // once revealed, never redraw the cover
    draw();
    const b = box.current;
    if (!b || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => { if (!revealed) draw(); });
    ro.observe(b);
    return () => ro.disconnect();
  }, [draw, revealed]);

  const finish = useCallback(() => {
    setRevealed((r) => {
      if (!r) onReveal?.();
      return true;
    });
    setTimeout(() => setGone(true), 450);
  }, [onReveal]);

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvas.current;
    if (!c || revealed) return;
    const r = c.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * c.width;
    const y = ((e.clientY - r.top) / r.height) * c.height;
    const ctx = c.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(28, c.height / 3);
    ctx.beginPath();
    const from = last.current ?? { x, y };
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    last.current = { x, y };
    // coarse coverage grid: mark cells near the brush
    const cols = 16, rows = 6;
    const rad = ctx.lineWidth / 2;
    for (let gy = 0; gy < rows; gy++) for (let gx = 0; gx < cols; gx++) {
      const cx = ((gx + 0.5) / cols) * c.width, cy = ((gy + 0.5) / rows) * c.height;
      if (Math.hypot(cx - x, cy - y) < rad) cells.current.add(gy * cols + gx);
    }
    if (cells.current.size / (cols * rows) > 0.5) finish();
  };

  return (
    <div ref={box} className="relative">
      {children}
      {!gone && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full rounded-[inherit] transition-opacity duration-300 ease-out ${revealed ? "pointer-events-none opacity-0" : ""}`}
          style={{ touchAction: "none", cursor: "grab" }}
          onPointerDown={(e) => {
            try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* the pointer may already be gone */ }
            last.current = null;
            scratch(e);
          }}
          onPointerMove={(e) => { if (e.buttons || e.pointerType === "touch") scratch(e); }}
          onPointerUp={() => { last.current = null; }}
        />
      )}
      {!revealed && (
        <button type="button" onClick={finish} className="press absolute -bottom-4 right-2 min-h-11 rounded-full bg-black/70 px-4 text-xs text-white">
          {revealLabel}
        </button>
      )}
    </div>
  );
}
