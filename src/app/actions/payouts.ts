"use server";

// Payout Server Actions: thin forwards to the backend API (admin only there). The balance view also
// feeds the admin Barbers screen.

import { revalidatePath } from "next/cache";
import { callAction, failure } from "@/lib/api";
import type { ActionResult, PayoutsView } from "@/lib/api-types";
import type { Payout } from "@server/lib/types";

export type { PayoutsView };

export async function getPayoutsView(): Promise<ActionResult<PayoutsView>> {
  return callAction("payouts.getPayoutsView", [], failure);
}

export async function addPayout(input: unknown): Promise<ActionResult<Payout>> {
  const r = await callAction<ActionResult<Payout>>("payouts.addPayout", [input], failure);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

export async function deletePayout(input: unknown): Promise<ActionResult<null>> {
  const r = await callAction<ActionResult<null>>("payouts.deletePayout", [input], failure);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}
