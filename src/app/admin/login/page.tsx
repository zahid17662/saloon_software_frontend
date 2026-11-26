import { connection } from "next/server";
import { AdminLogin } from "@/components/admin/login";
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
  return <AdminLogin shopName={shopName} />;
}
