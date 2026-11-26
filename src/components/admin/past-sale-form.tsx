"use client";

import { useEffect, useRef, useState } from "react";
import { addPastSale } from "@/app/actions/sales";
import { useCatalog } from "../catalog-context";
import { MinusIcon, PlusIcon } from "../icons";
import { Button, ErrorText, Field, Select } from "../ui";
import { BACKDATE_MAX_DAYS, resolveBackdate } from "@server/lib/backdate";
import { NET_ERR } from "@server/lib/messages";
import { bnDigits, splitAmount, taka } from "@server/lib/money";
import { shiftDays, todayKey } from "@server/lib/time";
import { PAYMENT_LABELS, type PaymentMethod } from "@server/lib/types";


function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * FR-22: the admin copies a sale from the paper notebook. The date and time are Dhaka local.
 * The limits shown here (today back to 60 days, never the future) are a convenience; the server
 * re-checks them against its own clock and is the only place that sets "entered by admin".
 */
export function PastSaleForm({
  onDone,
  onBusyChange,
}: {
  onDone: (dateKey: string) => void;
  /** Lets the parent block closing the dialog while a save is in flight. */
  onBusyChange?: (busy: boolean) => void;
}) {
  const catalog = useCatalog();
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState("12:00");
  const [barberId, setBarberId] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  const [cart, setCart] = useState<Record<number, number>>({});
  // One idempotency key per distinct entry: a pure retry reuses it, an edited entry gets a new one.
  const keyRef = useRef({ sig: "", key: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  if (!catalog) return null;
  const barbers = catalog.barbers.filter((b) => b.active).sort((a, z) => a.sortOrder - z.sortOrder);
  const cats = catalog.categories.filter((c) => c.active).sort((a, z) => a.sortOrder - z.sortOrder);
  const liveCats = new Set(cats.map((c) => c.id));
  const svcs = catalog.services.filter((s) => s.active && liveCats.has(s.categoryId));
  const barber = barbers.find((b) => b.id === Number(barberId));

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ svc: svcs.find((s) => s.id === Number(id)), qty }))
    .filter((l): l is { svc: (typeof svcs)[number]; qty: number } => !!l.svc && l.qty > 0);
  const total = lines.reduce((n, l) => n + l.svc.price * l.qty, 0);
  const share = barber ? splitAmount(total, barber.commissionPct).barberShare : 0;

  const setQty = (id: number, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(20, qty);
      return next;
    });

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        if (!barber) return setError("নাপিত বাছাই করুন");
        if (lines.length === 0) return setError("কোনো সার্ভিস বাছাই করা হয়নি");
        const when = resolveBackdate(date, time, new Date());
        if (!when.ok) return setError(when.error);
        const sig = JSON.stringify([barber.id, payment, date, time, lines.map((l) => [l.svc.id, l.qty])]);
        if (keyRef.current.sig !== sig) keyRef.current = { sig, key: newKey() };
        setBusy(true);
        setError("");
        try {
          const r = await addPastSale({
            barberId: barber.id,
            items: lines.map((l) => ({ serviceId: l.svc.id, qty: l.qty })),
            paymentMethod: payment,
            idempotencyKey: keyRef.current.key,
            date,
            time,
          });
          if (!r.ok) return setError(r.error);
          onDone(date);
        } catch {
          setError(NET_ERR);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="text-sm text-muted">
        খাতা দেখে পুরনো বিক্রি যোগ করুন। আজ থেকে সর্বোচ্চ {bnDigits(BACKDATE_MAX_DAYS)} দিন আগে পর্যন্ত, ভবিষ্যতের তারিখ নয়।
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="তারিখ"
          type="date"
          value={date}
          min={shiftDays(today, -BACKDATE_MAX_DAYS)}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Field label="সময়" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select label="নাপিত" value={barberId} onChange={(e) => setBarberId(e.target.value)} required>
          <option value="">— বাছাই করুন —</option>
          {barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
        <Select label="পেমেন্ট" value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
          {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => (
            <option key={m} value={m}>
              {PAYMENT_LABELS[m]}
            </option>
          ))}
        </Select>
      </div>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-muted">সার্ভিস</legend>
        <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-line p-2">
          {cats.map((cat) => {
            const list = svcs.filter((s) => s.categoryId === cat.id).sort((a, z) => a.sortOrder - z.sortOrder);
            if (list.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className="px-1 pb-1 text-xs font-semibold text-primary">{cat.name}</div>
                <ul>
                  {list.map((s) => {
                    const qty = cart[s.id] ?? 0;
                    return (
                      <li key={s.id} className="flex items-center gap-2 px-1 py-1">
                        <span className="min-w-0 flex-1 truncate text-sm text-fg">{s.name}</span>
                        <span className="w-16 text-right text-sm text-muted tabular-nums">{taka(s.price)}</span>
                        <button
                          type="button"
                          onClick={() => setQty(s.id, qty - 1)}
                          disabled={qty === 0}
                          aria-label={`${s.name} কমান`}
                          className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-2 text-fg disabled:opacity-40"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold tabular-nums">{bnDigits(qty)}</span>
                        <button
                          type="button"
                          onClick={() => setQty(s.id, qty + 1)}
                          disabled={qty >= 20}
                          aria-label={`${s.name} বাড়ান`}
                          className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-2 text-fg disabled:opacity-40"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div className="flex items-baseline justify-between rounded-xl bg-surface-2 px-3 py-2">
        <span className="text-sm text-muted">মোট{barber ? ` · নাপিতের ভাগ ${taka(share)}` : ""}</span>
        <span className="text-xl font-bold text-fg tabular-nums">{taka(total)}</span>
      </div>

      <ErrorText>{error}</ErrorText>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "সেভ হচ্ছে…" : "সেভ করুন"}
      </Button>
    </form>
  );
}
