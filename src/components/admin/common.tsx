"use client";

import { bnDigits, nameInitial, taka } from "@server/lib/money";
import { fmtDateKey, type DateRange } from "@server/lib/time";
import type { BarberRow } from "@server/lib/reports";
import { Empty } from "../ui";

export const rangeLabel = (r: DateRange) =>
  r.from === r.to ? fmtDateKey(r.from) : `${fmtDateKey(r.from)} – ${fmtDateKey(r.to)}`;

export const th = "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-subtle";
export const thNum = "px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-subtle";
export const td = "px-3 py-2.5 text-sm text-fg";
export const tdNum = "px-3 py-2.5 text-right text-sm tabular-nums text-fg";

/** `flat` drops the card chrome when the table already sits inside a Card. */
export function TableWrap({ children, flat }: { children: React.ReactNode; flat?: boolean }) {
  return (
    <div className={flat ? "-mx-1 overflow-x-auto" : "overflow-x-auto rounded-3xl bg-surface p-2 shadow-card"}>
      <table className="w-full min-w-[560px] border-collapse">{children}</table>
    </div>
  );
}

/** Per-barber totals table used by the dashboard and reports. */
export function BarberTable({ rows, flat }: { rows: BarberRow[]; flat?: boolean }) {
  if (rows.length === 0) return <Empty>এই সময়ে কোনো বিক্রি নেই</Empty>;
  const sum = rows.reduce(
    (t, r) => ({
      count: t.count + r.count,
      services: t.services + r.services,
      total: t.total + r.total,
      barberShare: t.barberShare + r.barberShare,
      ownerShare: t.ownerShare + r.ownerShare,
    }),
    { count: 0, services: 0, total: 0, barberShare: 0, ownerShare: 0 },
  );
  return (
    <TableWrap flat={flat}>
      <thead className="border-b border-line">
        <tr>
          <th className={th}>নাপিত</th>
          <th className={thNum}>কাস্টমার</th>
          <th className={thNum}>সার্ভিস</th>
          <th className={thNum}>মোট বিক্রি</th>
          <th className={thNum}>নাপিতের ভাগ</th>
          <th className={thNum}>মালিকের ভাগ</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {rows.map((r) => (
          <tr key={r.barberId}>
            <td className={td}>
              <span className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                  {nameInitial(r.barberName)}
                </span>
                {r.barberName}
              </span>
            </td>
            <td className={tdNum}>{bnDigits(r.count)}</td>
            <td className={tdNum}>{bnDigits(r.services)}</td>
            <td className={tdNum}>{taka(r.total)}</td>
            <td className={tdNum}>{taka(r.barberShare)}</td>
            <td className={`${tdNum} text-primary`}>{taka(r.ownerShare)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t border-line font-semibold">
        <tr>
          <td className={td}>মোট</td>
          <td className={tdNum}>{bnDigits(sum.count)}</td>
          <td className={tdNum}>{bnDigits(sum.services)}</td>
          <td className={tdNum}>{taka(sum.total)}</td>
          <td className={tdNum}>{taka(sum.barberShare)}</td>
          <td className={`${tdNum} text-primary`}>{taka(sum.ownerShare)}</td>
        </tr>
      </tfoot>
    </TableWrap>
  );
}
