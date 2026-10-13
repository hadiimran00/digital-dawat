import { SupportLink } from "@/components/SupportLink";
import { supportWhatsapp } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing & refunds", alternates: { canonical: "/policies" } };

export default function Policies() {
  return (
    <div className="prose mx-auto max-w-2xl space-y-4 px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-brand">Pricing &amp; refunds</h1>
      <p><strong>Flat prices.</strong> The price on each template is the full price. There are no per-guest fees and no charge to preview or edit.</p>
      <p><strong>How payment works.</strong> After you finish editing, you pay by online bank transfer and upload a screenshot of your receipt. Your invitation goes live once we confirm the payment.</p>
      <h2 className="pt-2 font-display text-2xl font-bold text-brand">Our promise</h2>
      <p>You see your finished invitation before you pay. If something still isn&apos;t right after that, we&apos;ll put it right.</p>
      <h2 className="pt-2 font-display text-2xl font-bold text-brand">Need a change?</h2>
      <p>{supportWhatsapp ? <SupportLink topic="I need a change to my invitation" className="text-brand">Message us on WhatsApp</SupportLink> : "Message us on WhatsApp"}. We correct names, dates, venues and spelling for free.</p>
      <h2 className="pt-2 font-display text-2xl font-bold text-brand">Full refund</h2>
      <p>You get all your money back if:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>we don&apos;t publish your invitation within <strong>48 hours</strong> of receiving your payment, or</li>
        <li>you ask within <strong>48 hours</strong> of it going live, we can&apos;t fix the problem, and you haven&apos;t sent it to your guests yet.</li>
      </ul>
      <h2 className="pt-2 font-display text-2xl font-bold text-brand">How we refund</h2>
      <p>We send the money back to the account you paid from within 3 working days.</p>
      <p><strong>Artwork.</strong> Some templates feature historic artwork from The Cleveland Museum of Art’s Open Access collection (CC0 public domain): “Vase with flower arrangement and scrollwork” (Mughal India, Lucknow) and “Spread with floral medallion pattern” (Mughal India, Deccan).</p>
      <p><strong>Your data.</strong> We store your invite content, your email, and RSVP replies guests send. Receipt images are private and visible only to you and the site administrators.</p>
    </div>
  );
}
