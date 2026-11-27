"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { barberLogout, checkBarberSession, checkShopSession } from "@/app/actions/auth";
import { createSale, voidMySale } from "@/app/actions/sales";
import { useCatalog } from "@/components/catalog-context";
import { Badge, Button, cx, ErrorText, Field, LoadingScreen, Modal } from "@/components/ui";
import { BackIcon, LogoutIcon, MinusIcon, PlusIcon, ReceiptIcon } from "@/components/icons";
import { NET_ERR } from "@server/lib/messages";
import { bnDigits, receiptNo, splitAmount, taka } from "@server/lib/money";
import { canBarberVoid } from "@server/lib/sale-rules";
import { fmtTime } from "@server/lib/time";
import { PAYMENT_LABELS, type PaymentMethod, type Sale } from "@server/lib/types";

function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}


/** `todaySales` is this barber's entries for today (Dhaka), loaded from Neon by the server page. */
export function BarberScreen({ barberId, todaySales }: { barberId: number; todaySales: Sale[] }) {
  const catalog = useCatalog();
  const router = useRouter();
  const barber = catalog?.barbers.find((b) => b.id === barberId && b.active);

  const categories = useMemo(
    () => (catalog?.categories ?? []).filter((c) => c.active).sort((a, z) => a.sortOrder - z.sortOrder),
    [catalog],
  );
  const services = useMemo(() => {
    const live = new Set(categories.map((c) => c.id));
    return (catalog?.services ?? [])
      .filter((x) => x.active && live.has(x.categoryId))
      .sort((a, z) => a.sortOrder - z.sortOrder);
  }, [catalog, categories]);

  const [tab, setTab] = useState<number | "all">("all");
  const [cart, setCart] = useState<Record<number, number>>({});
  const [payment, setPayment] = useState<PaymentMethod>("CASH");
  // One idempotency key per distinct cart. A pure retry (same cart) reuses it, so a lost response
  // never creates a second sale; if the barber changes the cart after a failed try, a new key is
  // used so the change is not silently dropped by the server returning the first sale.
  const keyRef = useRef({ sig: "", key: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null);
  // Clock for the 10-minute "wrong entry" button; ticks so the button disappears on its own.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!catalog) return <LoadingScreen />;
  if (!barber) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted">এই নাপিতকে পাওয়া যায়নি বা নিষ্ক্রিয় করা হয়েছে।</p>
        <Link href="/pos" className="text-primary underline">
          তালিকায় ফিরে যান
        </Link>
      </main>
    );
  }

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ svc: services.find((x) => x.id === Number(id)), qty }))
    .filter((l): l is { svc: (typeof services)[number]; qty: number } => !!l.svc && l.qty > 0);
  const total = lines.reduce((n, l) => n + l.svc.price * l.qty, 0);
  const itemCount = lines.reduce((n, l) => n + l.qty, 0);
  const { barberShare } = splitAmount(total, barber.commissionPct);

  const mineToday = todaySales;
  const liveToday = mineToday.filter((x) => !x.voidedAt);
  const earnedToday = liveToday.reduce((n, x) => n + x.barberShare, 0);

  const setQty = (id: number, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(20, qty);
      return next;
    });

  async function save() {
    if (saving) return; // a second tap while the first is in flight
    setSaving(true);
    setError("");
    const sig = JSON.stringify([barber!.id, payment, lines.map((l) => [l.svc.id, l.qty])]);
    if (keyRef.current.sig !== sig) keyRef.current = { sig, key: newKey() };
    try {
      // Only WHICH services and how many are sent. The server prices and splits the sale (FR-8),
      // and the same idempotency key is reused on a retry so a double tap cannot create two sales.
      const r = await createSale({
        barberId: barber!.id,
        items: lines.map((l) => ({ serviceId: l.svc.id, qty: l.qty })),
        paymentMethod: payment,
        idempotencyKey: keyRef.current.key,
      });
      if (!r.ok) {
        setError(r.error);
        setCartOpen(true);
        // If it was refused because the session ended, go to the screen that can fix that.
        if (!(await checkShopSession()).valid) router.replace("/unlock");
        else if (!(await checkBarberSession(barber!.id)).valid) router.replace(`/barber-login/${barber!.id}`);
        return;
      }
      setCart({});
      setPayment("CASH");
      keyRef.current = { sig: "", key: "" };
      setCartOpen(false);
      router.push(`/receipt/${r.data.id}?from=barber`);
    } catch {
      setError(NET_ERR);
      setCartOpen(true);
    } finally {
      setSaving(false);
    }
  }

  // If the open category was hidden meanwhile, fall back to "all" instead of an empty grid.
  const activeTab = tab !== "all" && !categories.some((c) => c.id === tab) ? "all" : tab;
  const visibleCats = activeTab === "all" ? categories : categories.filter((c) => c.id === activeTab);

  return (
    <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[1fr_360px] lg:gap-6 lg:p-6">
      <main className="p-4 pb-44 lg:p-0">
        {/* Header */}
        <header className="mb-4 flex items-center gap-3">
          <Link href="/pos" aria-label="নাপিত তালিকা" className="rounded-xl p-2.5 text-muted hover:bg-surface-2 hover:text-fg">
            <BackIcon className="h-6 w-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-fg">{barber.name}</h1>
            <p className="text-sm text-muted">
              আজ {bnDigits(liveToday.length)} জন কাস্টমার · আপনার আয় <span className="text-primary">{taka(earnedToday)}</span>
            </p>
          </div>
          <button
            type="button"
            aria-label="লগআউট"
            onClick={() => {
              barberLogout().finally(() => router.push("/pos"));
            }}
            className="rounded-xl p-2.5 text-muted hover:bg-surface-2 hover:text-fg"
          >
            <LogoutIcon className="h-6 w-6" />
          </button>
        </header>

        {/* Category tabs */}
        <nav className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" aria-label="ক্যাটাগরি">
          {[{ id: "all" as const, name: "সব" }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              aria-pressed={activeTab === c.id}
              className={cx(
                "min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm transition-colors",
                activeTab === c.id
                  ? "border-primary bg-primary font-semibold text-white"
                  : "border-line bg-surface text-muted hover:text-fg",
              )}
            >
              {c.name}
            </button>
          ))}
        </nav>

        {/* Service grid */}
        <div className="space-y-6">
          {visibleCats.map((cat) => {
            const list = services.filter((x) => x.categoryId === cat.id);
            if (list.length === 0) return null;
            return (
              <section key={cat.id}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-danger" />
                  {cat.name}
                </h2>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {list.map((svc) => {
                    const qty = cart[svc.id] ?? 0;
                    return (
                      <li key={svc.id}>
                        <button
                          onClick={() => setQty(svc.id, qty + 1)}
                          aria-label={`${svc.name}, ${taka(svc.price)}${qty > 0 ? `, ${bnDigits(qty)}টি` : ""}`}
                          className={cx(
                            "relative flex h-full min-h-24 w-full flex-col justify-between rounded-2xl border p-3 text-left transition-all active:scale-[0.97]",
                            qty > 0
                              ? "border-primary bg-primary-soft"
                              : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
                          )}
                        >
                          <span className="pr-6 text-[15px] leading-snug font-medium text-fg">{svc.name}</span>
                          <span className="mt-2 text-lg font-bold text-primary tabular-nums">{taka(svc.price)}</span>
                          {qty > 0 && (
                            <span aria-hidden="true" className="absolute top-2 right-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-sm font-bold text-white">
                              {bnDigits(qty)}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Today's sales */}
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-muted">আজকের এন্ট্রি</h2>
          {mineToday.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line p-4 text-center text-sm text-subtle">
              আজ এখনো কোনো এন্ট্রি নেই
            </p>
          ) : (
            <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
              {mineToday.slice(0, 10).map((sale) => (
                <li key={sale.id} className="flex items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <div className={cx("truncate text-sm", sale.voidedAt ? "text-subtle line-through" : "text-fg")}>
                      {sale.items.map((i) => (i.qty > 1 ? `${i.nameSnapshot} ×${bnDigits(i.qty)}` : i.nameSnapshot)).join(", ")}
                    </div>
                    <div className="text-xs text-subtle">
                      {fmtTime(sale.createdAt)} · {receiptNo(sale.id)}
                    </div>
                  </div>
                  {sale.voidedAt ? (
                    <Badge tone="red">বাতিল</Badge>
                  ) : (
                    <span className="font-semibold text-fg tabular-nums">{taka(sale.total)}</span>
                  )}
                  <Link
                    href={`/receipt/${sale.id}?from=barber`}
                    aria-label="রসিদ দেখুন"
                    className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-fg"
                  >
                    <ReceiptIcon className="h-5 w-5" />
                  </Link>
                  {canBarberVoid(sale, nowMs) && (
                    <Button variant="danger" size="sm" onClick={() => setVoidTarget(sale)}>
                      বাতিল
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      {/* Cart: bottom sheet on phones, side panel on desktop */}
      <aside
        aria-label="কাস্টমারের সার্ভিস"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:sticky lg:top-6 lg:self-start lg:rounded-3xl lg:border"
      >
        <div className={cx("max-h-[55dvh] overflow-y-auto px-4 pt-4", cartOpen ? "block" : "hidden", "lg:block lg:max-h-[60dvh]")}>
          <h2 className="mb-3 hidden text-lg font-semibold text-fg lg:block">এই কাস্টমার</h2>
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-subtle">সার্ভিসে চাপ দিয়ে যোগ করুন</p>
          ) : (
            <ul className="space-y-2">
              {lines.map(({ svc, qty }) => (
                <li key={svc.id} className="flex items-center gap-2 rounded-xl bg-surface-2 p-2 pl-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-fg">{svc.name}</div>
                    <div className="text-xs text-subtle tabular-nums">
                      {taka(svc.price)} × {bnDigits(qty)} = {taka(svc.price * qty)}
                    </div>
                  </div>
                  <button
                    onClick={() => setQty(svc.id, qty - 1)}
                    aria-label={`${svc.name} কমান`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-2 text-fg hover:bg-line"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-semibold tabular-nums">{bnDigits(qty)}</span>
                  <button
                    onClick={() => setQty(svc.id, qty + 1)}
                    disabled={qty >= 20}
                    aria-label={`${svc.name} বাড়ান`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-2 text-fg hover:bg-line disabled:opacity-40"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <fieldset className="mt-4">
            <legend className="mb-2 text-sm text-muted">পেমেন্ট</legend>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setPayment(m)}
                  aria-pressed={payment === m}
                  className={cx(
                    "min-h-11 rounded-lg border py-2 text-sm",
                    payment === m ? "border-primary bg-primary-soft text-primary" : "border-line text-muted",
                  )}
                >
                  {PAYMENT_LABELS[m]}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-3">
            <ErrorText>{error}</ErrorText>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4">
          <button
            onClick={() => setCartOpen((o) => !o)}
            className="flex-1 text-left lg:pointer-events-none"
            aria-expanded={cartOpen}
          >
            <div className="text-xs text-muted">
              {bnDigits(itemCount)}টি সার্ভিস <span className="lg:hidden">· {cartOpen ? "লুকান ▾" : "দেখুন ▴"}</span>
            </div>
            <div className="text-2xl font-bold text-fg tabular-nums">{taka(total)}</div>
            <div className="text-xs text-primary">
              আপনার ভাগ ({bnDigits(barber.commissionPct)}%): {taka(barberShare)}
            </div>
          </button>
          <Button size="lg" onClick={save} disabled={lines.length === 0 || saving} className="min-w-28">
            {saving ? "সেভ হচ্ছে…" : "সেভ"}
          </Button>
        </div>
      </aside>

      <VoidModal key={voidTarget?.id ?? 0} sale={voidTarget} barberId={barber.id} onClose={() => setVoidTarget(null)} />
    </div>
  );
}

function VoidModal({ sale, barberId, onClose }: { sale: Sale | null; barberId: number; onClose: () => void }) {
  const [reason, setReason] = useState("ভুল সার্ভিস বাছাই হয়েছে");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={!!sale} title="এন্ট্রি বাতিল করবেন?" onClose={onClose} dismissible={!busy}>
      {sale && (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            try {
              // The server re-checks the 10-minute window, ownership and admin-entered sales.
              const r = await voidMySale({ saleId: sale.id, barberId, reason });
              if (!r.ok) return setError(r.error);
              setError("");
              onClose();
            } catch {
              setError(NET_ERR);
            } finally {
              setBusy(false);
            }
          }}
        >
          <p className="text-sm text-muted">
            {receiptNo(sale.id)} · {taka(sale.total)} — বাতিল করলে এটি কোনো হিসাবে যোগ হবে না।
          </p>
          <Field label="কারণ" value={reason} onChange={(e) => setReason(e.target.value)} required />
          <ErrorText>{error}</ErrorText>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              না
            </Button>
            <Button type="submit" variant="danger" className="flex-1" disabled={busy}>
              {busy ? "অপেক্ষা করুন…" : "বাতিল করুন"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
