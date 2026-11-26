"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    // Only the error name: messages and digests can carry hostnames or other internals.
    console.error("page error:", error instanceof Error ? error.name : "unknown");
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold text-fg">কিছু একটা ভুল হয়েছে</h1>
      <p className="text-muted">পেজটি লোড করা যায়নি। ইন্টারনেট ঠিক আছে কিনা দেখে আবার চেষ্টা করুন।</p>
      <Button onClick={() => retry()}>আবার চেষ্টা করুন</Button>
    </main>
  );
}
