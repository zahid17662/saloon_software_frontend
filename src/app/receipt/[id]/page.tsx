import { notFound, redirect } from "next/navigation";
import { ShopGate } from "@/components/gates";
import { ReceiptView } from "@/components/receipt-view";
import { readApi } from "@/lib/api";
import type { ReadResult, Sale } from "@/lib/api-types";

// Live data from the API on every request (Cache Components: no prerendered body for this page).
export const instant = false;

export default async function ReceiptPage({ params }: PageProps<"/receipt/[id]">) {
  const { id } = await params;
  const saleId = Number(id);
  // An invalid id still goes through the shop-session check first; the API answers "no such sale".
  const valid = Number.isSafeInteger(saleId) && saleId > 0;
  const r = await readApi<ReadResult<Sale | null>>("read.receipt", [valid ? saleId : 0]);
  if (r.status === "redirect") redirect(r.to);
  if (r.status !== "ok") notFound();
  return (
    <ShopGate>
      <ReceiptView sale={r.data} />
    </ShopGate>
  );
}
