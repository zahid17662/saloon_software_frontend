import { notFound, redirect } from "next/navigation";
import { BarberScreen } from "@/components/barber-screen";
import { BarberGate } from "@/components/gates";
import { readApi } from "@/lib/api";
import type { ReadResult, Sale } from "@/lib/api-types";

// Live data from the API on every request (Cache Components: no prerendered body for this page).
export const instant = false;

export default async function BarberPage({ params }: PageProps<"/barber/[id]">) {
  const { id } = await params;
  const barberId = Number(id);
  if (!Number.isSafeInteger(barberId) || barberId <= 0) notFound();
  const r = await readApi<ReadResult<Sale[]>>("read.barber", [barberId]);
  if (r.status === "redirect") redirect(r.to);
  if (r.status !== "ok") notFound();
  return (
    <BarberGate barberId={barberId}>
      <BarberScreen barberId={barberId} todaySales={r.data} />
    </BarberGate>
  );
}
