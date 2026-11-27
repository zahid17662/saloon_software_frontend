import type { Metadata } from "next";
import { OffersContent } from "@/site/offers-page";

export const metadata: Metadata = {
  title: "Offers",
  description: "The Gentleman's Combo and other package deals, bookable online.",
  alternates: { canonical: "/offers" },
};

export default function OffersPage() {
  return <OffersContent />;
}
