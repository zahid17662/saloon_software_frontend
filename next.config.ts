import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

// npm workspaces hoist `next` and the other dependencies to the repo root's node_modules,
// so Turbopack's root must be the monorepo root (one level above Client/).
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const isDev = process.env.NODE_ENV !== "production";

// CSP. Fonts come from next/font, which self-hosts them at build time, so `font-src 'self'` is enough
// and the browser never contacts fonts.googleapis.com. Next's own inline bootstrap scripts need
// 'unsafe-inline' because per-request nonces would disable static/partial prerendering; no user
// content is ever rendered as HTML, so the main XSS risk is already closed by React escaping.
// 'unsafe-eval' is dev-only (React refresh / Turbopack).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The app needs none of these. Printing uses window.print(), which is not a gated feature.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Two root layouts (website and staff screens), so unknown addresses need one shared 404 page.
  experimental: { globalNotFound: true },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    root: ROOT,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
