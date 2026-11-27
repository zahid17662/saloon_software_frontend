"use client";

// Read-only appointments list for the barber-facing screen (FR: barbers can see online booking
// requests, but only the admin triages them — see Server/src/actions/appointments.ts).

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAppointments } from "./admin/use-admin-data";
import { td, th, TableWrap } from "./admin/common";
import { Badge, Empty, ErrorText, LoadingScreen, PageTitle, Select } from "./ui";
import { BackIcon } from "./icons";
import { fmtDateTime } from "@server/lib/time";
import { APPOINTMENT_STATUS_LABELS, type Appointment, type AppointmentStatus } from "@server/lib/types";

const TONE: Record<AppointmentStatus, "neutral" | "green" | "red" | "gold"> = {
  PENDING: "gold",
  CONFIRMED: "green",
  CANCELLED: "red",
  DONE: "neutral",
};

export function AppointmentsView() {
  const view = useAppointments();
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all");
  const barberId = useSearchParams().get("barberId");
  const backHref = barberId ? `/barber/${barberId}` : "/pos";

  return (
    <div className="mx-auto max-w-4xl p-4 lg:p-6">
      <header className="mb-4 flex items-center gap-3">
        <Link href={backHref} aria-label="পেছনে" className="rounded-xl p-2.5 text-muted hover:bg-surface-2 hover:text-fg">
          <BackIcon className="h-6 w-6" />
        </Link>
        <div className="flex-1">
          <PageTitle title="অ্যাপয়েন্টমেন্ট" sub="অ্যাডমিন বুকিং নিশ্চিত বা বাতিল করেন" />
        </div>
      </header>

      {!view.data ? (
        view.error ? <ErrorText>{view.error}</ErrorText> : <LoadingScreen />
      ) : (
        <>
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
          <AppointmentsTable appointments={view.data} filter={filter} />
        </>
      )}
    </div>
  );
}

function AppointmentsTable({ appointments, filter }: { appointments: Appointment[]; filter: "all" | AppointmentStatus }) {
  const list = appointments.filter((a) => filter === "all" || a.status === filter);
  if (list.length === 0) return <Empty>এখনো কোনো বুকিং আসেনি</Empty>;
  return (
    <TableWrap>
      <thead className="border-b border-line">
        <tr>
          <th className={th}>সময়</th>
          <th className={th}>কাস্টমার</th>
          <th className={th}>সার্ভিস</th>
          <th className={th}>নাপিত</th>
          <th className={th}>অবস্থা</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {list.map((a) => (
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
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}
