import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://digital-dawat.pages.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/order", "/rsvps", "/login", "/create", "/i"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
