import type { Metadata } from "next";
import { ContactContent } from "@/site/contact-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Visit, call or book online. Opening hours, address and frequently asked questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactContent />;
}
