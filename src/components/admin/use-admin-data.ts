"use client";

// Loading helpers for admin screens that read live Neon data through admin-only Server Actions.
// Both ignore a slow reply that was overtaken by a newer request, and expose `reload()` for use
// after a change.

import { useCallback, useEffect, useState } from "react";
import { getPayoutsView, type PayoutsView } from "@/app/actions/payouts";
import { listSales } from "@/app/actions/sales";
import { NET_ERR } from "@server/lib/messages";
import type { Sale } from "@server/lib/types";

export interface Loaded<T> {
  /** Data for exactly the query asked for; null while a different query is still loading. */
  data: T | null;
  error: string;
  /** True while a reload of the same query is in flight (data is the previous result). */
  loading: boolean;
  reload: () => void;
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };
interface State<T> {
  key: string;
  data: T | null;
  error: string;
}

function useLoaded<T>(key: string, load: () => Promise<Result<T>>): Loaded<T> {
  const [state, setState] = useState<State<T>>({ key: "", data: null, error: "" });
  const [tick, setTick] = useState(0);
  const [done, setDone] = useState(0); // the tick whose reply has arrived

  useEffect(() => {
    let current = true;
    const finish = (next: (prev: State<T>) => State<T>) => {
      if (!current) return;
      setState(next);
      setDone(tick);
    };
    load()
      .then((r) =>
        finish((prev) =>
          r.ok
            ? { key, data: r.data, error: "" }
            : { key, data: prev.key === key ? prev.data : null, error: r.error },
        ),
      )
      .catch(() => finish((prev) => ({ key, data: prev.key === key ? prev.data : null, error: NET_ERR })));
    return () => {
      current = false;
    };
    // `load` is rebuilt every render; the key and tick identify a request. Callers must put every
    // input of `load` into `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  const sameQuery = state.key === key;
  return {
    data: sameQuery ? state.data : null,
    error: sameQuery ? state.error : "",
    loading: !sameQuery || done !== tick,
    reload,
  };
}

/** Every sale (live and voided) dated from..to in Dhaka, newest first. */
export function useSalesWindow(from: string, to: string): Loaded<Sale[]> {
  return useLoaded(`${from}|${to}`, () => listSales({ from, to, status: "all" }));
}

/** Payout history plus per-barber earned / paid / balance. */
export function usePayoutsView(): Loaded<PayoutsView> {
  return useLoaded("payouts", () => getPayoutsView());
}
