"use client";

import { useState } from "react";
import { useCatalog } from "../catalog-context";
import { Badge, Button, Card, ErrorText, Field, LoadingScreen, Modal, PageTitle, Toggle } from "../ui";
import { usePayoutsView } from "./use-admin-data";
import { PlusIcon } from "../icons";
import { addBarber, updateBarber } from "@/app/actions/catalog";
import { NET_ERR } from "@server/lib/messages";
import { bnDigits, nameInitial, parseIntInput } from "@server/lib/money";
import type { Barber } from "@server/lib/types";

export function Barbers() {
  const catalog = useCatalog();
  const view = usePayoutsView(); // per-barber live sale counts come with the balances
  const [editing, setEditing] = useState<Barber | "new" | null>(null);
  if (!catalog) return <LoadingScreen />;
  const barbers = [...catalog.barbers].sort((a, z) => Number(z.active) - Number(a.active) || a.sortOrder - z.sortOrder);
  const salesCount = (id: number) => {
    const n = view.data?.balances.find((b) => b.barberId === id)?.salesCount;
    return n === undefined ? "—" : bnDigits(n); // never show a made-up zero while loading or after an error
  };
  const nextName = `নাপিত ${bnDigits(catalog.barbers.length + 1)}`;

  return (
    <>
      <PageTitle
        title="নাপিত"
        sub={`${bnDigits(catalog.barbers.filter((b) => b.active).length)} জন সক্রিয়`}
        actions={
          <Button onClick={() => setEditing("new")}>
            <PlusIcon className="h-5 w-5" />
            নতুন নাপিত
          </Button>
        }
      />

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {barbers.map((b) => (
          <li key={b.id}>
            <Card className={b.active ? "" : "opacity-60"}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {nameInitial(b.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-fg">{b.name}</div>
                  <div className="text-sm text-muted">
                    কমিশন {bnDigits(b.commissionPct)}% · {salesCount(b.id)}টি বিক্রি
                  </div>
                  {!b.hasPassword && <div className="text-xs text-amber-600">পাসওয়ার্ড সেট করা হয়নি</div>}
                </div>
                {b.active ? <Badge tone="green">সক্রিয়</Badge> : <Badge>নিষ্ক্রিয়</Badge>}
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setEditing(b)}>
                এডিট
              </Button>
            </Card>
          </li>
        ))}
      </ul>

      <Modal
        open={editing !== null}
        title={editing === "new" ? "নতুন নাপিত" : "নাপিত এডিট"}
        onClose={() => setEditing(null)}
      >
        {editing !== null && (
          <BarberForm
            key={editing === "new" ? "new" : editing.id}
            barber={editing === "new" ? null : editing}
            defaultName={nextName}
            onDone={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}

function BarberForm({ barber, defaultName, onDone }: { barber: Barber | null; defaultName: string; onDone: () => void }) {
  const [name, setName] = useState(barber?.name ?? defaultName);
  const [pct, setPct] = useState(String(barber?.commissionPct ?? 50));
  const [order, setOrder] = useState(String(barber?.sortOrder ?? ""));
  const [active, setActive] = useState(barber?.active ?? true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (busy) return;
        const commission = parseIntInput(pct);
        if (commission === null) return setError("কমিশন ০ থেকে ১০০-এর মধ্যে হতে হবে");
        setBusy(true);
        try {
          const r = barber
            ? await updateBarber(barber.id, {
                name,
                commissionPct: commission,
                sortOrder: parseIntInput(order) ?? barber.sortOrder,
                active,
                ...(password ? { password } : {}),
              })
            : await addBarber({ name, commissionPct: commission, password });
          if (!r.ok) return setError(r.error);
          onDone();
        } catch {
          setError(NET_ERR);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="নাম" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
      <Field
        label="কমিশন (%)"
        inputMode="numeric"
        value={pct}
        onChange={(e) => setPct(e.target.value)}
        hint="নাপিত প্রতিটি সার্ভিসের কত শতাংশ পাবে। পরিবর্তন শুধু নতুন বিক্রিতে প্রযোজ্য হবে।"
        required
      />
      <Field
        label={barber ? "নতুন পাসওয়ার্ড" : "পাসওয়ার্ড"}
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        hint={
          barber
            ? barber.hasPassword
              ? "খালি রাখলে বর্তমান পাসওয়ার্ড বদলাবে না। কমপক্ষে ৬ অক্ষর, অক্ষর ও সংখ্যা দুটোই থাকতে হবে।"
              : "এখনো কোনো পাসওয়ার্ড সেট করা হয়নি — নাপিত লগইন করতে পারবেন না। কমপক্ষে ৬ অক্ষর, অক্ষর ও সংখ্যা দুটোই থাকতে হবে।"
            : "কমপক্ষে ৬ অক্ষর, অক্ষর ও সংখ্যা দুটোই থাকতে হবে। এই পাসওয়ার্ড দিয়ে নাপিত নিজের স্ক্রিনে লগইন করবেন।"
        }
        required={!barber}
      />
      {barber && (
        <>
          <Field label="ক্রম (ছোট সংখ্যা আগে দেখাবে)" inputMode="numeric" value={order} onChange={(e) => setOrder(e.target.value)} />
          <Toggle checked={active} onChange={setActive} label={active ? "সক্রিয় — তালিকায় দেখাবে" : "নিষ্ক্রিয় — তালিকায় দেখাবে না"} />
        </>
      )}
      <ErrorText>{error}</ErrorText>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? "সেভ হচ্ছে…" : "সেভ করুন"}
      </Button>
    </form>
  );
}
