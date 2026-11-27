// Shapes the backend API returns. Hand-written mirrors of the backend's types (the API is JSON, so
// there is no shared TypeScript import across the two repos).

import type { Appointment, Barber, Category, Payout, Sale, Service, Settings } from "@server/lib/types";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

/** What the auth actions return: success carries no data. */
export type AuthResult = { ok: true } | { ok: false; error: string };

export interface BarberBalance {
  barberId: number;
  earned: number;
  paid: number;
  balance: number; // negative = advance
  salesCount: number;
}

export interface PayoutsView {
  payouts: Payout[];
  balances: BarberBalance[];
}

export interface Catalog {
  categories: Category[];
  services: Service[];
  barbers: Barber[];
  settings: Settings;
}

export interface TodayStat {
  barberId: number;
  count: number;
  barberShare: number;
}

/** A page read: data, or where to send the visitor instead. */
export type ReadResult<T> =
  | { status: "ok"; data: T }
  | { status: "redirect"; to: string }
  | { status: "notFound" }
  | { status: "unauthorized" };

export type { Appointment, Sale };
