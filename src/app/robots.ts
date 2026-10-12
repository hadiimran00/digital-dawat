import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const base = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/order", "/rsvps", "/guests", "/login", "/create", "/i", "/phone-check", "/card"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
