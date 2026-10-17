/** Public base URL (no trailing slash). Set NEXT_PUBLIC_SITE_URL=https://kabootarpost.com once that domain is connected. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digital-dawat.pages.dev").replace(/\/$/, "");
export const SITE_NAME = "Kabootar Post";
