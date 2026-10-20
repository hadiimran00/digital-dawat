import type { Metadata } from "next";

// Private or per-customer pages should never appear in search results.
export const metadata: Metadata = { title: "Your video", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
