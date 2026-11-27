import path from "node:path";
import { defineConfig } from "vitest/config";

// Frontend tests are static checks of the source and config (no browser, no network). Behavioural
// tests of the business rules run in the Server workspace; browser tests live in the root e2e/.
export default defineConfig({
  resolve: {
    alias: [
      { find: "@server", replacement: path.resolve(process.cwd(), "src/shared") },
      { find: "@", replacement: path.resolve(process.cwd(), "src") },
    ],
  },
  test: { include: ["src/**/*.test.ts"] },
});
