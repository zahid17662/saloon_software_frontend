import type { Metadata } from "next";
import { Suspense } from "react";
import { ServicesContent } from "@/site/services-page";

export const metadata: Metadata = {
  title: "Services & Prices",
  description: "Full price list: haircuts, beard trims, hair colour, facials, hair treatments and massage chair sessions.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <Suspense>
      <ServicesContent />
    </Suspense>
  );
}
