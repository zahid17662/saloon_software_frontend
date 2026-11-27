"use client";

import { useEffect, useState } from "react";
import { addPayout, deletePayout } from "@/app/actions/payouts";
import { useCatalog } from "../catalog-context";
import { Badge, Button, Card, Empty, ErrorText, Field, LoadingScreen, Modal, PageTitle, Select } from "../ui";
import { TableWrap, td, tdNum, th, thNum } from "./common";
import { usePayoutsView } from "./use-admin-data";
import { NET_ERR } from "@server/lib/messages";
import { canDeletePayout } from "@server/lib/sale-rules";
import { bnDigits, parseIntInput, taka } from "@server/lib/money";
import { fmtDate, todayKey } from "@server/lib/time";
import type { Barber } from "@server/lib/types";

export function Payouts() {
  const catalog = useCatalog();
  const view = usePayoutsView();
  const [payTo, setPayTo] = useState<Barber | null>(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  // Clock for the 24-hour delete button; the server re-checks the window on every delete.
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (!catalog || !view.data) return view.error ? <ErrorText>{view.error}</ErrorText> : <LoadingScreen />;
  const { balances, payouts } = view.data;
  const balanceOf = (id: number) => balances.find((b) => b.barberId === id) ?? { earned: 0, paid: 0, balance: 0 };

  const cards = catalog.barbers
    .map((b) => ({ barber: b, ...balanceOf(b.id) }))
    .filter((c) => c.barber.active || c.balance !== 0)
    .sort((a, z) => a.barber.sortOrder - z.barber.sortOrder);
  const totalOwed = cards.reduce((n, c) => n + Math.max(0, c.balance), 0);

  const history = payouts.filter((p) => filter === "all" || p.barberId === Number(filter)); // already newest first

  return (
    <>
      <PageTitle title="নাপিতের পেমেন্ট" sub={`মোট পাওনা ${taka(totalOwed)}`} />
      {view.error && <ErrorText>{view.error}</ErrorText>}
      <p role="status" className="sr-only">
        {view.loading ? "হিসাব হালনাগাদ হচ্ছে…" : ""}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ barber, earned, paid, balance }) => (
          <Card key={barber.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-fg">{barber.name}</div>
                {!barber.active && <Badge>নিষ্ক্রিয়</Badge>}
              </div>
              <Button size="sm" onClick={() => setPayTo(barber)} disabled={view.loading} aria-label={`${barber.name}-কে টাকা দিন`}>
                টাকা দিন
              </Button>
            </div>
            <dl className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">মোট আয়</dt>
                <dd className="tabular-nums">{taka(earned)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">দেওয়া হয়েছে</dt>
                <dd className="tabular-nums">{taka(paid)}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>{balance < 0 ? "অগ্রিম" : "বাকি"}</dt>
                <dd className={balance < 0 ? "text-danger tabular-nums" : "text-primary tabular-nums"}>
                  {taka(Math.abs(balance))}
                </dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      <div className="mt-8 mb-3 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold text-fg">পেমেন্টের ইতিহাস</h2>
        <Select label="নাপিত" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
          <option value="all">সবাই</option>
          {catalog.barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      </div>
      <ErrorText>{error}</ErrorText>
      {history.length === 0 ? (
        <Empty>এখনো কোনো পেমেন্ট দেওয়া হয়নি</Empty>
      ) : (
        <TableWrap>
          <thead className="border-b border-line">
            <tr>
              <th className={th}>তারিখ</th>
              <th className={th}>নাপিত</th>
              <th className={thNum}>টাকা</th>
              <th className={th}>নোট</th>
              <th className={th}>
                <span className="sr-only">কার্যক্রম</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {history.map((p) => (
              <tr key={p.id}>
                <td className={`${td} whitespace-nowrap`}>{fmtDate(p.paidAt)}</td>
                <td className={td}>{catalog.barbers.find((b) => b.id === p.barberId)?.name ?? "—"}</td>
                <td className={tdNum}>{taka(p.amount)}</td>
                <td className={`${td} text-muted`}>{p.note || "—"}</td>
                <td className={`${td} text-right`}>
                  {canDeletePayout(p, nowMs) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleting === p.id}
                      aria-label={`${taka(p.amount)}-এর পেমেন্ট মুছুন`}
                      onClick={async () => {
                        if (deleting !== null || !window.confirm(`${taka(p.amount)}-এর পেমেন্টটি মুছবেন?`)) return;
                        setDeleting(p.id);
                        try {
                          const r = await deletePayout({ id: p.id });
                          setError(r.ok ? "" : r.error);
                          if (r.ok) view.reload();
                        } catch {
                          setError(NET_ERR);
                        } finally {
                          setDeleting(null);
                        }
                      }}
                    >
                      মুছুন
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <Modal open={!!payTo} title={`${payTo?.name ?? ""}-কে টাকা দিন`} onClose={() => setPayTo(null)}>
        {payTo && (
          <PayoutForm
            key={payTo.id}
            barber={payTo}
            suggested={Math.max(0, balanceOf(payTo.id).balance)}
            onDone={() => {
              setPayTo(null);
              view.reload();
            }}
          />
        )}
      </Modal>
    </>
  );
}

function PayoutForm({ barber, suggested, onDone }: { barber: Barber; suggested: number; onDone: () => void }) {
  const [amount, setAmount] = useState(suggested > 0 ? String(suggested) : "");
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const value = parseIntInput(amount);
        if (value === null || value <= 0) return setError("টাকার পরিমাণ সঠিক নয়");
        setBusy(true);
        try {
          const r = await addPayout({ barberId: barber.id, amount: value, date, note });
          if (!r.ok) return setError(r.error);
          onDone();
        } catch {
          setError(NET_ERR);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="text-sm text-muted">
        বর্তমান বাকি: <span className="text-primary">{taka(suggested)}</span>
        {suggested > 0 && ` (কমিশন ${bnDigits(barber.commissionPct)}%)`}
      </p>
      <Field label="টাকার পরিমাণ (৳)" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} required autoFocus />
      <Field label="তারিখ" type="date" value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} required />
      <Field label="নোট (ঐচ্ছিক)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="যেমন: সাপ্তাহিক পেমেন্ট" />
      <ErrorText>{error}</ErrorText>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "সেভ হচ্ছে…" : "পেমেন্ট সেভ করুন"}
      </Button>
    </form>
  );
}
