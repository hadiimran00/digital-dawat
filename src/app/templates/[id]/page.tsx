import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { TEMPLATES, formatPKR, getTemplate, categoryLabel, type Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { JsonLd } from "@/components/JsonLd";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ id: t.id }));
}
export const dynamicParams = false;

const MOTION_LABEL: Record<Template["motion"], string> = {
  rise: "classic",
  envelope: "envelope",
  scratch: "scratch reveal",
  sparkle: "sparkle",
};

export async function generateMetadata({ params }: PageProps<"/templates/[id]">): Promise<Metadata> {
  const t = getTemplate((await params).id);
  if (!t) return {};
  const title = `${t.name}: ${categoryLabel(t.category)} invitation template`;
  const description = `${t.tagline} Tap the live demo, then customise this ${categoryLabel(t.category).toLowerCase()} invitation with your names and events. ${formatPKR(t.price)} flat price.`;
  return {
    title,
    description,
    alternates: { canonical: `/templates/${t.id}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `/templates/${t.id}`,
      images: [{ url: `/og/${t.id}.jpg`, width: 1200, height: 630, alt: `${t.name} ${categoryLabel(t.category).toLowerCase()} invitation template` }],
    },
  };
}

export default async function TemplatePage({ params }: PageProps<"/templates/[id]">) {
  const t = getTemplate((await params).id);
  if (!t) notFound();
  const cta = `/create?t=${t.id}`;
  const events = defaultContent(t.category).events;
  const related = [
    ...TEMPLATES.filter((o) => o.id !== t.id && o.category === t.category),
    ...TEMPLATES.filter((o) => o.id !== t.id && o.category !== t.category && o.theme.ornament === t.theme.ornament),
  ].slice(0, 3);
  const url = `${SITE_URL}/templates/${t.id}`;

  return (
    <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: `${t.name} ${categoryLabel(t.category).toLowerCase()} invitation template`,
              description: t.tagline,
              image: `${SITE_URL}/og/${t.id}.jpg`,
              category: "Digital invitation",
              brand: { "@type": "Brand", name: SITE_NAME },
              offers: { "@type": "Offer", price: t.price, priceCurrency: "PKR", availability: "https://schema.org/InStock", url },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Templates", item: `${SITE_URL}/templates` },
                { "@type": "ListItem", position: 3, name: t.name, item: url },
              ],
            },
          ],
        }}
      />
      <Link
        href="/templates"
        className="press fixed left-3 top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-40 hidden min-h-11 items-center gap-1 rounded-full bg-black/55 px-4 text-sm font-medium text-white backdrop-blur md:inline-flex"
      >
        <ArrowLeft className="size-4" aria-hidden /> Templates
      </Link>

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[390px_1fr] md:px-4 md:py-12">
        {/* live demo: full screen on phones, a phone frame on larger screens */}
        <div className="h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] w-full md:sticky md:top-8 md:h-[min(780px,88vh)] md:self-start md:overflow-hidden md:rounded-[2.5rem] md:border-8 md:border-foreground/90 md:shadow-2xl">
          <InviteExperience template={t} content={defaultContent(t.category)} demo />
        </div>

        <div className="px-4 py-10 md:self-center md:py-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-deep">{categoryLabel(t.category)}</p>
          <h1 className="font-display text-5xl font-bold text-brand">{t.name}</h1>
          <p className="mt-3 text-lg text-foreground/70">{t.tagline}</p>
          <p className="mt-6 text-3xl font-bold">{formatPKR(t.price)}</p>
          <p className="text-sm text-foreground/70">One payment per invitation. Guests are not charged and there is no per-guest fee.</p>

          <h2 className="mt-8 font-display text-2xl font-bold">About this design</h2>
          <p className="mt-2 text-sm text-foreground/80">
            {t.name} is a {categoryLabel(t.category).toLowerCase()} invitation template. {t.tagline}{" "}
            {events.length > 1
              ? `It starts with ${events.length} events already set up (${events.map((e) => e.title).join(", ")}). You can rename them, remove them or add more, up to six.`
              : `It starts with one event, with fields for the date, time, venue, address, map link and dress code. You can add up to six events.`}{" "}
            The video download uses the {MOTION_LABEL[t.motion]} style by default, and you can switch to three others.
          </p>

          <h2 className="mt-6 font-display text-2xl font-bold">Included</h2>
          <ul className="mt-2 space-y-2 text-sm">
            <li>✓ Tap-to-open invitation with countdown, venue, map and add-to-calendar</li>
            <li>✓ English or Urdu layout, with an optional Bismillah</li>
            <li>✓ RSVP with guest counts, exportable to a spreadsheet</li>
            <li>✓ A personal link for each guest, with their name and reserved places</li>
            <li>✓ One link to share on WhatsApp, and a vertical video to download</li>
          </ul>
          <Link href={cta} prefetch={false} className="btn btn-primary mt-8 hidden md:inline-flex">Customise this template</Link>

          {related.length > 0 && (
            <nav aria-label="Related templates" className="mt-10">
              <h2 className="font-display text-2xl font-bold">More designs you may like</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link className="underline decoration-gold underline-offset-4" href={`/templates/${r.id}`}>
                      {r.name}: {categoryLabel(r.category)} invitation, {formatPKR(r.price)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>

      {/* phones: always-visible buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-background/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur md:hidden">
        <Link href="/templates" aria-label="Back to all templates" className="press grid size-11 shrink-0 place-items-center rounded-full border border-line">
          <ArrowLeft className="size-5" aria-hidden />
        </Link>
        <div className="mr-auto">
          <p className="font-semibold leading-tight">{t.name}</p>
          <p className="text-sm text-foreground/70">{formatPKR(t.price)} flat</p>
        </div>
        <Link href={cta} prefetch={false} className="btn btn-primary">Customise</Link>
      </div>
    </div>
  );
}
