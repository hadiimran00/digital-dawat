"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTemplate } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import { InviteCard } from "@/components/invite/InviteCard";

/** Just a template's card, for `npm run previews` to photograph into the gallery thumbnails. Not linked anywhere. */
function Card() {
  const t = getTemplate(useSearchParams().get("t") ?? "");
  if (!t) return <p className="p-8">Unknown template.</p>;
  return (
    <div data-preview-card className="mx-auto w-[300px] py-8">
      <InviteCard template={t} content={defaultContent(t.category)} />
    </div>
  );
}

export default function CardPage() {
  return <Suspense><Card /></Suspense>;
}
