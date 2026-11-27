"use client";

// Online booking requests from the public site (not part of the v1 PRD scope — an extra for the
// website). The admin confirms, cancels or marks one done; nothing here affects sales or payouts.

import { useState } from "react";
import { updateAppointmentStatus } from "@/app/actions/appointments";
import { Badge, Button, Empty, ErrorText, LoadingScreen, PageTitle, Select } from "../ui";
import { TableWrap, td, th } from "./common";
import { useAppointments } from "./use-admin-data";
import { NET_ERR } from "@server/lib/messages";
import { fmtDateTime } from "@server/lib/time";
import { APPOINTMENT_STATUS_LABELS, type Appointment, type AppointmentStatus } from "@server/lib/types";

const TONE: Record<AppointmentStatus, "neutral" | "green" | "red" | "gold"> = {
  PENDING: "gold",
  CONFIRMED: "green",
  CANCELLED: "red",
  DONE: "neutral",
};

export function Appointments() {
  const view = useAppointments();
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  if (!view.data) return view.error ? <ErrorText>{view.error}</ErrorText> : <LoadingScreen />;
  const list = view.data.filter((a) => filter === "all" || a.status === filter);
  const pendingCount = view.data.filter((a) => a.status === "PENDING").length;

  async function setStatus(id: number, status: AppointmentStatus) {
    if (busy !== null) return;
    setBusy(id);
    try {
      const r = await updateAppointmentStatus({ id, status });
      setError(r.ok ? "" : r.error);
      if (r.ok) view.reload();
    } catch {
      setError(NET_ERR);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <PageTitle title="অ্যাপয়েন্টমেন্ট" sub={pendingCount > 0 ? `${pendingCount}টি অপেক্ষমাণ` : "সবগুলো দেখা হয়েছে"} />
      <div className="mb-4 flex justify-end">
        <Select label="অবস্থা" value={filter} onChange={(e) => setFilter(e.target.value as "all" | AppointmentStatus)} className="w-44">
          <option value="all">সবগুলো</option>
          {Object.entries(APPOINTMENT_STATUS_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <ErrorText>{error}</ErrorText>
      {list.length === 0 ? (
        <Empty>এখনো কোনো বুকিং আসেনি</Empty>
      ) : (
        <TableWrap>
          <thead className="border-b border-line">
            <tr>
              <th className={th}>সময়</th>
              <th className={th}>কাস্টমার</th>
              <th className={th}>সার্ভিস</th>
              <th className={th}>নাপিত</th>
              <th className={th}>অবস্থা</th>
              <th className={th}>
                <span className="sr-only">কার্যক্রম</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((a: Appointment) => (
              <tr key={a.id}>
                <td className={`${td} whitespace-nowrap`}>
                  {fmtDateTime(a.requestedAt)}
                  {a.preferredTimeText && <div className="text-xs text-muted">কাস্টমার লিখেছে: {a.preferredTimeText}</div>}
                </td>
                <td className={td}>
                  <div className="font-medium text-fg">{a.customerName}</div>
                  <div className="text-xs text-muted">{a.customerPhone}</div>
                </td>
                <td className={td}>{a.serviceName}</td>
                <td className={`${td} text-muted`}>{a.barberName ?? "কোনো পছন্দ নেই"}</td>
                <td className={td}>
                  <Badge tone={TONE[a.status]}>{APPOINTMENT_STATUS_LABELS[a.status]}</Badge>
                </td>
                <td className={`${td} text-right whitespace-nowrap`}>
                  {a.status === "PENDING" && (
                    <>
                      <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => setStatus(a.id, "CONFIRMED")}>
                        নিশ্চিত করুন
                      </Button>
                      <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => setStatus(a.id, "CANCELLED")}>
                        বাতিল
                      </Button>
                    </>
                  )}
                  {a.status === "CONFIRMED" && (
                    <>
                      <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => setStatus(a.id, "DONE")}>
                        সম্পন্ন
                      </Button>
                      <Button variant="ghost" size="sm" disabled={busy === a.id} onClick={() => setStatus(a.id, "CANCELLED")}>
                        বাতিল
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
