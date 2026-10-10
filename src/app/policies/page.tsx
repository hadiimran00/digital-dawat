import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pricing & refunds", alternates: { canonical: "/policies" } };

export default function Policies() {
  return (
    <div className="prose mx-auto max-w-2xl space-y-4 px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-brand">Pricing &amp; refunds</h1>
      <p><strong>Flat prices.</strong> The price on each template is the full price. There are no per-guest fees and no charge to preview or edit.</p>
      <p><strong>How payment works.</strong> After you finish editing, you pay by SadaPay and upload a screenshot of your receipt. Your invitation goes live once we confirm the payment.</p>
      <p><strong>Refunds.</strong> <em>Draft policy; the business owner must confirm before launch.</em> If you have paid but your invitation has not been published, you can ask for a full refund.</p>
      <p><strong>Artwork.</strong> Some templates feature historic artwork from The Cleveland Museum of Art’s Open Access collection (CC0 public domain): “Vase with flower arrangement and scrollwork” (Mughal India, Lucknow) and “Spread with floral medallion pattern” (Mughal India, Deccan).</p>
      <p><strong>Your data.</strong> We store your invite content, your email, and RSVP replies guests send. Receipt images are private and visible only to you and the site administrators.</p>
    </div>
  );
}
