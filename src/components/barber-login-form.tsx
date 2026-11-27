"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { barberLogin } from "@/app/actions/auth";
import { Button, ErrorText } from "@/components/ui";
import { NET_ERR } from "@server/lib/messages";
import { nameInitial } from "@server/lib/money";

// Same shared login UI for every barber - only barberId/barberName differ per page.
export function BarberLoginForm({ barberId, barberName }: { barberId: number; barberName: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const r = await barberLogin({ barberId, password });
        if (r.ok) router.replace(`/barber/${barberId}`);
        else {
          setError(r.error);
          setPassword("");
        }
      } catch {
        setError(NET_ERR); // keep what was typed
      }
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
          {nameInitial(barberName)}
        </div>
        <h1 className="text-xl font-bold text-fg">{barberName}</h1>
        <p className="mt-1 text-sm text-muted">লগইন করতে আপনার পাসওয়ার্ড দিন</p>

        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          aria-label="পাসওয়ার্ড"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          className="mt-6 h-14 w-full rounded-2xl border border-line-strong bg-surface-2 px-4 text-center text-lg text-fg focus:border-primary focus:outline-none"
        />
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
        <Button type="submit" size="lg" className="mt-4 w-full" disabled={!password || pending}>
          লগইন
        </Button>
        <Link href="/pos" className="mt-2 inline-block text-sm text-primary hover:underline">
          নাপিত তালিকা
        </Link>
      </form>
    </main>
  );
}
