import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { TEMPLATES, formatPKR, getTemplate, categoryLabel } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import { InviteExperience } from "@/components/invite/InviteExperience";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/templates/[id]">): Promise<Metadata> {
  const t = getTemplate((await params).id);
  if (!t) return {};
  return {
    title: `${t.name} — ${categoryLabel(t.category)} invitation`,
    description: `${t.tagline} Open the live demo, then customise this ${categoryLabel(t.category).toLowerCase()} invitation. ${formatPKR(t.price)} flat.`,
  };
}

export default async function TemplatePage({ params }: PageProps<"/templates/[id]">) {
  const t = getTemplate((await params).id);
  if (!t) notFound();
  const cta = `/create/?t=${t.id}`;
  return (
    <div className="pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <Link
        href="/templates/"
        className="press fixed left-3 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-40 inline-flex min-h-11 items-center gap-1 rounded-full bg-black/55 px-4 text-sm font-medium text-white backdrop-blur"
      >
        <ArrowLeft className="size-4" aria-hidden /> Templates
      </Link>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[390px_1fr] md:px-4 md:py-12">
        {/* live demo: full screen on phones, a phone frame on larger screens */}
        <div className="h-[100dvh] w-full md:sticky md:top-8 md:h-[min(780px,88vh)] md:self-start md:overflow-hidden md:rounded-[2.5rem] md:border-8 md:border-foreground/90 md:shadow-2xl">
          <InviteExperience template={t} content={defaultContent(t.category)} demo />
        </div>

        <div className="px-4 py-10 md:self-center md:py-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold">{categoryLabel(t.category)}</p>
          <h1 className="font-display text-5xl font-bold text-brand">{t.name}</h1>
          <p className="mt-3 text-lg text-foreground/70">{t.tagline}</p>
          <p className="mt-6 text-3xl font-bold">{formatPKR(t.price)}</p>
          <p className="text-sm text-foreground/60">One-time, flat price. No per-guest fees.</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>✓ Tap-to-open invitation with countdown, details and map</li>
            <li>✓ English or Urdu layout</li>
            <li>✓ RSVP with guest counts, exportable to CSV</li>
            <li>✓ Share one link on WhatsApp</li>
            <li>✓ Video download ({t.motion === "envelope" ? "envelope" : t.motion === "scratch" ? "scratch reveal" : t.motion === "sparkle" ? "sparkle" : "classic"} style and more)</li>
          </ul>
          <Link href={cta} className="btn btn-primary mt-8 hidden md:inline-flex">Customise this template</Link>
        </div>
      </div>

      {/* phones: always-visible buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:hidden">
        <div>
          <p className="font-semibold leading-tight">{t.name}</p>
          <p className="text-sm text-foreground/70">{formatPKR(t.price)} flat</p>
        </div>
        <Link href={cta} className="btn btn-primary">Customise</Link>
      </div>
    </div>
  );
}
