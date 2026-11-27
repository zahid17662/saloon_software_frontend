import type { Metadata } from "next";
import { Suspense } from "react";
import { BookPageContent } from "@/site/book-page";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: "Pick a service, a time and (optionally) a barber — book your appointment online.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <Suspense>
      <BookPageContent />
    </Suspense>
  );
}
