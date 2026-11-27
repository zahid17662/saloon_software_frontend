import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Poppins } from "next/font/google";
import { CatalogBoundary } from "@/components/catalog-boundary";
import { readApi } from "@/lib/api";
import "../globals.css";

// Poppins renders Latin letters and numbers; Hind Siliguri covers Bangla.
// The browser picks per glyph, so mixed text uses both.
const latin = Poppins({
  variable: "--font-latin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bangla = Hind_Siliguri({
  variable: "--font-bn",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

// Root layout for everything the staff use (POS, admin, receipts): Bangla, never indexed. Only these
// pages load the catalog from the API. The public website has its own root layout in (site).

const FALLBACK_TITLE = "সেলুন হিসাব";

// The browser tab shows the shop name from Settings (it is already shown on the public login pages).
// If the database is unreachable the tab falls back to a generic title rather than failing the page.
export async function generateMetadata(): Promise<Metadata> {
  let title = FALLBACK_TITLE;
  try {
    title = (await readApi<string>("read.shopName")).trim() || FALLBACK_TITLE;
  } catch {
    /* keep the fallback */
  }
  return {
    title,
    description: "সেলুনের সার্ভিস, নাপিতের কমিশন ও দৈনিক হিসাব",
    robots: { index: false, follow: false }, // staff screens stay out of search engines
  };
}

export const viewport: Viewport = {
  themeColor: "#f3f5f9",
  width: "device-width",
  initialScale: 1,
};

export default function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`${latin.variable} ${bangla.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <CatalogBoundary>{children}</CatalogBoundary>
      </body>
    </html>
  );
}
