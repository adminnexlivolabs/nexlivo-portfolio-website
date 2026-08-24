import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
});

const title = "Nexlivo Labs — Web and mobile product studio";
const description =
  "Nexlivo Labs designs and builds web and mobile products for businesses and enterprises, and keeps them running after launch.";

// Social platforms fetch og:image over the public internet, so the tag has to
// carry an ABSOLUTE URL. Next builds one by resolving the relative path below
// against metadataBase; without it, Next falls back to localhost and warns at
// build time. The production origin is not fixed yet, so it is read from the
// environment (set NEXT_PUBLIC_SITE_URL on the deploy target) and only falls
// back to localhost for local development.
// `||`, not `??`: an env file that declares the key but leaves it blank yields
// "", which would make `new URL("")` throw at build time.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// public/og-image.png, 1200x630. Regenerate with scripts/make-og-image.mjs.
const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Nexlivo Labs — we design and build software that businesses run on.",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Nexlivo Labs",
  // No bare phone/email/date strings on the page should be silently
  // re-linked or re-styled by the browser - the phone and email links
  // in Footer/Contact are already deliberate <a> elements.
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    siteName: "Nexlivo Labs",
    type: "website",
    locale: "en_US",
    url: "/",
    images: [ogImage],
  },
  twitter: {
    // summary_large_image, not summary: the card is a 1.91:1 banner, and
    // "summary" would crop it to a small square thumbnail.
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#010417",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){document.documentElement.dataset.js='1';try{var s=sessionStorage.getItem('nexlivo:intro-seen')==='1';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(s||r){document.documentElement.dataset.introDone='true';}}catch(e){}try{if(localStorage.getItem('nexlivo:announcement-dismissed')==='1'){document.documentElement.dataset.announcementDismissed='1';}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <IntroOverlay />
        <AnnouncementBar />
        <Nav />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
