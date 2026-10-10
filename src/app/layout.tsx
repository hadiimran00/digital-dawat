import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/Site";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const sans = DM_Sans({ variable: "--nf-sans", subsets: ["latin"] });
const display = Cormorant_Garamond({ variable: "--nf-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const urdu = Noto_Nastaliq_Urdu({ variable: "--nf-urdu", subsets: ["arabic"], weight: ["400", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Digital Dawat | Wedding invitations for WhatsApp", template: "%s | Digital Dawat" },
  description:
    "Make a nikkah, mehndi, baraat or walima invitation with a live preview, flat PKR prices, RSVPs with guest counts and one link for WhatsApp. English and Urdu.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_PK",
    images: [{ url: "/og/default.jpg", width: 1200, height: 630, alt: "Digital Dawat wedding invitation templates" }],
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
    <html lang="en" className={`${sans.variable} ${display.variable} ${urdu.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
