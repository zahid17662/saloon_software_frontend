// Frontend-side security checks (the web half of the security suite). The attacker-style
// tests for auth, replay and rate limits run against the API in the Server workspace.
//   1. the web app has no database or password-hashing code at all
//   2. the customer receipt never shows the barber/owner split (FR-14)
//   3. no HTML-injection sinks
//   4. security headers and CSP
//   5. the built bundle contains no secrets (only when `next build` has been run)

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { parse as parseEnv } from "dotenv";
import { afterEach, describe, expect, it, vi } from "vitest";

const root = process.cwd(); // the Client folder (npm test runs from here)
const srcDir = path.join(root, "src");

function walk(dir: string, accept: (f: string) => boolean): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p, accept) : accept(f) ? [p] : [];
  });
}
const JSON_LD_FILE = path.join("site", "json-ld.tsx");
const sources = () => walk(srcDir, (f) => /\.(tsx?|jsx?)$/.test(f) && !/\.test\./.test(f));

describe("1. the web app holds no backend secrets or database code", () => {
  it("no source file imports a database driver, ORM or bcrypt", () => {
    const offenders = sources().filter((p) =>
      /from "(drizzle-orm[^"]*|@neondatabase\/serverless|bcryptjs|bcrypt|pg|ws)"|from "@server\/db"/.test(readFileSync(p, "utf8")),
    );
    expect(offenders.map((p) => path.relative(root, p))).toEqual([]);
  });

  it("the API key and the backend URL are only read in src/lib/api.ts", () => {
    const offenders = sources()
      .filter((p) => /process\.env\.(API_KEY|API_URL)/.test(readFileSync(p, "utf8")))
      .map((p) => path.relative(root, p).replaceAll("\\", "/"));
    expect(offenders).toEqual(["src/lib/api.ts"]);
  });

  it("every page that shows barber, sale or catalog data reads it through the API (which checks the session)", () => {
    const pages = walk(path.join(srcDir, "app"), (f) => f === "page.tsx");
    // "(site)/*" is the public website, multi-page but still static (checked below); /unlock only redirects.
    // appointments is a data-free shell like the admin pages: it loads through a session-checked
    // Server Action (requireShop), not readApi.
    const open = new Set(["(pos)/unlock/page.tsx", "(pos)/admin/login/page.tsx", "(pos)/appointments/page.tsx"]);
    const offenders: string[] = [];
    for (const p of pages) {
      const rel = path.relative(path.join(srcDir, "app"), p).replaceAll("\\", "/");
      if (open.has(rel) || rel.startsWith("(pos)/admin/") || rel.startsWith("(site)/")) continue; // admin pages are data-free shells
      if (!/readApi\(|readApi</.test(readFileSync(p, "utf8"))) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  it("the public website never touches the API or any POS data (except the one public booking form)", () => {
    const files = [...walk(path.join(srcDir, "app/(site)"), (f) => /\.tsx?$/.test(f)), ...walk(path.join(srcDir, "site"), (f) => /\.tsx?$/.test(f))];
    // The booking form is the one deliberate exception: it calls appointments.* only (a public,
    // rate-limited create plus a name-only barber read), never catalog/sales/auth/payouts.
    const ALLOWED = /from "@\/app\/actions\/appointments"/g;
    const offenders = files
      .filter((p) => {
        const src = readFileSync(p, "utf8").replace(ALLOWED, "");
        return /@\/lib\/|@\/actions|@\/components|@server|readApi/.test(src);
      })
      .map((p) => path.relative(root, p));
    expect(offenders).toEqual([]);
  });
});

describe("2. receipt", () => {
  it("the customer receipt never shows the barber/owner split (FR-14)", () => {
    const src = readFileSync(path.join(srcDir, "components/receipt-view.tsx"), "utf8");
    expect(src).not.toMatch(/barberShare|ownerShare|commissionPct/);
  });
});

describe("3. output safety", () => {
  it("no component or page uses an HTML-injection sink (dangerouslySetInnerHTML, innerHTML, document.write, eval)", () => {
    const hits = sources()
      .filter((p) => !p.endsWith(JSON_LD_FILE)) // the one allowed place, checked in the next test
      .filter((p) => /dangerouslySetInnerHTML|\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function\(/.test(readFileSync(p, "utf8")))
      .map((p) => path.relative(root, p));
    expect(hits).toEqual([]);
  });
});

describe("3b. JSON-LD", () => {
  it("the only raw-HTML write is the structured-data script, and a name holding </script> cannot break out of it", async () => {
    const src = readFileSync(path.join(srcDir, "site/json-ld.tsx"), "utf8");
    expect(src.match(/dangerouslySetInnerHTML/g)).toHaveLength(1);

    // Behaviour, not source text: render the real component with a hostile business name.
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    vi.doMock("@/site/config", () => ({ SITE: { name: "</script><img src=x onerror=alert(1)>", address: "", phone: "", whatsapp: "", hours: "", year: 2026, reviews: [] } }));
    const { JsonLd } = await import("@/site/json-ld");
    const { renderToStaticMarkup } = await import("react-dom/server");
    const html = renderToStaticMarkup(JsonLd());
    expect(html.match(/<\/script>/g)).toHaveLength(1); // only the real closing tag
    expect(html).not.toMatch(/<img/);
    const body = html.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(JSON.parse(body).name).toBe("</script><img src=x onerror=alert(1)>"); // still the same data once parsed
    vi.doUnmock("@/site/config");
    vi.doUnmock("server-only");
  });

  it("the business data holds only what config.ts has (empty items are left out, nothing is invented)", async () => {
    vi.resetModules();
    vi.doMock("server-only", () => ({}));
    vi.doMock("@/site/config", () => ({ SITE: { name: "Test Salon", address: "", phone: "", whatsapp: "", hours: "", year: 2026, reviews: [] } }));
    const empty = (await import("@/site/json-ld")).businessData();
    expect(empty["@type"]).toBe("HairSalon");
    expect(Object.keys(empty)).not.toContain("telephone");
    expect(Object.keys(empty)).not.toContain("address");
    expect(Object.keys(empty)).not.toContain("aggregateRating");

    vi.resetModules();
    vi.doMock("@/site/config", () => ({ SITE: { name: "Test Salon", address: "1 Road", phone: "017", whatsapp: "", hours: "", year: 2026, reviews: [] } }));
    const filled = (await import("@/site/json-ld")).businessData();
    expect(filled).toMatchObject({ telephone: "017", address: { streetAddress: "1 Road" } });
    vi.doUnmock("@/site/config");
    vi.doUnmock("server-only");
  });
});

describe("4. headers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function loadHeaders(env: "production" | "development") {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", env);
    const cfg = (await import("../next.config")).default;
    const rules = await cfg.headers!();
    const rule = rules.find((r) => r.source === "/:path*");
    return Object.fromEntries((rule?.headers ?? []).map((h) => [h.key.toLowerCase(), h.value]));
  }

  it("the header rule matches every path (source /:path*) and carries all the required headers", async () => {
    const h = await loadHeaders("production");
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toMatch(/max-age=\d{8,}/);
    expect(h["permissions-policy"]).toMatch(/camera=\(\).*microphone=\(\).*geolocation=\(\)/);
    expect(h["content-security-policy"]).toBeTruthy();
  });

  it("production CSP: self only, no eval, no framing, no plugins, no foreign form targets, upgrades http", async () => {
    const csp = (await loadHeaders("production"))["content-security-policy"];
    for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests", "connect-src 'self'"]) {
      expect(csp, d).toContain(d);
    }
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/https?:\/\/|\*/); // no third-party origins or wildcards (the browser never calls the API)
    expect(csp).not.toMatch(/ws:|wss:/);
  });
});

describe("5. bundle secrets", () => {
  const staticDir = path.join(root, ".next/static");
  it.skipIf(!existsSync(staticDir))("the built client bundle contains no env var names, connection strings or secret values", () => {
    const files = walk(staticDir, (f) => /\.(js|css|html|json|map|txt)$/.test(f));
    expect(files.length).toBeGreaterThan(0);
    const blob = files.map((f) => readFileSync(f, "utf8")).join("\n");

    for (const needle of ["DATABASE_URL", "DIRECT_URL", "SESSION_SECRET", "API_KEY", "API_URL", "SEED_ADMIN_PIN", "SEED_SHOP_CODE", "TRUST_PROXY_HEADERS", "neon.tech", "postgres://", "postgresql://", "adminPinHash", "shopCodeHash", "bcryptjs"]) {
      expect(blob.includes(needle), `client bundle contains "${needle}"`).toBe(false);
    }

    // The actual values from the local env files (never printed: only a boolean is asserted).
    const secrets: string[] = [];
    for (const f of [".env.local", ".env.test", ".env", ".env.production"]) {
      const p = path.join(root, f);
      if (!existsSync(p)) continue;
      for (const [k, v] of Object.entries(parseEnv(readFileSync(p)))) {
        if (/SECRET|PASSWORD|PIN|URL|KEY|TOKEN|CODE/i.test(k) && v.length >= 8) secrets.push(v);
        if (/URL/i.test(k)) {
          try {
            const host = new URL(v).hostname; // the database / API host name
            if (host !== "localhost" && host !== "127.0.0.1" && host !== "::1") secrets.push(host);
          } catch {}
        }
      }
    }
    for (const s of new Set(secrets)) expect(blob.includes(s), "a secret value from an .env file is in the client bundle").toBe(false);
  });
});
