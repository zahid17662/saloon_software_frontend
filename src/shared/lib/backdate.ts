// GENERATED COPY of the backend's src/lib/backdate.ts. Do not edit here: change it in the backend
// repo and run `npm run sync:shared` in the dev meta-repo.
// FR-22: the admin may enter a sale with a past Dhaka date and time. Allowed: from the start of the
// Dhaka day 60 days ago up to "now". Pure (the clock is a parameter) so it is shared by the form,
// the server action and the tests.

import { dhakaDayStart, shiftDays, todayKey } from "./time";

export const BACKDATE_MAX_DAYS = 60;

export type BackdateResult = { ok: true; at: Date } | { ok: false; error: string };

export const BACKDATE_MSG = {
  invalid: "তারিখ ও সময় সঠিক নয়",
  future: "ভবিষ্যতের তারিখ বা সময় দেওয়া যাবে না",
  tooOld: "৬০ দিনের বেশি পুরনো তারিখ দেওয়া যাবে না",
} as const;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** `dateKey` "YYYY-MM-DD" and `time` "HH:mm" are Dhaka local. Returns the UTC instant to store. */
export function resolveBackdate(dateKey: string, time: string, now: Date): BackdateResult {
  if (!DATE.test(dateKey) || !TIME.test(time)) return { ok: false, error: BACKDATE_MSG.invalid };
  const start = dhakaDayStart(dateKey);
  // Reject days that do not exist (2026-02-30 would silently roll over to March 2).
  if (Number.isNaN(start.getTime()) || shiftDays(dateKey, 0) !== dateKey) {
    return { ok: false, error: BACKDATE_MSG.invalid };
  }
  const [h, m] = time.split(":").map(Number);
  const at = new Date(start.getTime() + (h * 60 + m) * 60_000);
  if (at.getTime() > now.getTime()) return { ok: false, error: BACKDATE_MSG.future };
  if (dateKey < shiftDays(todayKey(now), -BACKDATE_MAX_DAYS)) return { ok: false, error: BACKDATE_MSG.tooOld };
  return { ok: true, at };
}
