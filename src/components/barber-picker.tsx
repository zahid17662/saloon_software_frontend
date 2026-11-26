"use client";

import Link from "next/link";
import { useCatalog } from "@/components/catalog-context";
import { ChartIcon, ScissorsIcon } from "@/components/icons";
import { LoadingScreen } from "@/components/ui";
import { bnDigits, nameInitial, taka } from "@server/lib/money";

export interface TodayStat {
  barberId: number;
  count: number;
  barberShare: number;
}

export function BarberPicker({ stats }: { stats: TodayStat[] }) {
  const catalog = useCatalog();
  if (!catalog) return <LoadingScreen />;
  const barbers = catalog.barbers.filter((b) => b.active).sort((a, z) => a.sortOrder - z.sortOrder);
  const statOf = (id: number) => stats.find((x) => x.barberId === id) ?? { barberId: id, count: 0, barberShare: 0 };

  return (
    <main className="mx-auto min-h-dvh max-w-4xl p-4 sm:p-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <ScissorsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-fg">{catalog.settings.shopName}</h1>
            <p className="text-sm text-muted">আপনার নাম বেছে নিন</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-line px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
        >
          <ChartIcon className="h-4 w-4" />
          এডমিন
        </Link>
      </header>

      {barbers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center text-subtle">
          কোনো নাপিত নেই। এডমিন প্যানেল থেকে নাপিত যোগ করুন।
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {barbers.map((b) => {
            const mine = statOf(b.id);
            return (
              <li key={b.id}>
                <Link
                  href={`/barber-login/${b.id}`}
                  className="group flex h-full min-h-36 flex-col justify-between rounded-3xl border border-line bg-surface p-5 transition-colors hover:border-primary/50 hover:bg-surface-2 active:scale-[0.98]"
                >
                  <div aria-hidden="true" className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                    {nameInitial(b.name)}
                  </div>
                  <div>
                    <div className="mt-3 text-lg font-semibold text-fg">{b.name}</div>
                    <div className="text-sm text-muted">
                      আজ {bnDigits(mine.count)} জন · {taka(mine.barberShare)}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
