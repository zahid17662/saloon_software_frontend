"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCatalog } from "@/components/catalog-context";
import { Button, cx, LoadingScreen } from "@/components/ui";
import { BackIcon, PrintIcon } from "@/components/icons";
import { bnDigits, receiptNo, taka } from "@server/lib/money";
import { fmtDateTime } from "@server/lib/time";
import { PAYMENT_LABELS, type PaperWidth, type Sale } from "@server/lib/types";

const PAPER: Record<PaperWidth, { label: string; cls: string }> = {
  "58": { label: "৫৮ মিমি", cls: "w-[58mm] text-[11px] p-[3mm]" },
  "80": { label: "৮০ মিমি", cls: "w-[80mm] text-[12.5px] p-[4mm]" },
  A4: { label: "A4", cls: "w-full max-w-[150mm] text-[14px] p-[10mm]" },
};

/** `sale` is null when the receipt number does not exist. Loaded from Neon by the server page. */
export function ReceiptView({ sale }: { sale: Sale | null }) {
  const catalog = useCatalog();
  const from = useSearchParams().get("from");
  const [paper, setPaper] = useState<PaperWidth | null>(null);

  if (!catalog) return <LoadingScreen />;
  if (!sale) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted">রসিদ পাওয়া যায়নি।</p>
        <Link href="/pos" className="text-primary underline">
          হোমে যান
        </Link>
      </main>
    );
  }

  const barber = catalog.barbers.find((b) => b.id === sale.barberId);
  const backHref = from === "admin" ? "/admin/sales" : `/barber/${sale.barberId}`;
  const { settings } = catalog;
  const paperNow: PaperWidth = paper ?? settings.paperWidth; // the user's pick wins, else the shop default

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-center p-4 print:block print:p-0">
      <div className="no-print mb-4 flex w-full flex-wrap items-center justify-between gap-2">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 rounded-xl px-2 py-2 text-muted hover:bg-surface-2 hover:text-fg"
        >
          <BackIcon className="h-5 w-5" />
          {from === "admin" ? "বিক্রির তালিকা" : "নতুন কাস্টমার"}
        </Link>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-xl border border-line bg-surface p-1" role="group" aria-label="কাগজের মাপ">
            {(Object.keys(PAPER) as PaperWidth[]).map((p) => (
              <button
                key={p}
                onClick={() => setPaper(p)}
                aria-pressed={paperNow === p}
                className={cx(
                  "rounded-lg px-2.5 py-1 text-xs",
                  paperNow === p ? "bg-primary font-semibold text-white" : "text-muted",
                )}
              >
                {PAPER[p].label}
              </button>
            ))}
          </div>
          <Button onClick={() => window.print()}>
            <PrintIcon className="h-5 w-5" />
            প্রিন্ট
          </Button>
        </div>
      </div>

      {/* The printable receipt. FR-14: total only — never the barber/owner split. */}
      <article
        className={cx(
          "print-area mx-auto rounded-xl bg-white font-sans leading-snug text-black shadow-2xl",
          PAPER[paperNow].cls,
        )}
      >
        <header className="text-center">
          <div className="text-[1.35em] font-bold">{settings.shopName}</div>
          {settings.shopAddress && <div>{settings.shopAddress}</div>}
          {settings.shopPhone && <div>ফোন: {bnDigits(settings.shopPhone)}</div>}
        </header>

        <div className="my-2 border-t border-dashed border-black" />

        <dl className="grid grid-cols-[auto_1fr] gap-x-2">
          <dt>রসিদ নং:</dt>
          <dd className="text-right font-semibold">{receiptNo(sale.id)}</dd>
          <dt>তারিখ:</dt>
          <dd className="text-right">{fmtDateTime(sale.createdAt)}</dd>
          <dt>নাপিত:</dt>
          <dd className="text-right">{barber?.name ?? "—"}</dd>
        </dl>

        <div className="my-2 border-t border-dashed border-black" />

        <table className="w-full">
          <thead>
            <tr className="text-left">
              <th className="font-semibold">সার্ভিস</th>
              <th className="text-right font-semibold">টাকা</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((i, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-0.5 pr-2">
                  {i.nameSnapshot}
                  {i.qty > 1 && (
                    <span className="block text-[0.9em] text-gray-600">
                      {taka(i.priceSnapshot)} × {bnDigits(i.qty)}
                    </span>
                  )}
                </td>
                <td className="py-0.5 text-right tabular-nums">{taka(i.priceSnapshot * i.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="my-2 border-t border-dashed border-black" />

        <div className="flex items-baseline justify-between text-[1.25em] font-bold">
          <span>মোট</span>
          <span className="tabular-nums">{taka(sale.total)}</span>
        </div>
        <div className="flex justify-between">
          <span>পেমেন্ট</span>
          <span>{PAYMENT_LABELS[sale.paymentMethod]}</span>
        </div>

        {sale.voidedAt && (
          <div className="my-2 border-2 border-black py-1 text-center text-[1.2em] font-bold">বাতিল</div>
        )}

        <div className="my-2 border-t border-dashed border-black" />
        {settings.receiptFooter && <p className="text-center">{settings.receiptFooter}</p>}
      </article>
    </main>
  );
}
