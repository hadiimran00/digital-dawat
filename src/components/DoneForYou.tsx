"use client";

import { Palette } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { supportLink, supportWhatsapp } from "@/lib/config";
import { useSetting } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";
import { formatPKR, type Template } from "@/lib/templates";

/**
 * The price of an invitation card designed to the family's own choice, until public.settings 'custom_design_price'
 * loads (set it there to change it; empty hides the option everywhere).
 */
export const CUSTOM_DESIGN_PRICE = 5000;

/**
 * "A design of your own choice": hands the family over to the owner on WhatsApp, naming and linking the design they were
 * looking at as a starting point. The owner designs it there, so no payment here.
 * Renders nothing until the owner's number is set (NEXT_PUBLIC_WHATSAPP), or when the price setting is empty.
 */
export function DoneForYou({ template, className = "" }: { template: Template; className?: string }) {
  const price = Number(useSetting("custom_design_price", String(CUSTOM_DESIGN_PRICE))) || 0;
  if (!supportWhatsapp || price <= 0) return null;
  const topic = `I'd like an invitation card designed to my own choice (${formatPKR(price)}). I liked the ${template.name} design (${SITE_URL}/templates/${template.id})`;
  return (
    <>
      <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-foreground/70">Want it your way?</p>
      <a href={supportLink(topic)} target="_blank" rel="noopener noreferrer"
        className={`press flex min-h-11 items-start gap-3 rounded-xl border border-line bg-background p-3 text-left hover:border-gold ${className}`}>
        <Palette className="mt-0.5 size-5 shrink-0 text-gold-deep" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-1.5 text-sm font-semibold">
            A design of your own choice<WhatsAppIcon className="size-3.5 text-[#25D366]" />
          </span>
          <span className="mt-0.5 block text-sm font-semibold tabular-nums">{formatPKR(price)} in total</span>
          <span className="mt-0.5 block text-xs text-foreground/70">Your colours, fonts, photos or a look you&apos;ve seen elsewhere. Tell us on WhatsApp and we&apos;ll design your card.</span>
        </span>
      </a>
    </>
  );
}
