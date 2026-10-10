/** Public base URL (no trailing slash). Set NEXT_PUBLIC_SITE_URL when you have a custom domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://digital-dawat.pages.dev").replace(/\/$/, "");
export const SITE_NAME = "Digital Dawat";
