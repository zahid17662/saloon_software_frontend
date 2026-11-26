// GENERATED COPY of the backend's src/lib/route-guard.ts. Do not edit here: change it in the backend
// repo and run `npm run sync:shared` in the dev meta-repo.
// Convenience redirects used by proxy.ts (PRD FR-4: the real authorization check is server-side in
// every Server Action). Pure, so it can be tested without Next.

export interface GuardInput {
  pathname: string;
  search: string; // includes the leading "?" or is ""
  hasShop: boolean; // valid shop cookie (signature + expiry)
  hasAdmin: boolean; // valid admin cookie (signature + expiry)
}

const isAdminPath = (p: string) => p === "/admin" || p.startsWith("/admin/");

export function guardRoute({ pathname, search, hasShop, hasAdmin }: GuardInput): { redirect: string } | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  if (path === "/unlock") return null;

  if (isAdminPath(path)) {
    if (path === "/admin/login") return null;
    if (hasAdmin) return null;
    return { redirect: `/admin/login?next=${encodeURIComponent(path + search)}` };
  }

  // Barber screens: an unlocked shop device, or an admin session (admin login also unlocks).
  if (!hasShop && !hasAdmin) return { redirect: "/unlock" };
  return null;
}

/** Only same-origin /admin paths are allowed as a post-login target (no open redirect). */
export function safeNext(next: string | null | undefined): string {
  if (!next) return "/admin";
  if (!/^\/admin(\/|\?|$)/.test(next)) return "/admin";
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return "/admin";
  if (/^\/admin\/login(\/|\?|$)/.test(next)) return "/admin";
  return next;
}
