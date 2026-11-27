// Copies the framework-free modules the UI needs (money, time, types, reports, ...) from the
// backend's src/lib into src/shared/lib, so this app builds on its own (no cross-repo import) while
// the money and date rules still come from ONE source: Server/src/lib.
//
//   npm run sync:shared          copy (run it after changing any of these files in Server/)
//   npm run check:shared         fail if the copies are out of date (part of the root `npm test`)
//
// It needs the sibling Server folder of this monorepo. If an installation does not include it,
// the committed copies are kept and this script says so and exits.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(here, "../../Server/src/lib");
const target = path.resolve(here, "../src/shared/lib");
const check = process.argv.includes("--check");

const FILES = [
  "auth-core.ts",
  "backdate.ts",
  "messages.ts",
  "money.ts",
  "reports.ts",
  "route-guard.ts",
  "sale-rules.ts",
  "time.ts",
  "types.ts",
];

const BANNER =
  "// GENERATED COPY of Server/src/lib/%FILE%. Do not edit here: change it there\n" +
  "// and run `npm run sync:shared` at the repo root.\n";

if (!existsSync(source)) {
  console.log("Server sources not found next to this app: keeping the committed copies.");
  process.exit(0);
}

mkdirSync(target, { recursive: true });
const stale = [];
for (const f of FILES) {
  const want = BANNER.replace("%FILE%", f) + readFileSync(path.join(source, f), "utf8");
  const dest = path.join(target, f);
  const have = existsSync(dest) ? readFileSync(dest, "utf8") : null;
  if (have === want) continue;
  if (check) stale.push(f);
  else writeFileSync(dest, want);
}

if (check && stale.length > 0) {
  console.error(`src/shared/lib is out of date: ${stale.join(", ")}. Run \`npm run sync:shared\`.`);
  process.exit(1);
}
console.log(check ? "shared copies are up to date" : "shared copies written");
