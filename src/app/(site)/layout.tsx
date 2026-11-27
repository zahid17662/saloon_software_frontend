import type { Metadata } from "next";
import { Hind_Siliguri, Montserrat } from "next/font/google";
import { SiteChrome } from "@/site/chrome";
import { SITE } from "@/site/config";
import { SITE_URL } from "@/site/url";
import "../globals.css";

// Root layout of the public website (English). The staff screens have their own root layout in (pos).
// Montserrat is the site font; Hind Siliguri only supplies the taka sign (৳). The site is multi-page
// (Home, Services, Offers, Contact, and /book for booking); the header/footer are shared here so
// every page gets them, and each page sets its own title/description/canonical below.
const montserrat = Montserrat({ variable: "--font-site", subsets: ["latin"] });
const bangla = Hind_Siliguri({ variable: "--font-bn", subsets: ["bengali"], weight: ["400", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { template: `%s | ${SITE.name}`, default: `${SITE.name} | Men's Haircut, Facial & Grooming` },
  description: "Haircut, beard, hair colour, facial, hair treatment and massage chair services for men. Look Good, Feel Confident.",
  openGraph: {
    title: SITE.name,
    description: "Look Good, Feel Confident.",
    type: "website",
    siteName: SITE.name,
    locale: "en",
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: "Look Good, Feel Confident." },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${bangla.variable}`}>
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
