import type { MetadataRoute } from "next";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digital-dawat.pages.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/templates`, priority: 0.9 },
    ...TEMPLATES.map((t) => ({ url: `${base}/templates/${t.id}`, priority: 0.8 })),
    { url: `${base}/policies`, priority: 0.3 },
  ];
}
