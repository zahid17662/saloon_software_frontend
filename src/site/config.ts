// Public website details. EDIT THIS FILE before going live.
// An empty string (or empty list) hides that item on the site, so nothing made-up is ever published.

export interface Review {
  name: string;
  service: string;
  text: string;
}

export const SITE = {
  name: "Nir Smart Gents Parlour",
  address: "", // e.g. "House 1, Road 2, Mirpur, Dhaka"
  phone: "", // e.g. "01700000000": shows "Call us" and the call-to-book button
  whatsapp: "", // international format without "+", e.g. "8801700000000": enables booking on WhatsApp
  hours: "", // e.g. "Every day, 10 AM – 10 PM"
  year: 2026,
  reviews: [] as Review[], // real customer reviews only; the section appears once this has entries
};
