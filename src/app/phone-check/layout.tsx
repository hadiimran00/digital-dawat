import type { Metadata } from "next";

// A private diagnostics page for testing on real phones; it must not appear in search results.
export const metadata: Metadata = { title: "Phone check", robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
