"use client";

import { useEffect, useRef, useState } from "react";
import { defaultContent } from "@/lib/content";
import { getTemplate } from "@/lib/templates";

type Row = [label: string, value: string];

const sizeKB = (b: number) => `${Math.round(b / 1024)} KB`;

/** Hidden diagnostics page: shows what this phone can do and times a real video render. Not linked from the site. */
export default function PhoneCheck() {
  const [info, setInfo] = useState<Row[]>([]);
  const [tests, setTests] = useState<Row[]>([]);
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const probe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mq = (q: string) => window.matchMedia(q).matches;
      const cs = probe.current ? getComputedStyle(probe.current) : null;
      let webp = "no";
      try { webp = document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp") ? "yes" : "no"; } catch {}
      let h264 = "n/a";
      const encoder = typeof VideoEncoder !== "undefined" ? "yes" : "NO";
      try {
        const { canExportMp4 } = await import("@/lib/videoExport");
        h264 = (await canExportMp4()) ? "YES" : "NO";
      } catch (e) { h264 = `error: ${e instanceof Error ? e.message : e}`; }
      let storage = "ok";
      try { localStorage.setItem("pc", "1"); localStorage.removeItem("pc"); } catch { storage = "blocked"; }
      const rows: Row[] = [
        ["Browser", navigator.userAgent],
        ["Screen (css px)", `${window.innerWidth} x ${window.innerHeight} @ ${window.devicePixelRatio}x`],
        ["Touch points", String(navigator.maxTouchPoints)],
        ["Hover / fine pointer", `${mq("(hover: hover)")} / ${mq("(pointer: fine)")}`],
        ["Reduced motion", String(mq("(prefers-reduced-motion: reduce)"))],
        ["Safe area top / bottom", cs ? `${cs.paddingTop} / ${cs.paddingBottom}` : "n/a"],
        ["VideoEncoder available", encoder],
        ["Can encode H.264 MP4 (720x1280)", h264],
        ["WebP images", webp],
        ["localStorage", storage],
        ["Clipboard API", navigator.clipboard ? "yes" : "no"],
        ["Page loaded", new Date().toISOString()],
      ];
      if (!cancelled) setInfo(rows);
    })();
    return () => { cancelled = true; };
  }, []);

  async function runVideo(style: "rise" | "envelope" | "scratch" | "sparkle") {
    setBusy(style);
    setVideoUrl(null);
    const t = getTemplate("zamurd-nikkah")!;
    const start = performance.now();
    try {
      const { renderInviteVideo } = await import("@/lib/videoExport");
      const { blob } = await renderInviteVideo(t, defaultContent(t.category), undefined, style);
      const secs = ((performance.now() - start) / 1000).toFixed(1);
      setTests((r) => [...r, [`Video "${style}"`, `OK in ${secs}s, ${sizeKB(blob.size)}, ${blob.type}`]]);
      setVideoUrl(URL.createObjectURL(blob));
    } catch (e) {
      setTests((r) => [...r, [`Video "${style}"`, `FAILED: ${e instanceof Error ? e.message : String(e)}`]]);
    } finally {
      setBusy("");
    }
  }

  async function copy() {
    const text = [...info, ...tests].map(([k, v]) => `${k}: ${v}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <div ref={probe} aria-hidden className="pointer-events-none absolute h-0 w-0 overflow-hidden" style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }} />
      <h1 className="font-display text-3xl font-bold text-brand">Phone check</h1>
      <p className="mt-1 text-sm text-foreground/70">Tap each video test, then tap Copy report and paste it back to the developer.</p>

      <dl className="mt-6 divide-y divide-line rounded-xl border border-line bg-card text-sm">
        {[...info, ...tests].map(([k, v], i) => (
          <div key={i} className="flex flex-col gap-0.5 p-3">
            <dt className="font-semibold">{k}</dt>
            <dd className="break-words text-foreground/80">{v}</dd>
          </div>
        ))}
        {info.length === 0 && <p className="p-3">Checking…</p>}
      </dl>

      <h2 className="mt-6 font-display text-xl font-bold">Video tests</h2>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(["rise", "envelope", "scratch", "sparkle"] as const).map((s) => (
          <button key={s} className="btn btn-ghost" disabled={!!busy} onClick={() => runVideo(s)}>
            {busy === s ? "Rendering…" : s}
          </button>
        ))}
      </div>
      {videoUrl && <video src={videoUrl} controls playsInline className="mx-auto mt-4 w-full max-w-[260px] rounded-xl" />}

      <button className="btn btn-primary mt-6 w-full" onClick={copy}>{copied ? "Copied" : "Copy report"}</button>
    </div>
  );
}
