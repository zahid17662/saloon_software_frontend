"use client";

import { useState } from "react";
import { useCatalog } from "../catalog-context";
import { RangeFilter, useDateRange } from "../range-filter";
import { Button, cx, Empty, ErrorText, LoadingScreen, PageTitle } from "../ui";
import { useSalesWindow } from "./use-admin-data";
import { rangeLabel, TableWrap, td, tdNum, th, thNum } from "./common";
import { byPeriod, byService, downloadFile, liveSales, summarize, toCsv } from "@server/lib/reports";
import { bnDigits, taka } from "@server/lib/money";
import { fmtDateKey, fmtMonthKey } from "@server/lib/time";

type Mode = "day" | "month" | "service";
const TABS: { id: Mode; label: string }[] = [
  { id: "day", label: "দৈনিক" },
  { id: "month", label: "মাসিক" },
  { id: "service", label: "সার্ভিস অনুযায়ী" },
];

export function Reports() {
  const catalog = useCatalog();
  const r = useDateRange("month");
  const [mode, setMode] = useState<Mode>("day");
  const loaded = useSalesWindow(r.range.from, r.range.to);
  if (!catalog || !loaded.data) return loaded.error ? <ErrorText>{loaded.error}</ErrorText> : <LoadingScreen />;
  const sales = liveSales(loaded.data, r.range);
  const t = summarize(sales);

  const periodRows = mode === "service" ? [] : byPeriod(sales, catalog.barbers, mode);
  const serviceRows = mode === "service" ? byService(sales) : [];
  const fmtPeriod = (p: string) => (mode === "month" ? fmtMonthKey(p) : fmtDateKey(p));

  function exportCsv() {
    const name = `report-${mode}-${r.range.from}_${r.range.to}.csv`;
    if (mode === "service") {
      downloadFile(name, toCsv(["সার্ভিস", "কতবার", "মোট টাকা"], serviceRows.map((x) => [x.name, x.qty, x.revenue])));
    } else {
      downloadFile(
        name,
        toCsv(
          [mode === "day" ? "তারিখ" : "মাস", "নাপিত", "কাস্টমার", "সার্ভিস", "মোট বিক্রি", "নাপিতের ভাগ", "মালিকের ভাগ"],
          periodRows.map((x) => [x.period, x.barberName, x.count, x.services, x.total, x.barberShare, x.ownerShare]),
        ),
      );
    }
  }

  const empty = mode === "service" ? serviceRows.length === 0 : periodRows.length === 0;

  return (
    <>
      <PageTitle
        title="রিপোর্ট"
        sub={`${rangeLabel(r.range)} · মোট ${taka(t.total)} · মালিকের ভাগ ${taka(t.ownerShare)}`}
        actions={
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={empty}>
            সিএসভি ডাউনলোড
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="হিসাবের ধরন">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={cx(
                "rounded-lg px-3 py-1.5 text-sm",
                mode === tab.id ? "bg-surface-2 font-semibold text-fg" : "text-muted hover:text-fg",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <RangeFilter state={r} />
      </div>

      {empty ? (
        <Empty>এই সময়ে কোনো বিক্রি নেই</Empty>
      ) : mode === "service" ? (
        <TableWrap>
          <thead className="border-b border-line">
            <tr>
              <th className={th}>সার্ভিস</th>
              <th className={thNum}>কতবার</th>
              <th className={thNum}>মোট টাকা</th>
              <th className={thNum}>অংশ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {serviceRows.map((x) => (
              <tr key={x.name}>
                <td className={td}>{x.name}</td>
                <td className={tdNum}>{bnDigits(x.qty)}</td>
                <td className={tdNum}>{taka(x.revenue)}</td>
                <td className={tdNum}>
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full bg-primary" style={{ width: `${t.total > 0 ? (x.revenue / t.total) * 100 : 0}%` }} />
                    </div>
                    <span className="w-10">{bnDigits(t.total > 0 ? Math.round((x.revenue / t.total) * 100) : 0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      ) : (
        <TableWrap>
          <thead className="border-b border-line">
            <tr>
              <th className={th}>{mode === "day" ? "তারিখ" : "মাস"}</th>
              <th className={th}>নাপিত</th>
              <th className={thNum}>কাস্টমার</th>
              <th className={thNum}>সার্ভিস</th>
              <th className={thNum}>মোট বিক্রি</th>
              <th className={thNum}>নাপিতের ভাগ</th>
              <th className={thNum}>মালিকের ভাগ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {periodRows.map((x, i) => {
              const firstOfPeriod = i === 0 || periodRows[i - 1].period !== x.period;
              return (
                <tr key={`${x.period}-${x.barberId}`} className={firstOfPeriod && i > 0 ? "border-t-2 border-line" : ""}>
                  <td className={cx(td, !firstOfPeriod && "text-transparent")}>{fmtPeriod(x.period)}</td>
                  <td className={td}>{x.barberName}</td>
                  <td className={tdNum}>{bnDigits(x.count)}</td>
                  <td className={tdNum}>{bnDigits(x.services)}</td>
                  <td className={tdNum}>{taka(x.total)}</td>
                  <td className={tdNum}>{taka(x.barberShare)}</td>
                  <td className={`${tdNum} text-primary`}>{taka(x.ownerShare)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t border-line-strong bg-surface-2 font-semibold">
            <tr>
              <td className={td} colSpan={2}>
                মোট
              </td>
              <td className={tdNum}>{bnDigits(t.count)}</td>
              <td className={tdNum}>{bnDigits(t.services)}</td>
              <td className={tdNum}>{taka(t.total)}</td>
              <td className={tdNum}>{taka(t.barberShare)}</td>
              <td className={`${tdNum} text-primary`}>{taka(t.ownerShare)}</td>
            </tr>
          </tfoot>
        </TableWrap>
      )}
    </>
  );
}
