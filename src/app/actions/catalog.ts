"use server";

// Admin catalog writes: barbers, categories, services, shop settings. Thin forwards to the backend
// API (which requires the admin session and validates everything); a successful write revalidates the
// whole tree because the catalog feeds the barber screen, receipts and every admin page.

import { revalidatePath } from "next/cache";
import { callAction, failure } from "@/lib/api";
import type { ActionResult } from "@/lib/api-types";
import type { Barber, Category, Service, Settings } from "@server/lib/types";

async function write<T>(name: string, args: unknown[]): Promise<ActionResult<T>> {
  const r = await callAction<ActionResult<T>>(name, args, failure);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

export async function addBarber(input: unknown): Promise<ActionResult<Barber>> {
  return write("catalog.addBarber", [input]);
}

export async function updateBarber(id: unknown, patch: unknown): Promise<ActionResult<Barber>> {
  return write("catalog.updateBarber", [id, patch]);
}

export async function addCategory(input: unknown): Promise<ActionResult<Category>> {
  return write("catalog.addCategory", [input]);
}

export async function updateCategory(id: unknown, patch: unknown): Promise<ActionResult<Category>> {
  return write("catalog.updateCategory", [id, patch]);
}

export async function addService(input: unknown): Promise<ActionResult<Service>> {
  return write("catalog.addService", [input]);
}

export async function updateService(id: unknown, patch: unknown): Promise<ActionResult<Service>> {
  return write("catalog.updateService", [id, patch]);
}

export async function updateSettings(patch: unknown): Promise<ActionResult<Settings>> {
  return write("catalog.updateSettings", [patch]);
}
