"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import type { Template } from "@/lib/templates";
import type { InviteContent } from "@/lib/content";
import { VIDEO_STYLES, canExportMp4, renderInviteVideo, type VideoStyle } from "@/lib/videoExport";

export function VideoExport({ template, content }: { template: Template; content: InviteContent }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [style, setStyle] = useState<VideoStyle>(template.motion);

  useEffect(() => {
    canExportMp4().then(setSupported);
  }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  async function go() {
    setError("");
    setProgress(0);
    try {
      const blob = await renderInviteVideo(template, content, setProgress, style);
      setUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video export failed.");
    } finally {
      setProgress(null);
    }
  }

  if (supported === null) return null;
  if (!supported) {
    return (
      <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
        Video download needs a browser that can encode MP4 (recent Chrome, Edge or Safari). Your web invite link works everywhere.
      </p>
    );
  }
  return (
    <div className="mt-4 text-center">
      <fieldset className="mb-3 text-left">
        <legend className="mb-1 text-sm font-semibold">Video style</legend>
        <div className="grid grid-cols-2 gap-2">
          {VIDEO_STYLES.map((v) => (
            <label key={v.id} className={`press cursor-pointer rounded-xl border p-2 text-sm ${style === v.id ? "border-brand bg-white ring-1 ring-brand" : "border-line bg-card"}`}>
              <input type="radio" name="video-style" className="sr-only" checked={style === v.id} onChange={() => { setStyle(v.id); setUrl(null); }} />
              <span className="font-semibold">{v.label}</span>
              <span className="block text-xs text-foreground/70">{v.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" className="btn btn-ghost w-full" onClick={go} disabled={progress !== null}>
        {progress !== null ? `Rendering ${Math.round(progress * 100)}%` : "Create video"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {url && (
        <div className="mt-3 space-y-2">
          <video src={url} controls playsInline className="mx-auto w-full max-w-[300px] rounded-xl" />
          <a href={url} download={`invitation-${template.id}.mp4`} className="btn btn-primary w-full">
            <Download className="size-4" aria-hidden /> Download MP4
          </a>
        </div>
      )}
    </div>
  );
}
