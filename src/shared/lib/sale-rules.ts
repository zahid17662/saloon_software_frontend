// GENERATED COPY of the backend's src/lib/sale-rules.ts. Do not edit here: change it in the backend
// repo and run `npm run sync:shared` in the dev meta-repo.
// Time-window rules shared by the UI (to show or hide a button) and the server (the real check).
// The clock is always a parameter so these stay pure and testable.

export const BARBER_VOID_WINDOW_MS = 10 * 60 * 1000;
export const PAYOUT_DELETE_WINDOW_MS = 24 * 60 * 60 * 1000;

/**
 * A barber may void a sale only while it is live, within 10 minutes of being made, and only if the
 * barber made it. Admin-entered (back-dated, FR-22) sales are never barber-voidable.
 */
export function canBarberVoid(
  sale: { createdAt: string; voidedAt: string | null; enteredByAdmin: boolean },
  nowMs: number,
): boolean {
  if (sale.voidedAt || sale.enteredByAdmin) return false;
  return nowMs - Date.parse(sale.createdAt) <= BARBER_VOID_WINDOW_MS;
}

export const canDeletePayout = (payout: { createdAt: string }, nowMs: number): boolean =>
  nowMs - Date.parse(payout.createdAt) <= PAYOUT_DELETE_WINDOW_MS;
