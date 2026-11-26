"use client";

import Link from "next/link";
import { useCatalog } from "../catalog-context";
import { RangeFilter, useDateRange } from "../range-filter";
import { Badge, Card, CardHeader, Empty, ErrorText, LoadingScreen, Stat } from "../ui";
import { ArrowUpRightIcon, BagIcon, ReceiptIcon, UsersIcon, WalletIcon } from "../icons";
import { BarberTable, rangeLabel } from "./common";
import { SalesChart } from "./sales-chart";
import { useSalesWindow } from "./use-admin-data";
import { byBarber, byService, liveSales, summarize } from "@server/lib/reports";
import { bnDigits, receiptNo, taka } from "@server/lib/money";
import { fmtDate, fmtDateTime, shiftDays, todayKey, type DateRange } from "@server/lib/time";

/** Same-length period immediately before `r`, for the trend pills. */
function previousRange(r: DateRange): DateRange {
  const days = Math.round((Date.parse(r.to) - Date.parse(r.from)) / 86_400_000) + 1;
  return { from: shiftDays(r.from, -days), to: shiftDays(r.to, -days) };
}

const pct = (cur: number, prev: number) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);

export function Dashboard() {
  const catalog = useCatalog();
  const r = useDateRange("today");
  // One request covers the chosen period, the period before it (trend pills) and the 14-day chart.
  const today = todayKey();
  const loaded = useSalesWindow(
    [previousRange(r.range).from, shiftDays(today, -13)].sort()[0],
    [r.range.to, today].sort()[1],
  );
  if (!catalog || !loaded.data) return loaded.error ? <ErrorText>{loaded.error}</ErrorText> : <LoadingScreen />;
  const all = loaded.data;
  const barbers = catalog.barbers;
  const sales = liveSales(all, r.range);
  const prev = summarize(liveSales(all, previousRange(r.range)));
  const t = summarize(sales);
  const avg = t.count ? Math.round(t.total / t.count) : 0;
  const prevAvg = prev.count ? Math.round(prev.total / prev.count) : 0;
  const rows = byBarber(sales, barbers);
  const top = byService(sales).slice(0, 5);
  const recent = [...all].sort((a, z) => z.id - a.id).slice(0, 5);
  const vsLabel = r.preset === "today" ? "গতকালের তুলনায়" : "আগের সময়ের তুলনায়";

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-fg">স্বাগতম <span aria-hidden="true">👋</span></h1>
          <p className="mt-1 text-sm text-muted">
            {r.preset === "today" ? fmtDate(new Date().toISOString()) : `দেখাচ্ছে: ${rangeLabel(r.range)}`}
          </p>
        </div>
        <RangeFilter state={r} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          tone="primary"
          label="মোট বিক্রি"
          value={taka(t.total)}
          icon={<BagIcon className="h-[18px] w-[18px]" />}
          trend={pct(t.total, prev.total)}
          sub={`${vsLabel}`}
        />
        <Stat
          tone="lavender"
          label="মালিকের ভাগ"
          value={taka(t.ownerShare)}
          icon={<WalletIcon className="h-[18px] w-[18px]" />}
          trend={pct(t.ownerShare, prev.ownerShare)}
          sub={`নাপিতদের ভাগ ${taka(t.barberShare)}`}
        />
        <Stat
          tone="blush"
          label="কাস্টমার"
          value={bnDigits(t.count)}
          icon={<UsersIcon className="h-[18px] w-[18px]" />}
          trend={pct(t.count, prev.count)}
          sub={`মোট ${bnDigits(t.services)}টি সার্ভিস দেওয়া হয়েছে`}
        />
        <Stat
          tone="peach"
          label="গড় বিল"
          value={taka(avg)}
          icon={<ReceiptIcon className="h-[18px] w-[18px]" />}
          trend={pct(avg, prevAvg)}
          sub="প্রতি কাস্টমার গড়ে খরচ"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader
            title="নাপিত অনুযায়ী হিসাব"
            sub="প্রত্যেক নাপিতের বিক্রি ও কমিশন ভাগ"
            actions={
              <Link
                href="/admin/reports"
                aria-label="রিপোর্ট দেখুন"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-fg hover:bg-surface-2"
              >
                <ArrowUpRightIcon className="h-[18px] w-[18px]" />
              </Link>
            }
          />
          <BarberTable rows={rows} flat />
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader title="শীর্ষ সার্ভিস" sub="সবচেয়ে বেশি আয় হয়েছে যেগুলো থেকে" />
          {top.length === 0 ? (
            <Empty>এই সময়ে কোনো বিক্রি নেই</Empty>
          ) : (
            <ul className="space-y-2">
              {top.map((x, i) => (
                <li key={x.name} className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-sm font-semibold text-primary shadow-card">
                    {bnDigits(i + 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg">{x.name}</div>
                    <div className="text-xs text-muted">{bnDigits(x.qty)} বার</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold tabular-nums text-fg">{taka(x.revenue)}</div>
                    <div className="text-xs font-medium text-success">
                      {bnDigits(t.total > 0 ? Math.round((x.revenue / t.total) * 100) : 0)}%
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-8">
          <SalesChart sales={all} />
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader
            title="সাম্প্রতিক এন্ট্রি"
            actions={
              <Link href="/admin/sales" className="text-sm font-medium text-primary hover:underline">
                সব দেখুন
              </Link>
            }
          />
          {recent.length === 0 ? (
            <Empty>এখনো কোনো বিক্রি হয়নি</Empty>
          ) : (
            <ul className="space-y-1">
              {recent.map((sale) => (
                <li key={sale.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-surface-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-fg">
                      {barbers.find((b) => b.id === sale.barberId)?.name}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {receiptNo(sale.id)} · {fmtDateTime(sale.createdAt)}
                    </div>
                  </div>
                  {sale.voidedAt ? (
                    <Badge tone="red">বাতিল</Badge>
                  ) : (
                    <span className="text-sm font-semibold tabular-nums">{taka(sale.total)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
