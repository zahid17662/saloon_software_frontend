"use client";

import { useSearchParams } from "next/navigation";
import { BookingFlow, type BookingService } from "./booking";

/** Reads ?name=&price= (set by a service card's "Book" link) to preselect a service. */
export function BookPageContent() {
  const params = useSearchParams();
  const name = params.get("name");
  const priceRaw = params.get("price");
  const price = priceRaw ? Number(priceRaw) : NaN;
  const initial: BookingService | null = name && Number.isFinite(price) && price > 0 ? { name, price } : null;

  return <BookingFlow initial={initial} />;
}
