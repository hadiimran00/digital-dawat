import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Check } from "lucide-react";
import { TEMPLATES, formatPKR, getTemplate, categoryLabel, type Template } from "@/lib/templates";
import { defaultContent } from "@/lib/content";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { InviteExperience } from "@/components/invite/InviteExperience";
import { PhoneFrame } from "@/components/PhoneFrame";
import { JsonLd } from "@/components/JsonLd";
import { SupportLink } from "@/components/SupportLink";
import { DoneForYou } from "@/components/DoneForYou";
import { LivePrice, Unavailable } from "@/components/TemplateLive";
import { MAX_GUESTS } from "@/lib/guests";
import { supportWhatsapp } from "@/lib/config";

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
  const included: [string, string[]][] = [
    ["The invitation", [
      "Tap to open, with a countdown, venues, maps and add-to-calendar",
      ...(t.concept === "print" ? ["The card's artwork stays behind every screen"] : t.concept ? ["A full-screen scene for every event"] : []),
      t.music ? "Its own song, or upload yours. Guests can turn it off." : "Add your own song, or keep it quiet",
      t.concept === "print"
        ? t.print?.photo ? "Your own photo in the frame on the card, plus a portrait screen" : "Add a portrait photo of your own"
        : ["aurora", "monogram", "embossed", "garden"].includes(t.concept ?? "") ? "Add a portrait photo of the two of you"
        : `Your own photos on the cover and with the couple${t.concept ? ", plus one per event" : ""}`,
      "English or Urdu, with an optional Bismillah",
    ]],
    ["Your guests", [
      "A personal link for each guest, greeted by name",
      "Invite each guest to only their events, with their number of guests",
      "Send on WhatsApp with one tap per guest",
      "See who was sent, opened and replied",
    ]],
    ["Replies", [
      "RSVPs for each event, with totals",
      "Guests can change their reply from the same link",
      "Download the list for your caterer",
    ]],
    ["To share", [
      `A vertical video${t.music ? " with your photos and music" : " with your photos"} for Status and Instagram`,
    ]],
  ];

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

      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[420px_1fr] md:px-4 md:py-12">
        {/* live demo: full screen on phones, an iPhone-shaped frame on larger screens */}
        <div className="md:sticky md:top-6 md:flex md:justify-center md:self-start">
          <PhoneFrame margin={56} plainClassName="h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] w-full">
            <InviteExperience template={t} content={defaultContent(t.category)} demo />
          </PhoneFrame>
        </div>

        <div className="px-4 py-10 md:self-center md:py-0">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-deep">{categoryLabel(t.category)}</p>
          <h1 className="font-display text-5xl font-bold text-brand">{t.name}</h1>
          <p className="mt-3 text-lg text-foreground/70">{t.tagline}</p>
          {/* price, with what it covers and why it's safe to start, then the action right under it */}
          <div className="mt-6 rounded-2xl border border-line bg-card p-5">
            <p className="flex flex-wrap items-baseline gap-x-3"><span className="text-4xl font-bold tabular-nums"><LivePrice template={t} /></span><span className="text-sm text-foreground/70">one price for your whole guest list</span></p>
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />Build and preview your own invitation for free. You pay only when you&apos;re happy with it.</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />Up to {MAX_GUESTS.toLocaleString("en-PK")} guests, with no per-guest fee. For a 300-guest wedding that&apos;s about <LivePrice template={t} per={300} /> a guest.</li>
              <li className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-gold-deep" aria-hidden />Pay by online transfer. Your invitation goes live once we confirm it.</li>
            </ul>
            <Unavailable template={t}>
            <Link href={cta} prefetch={false} className="btn btn-primary mt-5 hidden w-full md:inline-flex">Customise {t.name}</Link>
            <p className="mt-2 hidden text-center text-xs text-foreground/70 md:block">Free to try. You only sign in when you&apos;re ready to order.</p>
            <DoneForYou template={t} className="mt-2" />
            </Unavailable>
          </div>

          <h2 className="mt-8 font-display text-2xl font-bold">About this design</h2>
          <p className="mt-2 text-sm text-foreground/80">
            {events.length > 1
              ? `It comes with ${events.length} events set up: ${events.map((e) => e.title).join(", ")}. Rename them, remove them or add more, up to six.`
              : `It comes with one event, with the date, time, venue, map link and dress code. You can add up to six.`}{" "}
            The video download uses the {MOTION_LABEL[t.motion]} style, or you can pick one of three others.
          </p>

          <h2 className="mt-8 font-display text-2xl font-bold">What you get</h2>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            {included.map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gold-deep">{group}</h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <Unavailable template={t} quiet><Link href={cta} prefetch={false} className="btn btn-primary mt-8 hidden md:inline-flex">Customise {t.name}</Link></Unavailable>
          {supportWhatsapp && <p className="mt-4 text-sm text-foreground/70">Questions about {t.name}? <SupportLink topic={`I have a question about the ${t.name} template`} className="text-brand" /></p>}

          {related.length > 0 && (
            <nav aria-label="Related templates" className="mt-10">
              <h2 className="font-display text-2xl font-bold">More designs you may like</h2>
              <ul className="mt-3 grid grid-cols-3 gap-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/templates/${r.id}`} className="group block">
                      {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                      <img src={`/thumbs/${r.id}.webp`} alt="" width={360} height={640} loading="lazy" className="w-full rounded-xl border border-line transition-[translate] duration-200 ease-out [@media(hover:hover)]:group-hover:-translate-y-0.5" style={{ background: r.theme.bg }} />
                      <span className="mt-2 block text-sm font-semibold">{r.name}</span>
                      <span className="block text-xs text-foreground/70">{categoryLabel(r.category)} · <LivePrice template={r} /></span>
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
          <p className="text-sm text-foreground/70"><LivePrice template={t} /> flat</p>
        </div>
        <Unavailable template={t} quiet><Link href={cta} prefetch={false} className="btn btn-primary">Customise</Link></Unavailable>
      </div>
    </div>
  );
}
