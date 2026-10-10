"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { uploadPhoto } from "@/lib/photos";
import { backendConfigured } from "@/lib/config";

/** One photo slot in the editor: pick, shrink, upload, preview, replace or remove. Uploading needs the customer to be signed in. */
export function PhotoField({
  label, hint, value, onChange, next, fallback,
}: { label: string; hint?: string; value: string; onChange: (url: string) => void; next: string; fallback?: string }) {
  const shown = value || fallback;
  const router = useRouter();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const r = await uploadPhoto(file);
      if ("signIn" in r) {
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      onChange(r.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-white">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export, photo comes from our storage
          <img src={shown} alt="" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-6 text-foreground/40" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="font-medium">{label}</label>
        {hint && <p className="text-sm text-foreground/70">{hint}</p>}
        {!value && fallback && <p className="text-sm font-medium text-gold-deep">Using the template&apos;s photo. Upload your own to replace it.</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only"
            disabled={busy || !backendConfigured} onChange={(e) => pick(e.target.files?.[0])} />
          <button type="button" className="btn btn-ghost" disabled={busy || !backendConfigured} onClick={() => input.current?.click()}>
            <ImagePlus className="size-4" aria-hidden />{busy ? "Uploading…" : value ? "Replace" : "Upload photo"}
          </button>
          {value && !busy && (
            <button type="button" className="btn btn-ghost text-red-700" onClick={() => onChange("")}>
              <Trash2 className="size-4" aria-hidden /> {fallback ? "Use template photo" : "Remove"}
            </button>
          )}
        </div>
        {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
