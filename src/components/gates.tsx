"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { checkBarberSession } from "@/app/actions/auth";

/**
 * This specific barber must still have a valid password session -
 * e.g. if admin resets their password or deactivates them mid-shift, this sends them to re-login.
 */
export function BarberGate({ barberId, children }: { barberId: number; children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    const check = () =>
      checkBarberSession(barberId)
        .then((r) => {
          if (alive && !r.valid) router.replace(`/barber-login/${barberId}`);
        })
        .catch(() => {
          /* offline or server error: keep the current state */
        });
    check();
    window.addEventListener("focus", check);
    return () => {
      alive = false;
      window.removeEventListener("focus", check);
    };
  }, [router, barberId]);

  return <>{children}</>;
}
