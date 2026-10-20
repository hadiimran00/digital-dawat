"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import { ContentSchema } from "@/lib/contentSchema";
import type { InviteContent } from "@/lib/content";
import { getTemplate, type Template } from "@/lib/templates";
import { NotConfigured, useUser } from "@/lib/useUser";
import { VideoExport } from "@/components/VideoExport";

/** The paid invitation's video, without the preview watermark (from My orders). Only published invitations qualify. */
function VideoPage() {
  const slug = useSearchParams().get("s") ?? "";
  const user = useUser();
  const [data, setData] = useState<{ template: Template; content: InviteContent; published: boolean } | null | undefined>(undefined);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !slug || !user) return;
    // row-level security: the owner (or an admin) gets their invitation back, nobody else
    sb.from("invites").select("template_id,content,status").eq("slug", slug).maybeSingle().then(({ data: row }) => {
      const template = row && getTemplate(row.template_id);
      const parsed = row && ContentSchema.safeParse(row.content);
      setData(row && template && parsed?.success ? { template, content: parsed.data, published: row.status === "published" } : null);
    });
  }, [slug, user]);

  if (!backendConfigured) return <NotConfigured />;
  if (user === undefined) return <p className="p-8 text-center">Loading…</p>;
  if (user === null) return <p className="p-8 text-center"><Link className="underline" href={`/login?next=${encodeURIComponent(`/video?s=${slug}`)}`}>Sign in</Link> to download your video.</p>;
  if (data === undefined) return <p className="p-8 text-center">Loading your invitation…</p>;
  if (data === null) return <p className="p-8 text-center">This invitation could not be found in your account.</p>;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Link href="/account" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium"><ArrowLeft className="size-4" aria-hidden /> My orders</Link>
      <h1 className="mt-2 font-display text-4xl font-bold text-brand">Your video</h1>
      {data.published ? (
        <>
          <p className="mt-2 text-foreground/70">A short vertical video of your {data.template.name} invitation for WhatsApp Status and Instagram. Pick a style, create it, then download.</p>
          <VideoExport template={data.template} content={data.content} />
        </>
      ) : (
        <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Your video is ready to download once your payment is confirmed and the invitation is live.</p>
      )}
    </div>
  );
}

export default function Page() {
  return <Suspense fallback={<p className="p-8 text-center">Loading…</p>}><VideoPage /></Suspense>;
}
