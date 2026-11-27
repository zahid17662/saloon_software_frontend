import { NextResponse, type NextRequest } from "next/server";
import { cookieName, verifyAdminCookie, verifyShopCookie } from "@server/lib/auth-core";
import { guardRoute } from "@server/lib/route-guard";

// Convenience redirects only (PRD FR-4). It checks the cookie signature and expiry, with no DB call.
// The authoritative check, including the shop code version, runs in every API action.
export function proxy(request: NextRequest) {
  // A Server Action cannot follow a page redirect (it would look like a dead connection). Every action
  // is authorised by the API, so let it through and let the answer say "log in again".
  if (request.method === "POST" && request.headers.has("next-action")) return NextResponse.next();

  const secret = process.env.SESSION_SECRET ?? ""; // auth-core throws if missing/short: fail closed
  const secure = process.env.NODE_ENV === "production";

  const decision = guardRoute({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hasShop: verifyShopCookie(request.cookies.get(cookieName("shop", secure))?.value, secret) !== null,
    hasAdmin: verifyAdminCookie(request.cookies.get(cookieName("admin", secure))?.value, secret) !== null,
  });

  if (decision) return NextResponse.redirect(new URL(decision.redirect, request.url));
  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static assets so redirects never block CSS/JS/images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
