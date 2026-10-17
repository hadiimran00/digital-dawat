"use client";

import Link from "next/link";
import { SupportLink } from "@/components/SupportLink";
import { usePathname } from "next/navigation";
import { PigeonMark } from "@/components/Logo";

/** Guest-facing invitation pages and template demos are full-screen: no site header or footer. */
function useImmersive() {
  const path = usePathname() ?? "";
  return /^\/i\/?$/.test(path) || /^\/templates\/[^/]+\/?$/.test(path);
}

export function SiteHeader() {
  const immersive = useImmersive();
  if (immersive) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-brand">
          <PigeonMark className="size-9 shrink-0" />
          <span className="whitespace-nowrap">Kabootar Post<span className="text-gold-deep">.</span></span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm font-medium sm:gap-4">
          <Link href="/templates" className="px-3 py-2">Templates</Link>
          <Link href="/account" className="whitespace-nowrap px-3 py-2">My orders</Link>
          <Link href="/templates" className="btn btn-primary hidden sm:inline-flex">Start creating</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const immersive = useImmersive();
  if (immersive) return null;
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-foreground/70 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Kabootar Post. The old way of inviting, delivered the new way.</p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/templates">Templates</Link>
          <Link href="/policies">Pricing &amp; refunds</Link>
          <SupportLink className="!font-normal !no-underline">Help on WhatsApp</SupportLink>
        </nav>
      </div>
    </footer>
  );
}
