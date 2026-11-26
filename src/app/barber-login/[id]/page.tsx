import { notFound, redirect } from "next/navigation";
import { BarberLoginForm } from "@/components/barber-login-form";
import { readApi } from "@/lib/api";
import type { ReadResult } from "@/lib/api-types";

// Live data from the API on every request (Cache Components: no prerendered body for this page).
export const instant = false;

export default async function BarberLoginPage({ params }: PageProps<"/barber-login/[id]">) {
  const { id } = await params;
  const barberId = Number(id);
  if (!Number.isSafeInteger(barberId) || barberId <= 0) notFound();
  // The device itself must already be unlocked; the API sends it to /unlock otherwise.
  const r = await readApi<ReadResult<{ id: number; name: string }>>("read.barberLogin", [barberId]);
  if (r.status === "redirect") redirect(r.to);
  if (r.status !== "ok") notFound();
  return <BarberLoginForm barberId={r.data.id} barberName={r.data.name} />;
}
