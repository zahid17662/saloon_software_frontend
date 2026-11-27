"use server";

// Auth Server Actions. They are thin: the backend API validates, rate-limits, checks bcrypt and signs
// the session cookies; this layer just forwards the call and applies the cookies the API returns.

import { callAction, failure } from "@/lib/api";
import type { AuthResult } from "@/lib/api-types";

export async function unlockShop(input: unknown): Promise<AuthResult> {
  return callAction("auth.unlockShop", [input], failure);
}

export async function loginAdmin(input: unknown): Promise<AuthResult> {
  return callAction("auth.loginAdmin", [input], failure);
}

/** Ends the admin session only; the device stays unlocked for barbers. */
export async function logoutAdmin(): Promise<AuthResult> {
  return callAction("auth.logoutAdmin", [], failure);
}

export async function changeAdminPin(input: unknown): Promise<AuthResult> {
  return callAction("auth.changeAdminPin", [input], failure);
}

export async function changeShopCode(input: unknown): Promise<AuthResult> {
  return callAction("auth.changeShopCode", [input], failure);
}

/** Used by the barber screens to notice a stale device (e.g. after the shop code changed). */
export async function checkShopSession(): Promise<{ valid: boolean }> {
  return callAction("auth.checkShopSession", [], { valid: true }); // unreachable API: keep the screen
}

/** A barber logging in to their own screen. The device must already be shop-unlocked. */
export async function barberLogin(input: unknown): Promise<AuthResult> {
  return callAction("auth.barberLogin", [input], failure);
}

/** Ends just this barber's own session; the shop device stays unlocked for the next person. */
export async function barberLogout(): Promise<AuthResult> {
  return callAction("auth.barberLogout", [], failure);
}

/** Used by the barber screen to notice its own session going stale (password changed, deactivated). */
export async function checkBarberSession(barberId: number): Promise<{ valid: boolean }> {
  return callAction("auth.checkBarberSession", [barberId], { valid: true }); // unreachable API: keep the screen
}
