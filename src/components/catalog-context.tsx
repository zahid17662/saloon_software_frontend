"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Barber, Category, Service, Settings } from "@server/lib/types";

export interface CatalogData {
  categories: Category[];
  services: Service[];
  barbers: Barber[];
  settings: Settings;
}

// null = the visitor has no valid session (for example on /unlock), so nothing was loaded.
const Ctx = createContext<CatalogData | null>(null);

export function CatalogProvider({ catalog, children }: { catalog: CatalogData | null; children: ReactNode }) {
  return <Ctx.Provider value={catalog}>{children}</Ctx.Provider>;
}

/** The server-loaded catalog, or null before login. Updates after every catalog Server Action. */
export const useCatalog = () => useContext(Ctx);
