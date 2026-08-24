import type { Metadata, Viewport } from "next";
import { Montserrat, Inter } from "next/font/google";
import { IntroOverlay } from "@/components/intro/IntroOverlay";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Nav } from "@/components/layout/Nav";
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

export const metadata: Metadata = {
  title: "Nexlivo Labs — Web and mobile product studio",
  description:
    "Nexlivo Labs designs and builds web and mobile products for businesses and enterprises, and keeps them running after launch.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
            __html: `(function(){document.documentElement.dataset.js='1';try{var s=sessionStorage.getItem('nexlivo:intro-seen')==='1';var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(s||r){document.documentElement.dataset.introDone='true';}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <IntroOverlay />
        <AnnouncementBar />
        <Nav />
        <main id="top">{children}</main>
      </body>
    </html>
  );
}
