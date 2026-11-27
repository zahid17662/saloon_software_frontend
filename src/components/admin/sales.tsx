"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { adminVoidSale, listSales } from "@/app/actions/sales";
import { useCatalog } from "../catalog-context";
import { RangeFilter, useDateRange } from "../range-filter";
import { Badge, Button, Empty, ErrorText, Field, LoadingScreen, Modal, PageTitle, Select } from "../ui";
import { PastSaleForm } from "./past-sale-form";
import { rangeLabel, TableWrap, td, tdNum, th, thNum } from "./common";
import { NET_ERR } from "@server/lib/messages";
import { bnDigits, receiptNo, taka } from "@server/lib/money";
import { fmtDateTime } from "@server/lib/time";
import { PAYMENT_LABELS, type Sale } from "@server/lib/types";

const PAGE = 30;

export function SalesList() {
  const catalog = useCatalog();
  const r = useDateRange("today");
  const [barberId, setBarberId] = useState("all");
  const [status, setStatus] = useState<"all" | "live" | "void">("all");
  const [limit, setLimit] = useState(PAGE);
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [rowsKey, setRowsKey] = useState("");
  const [rows, setRows] = useState<Sale[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);

  const { from, to } = r.range;
  const queryKey = `${from}|${to}|${barberId}|${status}`;
  useEffect(() => {
    let current = true; // ignore a slow response that was overtaken by a newer filter
    listSales({
      from,
      to,
      status,
      ...(barberId === "all" ? {} : { barberId: Number(barberId) }),
    })
      .then((res) => {
        if (!current) return;
        if (res.ok) {
          setRows(res.data);
          setRowsKey(queryKey);
          setLimit(PAGE); // a new filter starts at the first page again
          setLoadError("");
        } else {
          setRowsKey(queryKey);
          setRows([]);
          setLoadError(res.error);
        }
      })
      .catch(() => {
        if (!current) return;
        setRowsKey(queryKey);
        setRows([]);
        setLoadError(NET_ERR);
      });
    return () => {
      current = false;
    };
  }, [from, to, barberId, status, reload, queryKey]);

  const refresh = useCallback(() => setReload((n) => n + 1), []);

  if (!catalog || rows === null) return <LoadingScreen />;
  const stale = rowsKey !== queryKey; // the table still shows the previous filter until the reply arrives
  const liveTotal = rows.filter((x) => !x.voidedAt).reduce((n, x) => n + x.total, 0);
  const barberName = (id: number) => catalog.barbers.find((b) => b.id === id)?.name ?? "—";

  return (
    <>
      <PageTitle
        title="বিক্রির তালিকা"
        sub={`${rangeLabel(r.range)} · ${bnDigits(rows.length)}টি এন্ট্রি · ${taka(liveTotal)}`}
        actions={<Button onClick={() => setAddOpen(true)}>পুরনো বিক্রি যোগ করুন</Button>}
      />
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <RangeFilter state={r} />
        <Select label="নাপিত" value={barberId} onChange={(e) => setBarberId(e.target.value)} className="w-40">
          <option value="all">সবাই</option>
          {catalog.barbers.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
              {!b.active ? " (নিষ্ক্রিয়)" : ""}
            </option>
          ))}
        </Select>
        <Select
          label="অবস্থা"
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="w-36"
        >
          <option value="all">সব</option>
          <option value="live">চালু</option>
          <option value="void">বাতিল</option>
        </Select>
      </div>

      <ErrorText>{loadError}</ErrorText>

      {rows.length === 0 ? (
        <>{!loadError && <Empty>কোনো এন্ট্রি পাওয়া যায়নি</Empty>}</>
      ) : (
        <>
          <div aria-busy={stale} className={stale ? "opacity-50 transition-opacity" : undefined}>
          <TableWrap>
            <thead className="border-b border-line">
              <tr>
                <th className={th}>রসিদ</th>
                <th className={th}>সময়</th>
                <th className={th}>নাপিত</th>
                <th className={th}>সার্ভিস</th>
                <th className={thNum}>মোট</th>
                <th className={th}>পেমেন্ট</th>
                <th className={th}>
                  <span className="sr-only">কার্যক্রম</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.slice(0, limit).map((x) => (
                <tr key={x.id} className={x.voidedAt ? "opacity-60" : ""}>
                  <td className={td}>
                    <span className="font-mono text-xs">{receiptNo(x.id)}</span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-muted`}>
                    {fmtDateTime(x.createdAt)}
                    {x.enteredByAdmin && (
                      <div className="mt-1">
                        <Badge tone="gold">পুরনো এন্ট্রি</Badge>
                      </div>
                    )}
                  </td>
                  <td className={td}>{barberName(x.barberId)}</td>
                  <td className={`${td} max-w-64`}>
                    <span className={x.voidedAt ? "line-through" : ""}>
                      {x.items.map((i) => (i.qty > 1 ? `${i.nameSnapshot} ×${bnDigits(i.qty)}` : i.nameSnapshot)).join(", ")}
                    </span>
                    {x.voidedAt && (
                      <div className="mt-1 text-xs text-danger">
                        বাতিল ({x.voidedBy === "ADMIN" ? "এডমিন" : "নাপিত"}): {x.voidReason}
                      </div>
                    )}
                  </td>
                  <td className={tdNum}>{taka(x.total)}</td>
                  <td className={td}>
                    {x.voidedAt ? <Badge tone="red">বাতিল</Badge> : <Badge>{PAYMENT_LABELS[x.paymentMethod]}</Badge>}
                  </td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    <Link
                      href={`/receipt/${x.id}?from=admin`}
                      className="mr-2 text-sm text-primary hover:underline"
                    >
                      রসিদ
                    </Link>
                    {!x.voidedAt && (
                      <Button variant="danger" size="sm" onClick={() => setVoidTarget(x)}>
                        বাতিল
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          </div>
          {rows.length > limit && (
            <div className="mt-4 text-center">
              <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
                আরও দেখুন ({bnDigits(rows.length - limit)})
              </Button>
            </div>
          )}
        </>
      )}

      <Modal open={!!voidTarget} title="বিক্রি বাতিল" onClose={() => setVoidTarget(null)}>
        {voidTarget && (
          <VoidForm
            key={voidTarget.id}
            sale={voidTarget}
            onDone={() => {
              setVoidTarget(null);
              refresh();
            }}
            onCancel={() => setVoidTarget(null)}
          />
        )}
      </Modal>

      <Modal open={addOpen} title="পুরনো বিক্রি যোগ করুন" onClose={() => setAddOpen(false)} dismissible={!addBusy}>
        {addOpen && (
          <PastSaleForm
            onBusyChange={setAddBusy}
            onDone={(dateKey) => {
              setAddOpen(false);
              // Show the day that was just entered so the new row is visible.
              r.setCustom({ from: dateKey, to: dateKey });
              r.setPreset("custom");
              refresh();
            }}
          />
        )}
      </Modal>
    </>
  );
}

function VoidForm({ sale, onDone, onCancel }: { sale: Sale; onDone: () => void; onCancel: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
          const res = await adminVoidSale({ saleId: sale.id, reason });
          if (!res.ok) return setError(res.error);
          onDone();
        } catch {
          setError(NET_ERR);
        } finally {
          setBusy(false);
        }
      }}
    >
      <p className="text-sm text-muted">
        {receiptNo(sale.id)} · {taka(sale.total)}। বাতিল করলে এটি সব হিসাব ও নাপিতের পাওনা থেকে বাদ যাবে, তবে তালিকায় থাকবে।
      </p>
      <Field label="কারণ" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="যেমন: ভুল নাপিতের নামে এন্ট্রি" required autoFocus />
      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          না
        </Button>
        <Button type="submit" variant="danger" className="flex-1" disabled={busy}>
          {busy ? "অপেক্ষা করুন…" : "বাতিল করুন"}
        </Button>
      </div>
    </form>
  );
}
