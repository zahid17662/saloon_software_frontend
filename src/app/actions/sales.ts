"use server";

// Sale Server Actions: thin forwards to the backend API, which does the auth, validation and the
// server-clock sale logic. After a successful write the whole tree is revalidated so every screen
// re-reads from the API.

import { revalidatePath } from "next/cache";
import { callAction, failure } from "@/lib/api";
import type { ActionResult } from "@/lib/api-types";
import type { Sale } from "@server/lib/types";

const refreshAll = () => revalidatePath("/", "layout");

async function write<T>(name: string, args: unknown[]): Promise<ActionResult<T>> {
  const r = await callAction<ActionResult<T>>(name, args, failure);
  if (r.ok) refreshAll();
  return r;
}

export async function createSale(input: unknown): Promise<ActionResult<Sale>> {
  return write("sales.createSale", [input]);
}

export async function voidMySale(input: unknown): Promise<ActionResult<Sale>> {
  return write("sales.voidMySale", [input]);
}

export async function listSales(input: unknown): Promise<ActionResult<Sale[]>> {
  return callAction("sales.listSales", [input], failure);
}

export async function adminVoidSale(input: unknown): Promise<ActionResult<Sale>> {
  return write("sales.adminVoidSale", [input]);
}

/** FR-22. The API decides enteredByAdmin and the timestamp, never the browser. */
export async function addPastSale(input: unknown): Promise<ActionResult<Sale>> {
  return write("sales.addPastSale", [input]);
}
