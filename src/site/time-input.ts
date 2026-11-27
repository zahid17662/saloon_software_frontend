// A lenient parser for the booking form's free-text time field, so a visitor can type "2pm",
// "14:00", "12 to 1", "12-1pm" or just "12" instead of being forced through a native time picker.

/**
 * Parses the first time mentioned in `raw` into a 24h "HH:MM" slot (for a range, the start time).
 * Returns null when nothing time-like is found. A bare hour with no am/pm is guessed from typical
 * parlour hours: 1-7 -> PM, 8-11 -> AM, 12 -> PM (noon) — never worse than asking the visitor to
 * confirm by phone, which the booking flow already promises.
 */
export function parseTimeInput(raw: string): string | null {
  const text = raw.trim().toLowerCase();
  if (!text) return null;
  const match = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/.exec(text);
  if (!match) return null;

  let hour = Number(match[1]);
  const minute = match[2] ? Number(match[2]) : 0;
  const meridiem = match[3];
  if (!Number.isInteger(hour) || minute < 0 || minute > 59) return null;

  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    if (meridiem === "pm" && hour !== 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
  } else if (hour >= 13 && hour <= 23) {
    // already a 24h hour, e.g. "14:00" or a range like "14-15" — use as-is
  } else if (hour >= 1 && hour <= 7) {
    hour += 12; // bare afternoon/evening hour, e.g. "2" -> 2 PM
  } else if (hour < 0 || hour > 23) {
    return null;
  }
  // hour 0, 8-12: kept as typed (midnight literal, morning 8-11, or noon)

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** 24h "HH:MM" -> a friendly 12h label, e.g. "14:30" -> "2:30 PM". Returns null if malformed. */
export function formatHHMM(hhmm: string): string | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const minute = m[2];
  let hour = Number(m[1]);
  if (hour < 0 || hour > 23) return null;
  const meridiem = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${meridiem}`;
}
