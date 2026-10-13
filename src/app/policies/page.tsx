import Link from "next/link";
import type { Metadata } from "next";
import { Eye, RotateCcw, Tag } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SupportLink } from "@/components/SupportLink";
import { supportWhatsapp } from "@/lib/config";
import { TEMPLATES, formatPKR } from "@/lib/templates";

export const metadata: Metadata = {
  title: "Pricing & refunds",
  alternates: { canonical: "/policies" },
  description: "One flat price per invitation, no per-guest fees. See your invitation before you pay, free corrections, and a full refund within 48 hours.",
};

const UPDATED = "13 October 2026";
const prices = TEMPLATES.map((t) => t.price);
const FROM = formatPKR(Math.min(...prices));
const TO = formatPKR(Math.max(...prices));

const SUMMARY = [
  { icon: Tag, title: "One flat price", text: `${FROM} to ${TO} per invitation. No per-guest fees.` },
  { icon: Eye, title: "See it before you pay", text: "Build and preview your whole invitation first." },
  { icon: RotateCcw, title: "48-hour refund", text: "A full refund if we can't put things right." },
];

const H2 = "font-display text-2xl font-bold text-brand";

export default function Policies() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-28 pt-12">
      <h1 className="font-display text-4xl font-bold text-brand">Pricing &amp; refunds</h1>
      <p className="mt-2 text-sm text-foreground/70">Last updated {UPDATED}</p>

      {/* the three things people want to know, before the detail */}
      <ul className="mt-6 grid gap-3 sm:grid-cols-3">
        {SUMMARY.map(({ icon: Icon, title, text }) => (
          <li key={title} className="rounded-2xl border border-line bg-card p-4">
            <Icon className="size-5 text-gold-deep" aria-hidden />
            <p className="mt-2 font-semibold">{title}</p>
            <p className="mt-0.5 text-sm text-foreground/70">{text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 space-y-10 leading-relaxed">
        <section aria-labelledby="prices">
          <h2 id="prices" className={H2}>Prices</h2>
          <p className="mt-2">
            Each design shows its full price on its page, from {FROM} to {TO}. That one payment covers the invitation, every guest,
            RSVPs and the video. Guests never pay, and previewing or editing is free.
          </p>
          <Link href="/templates" className="mt-3 inline-flex min-h-11 items-center font-semibold text-brand underline underline-offset-4">See every design and its price</Link>
        </section>

        <section aria-labelledby="payment">
          <h2 id="payment" className={H2}>How payment works</h2>
          <ol className="mt-3 space-y-3">
            {[
              "Finish your invitation and check the preview.",
              "Pay by bank transfer and upload a screenshot of the receipt.",
              "We confirm the payment and your invitation goes live, within 48 hours.",
            ].map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-brand-ink">{i + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="promise">
          <h2 id="promise" className={H2}>Our promise</h2>
          <p className="mt-2">You see your finished invitation before you pay. If something still isn&apos;t right after that, we&apos;ll put it right.</p>
        </section>

        <section aria-labelledby="changes">
          <h2 id="changes" className={H2}>Need a change?</h2>
          <p className="mt-2">
            {supportWhatsapp ? <SupportLink topic="I need a change to my invitation" className="text-brand">Message us on WhatsApp</SupportLink> : "Message us on WhatsApp"}.
            {" "}We correct names, dates, venues and spelling for free.
          </p>
        </section>

        <section aria-labelledby="refund">
          <h2 id="refund" className={H2}>Full refund</h2>
          <p className="mt-2">You get all your money back in either of these cases:</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-gold-deep">Before it goes live</p>
              <p className="mt-1">We don&apos;t publish your invitation within <strong>48 hours</strong> of receiving your payment.</p>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-gold-deep">After it goes live</p>
              <p className="mt-1">You ask within <strong>48 hours</strong>, we can&apos;t fix the problem, and you haven&apos;t sent it to your guests yet.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="how-refund">
          <h2 id="how-refund" className={H2}>How we refund</h2>
          <p className="mt-2">We send the money back to the account you paid from within 3 working days.</p>
        </section>

        <section aria-labelledby="artwork">
          <h2 id="artwork" className={H2}>Artwork and music</h2>
          <p className="mt-2">
            Our designs use licensed photographs, illustrations and music, and some use public-domain art from The Cleveland Museum
            of Art&apos;s Open Access collection. Photos you upload stay yours and appear only on your invitation.
          </p>
        </section>

        <section aria-labelledby="data">
          <h2 id="data" className={H2}>Your data</h2>
          <p className="mt-2">
            We store your invitation, your email address, your guest list and the replies your guests send. Payment receipts are
            private: only you and our team can see them.
          </p>
        </section>
      </div>

      {supportWhatsapp && (
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand p-5 text-brand-ink">
          <div>
            <p className="font-display text-xl font-bold">Questions about an order?</p>
            <p className="text-sm text-brand-ink/80">Message us and we&apos;ll help.</p>
          </div>
          <a href={`https://wa.me/${supportWhatsapp}?text=${encodeURIComponent("Assalam o Alaikum, I have a question about my order.")}`} target="_blank" rel="noopener noreferrer"
            className="btn bg-gold-light text-brand"><WhatsAppIcon className="size-4" /> WhatsApp us</a>
        </div>
      )}
    </div>
  );
}
