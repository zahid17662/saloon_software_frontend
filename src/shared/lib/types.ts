// GENERATED COPY of Server/src/lib/types.ts. Do not edit here: change it there
// and run `npm run sync:shared` at the repo root.
// Domain types — mirror the Drizzle schema in docs/PRD.md §8 (src/db/schema.ts) so the
// frontend data layer can later be swapped for Neon-backed server actions.

export type PaymentMethod = "CASH" | "BKASH" | "NAGAD" | "OTHER";
export type VoidedBy = "BARBER" | "ADMIN";
export type PaperWidth = "58" | "80" | "A4";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "DONE";

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  price: number; // whole taka
  sortOrder: number;
  active: boolean;
}

export interface Barber {
  id: number;
  name: string;
  commissionPct: number; // 0–100
  sortOrder: number;
  active: boolean;
  hasPassword: boolean; // never the hash itself - just whether admin has set one
  createdAt: string; // ISO (UTC)
}

export interface SaleItem {
  serviceId: number;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
}

export interface Sale {
  id: number; // also receipt number
  idempotencyKey: string;
  barberId: number;
  total: number;
  barberShare: number;
  ownerShare: number;
  commissionPctSnapshot: number;
  paymentMethod: PaymentMethod;
  createdAt: string; // ISO (UTC)
  voidedAt: string | null;
  voidedBy: VoidedBy | null;
  voidReason: string | null;
  enteredByAdmin: boolean; // FR-22 back-dated entry
  items: SaleItem[];
}

export interface Payout {
  id: number;
  barberId: number;
  amount: number;
  note: string;
  paidAt: string; // ISO (UTC)
  createdAt: string; // ISO (UTC)
}

/** A customer's online booking request from the public site (admin screens manage these). */
export interface Appointment {
  id: number;
  customerName: string;
  customerPhone: string;
  serviceName: string; // snapshot: the public site's price list is static, not this table's services
  barberId: number | null;
  barberName: string | null; // snapshot; null = the customer had no preference
  requestedAt: string; // ISO (UTC)
  note: string;
  status: AppointmentStatus;
  createdAt: string; // ISO (UTC)
}

export interface Settings {
  shopName: string;
  shopAddress: string;
  shopPhone: string;
  receiptFooter: string;
  paperWidth: PaperWidth;
  // The admin PIN, shop code and shopCodeVersion are server-only (bcrypt hashes in the DB, see
  // src/lib/auth.ts). They are never part of the client-side data.
}

export interface DB {
  categories: Category[];
  services: Service[];
  barbers: Barber[];
  sales: Sale[];
  payouts: Payout[];
  settings: Settings;
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: "ক্যাশ",
  BKASH: "বিকাশ",
  NAGAD: "নগদ",
  OTHER: "অন্যান্য",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "অপেক্ষমাণ",
  CONFIRMED: "নিশ্চিত",
  CANCELLED: "বাতিল",
  DONE: "সম্পন্ন",
};
