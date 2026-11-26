import "server-only";

import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import { GENERIC_ERR } from "@server/lib/messages";

// The only door from the Next.js app to the backend API (Render). Server Actions and server-rendered
// pages call it; the browser never talks to the API and never sees API_KEY.
//
// Each call sends the visitor's cookies and client IP inside a JSON envelope, authenticated with the
// shared API_KEY. The API does the auth check, runs the business logic against Neon, and may answer
// with cookies to set (login / logout); `callAction` applies those to the visitor's browser.

interface SetCookie {
  name: string;
  value: string;
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "lax" | "strict" | "none";
    path?: string;
    maxAge?: number;
  };
}

interface RpcResponse<T> {
  result: T;
  setCookies: SetCookie[];
}

// A free Render instance can take about a minute to wake up, so be generous.
const TIMEOUT_MS = 60_000;

function config() {
  const url = process.env.API_URL;
  const key = process.env.API_KEY;
  if (!url || !key) throw new Error("API_URL and API_KEY must be set");
  return { url: url.replace(/\/+$/, ""), key };
}

async function rpc<T>(name: string, args: unknown[]): Promise<RpcResponse<T>> {
  const { url, key } = config();
  const jar = await cookies();
  const h = await headers();
  const forwarded: Record<string, string> = {};
  for (const k of ["x-real-ip", "x-forwarded-for"]) {
    const v = h.get(k);
    if (v) forwarded[k] = v;
  }
  const res = await fetch(`${url}/rpc/${encodeURIComponent(name)}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      args,
      cookies: Object.fromEntries(jar.getAll().map((c) => [c.name, c.value])),
      headers: forwarded,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  // Never include the response body or URL in the error: it could echo secrets.
  if (!res.ok) throw new Error(`API ${name} failed with HTTP ${res.status}`);
  return (await res.json()) as RpcResponse<T>;
}

/**
 * A Server Action call: returns the API's result, applies any cookies it asked for, and turns a
 * transport failure into `failure` (a Bangla `{ ok: false }` result) instead of an error page.
 */
export async function callAction<R>(name: string, args: unknown[], failure: R): Promise<R> {
  try {
    const { result, setCookies } = await rpc<R>(name, args);
    const jar = await cookies();
    for (const c of setCookies) jar.set(c.name, c.value, c.options);
    return result;
  } catch (e) {
    console.error(`action ${name} failed:`, e instanceof Error ? e.message : "unknown error");
    return failure;
  }
}

/** A server-rendered page read. Throws on failure, so a backend outage reaches error.tsx. */
export async function readApi<T>(name: string, args: unknown[] = []): Promise<T> {
  await connection(); // request-time work: it depends on the visitor's cookies and the clock
  return (await rpc<T>(name, args)).result;
}

export const failure = { ok: false as const, error: GENERIC_ERR };
