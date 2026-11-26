// GENERATED COPY of the backend's src/lib/reports.ts. Do not edit here: change it in the backend
// repo and run `npm run sync:shared` in the dev meta-repo.
import type { Barber, Payout, Sale } from "./types";
import { dhakaDateKey, dhakaMonthKey, inRange, type DateRange } from "./time";

export interface Totals {
  count: number; // sales (customers)
  services: number; // service units
  total: number;
  barberShare: number;
  ownerShare: number;
}

const emptyTotals = (): Totals => ({ count: 0, services: 0, total: 0, barberShare: 0, ownerShare: 0 });

function add(t: Totals, s: Sale) {
  t.count += 1;
  t.services += s.items.reduce((n, i) => n + i.qty, 0);
  t.total += s.total;
  t.barberShare += s.barberShare;
  t.ownerShare += s.ownerShare;
}

/** BR-4: voided sales never count. */
export function liveSales(sales: Sale[], range?: DateRange): Sale[] {
  return sales.filter((s) => !s.voidedAt && (!range || inRange(s.createdAt, range)));
}

export function summarize(sales: Sale[]): Totals {
  const t = emptyTotals();
  for (const s of sales) add(t, s);
  return t;
}

export interface BarberRow extends Totals {
  barberId: number;
  barberName: string;
}

export function byBarber(sales: Sale[], barbers: Barber[]): BarberRow[] {
  const rows = new Map<number, BarberRow>();
  for (const b of [...barbers].sort((a, z) => a.sortOrder - z.sortOrder)) {
    if (b.active) rows.set(b.id, { barberId: b.id, barberName: b.name, ...emptyTotals() });
  }
  for (const s of sales) {
    let row = rows.get(s.barberId);
    if (!row) {
      const name = barbers.find((b) => b.id === s.barberId)?.name ?? `#${s.barberId}`;
      row = { barberId: s.barberId, barberName: name, ...emptyTotals() };
      rows.set(s.barberId, row);
    }
    add(row, s);
  }
  return [...rows.values()];
}

export interface PeriodRow extends BarberRow {
  period: string; // date key or month key
}

/** Daily or monthly rows per barber, newest period first. */
export function byPeriod(sales: Sale[], barbers: Barber[], mode: "day" | "month"): PeriodRow[] {
  const keyOf = mode === "day" ? dhakaDateKey : dhakaMonthKey;
  const rows = new Map<string, PeriodRow>();
  for (const s of sales) {
    const period = keyOf(s.createdAt);
    const k = `${period}|${s.barberId}`;
    let row = rows.get(k);
    if (!row) {
      const name = barbers.find((b) => b.id === s.barberId)?.name ?? `#${s.barberId}`;
      row = { period, barberId: s.barberId, barberName: name, ...emptyTotals() };
      rows.set(k, row);
    }
    add(row, s);
  }
  return [...rows.values()].sort((a, z) =>
    a.period === z.period ? a.barberName.localeCompare(z.barberName) : a.period < z.period ? 1 : -1,
  );
}

export interface ServiceRow {
  name: string;
  qty: number;
  revenue: number;
}

export function byService(sales: Sale[]): ServiceRow[] {
  const rows = new Map<string, ServiceRow>();
  for (const s of sales) {
    for (const i of s.items) {
      const row = rows.get(i.nameSnapshot) ?? { name: i.nameSnapshot, qty: 0, revenue: 0 };
      row.qty += i.qty;
      row.revenue += i.qty * i.priceSnapshot;
      rows.set(i.nameSnapshot, row);
    }
  }
  return [...rows.values()].sort((a, z) => z.revenue - a.revenue);
}

export interface Balance {
  earned: number;
  paid: number;
  balance: number; // negative = advance (অগ্রিম), BR-7
}

export function barberBalance(barberId: number, sales: Sale[], payouts: Payout[]): Balance {
  const earned = sales
    .filter((s) => s.barberId === barberId && !s.voidedAt)
    .reduce((n, s) => n + s.barberShare, 0);
  const paid = payouts.filter((p) => p.barberId === barberId).reduce((n, p) => n + p.amount, 0);
  return { earned, paid, balance: earned - paid };
}

/** UTF-8 CSV with BOM so Excel renders Bangla (FR-16). */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

export function downloadFile(filename: string, content: string, type = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
