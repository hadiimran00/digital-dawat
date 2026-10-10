import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/Site";

const sans = DM_Sans({ variable: "--nf-sans", subsets: ["latin"] });
const display = Cormorant_Garamond({ variable: "--nf-display", subsets: ["latin"], weight: ["500", "600", "700"] });
const urdu = Noto_Nastaliq_Urdu({ variable: "--nf-urdu", subsets: ["arabic"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: { default: "Digital Dawat — Invitations for weddings & celebrations", template: "%s · Digital Dawat" },
  description:
    "Design beautiful web and video invitations for nikkah, mehndi, baraat, walima and more. Live preview, flat prices, RSVP tracking, share on WhatsApp.",
};

export const viewport: Viewport = { themeColor: "#0f3d33", width: "device-width", initialScale: 1 };

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
