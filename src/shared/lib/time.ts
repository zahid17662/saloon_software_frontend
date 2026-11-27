// GENERATED COPY of Server/src/lib/time.ts. Do not edit here: change it there
// and run `npm run sync:shared` at the repo root.
// BR-5: every day/month boundary is Asia/Dhaka (UTC+6, no DST).
const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" of the Dhaka calendar day this instant falls on. */
export function dhakaDateKey(iso: string | Date): string {
  const t = typeof iso === "string" ? Date.parse(iso) : iso.getTime();
  return new Date(t + DHAKA_OFFSET_MS).toISOString().slice(0, 10);
}

export function dhakaMonthKey(iso: string | Date): string {
  return dhakaDateKey(iso).slice(0, 7);
}

export function todayKey(now = new Date()): string {
  return dhakaDateKey(now);
}

export function shiftDays(dateKey: string, days: number): string {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

export type RangePreset = "today" | "yesterday" | "month" | "custom";

export interface DateRange {
  from: string; // inclusive date key
  to: string; // inclusive date key
}

export function presetRange(preset: Exclude<RangePreset, "custom">, now = new Date()): DateRange {
  const today = todayKey(now);
  if (preset === "today") return { from: today, to: today };
  if (preset === "yesterday") {
    const y = shiftDays(today, -1);
    return { from: y, to: y };
  }
  return { from: `${today.slice(0, 7)}-01`, to: today };
}

export function inRange(iso: string, range: DateRange): boolean {
  const k = dhakaDateKey(iso);
  return k >= range.from && k <= range.to;
}

/** The exact instant (UTC) a Dhaka calendar day begins, i.e. 00:00 Dhaka = 18:00 UTC the day before. */
export function dhakaDayStart(dateKey: string): Date {
  return new Date(Date.parse(`${dateKey}T00:00:00Z`) - DHAKA_OFFSET_MS);
}

/** Convert a Dhaka "YYYY-MM-DD" (local midday) to an ISO instant. */
export function dhakaDateToIso(dateKey: string): string {
  return new Date(Date.parse(`${dateKey}T12:00:00Z`) - DHAKA_OFFSET_MS).toISOString();
}

/** Convert a Dhaka "YYYY-MM-DD" + "HH:MM" wall-clock moment to the UTC instant it represents. */
export function dhakaDateTimeToIso(dateKey: string, timeKey: string): string {
  return new Date(Date.parse(`${dateKey}T${timeKey}:00Z`) - DHAKA_OFFSET_MS).toISOString();
}

const dateTimeFmt = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "Asia/Dhaka",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "Asia/Dhaka",
  hour: "numeric",
  minute: "2-digit",
});
const dateFmt = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "Asia/Dhaka",
  day: "numeric",
  month: "short",
  year: "numeric",
});
const monthFmt = new Intl.DateTimeFormat("bn-BD", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

export const fmtDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
export const fmtTime = (iso: string) => timeFmt.format(new Date(iso));
export const fmtDate = (iso: string) => dateFmt.format(new Date(iso));
/** Format a date key ("YYYY-MM-DD") as a Bangla date. */
export const fmtDateKey = (key: string) => dateFmt.format(new Date(dhakaDateToIso(key)));
/** Format a month key ("YYYY-MM") as a Bangla month name. */
export const fmtMonthKey = (key: string) => monthFmt.format(new Date(`${key}-15T00:00:00Z`));
