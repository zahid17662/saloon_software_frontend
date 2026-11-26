// GENERATED COPY of the backend's src/lib/money.ts. Do not edit here: change it in the backend
// repo and run `npm run sync:shared` in the dev meta-repo.
/** BR-1: barber share is rounded half-up; owner gets the exact remainder. */
export function splitAmount(total: number, commissionPct: number) {
  const barberShare = Math.round((total * commissionPct) / 100);
  return { barberShare, ownerShare: total - barberShare };
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function bnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/** ৳১,২৫০ — Indian digit grouping, Bangla numerals. */
export function taka(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}৳${bnDigits(Math.abs(amount).toLocaleString("en-IN"))}`;
}

export function receiptNo(id: number): string {
  return `R-${bnDigits(String(id).padStart(6, "0"))}`;
}

/** Parse a user-typed whole number, accepting Bangla or English digits. */
export function parseIntInput(raw: string): number | null {
  const ascii = raw.trim().replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
  if (!/^\d+$/.test(ascii)) return null;
  return Number(ascii);
}

/** Last visible character (grapheme) of a name for avatars, so a Bangla vowel sign is never cut off alone. */
export function nameInitial(name: string): string {
  const t = name.trim();
  const seg = new Intl.Segmenter("bn", { granularity: "grapheme" });
  const parts = [...seg.segment(t)];
  return parts.length ? parts[parts.length - 1].segment : "";
}
