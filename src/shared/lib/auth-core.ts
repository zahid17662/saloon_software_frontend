// GENERATED COPY of Server/src/lib/auth-core.ts. Do not edit here: change it there
// and run `npm run sync:shared` at the repo root.
// Pure auth primitives: HMAC-signed cookies, TTLs and zod input schemas.
// No DB and no "server-only" so tests and proxy.ts can import it. Never import this from client code:
// it needs node:crypto and the server's SESSION_SECRET.

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const SHOP_COOKIE_TTL_S = 180 * 24 * 60 * 60; // FR-1: 180 days
export const ADMIN_COOKIE_TTL_S = 8 * 60 * 60; // 8 hours
// Short: the shop device is often shared between barbers, so a long-lived barber cookie would
// recreate the exact problem this session fixes (the next barber on the same device staying
// "logged in" as the previous one). One shift's worth is enough.
export const BARBER_COOKIE_TTL_S = 12 * 60 * 60; // 12 hours
export const MAX_COOKIE_LENGTH = 512;
const MIN_SECRET_LENGTH = 32;

export type CookieKind = "shop" | "admin" | "barber";

const shopPayload = z.object({
  v: z.number().int().positive(), // shopCodeVersion the device unlocked with
  exp: z.number().int().positive(), // unix seconds
});
const adminPayload = z.object({
  pv: z.string().min(1).max(64), // fingerprint of the admin PIN hash (see adminPinFingerprint)
  exp: z.number().int().positive(),
});
const barberPayload = z.object({
  barberId: z.number().int().positive(),
  bv: z.string().min(1).max(64), // fingerprint of the barber's password hash (see barberPasswordFingerprint)
  exp: z.number().int().positive(),
});
export type ShopPayload = z.infer<typeof shopPayload>;
export type AdminPayload = z.infer<typeof adminPayload>;
export type BarberPayload = z.infer<typeof barberPayload>;

function assertSecret(secret: unknown): asserts secret is string {
  if (typeof secret !== "string" || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET must be set and at least ${MIN_SECRET_LENGTH} characters`);
  }
}

// The kind is part of the MAC input, so a cookie of one kind can never validate as another.
function mac(kind: CookieKind, payloadB64: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(`${kind}.${payloadB64}`).digest();
}

const B64URL = /^[A-Za-z0-9_-]+$/;

export function signCookie(kind: CookieKind, payload: object, secret: string): string {
  assertSecret(secret);
  const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${p}.${mac(kind, p, secret).toString("base64url")}`;
}

function verify<T extends { exp: number }>(
  kind: CookieKind,
  value: string | undefined,
  secret: string,
  schema: z.ZodType<T>,
  nowMs: number,
): T | null {
  assertSecret(secret);
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_COOKIE_LENGTH) return null;

  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [p, sig] = parts;
  if (!B64URL.test(p) || !B64URL.test(sig)) return null;

  const expected = mac(kind, p, secret);
  const given = Buffer.from(sig, "base64url");
  // Re-encoding rejects non-canonical base64 (trailing bits that decode to the same bytes).
  if (given.toString("base64url") !== sig) return null;
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  let json: unknown;
  try {
    json = JSON.parse(Buffer.from(p, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return null;
  if (parsed.data.exp * 1000 <= nowMs) return null;
  return parsed.data;
}

export const verifyShopCookie = (value: string | undefined, secret: string, nowMs = Date.now()) =>
  verify("shop", value, secret, shopPayload, nowMs);

export const verifyAdminCookie = (value: string | undefined, secret: string, nowMs = Date.now()) =>
  verify("admin", value, secret, adminPayload, nowMs);

export const verifyBarberCookie = (value: string | undefined, secret: string, nowMs = Date.now()) =>
  verify("barber", value, secret, barberPayload, nowMs);

export function createShopCookie(version: number, secret: string, nowMs = Date.now()) {
  const exp = Math.floor(nowMs / 1000) + SHOP_COOKIE_TTL_S;
  return { value: signCookie("shop", { v: version, exp }, secret), maxAge: SHOP_COOKIE_TTL_S };
}

export function createAdminCookie(pinFingerprint: string, secret: string, nowMs = Date.now()) {
  const exp = Math.floor(nowMs / 1000) + ADMIN_COOKIE_TTL_S;
  return { value: signCookie("admin", { pv: pinFingerprint, exp }, secret), maxAge: ADMIN_COOKIE_TTL_S };
}

export function createBarberCookie(barberId: number, passwordFingerprint: string, secret: string, nowMs = Date.now()) {
  const exp = Math.floor(nowMs / 1000) + BARBER_COOKIE_TTL_S;
  return {
    value: signCookie("barber", { barberId, bv: passwordFingerprint, exp }, secret),
    maxAge: BARBER_COOKIE_TTL_S,
  };
}

/**
 * Short keyed fingerprint of the stored PIN hash. Stored in the admin cookie so that changing the
 * PIN invalidates every other admin session. It is an HMAC, so it reveals nothing about the hash.
 */
export function adminPinFingerprint(pinHash: string, secret: string): string {
  assertSecret(secret);
  return createHmac("sha256", secret).update(`pv.${pinHash}`).digest("base64url").slice(0, 22);
}

/**
 * Same trick as adminPinFingerprint, for a barber's password hash: changing (or clearing) a
 * barber's password invalidates their existing session cookie without a server-side session table.
 */
export function barberPasswordFingerprint(passwordHash: string, secret: string): string {
  assertSecret(secret);
  return createHmac("sha256", secret).update(`bv.${passwordHash}`).digest("base64url").slice(0, 22);
}

/** `__Host-` needs Secure + Path=/ + no Domain, so only use it when the cookie is Secure. */
export function cookieName(kind: CookieKind, secure: boolean): string {
  return `${secure ? "__Host-" : ""}salon_${kind}`;
}

/** Attributes for a session cookie. Used by every Server Action that sets one. */
export function sessionCookieOptions(secure: boolean, maxAge: number) {
  return { httpOnly: true, secure, sameSite: "lax" as const, path: "/", maxAge };
}

/**
 * Attributes for clearing a cookie. They must match the ones used to set it: browsers silently
 * ignore a `__Host-` cookie that is overwritten without Secure, so a plain delete would leave a
 * "logged out" admin logged in for up to 8 hours in production.
 */
export function clearCookieOptions(secure: boolean) {
  return { ...sessionCookieOptions(secure, 0), expires: new Date(0) };
}

// ---------- zod input schemas (shared by the Server Actions) ----------

/** Shop code and admin PIN: 4-8 ASCII digits. */
export const codeSchema = z.string().trim().regex(/^[0-9]{4,8}$/);

export const unlockInput = z.object({ code: codeSchema });
export const loginAdminInput = z.object({ pin: codeSchema });
export const changePinInput = z.object({ current: codeSchema, next: codeSchema });
export const changeShopCodeInput = z.object({ next: codeSchema });
