import type { Metadata, Viewport } from "next";
import { HomeContent } from "@/site/home";
import { JsonLd } from "@/site/json-ld";

// The public website's home page. Mostly static: it never calls the API, so it stays fast even
// while the backend is asleep (the one exception is the booking panel, shared in the layout). The
// staff POS lives at /pos. Description, canonical link and share images come from here and the
// layout; the opengraph-image file next to this page supplies the share image.

export const metadata: Metadata = { alternates: { canonical: "/" } };

export const viewport: Viewport = {
  themeColor: "#0c0c0d",
  width: "device-width",
  initialScale: 1,
};

export default function Home() {
  return (
    <>
      <JsonLd />
      <HomeContent />
    </>
  );
}
