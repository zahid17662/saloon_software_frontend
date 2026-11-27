import { notFound, redirect } from "next/navigation";
import { BarberPicker } from "@/components/barber-picker";
import { ShopGate } from "@/components/gates";
import { readApi } from "@/lib/api";
import type { ReadResult, TodayStat } from "@/lib/api-types";

// Live data from the API on every request (Cache Components: no prerendered body for this page).
export const instant = false;

export default async function Home() {
  const r = await readApi<ReadResult<TodayStat[]>>("read.home");
  if (r.status === "redirect") redirect(r.to);
  if (r.status !== "ok") notFound();
  return (
    <ShopGate>
      <BarberPicker stats={r.data} />
    </ShopGate>
  );
}
