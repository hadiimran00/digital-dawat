import Link from "next/link";
import { Eye, Video, Link2, ListChecks, Wallet, Languages } from "lucide-react";
import { TemplateGallery } from "@/components/TemplateGallery";
import { InviteCard } from "@/components/invite/InviteCard";
import { TEMPLATES } from "@/lib/templates";
import { defaultContent } from "@/lib/content";

const FEATURES = [
  { icon: Eye, title: "See it before you pay", text: "Edit names, date and venue with a live preview. The price is shown upfront; no surprise fees at checkout." },
  { icon: Link2, title: "One link, shared on WhatsApp", text: "Every invite gets its own web page with map, countdown and details. Guests need no app or account." },
  { icon: Video, title: "Video invite for status & reels", text: "Download the same design as a short vertical video, created right in your browser." },
  { icon: ListChecks, title: "RSVP you can actually use", text: "Guests reply on the invite. You see attendance and guest counts, and can export them." },
  { icon: Languages, title: "English and Urdu", text: "Switch the whole card to Urdu with proper right-to-left layout." },
  { icon: Wallet, title: "Pay the way you already do", text: "SadaPay transfer. Upload your receipt and we publish once it’s confirmed." },
];

export default function Home() {
  return (
    <>
      <section className="bg-brand text-brand-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="rise">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gold">Digital invitations</p>
            <h1 className="font-display text-5xl font-bold leading-[1.05] sm:text-6xl">
              Invitations as beautiful as the celebration.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-brand-ink/80">
              Design a nikkah, mehndi, baraat or walima invite in minutes. Share one link on WhatsApp, collect RSVPs, and
              download a video for your story.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/templates/" className="btn bg-gold text-brand">Browse templates</Link>
              <a href="#how" className="btn border border-brand-ink/30">How it works</a>
            </div>
          </div>
          <div className="mx-auto w-full max-w-xs rise" style={{ animationDelay: "0.15s" }}>
            <div className="-rotate-2 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <InviteCard template={TEMPLATES[0]} content={defaultContent(TEMPLATES[0].category)} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-4xl font-bold text-brand">Popular right now</h2>
        <p className="mb-8 mt-2 text-foreground/70">Original designs, each priced flat from Rs 999.</p>
        <TemplateGallery limit={4} />
      </section>

      <section id="how" className="border-y border-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="font-display text-4xl font-bold text-brand">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-4">
            {["Pick a template", "Edit with live preview", "Pay and upload your receipt", "Get your link and video"].map((s, i) => (
              <li key={s} className="rounded-2xl border border-line p-5">
                <span className="font-display text-4xl text-gold">{i + 1}</span>
                <p className="mt-2 font-semibold">{s}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-4xl font-bold text-brand">Built around real frustrations</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-2xl border border-line bg-card p-6">
              <Icon className="size-6 text-gold" aria-hidden />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
