import { connection } from "next/server";
import { UnlockForm } from "@/components/unlock-form";
import { readApi } from "@/lib/api";

// Reads the shop name from the API on every request.
export const instant = false;

export default async function Page() {
  await connection();
  let shopName = "সেলুন";
  try {
    shopName = await readApi<string>("read.shopName");
  } catch {
    /* API unreachable: still show the form */
  }
  return <UnlockForm shopName={shopName} />;
}
