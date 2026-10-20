"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import type { InviteContent } from "@/lib/content";
import { ContentSchema } from "@/lib/contentSchema";
import { getTemplate, type Template } from "@/lib/templates";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { NotConfigured } from "@/lib/useUser";
import { PreviewWatermark } from "@/components/PreviewWatermark";

interface Loaded { id: string; template: Template; content: InviteContent; published: boolean }

function Invite() {
  const slug = useSearchParams().get("s") ?? "";
  const [data, setData] = useState<Loaded | null | undefined>(undefined);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !slug) return;
    // Row-level security decides what comes back: guests only ever get published invites, while the owner and
    // admins also get drafts awaiting review, which open as a preview (banner, RSVP disabled).
    sb.from("invites").select("id,template_id,content,status").eq("slug", slug).maybeSingle()
      .then(({ data: row }) => {
        const template = row && getTemplate(row.template_id);
        const parsed = row && ContentSchema.safeParse(row.content);
        setData(row && template && parsed?.success ? { id: row.id, template, content: parsed.data, published: row.status === "published" } : null);
      });
  }, [slug]);

  if (!backendConfigured) return <NotConfigured />;
  if (!slug) return <p className="p-8 text-center">This invitation link is incomplete.</p>;
  if (data === undefined) return <p className="p-8 text-center">Loading invitation…</p>;
  if (data === null) return <p className="p-8 text-center">This invitation could not be found, or hasn’t been published yet.</p>;

  // the invitation is designed for a phone: on wide screens it sits in a phone-width column over a blurred backdrop,
  // instead of stretching portrait photos across a landscape window
  // designs without a photo of their own (the printed cards, Hadiqa, Ambar, Firdaus) use their own card, blurred,
  // so the sides are never a flat empty colour
  const backdrop = data.content.coverPhoto || data.template.backdrop?.src || data.template.art?.src || `/thumbs/${data.template.id}.webp`;
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden" style={{ background: data.template.theme.bg }}>
      {backdrop && (
        // a quarter-size copy, blurred, then scaled up to fill the window: Chrome won't paint a blur over a whole
        // screen-sized layer (the sides came out blank), and a small blur scaled up looks the same
        <div aria-hidden className="absolute inset-0 hidden overflow-hidden md:block">
          <div className="absolute left-1/2 top-1/2 h-1/4 w-1/4" style={{ background: `url(${backdrop}) center / cover no-repeat`, filter: "blur(8px) brightness(0.5)", transform: "translate(-50%, -50%) scale(4.6)" }} />
        </div>
      )}
      {!data.published && (
        <p role="status" className="absolute inset-x-0 top-0 z-[70] bg-amber-400 px-3 py-1.5 text-center text-xs font-semibold text-amber-950">
          Preview: this invitation is not published yet. Guests cannot open it and replies are disabled.
        </p>
      )}
      <div className="relative mx-auto h-full w-full md:max-w-[440px] md:shadow-[0_0_80px_rgba(0,0,0,0.6)]">
        <InviteExperience template={data.template} content={data.content} inviteId={data.id} preview={!data.published} />
        {/* until the payment is approved the owner's preview carries a watermark */}
        {!data.published && <PreviewWatermark />}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return <Suspense fallback={<p className="p-8 text-center">Loading…</p>}><Invite /></Suspense>;
}
