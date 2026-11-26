import "server-only";

import { Suspense, type ReactNode } from "react";
import { readApi } from "@/lib/api";
import type { Catalog } from "@/lib/api-types";
import { CatalogProvider } from "./catalog-context";
import { LoadingScreen } from "./ui";

/**
 * Loads the catalog (categories, services, barbers, public settings) from the API for visitors with a
 * valid shop or admin session, and hands it to the client tree. Visitors without a session (the
 * /unlock page) get null; proxy.ts has already redirected everything else. A backend outage throws
 * to error.tsx instead of looking like "logged out".
 * Reads cookies, so it must sit behind Suspense (Cache Components).
 */
async function Loader({ children }: { children: ReactNode }) {
  const catalog = await readApi<Catalog | null>("read.catalog");
  return <CatalogProvider catalog={catalog}>{children}</CatalogProvider>;
}

export function CatalogBoundary({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Loader>{children}</Loader>
    </Suspense>
  );
}
