"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { unlockShop } from "@/app/actions/auth";
import { Button, ErrorText } from "@/components/ui";
import { ScissorsIcon } from "@/components/icons";

export function UnlockForm({ shopName }: { shopName: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await unlockShop({ code });
      if (r.ok) router.replace("/");
      else {
        setError(r.error);
        setCode("");
      }
    });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <ScissorsIcon className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-fg">{shopName}</h1>
        <p className="mt-1 text-sm text-muted">এই ডিভাইসটি চালু করতে দোকানের কোড দিন</p>

        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          aria-label="দোকানের কোড"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError("");
          }}
          className="mt-6 h-14 w-full rounded-2xl border border-line-strong bg-surface-2 text-center text-2xl tracking-[0.5em] text-fg focus:border-primary focus:outline-none"
        />
        <div className="mt-3">
          <ErrorText>{error}</ErrorText>
        </div>
        <Button type="submit" size="lg" className="mt-4 w-full" disabled={!code || pending}>
          চালু করুন
        </Button>
        <Link href="/admin/login" className="mt-2 inline-block text-sm text-primary hover:underline">
          এডমিন লগইন
        </Link>
      </form>
    </main>
  );
}
