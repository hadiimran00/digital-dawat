import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Eye, Video, Link2, ListChecks, UserRound, Languages, ChevronDown, Send, Image as ImageIcon } from "lucide-react";
import { TemplateGallery } from "@/components/TemplateGallery";
import { InviteCard } from "@/components/invite/InviteCard";
import { HeroDemo } from "@/components/HeroDemo";
import { SupportLink } from "@/components/SupportLink";
import { supportWhatsapp } from "@/lib/config";
import { SIGNATURE, TEMPLATES, formatPKR } from "@/lib/templates";
import { defaultContent } from "@/lib/content";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const PRICES = TEMPLATES.map((t) => t.price);
const FROM = formatPKR(Math.min(...PRICES));

const FEATURES = [
  { icon: Eye, title: "See it before you pay", text: "Edit names, events and venues with a live preview. The price is on every template page, and you pay after you have previewed your own invitation." },
  { icon: Link2, title: "One link for WhatsApp", text: "Guests open one link on any phone. They see each event with its date, venue, map and dress code, and can add it to their calendar." },
  { icon: UserRound, title: "A link for each guest", text: "Add your guest list or paste it from Excel. Each guest is greeted by name, sees only the events they are invited to, and has their places reserved." },
  { icon: Send, title: "Send on WhatsApp, one tap each", text: "A sending queue opens each guest's chat with your message and their link ready. You see who was sent, who opened it and who replied." },
  { icon: ListChecks, title: "RSVPs for every event", text: "Guests reply per event, and can change their answer later. You see totals for each event and can export the list to a spreadsheet." },
  { icon: ImageIcon, title: "Your own photos", text: "Upload your cover and couple photos, or keep the template's. The signature designs add a photo for each event and background music." },
  { icon: Video, title: "A video for your story", text: "Download a short vertical video with your photos, and music on the signature designs, for Instagram or WhatsApp Status." },
  { icon: Languages, title: "English and Urdu", text: "Switch the whole card to Urdu with a right-to-left layout, with an optional Bismillah at the top." },
];

const STEPS = [
  ["Pick a design", `${TEMPLATES.length} designs for nikkah, mehndi, baraat, walima and more. Every page shows the price.`],
  ["Add your details", "Names, events, venues, dress codes and your photos. The preview updates as you type."],
  ["Pay by bank transfer", "Send the amount and upload the receipt. We publish your invitation once we confirm it."],
  ["Send it to your guests", "Add your guest list, then send each person their own link on WhatsApp with one tap."],
];

/** the problems of a Pakistani guest list, and what the invitation does about each */
const GUEST_LIST = [
  ["Some guests are only invited to the Walima", "Pick the events for each guest. Their link shows those events and nothing else, so nobody turns up to the wrong function."],
  ["Every family asks how many can come", "Reserve places on each guest's link. The reply form lets them answer for that many people."],
  ["Replies are scattered across a dozen chats", "Every answer lands on one page, with totals for each event and a list you can download for the caterer."],
];

const FAQ = [
  ["Will older relatives be able to open it?", "Yes. They tap the link in WhatsApp and it opens in their phone's browser. One more tap opens the invitation, and they reply on the same page. Guests never need an app or an account."],
  ["Can I see the invitation before I pay?", "Yes. You edit and preview your own invitation first, and the price is shown on every template page."],
  ["How do I pay?", "By online bank transfer to the account shown at checkout. Upload a screenshot of the receipt and we publish your invitation after we confirm the payment."],
  ["Some guests are only invited to the Walima. Can I do that?", "Yes. In your guest list, pick the events for each guest. Their personal link shows only those events, and they can only reply to those."],
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
              Mehndi to Walima in one invitation that opens with music, maps and a countdown. Each guest gets a link with their name and only the events they&apos;re invited to, and you see who&apos;s coming.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/templates" className="btn bg-gold-light text-brand">See the invitations</Link>
              <a href="#how" className="btn border border-brand-ink/30">How it works</a>
            </div>
            <p className="mt-5 text-sm text-brand-ink/70">From {FROM}, one flat price. You preview your own invitation before you pay.</p>
          </div>
          <div className="mx-auto w-full max-w-xs rise" style={{ animationDelay: "0.12s" }}>
            <div className="-rotate-2 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <HeroDemo template={SIGNATURE[1]}>
                <InviteCard template={SIGNATURE[1]} content={defaultContent(SIGNATURE[1].category)} />
              </HeroDemo>
            </div>
            <p className="mt-5 text-center text-sm text-brand-ink/80">
              {SIGNATURE[1].name}, playing live.{" "}
              <Link href={`/templates/${SIGNATURE[1].id}`} className="font-semibold text-gold-light underline underline-offset-4">Try it yourself</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-deep">Signature collection</p>
        <h2 className="font-display text-4xl font-bold text-brand">Invitations that open like a film</h2>
        <p className="mb-8 mt-2 max-w-3xl text-foreground/70">
          Replay plays like a home video from your Mehndi. Shahi Darbar opens through carved palace doors, and Wisaal behind a silk curtain.
          Each one has a scene for every event and its own song. Hover a card, or scroll on your phone, to watch it play.
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

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-deep">Guest list</p>
        <h2 className="font-display text-4xl font-bold text-brand">Made for a Pakistani guest list</h2>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {GUEST_LIST.map(([problem, answer]) => (
            <li key={problem} className="border-l-2 border-gold pl-5">
              <p className="font-display text-2xl font-bold leading-snug text-brand">{problem}</p>
              <p className="mt-2 text-sm text-foreground/70">{answer}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-4xl font-bold text-brand">What every invitation includes</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-line bg-card p-6">
              <Icon className="size-6 text-gold-deep" aria-hidden />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link href="/templates" className="btn btn-primary">See the invitations</Link>
          <p className="text-sm text-foreground/70">Every design includes all of this, from {FROM}.</p>
        </div>
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
          {supportWhatsapp && <p className="mt-6 text-sm text-foreground/80">Still have a question? <SupportLink className="text-brand" /></p>}
        </div>
      </section>

      <section className="bg-brand text-brand-ink">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="font-display text-4xl font-bold">See your own names on the invitation</h2>
          <p className="mt-3 text-brand-ink/80">Choose a design and type your names and events. You see the finished invitation before you pay anything.</p>
          <Link href="/templates" className="btn mt-8 bg-gold-light text-brand">Choose your design</Link>
        </div>
      </section>
    </>
  );
}
