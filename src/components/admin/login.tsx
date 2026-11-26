"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/app/actions/auth";
import { safeNext } from "@server/lib/route-guard";
import { Button, ErrorText } from "../ui";
import { LockIcon } from "../icons";

export function AdminLogin({ shopName }: { shopName: string }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await loginAdmin({ pin });
      if (!r.ok) {
        setError(r.error);
        setPin("");
        return;
      }
      router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <LockIcon className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-fg">এডমিন লগইন</h1>
        <p className="mt-1 text-sm text-muted">{shopName}</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          aria-label="এডমিন পিন"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError("");
          }}
          className="mt-6 h-14 w-full rounded-2xl border border-line-strong bg-surface-2 text-center text-2xl tracking-[0.5em] text-fg focus:border-primary focus:outline-none"
        />
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
        <Button type="submit" size="lg" className="mt-4 w-full" disabled={!pin || pending}>
          লগইন
        </Button>
        <Link href="/" className="mt-2 inline-block text-sm text-primary hover:underline">
          নাপিতের স্ক্রিনে যান
        </Link>
      </form>
    </main>
  );
}
