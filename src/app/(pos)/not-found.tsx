import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold text-fg">পেজটি পাওয়া যায়নি</h1>
      <p className="text-muted">আপনি যে পেজটি খুঁজছেন সেটি নেই বা সরিয়ে ফেলা হয়েছে।</p>
      <Link
        href="/pos"
        className="inline-flex h-11 items-center rounded-xl bg-primary px-5 font-semibold text-white hover:opacity-90"
      >
        হোম পেজে যান
      </Link>
    </main>
  );
}
