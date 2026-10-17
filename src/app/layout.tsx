import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, DM_Sans, Fredoka, Great_Vibes, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu, Nunito } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const script = Great_Vibes({ variable: "--nf-script", subsets: ["latin"], weight: "400", preload: false, display: "swap" });
const sans = DM_Sans({ variable: "--nf-sans", subsets: ["latin"] });
const display = Cormorant_Garamond({ variable: "--nf-display", subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"] }); // 400: the large light type of the modern looks
const caps = Cinzel({ variable: "--nf-caps", subsets: ["latin"], weight: ["500", "700"], preload: false, display: "swap" });
// The Urdu font is large (about 230 KiB) and only needed for Arabic-script text, so it is not preloaded;
// it still downloads on demand with font-display: swap.
const urdu = Noto_Nastaliq_Urdu({ variable: "--nf-urdu", subsets: ["arabic"], weight: ["400", "700"], preload: false, display: "swap" });

// Bismillah: a light Arabic font (about 50 KiB) so pages do not download the 230 KiB Nastaliq font just for it.
const naskh = Noto_Naskh_Arabic({ variable: "--nf-naskh", subsets: ["arabic"], weight: ["400"], preload: false, display: "swap" });

// The kids' party designs: rounded, friendly type (Fredoka for titles and names, Nunito for the small print), loaded
// only when one of those designs is on screen
const fun = Fredoka({ variable: "--nf-fun", subsets: ["latin"], weight: ["500", "600", "700"], preload: false, display: "swap" });
const round = Nunito({ variable: "--nf-round", subsets: ["latin"], weight: ["600", "700", "800"], preload: false, display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kabootar Post | Wedding invitations for WhatsApp", template: "%s | Kabootar Post" },
  description:
    "Nikkah, mehndi, baraat and walima invitations in one WhatsApp link. Personal links for each guest, RSVPs per event, music and video. Flat PKR price, preview before you pay.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_PK",
    images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: "Kabootar Post wedding invitation templates" }],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // paint under the notch; content pads back with env(safe-area-inset-*)
  interactiveWidget: "resizes-content", // keyboard shrinks the layout viewport, so 100dvh tracks it
  colorScheme: "light",
  themeColor: "#fbf7f0", // the colour at the very top of the page (header), not the brand colour
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${script.variable} ${caps.variable} ${urdu.variable} ${naskh.variable} ${fun.variable} ${round.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppWidget />
      </body>
    </html>
  );
}
