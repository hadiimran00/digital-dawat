"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTemplate, type Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import { InviteCard } from "@/components/invite/InviteCard";
import { drawShareImage } from "@/lib/shareImage";

/** `?share=1`: the WhatsApp link picture a customer's invitation gets (sample names), to check the drawing. */
function SharePreview({ template }: { template: Template }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let url = "";
    drawShareImage(template, defaultContent(template.category)).then((b) => { url = URL.createObjectURL(b); setSrc(url); });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [template]);
  // eslint-disable-next-line @next/next/no-img-element -- a generated picture
  return src ? <img data-share-image src={src} alt="" width={1200} height={630} /> : <p className="p-8">Drawing…</p>;
}

/** Just a template's card, for `npm run previews` to photograph into the gallery thumbnails. Not linked anywhere. */
function Card() {
  const q = useSearchParams();
  const t = getTemplate(q.get("t") ?? "");
  if (!t) return <p className="p-8">Unknown template.</p>;
  if (q.get("share")) return <SharePreview template={t} />;
  return (
    <div data-preview-card className="mx-auto w-[300px] py-8">
      <InviteCard template={t} content={defaultContent(t.category)} />
    </div>
  );
}

export default function CardPage() {
  return <Suspense><Card /></Suspense>;
}
