"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/actions/auth";
import { NET_ERR } from "@server/lib/messages";
import { useCatalog } from "../catalog-context";
import { cx, LoadingScreen } from "../ui";
import {
  CalendarIcon,
  ChartIcon,
  GearIcon,
  HomeIcon,
  ListIcon,
  LogoutIcon,
  ReceiptIcon,
  ScissorsIcon,
  UsersIcon,
  WalletIcon,
} from "../icons";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", Icon: ChartIcon },
  { href: "/admin/reports", label: "রিপোর্ট", Icon: ListIcon },
  { href: "/admin/sales", label: "বিক্রি", Icon: ReceiptIcon },
  { href: "/admin/appointments", label: "অ্যাপয়েন্টমেন্ট", Icon: CalendarIcon },
  { href: "/admin/payouts", label: "নাপিতের পেমেন্ট", Icon: WalletIcon },
  { href: "/admin/barbers", label: "নাপিত", Icon: UsersIcon },
  { href: "/admin/services", label: "সার্ভিস ও দাম", Icon: ScissorsIcon },
  { href: "/admin/settings", label: "সেটিংস", Icon: GearIcon },
] as const;

/**
 * FR-2: every /admin page except login needs an admin session. proxy.ts redirects requests without a
 * valid admin cookie; the Server Actions re-check on every call (FR-4).
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const catalog = useCatalog();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const loggingOut = useRef(false);

  if (isLogin) return <>{children}</>;
  if (!catalog) return <LoadingScreen />;
  const shopName = catalog.settings.shopName;

  async function logout() {
    if (loggingOut.current) return; // ignore a double tap
    loggingOut.current = true;
    try {
      await logoutAdmin();
      router.replace("/admin/login");
    } catch {
      loggingOut.current = false;
      window.alert(NET_ERR); // still signed in; nothing was lost
    }
  }

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-dvh lg:pl-[17rem]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-xl focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
      >
        মূল অংশে যান
      </a>
      {/* Desktop sidebar — floating white panel, icons in circles, blue active circle */}
      <aside className="fixed inset-y-4 left-4 hidden w-60 flex-col rounded-3xl bg-surface p-4 shadow-card lg:flex">
        <div className="mb-8 flex items-center gap-3 px-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_6px_18px_rgb(59_130_246/0.35)]">
            <ScissorsIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-fg">{shopName}</div>
            <div className="text-xs text-subtle">এডমিন প্যানেল</div>
          </div>
        </div>
        <nav aria-label="প্রধান মেনু" className="flex-1 space-y-1">
          {NAV.map(({ href, label, Icon }) => {
            const on = active(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={cx(
                  "group flex items-center gap-3 rounded-full py-1.5 pr-3 pl-1.5 text-sm transition-colors",
                  on ? "bg-primary-soft font-semibold text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                )}
              >
                <span
                  className={cx(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                    on ? "bg-primary text-white" : "bg-surface-2 text-muted group-hover:text-fg",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-line pt-3">
          <Link
            href="/pos"
            className="flex items-center gap-3 rounded-full py-1.5 pr-3 pl-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
              <HomeIcon className="h-[18px] w-[18px]" />
            </span>
            নাপিতের স্ক্রিন
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-full py-1.5 pr-3 pl-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
              <LogoutIcon className="h-[18px] w-[18px]" />
            </span>
            লগআউট
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <div className="font-semibold text-fg">{shopName}</div>
          <div className="flex gap-1">
            <Link href="/pos" aria-label="নাপিতের স্ক্রিন" className="rounded-lg p-2 text-muted hover:bg-surface-2">
              <HomeIcon className="h-5 w-5" />
            </Link>
            <button
              aria-label="লগআউট"
              onClick={logout}
              className="rounded-lg p-2 text-muted hover:bg-surface-2"
            >
              <LogoutIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <nav aria-label="মেনু" className="scrollbar-none flex gap-1 overflow-x-auto px-3 py-2">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cx(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-sm",
                active(href) ? "border-primary bg-primary font-semibold text-white" : "border-line bg-surface text-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-7xl p-4 sm:p-6 lg:py-8">{children}</main>
    </div>
  );
}
