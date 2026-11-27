"use server";

// Appointment Server Actions: thin forwards to the backend API. createAppointment is public (the
// website's booking form, no session); list is readable by any unlocked shop device (barber or
// admin); updateStatus is admin only.

import { revalidatePath } from "next/cache";
import { callAction, failure, readApi } from "@/lib/api";
import type { ActionResult } from "@/lib/api-types";
import type { Appointment } from "@server/lib/types";

export type { Appointment };

export async function createAppointment(input: unknown): Promise<ActionResult<Appointment>> {
  return callAction("appointments.create", [input], failure);
}

export async function listAppointments(): Promise<ActionResult<Appointment[]>> {
  return callAction("appointments.list", [], failure);
}

export async function updateAppointmentStatus(input: unknown): Promise<ActionResult<Appointment>> {
  const r = await callAction<ActionResult<Appointment>>("appointments.updateStatus", [input], failure);
  if (r.ok) revalidatePath("/admin/appointments");
  return r;
}

/** Public: active barbers for the website's optional "pick a barber" field. */
export async function listActiveBarbers(): Promise<{ id: number; name: string }[]> {
  return readApi("read.barbersPublic");
}
