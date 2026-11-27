// Owner backup download (Settings). The admin session is checked by the backend API (this handler
// forwards the visitor's cookies); proxy.ts also redirects /admin/* without a cookie. Never cached.

import { readApi } from "@/lib/api";
import type { ReadResult } from "@/lib/api-types";

export async function GET(): Promise<Response> {
  const r = await readApi<ReadResult<{ filename: string; json: string }>>("read.backup");
  if (r.status !== "ok") return new Response("Unauthorized", { status: 401, headers: { "cache-control": "no-store" } });
  return new Response(r.data.json, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${r.data.filename}"`,
      "cache-control": "no-store",
    },
  });
}
