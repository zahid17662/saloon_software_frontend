import { Montserrat } from "next/font/google";
import "./globals.css";

// Shown for any address that matches no page. It bypasses the layouts, so it brings its own <html>.
// Plain two-language text: visitors can come from the English website or from a staff link.
const font = Montserrat({ subsets: ["latin"] });

export const metadata = { title: "Page not found", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={font.className}>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-xl font-bold text-fg">Page not found</h1>
          <p className="text-muted">পেজটি পাওয়া যায়নি</p>
          {/* A plain link on purpose: this page is served outside the app router */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-white hover:opacity-90">
            Home
          </a>
        </main>
      </body>
    </html>
  );
}
