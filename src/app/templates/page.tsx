import type { Metadata } from "next";
import { TemplateGallery } from "@/components/TemplateGallery";
import { TEMPLATES } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Wedding invitation templates",
  alternates: { canonical: "/templates" },
  description: `Browse ${TEMPLATES.length} original invitation templates for nikkah, mehndi, baraat, walima and more. Hover a card to watch it move. Flat PKR prices.`,
};

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-5xl font-bold text-brand">Templates</h1>
      <p className="mb-8 mt-2 text-foreground/70">Pick a design, then make it yours. Prices are flat and shown upfront.</p>
      <TemplateGallery />
    </div>
  );
}
