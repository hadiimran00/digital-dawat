import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Eye, Video, Link2, ListChecks, UserRound, Languages, ChevronDown } from "lucide-react";
import { TemplateGallery } from "@/components/TemplateGallery";
import { InviteCard } from "@/components/invite/InviteCard";
import { SIGNATURE, TEMPLATES, formatPKR } from "@/lib/templates";
import { defaultContent } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const PRICES = TEMPLATES.map((t) => t.price);
const FROM = formatPKR(Math.min(...PRICES));
const TO = formatPKR(Math.max(...PRICES));

const FEATURES = [
  { icon: Eye, title: "See it before you pay", text: "Edit names, events and venues with a live preview. The price is on every template page, and you pay after you have previewed your own invitation." },
  { icon: Link2, title: "One link for WhatsApp", text: "Guests open one link on any phone. They see each event with its date, venue, map and dress code, and can add it to their calendar." },
  { icon: UserRound, title: "A link for each guest", text: "Greet Sarah & Family by name and reserve their places, so the RSVP form already knows how many are invited." },
  { icon: ListChecks, title: "RSVPs in one list", text: "Guests reply on the invitation. You see who is coming and how many guests, and you can export the list to a spreadsheet." },
  { icon: Video, title: "A video for your story", text: "Download a short vertical video in four styles, made on your own device, for Instagram or WhatsApp Status." },
  { icon: Languages, title: "English and Urdu", text: "Switch the whole card to Urdu with a right-to-left layout, with an optional Bismillah at the top." },
];

const STEPS = [
  ["Pick a template", `${TEMPLATES.length} original designs for nikkah, mehndi, baraat, walima and more.`],
  ["Add your details", "Names, events, venues and dress codes, with a live preview as you type."],
  ["Pay by online bank transfer", "Send the amount and upload the receipt. We publish your invitation once we confirm it."],
  ["Share your link", "Send it on WhatsApp, download your video, and watch the replies arrive."],
];

const FAQ = [
  ["Do my guests need an app or an account?", "No. They open your link in their phone browser, tap to open the invitation, and reply on the same page."],
  ["Can I see the invitation before I pay?", "Yes. You edit and preview your own invitation first, and the price is shown on every template page."],
  ["How do I pay?", "By online bank transfer to the account shown at checkout. Upload a screenshot of the receipt and we publish your invitation after we confirm the payment."],
  ["Can I use Urdu?", "Yes. Switch the card to Urdu and the layout turns right to left. You can also type your own wording in either language."],
  ["Why is there no video button on my phone?", "Video export needs a recent browser that can encode MP4. Your invitation link works on any phone either way."],
];

export default function Home() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL }} />
      <section className="bg-brand text-brand-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="rise">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gold-light">Digital wedding invitations</p>
            <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
              Your whole wedding week in one WhatsApp link
            </h1>
            <p className="mt-6 max-w-lg text-lg text-brand-ink/80">
              Mehndi, Nikkah, Baraat and Walima on one invitation. Guests tap to open it, see every event with its dress code, and reply with their guest count.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/templates" className="btn bg-gold-light text-brand">Browse {TEMPLATES.length} templates</Link>
              <a href="#how" className="btn border border-brand-ink/30">See how it works</a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xs rise" style={{ animationDelay: "0.12s" }}>
            <div className="-rotate-2 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <InviteCard template={SIGNATURE[1]} content={defaultContent(SIGNATURE[1].category)} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-deep">Signature collection</p>
        <h2 className="font-display text-4xl font-bold text-brand">Our most cinematic invitations</h2>
        <p className="mb-8 mt-2 text-foreground/70">
          {SIGNATURE.map((t) => t.name).join(", ")}: full-screen scenes for every event, music, and an opening guests remember.
          Prices run from {FROM} to {TO} per invitation. Hover a card to watch it move.
        </p>
        <TemplateGallery limit={4} />
      </section>

      <section id="how" className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-4xl font-bold text-brand">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-2xl border border-line p-5">
                <span className="font-display text-4xl text-gold-deep">{i + 1}</span>
                <p className="mt-2 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-foreground/70">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-4xl font-bold text-brand">What every invitation includes</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-line bg-card p-6">
              <Icon className="size-6 text-gold-deep" aria-hidden />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line bg-white" aria-label="Questions">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="font-display text-4xl font-bold text-brand">Questions before you start</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-line bg-card p-4">
                <summary className="flex min-h-6 cursor-pointer list-none items-center justify-between gap-3 font-medium">
                  {q}
                  <ChevronDown className="size-4 shrink-0 transition-transform duration-200 ease-out group-open:rotate-180" aria-hidden />
                </summary>
                <p className="mt-3 text-sm text-foreground/80">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand text-brand-ink">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-4xl font-bold">See your names on a card</h2>
          <p className="mt-3 text-brand-ink/80">Choose a template, type your details, and preview your invitation before you pay.</p>
          <Link href="/templates" className="btn mt-8 bg-gold-light text-brand">Choose your template</Link>
        </div>
      </section>
    </>
  );
}
