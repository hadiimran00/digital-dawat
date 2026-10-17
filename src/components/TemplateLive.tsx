"use client";

import Link from "next/link";
import { useCatalog } from "@/lib/catalog";
import { formatPKR, type Template } from "@/lib/templates";

/** The design's price from the database (templates.ts until it loads). `per` divides it, e.g. 300 for "a guest". */
export function LivePrice({ template, per = 1 }: { template: Template; per?: number }) {
  const { price } = useCatalog();
  return <>{formatPKR(Math.round(price(template) / per))}</>;
}

/** Shown in place of the order button when the design is switched off in the database (visible = 'N'). */
/** `quiet`: show nothing at all when it is switched off (for the second and third order buttons on the page). */
export function Unavailable({ template, children, quiet = false }: { template: Template; children: React.ReactNode; quiet?: boolean }) {
  const { visible } = useCatalog();
  if (visible(template)) return <>{children}</>;
  if (quiet) return null;
  return (
    <div role="status" className="rounded-2xl border border-line bg-card p-4 text-sm">
      <p className="font-semibold">{template.name} is no longer available.</p>
      <p className="mt-1 text-foreground/70">Invitations already made with it keep working. Have a look at the other designs.</p>
      <Link href="/templates" className="btn btn-primary mt-3 w-full">See all designs</Link>
    </div>
  );
}
