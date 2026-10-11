"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { backendConfigured, getSupabase } from "@/lib/supabase";
import type { InviteContent } from "@/lib/content";
import { ContentSchema } from "@/lib/contentSchema";
import { getTemplate, type Template } from "@/lib/templates";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { NotConfigured } from "@/lib/useUser";

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

  return (
    <div className="relative h-[100dvh] w-full">
      {!data.published && (
        <p role="status" className="absolute inset-x-0 top-0 z-[70] bg-amber-400 px-3 py-1.5 text-center text-xs font-semibold text-amber-950">
          Preview: this invitation is not published yet. Guests cannot open it and replies are disabled.
        </p>
      )}
      <InviteExperience template={data.template} content={data.content} inviteId={data.id} demo={!data.published} />
    </div>
  );
}

export default function InvitePage() {
  return <Suspense fallback={<p className="p-8 text-center">Loading…</p>}><Invite /></Suspense>;
}
