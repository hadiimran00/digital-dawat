"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Music, Pause, Play, Upload, VolumeX } from "lucide-react";
import { backendConfigured } from "@/lib/config";
import { isOurSong, uploadSong } from "@/lib/music";
import type { Template } from "@/lib/templates";

type Choice = "ours" | "own" | "off";

/**
 * The invitation's music: the design's own song, a song the family uploads, or none. `value` is content.music
 * ("" = ours, "off" = none, or the uploaded song's URL). Uploading needs the customer to be signed in.
 */
export function MusicField({ template, value, onChange, next }: { template: Template; value: string; onChange: (v: string) => void; next: string }) {
  const router = useRouter();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const player = useRef<HTMLAudioElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [playing, setPlaying] = useState<string | null>(null);
  const own = value && value !== "off" && isOurSong(value) ? value : "";
  // a design without its own song starts on "no music"; picking "your own" before uploading keeps the upload open
  const [wantOwn, setWantOwn] = useState(false);
  const choice: Choice = own || wantOwn ? "own" : value === "off" || !template.music ? "off" : "ours";

  useEffect(() => () => player.current?.pause(), []);

  function listen(src: string) {
    const a = player.current;
    if (!a) return;
    if (playing === src) { a.pause(); setPlaying(null); return; }
    a.src = src;
    a.currentTime = 0;
    a.play().then(() => setPlaying(src)).catch(() => setPlaying(null));
  }

  function pickChoice(c: Choice) {
    setError("");
    player.current?.pause(); setPlaying(null);
    if (c === "ours") { setWantOwn(false); onChange(""); }
    if (c === "off") { setWantOwn(false); onChange("off"); }
    if (c === "own") { setWantOwn(true); if (!own) input.current?.click(); }
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const r = await uploadSong(file);
      if ("signIn" in r) { router.push(`/login?next=${encodeURIComponent(next)}`); return; }
      onChange(r.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  const options: { c: Choice; title: string; text: string; icon: typeof Music }[] = [
    ...(template.music ? [{ c: "ours" as const, title: "Use our song", text: template.music.title, icon: Music }] : []),
    { c: "own", title: "Upload your own song", text: own ? "Your song is added." : "MP3 or M4A, up to 10 MB", icon: Upload },
    { c: "off", title: "No music", text: "The invitation opens quietly.", icon: VolumeX },
  ];

  return (
    <div>
      <audio ref={player} onEnded={() => setPlaying(null)} preload="none" />
      <div role="radiogroup" aria-label="Music" className="grid gap-2 sm:grid-cols-3">
        {options.map(({ c, title, text, icon: Icon }) => {
          const picked = choice === c;
          return (
            <button key={c} type="button" role="radio" aria-checked={picked} onClick={() => pickChoice(c)} disabled={busy}
              className={`press flex min-h-14 items-start gap-2.5 rounded-xl border-2 p-3 text-left ${picked ? "border-brand bg-brand/5" : "border-line bg-white hover:border-gold"}`}>
              <Icon className={`mt-0.5 size-5 shrink-0 ${picked ? "text-brand" : "text-foreground/60"}`} aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block truncate text-xs text-foreground/70">{text}</span>
              </span>
            </button>
          );
        })}
      </div>

      <input ref={input} id={id} type="file" aria-label="Choose a song to upload" accept=".mp3,.m4a,.aac,audio/mpeg,audio/mp4,audio/x-m4a,audio/aac" className="sr-only"
        disabled={busy || !backendConfigured} onChange={(e) => upload(e.target.files?.[0])} />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {choice === "ours" && template.music && (
          <button type="button" className="btn btn-ghost" onClick={() => listen(template.music!.src)}>
            {playing === template.music.src ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {playing === template.music.src ? "Pause" : "Listen"}
          </button>
        )}
        {choice === "own" && (
          <>
            {own && (
              <button type="button" className="btn btn-ghost" onClick={() => listen(own)}>
                {playing === own ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                {playing === own ? "Pause" : "Listen to your song"}
              </button>
            )}
            <label htmlFor={id} className={`btn btn-ghost ${busy || !backendConfigured ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
              <Upload className="size-4" aria-hidden />{busy ? "Uploading…" : own ? "Choose another song" : "Choose a song"}
            </label>
          </>
        )}
      </div>
      {choice === "own" && (
        <p className="mt-2 text-sm text-foreground/70">Only upload a song you have the right to use. It starts when a guest opens the invitation, and they can turn it off.</p>
      )}
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
