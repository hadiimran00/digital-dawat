import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TEMPLATES } from "@/lib/templates";

export const dynamic = "force-static";

const base = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/templates`, priority: 0.9 },
    ...TEMPLATES.map((t) => ({ url: `${base}/templates/${t.id}`, priority: 0.8 })),
    { url: `${base}/policies`, priority: 0.3 },
  ];
}
