"use client";

import { useState } from "react";
import { presetRange, type DateRange, type RangePreset } from "@server/lib/time";
import { cx } from "./ui";

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: "today", label: "আজ" },
  { id: "yesterday", label: "গতকাল" },
  { id: "month", label: "এই মাস" },
  { id: "custom", label: "কাস্টম" },
];

export function useDateRange(initial: Exclude<RangePreset, "custom"> = "today") {
  const [preset, setPreset] = useState<RangePreset>(initial);
  const [custom, setCustom] = useState<DateRange>(() => presetRange("month"));
  const range = preset === "custom" ? custom : presetRange(preset);
  return { preset, setPreset, custom, setCustom, range };
}

export function RangeFilter({ state }: { state: ReturnType<typeof useDateRange> }) {
  const { preset, setPreset, custom, setCustom } = state;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="সময়সীমা">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPreset(p.id)}
            aria-pressed={preset === p.id}
            className={cx(
              "rounded-full border px-4 py-2 text-sm transition-colors",
              preset === p.id
                ? "border-primary bg-primary font-semibold text-white shadow-[0_4px_14px_rgb(59_130_246/0.25)]"
                : "border-line bg-surface text-muted hover:text-fg",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {preset === "custom" && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            aria-label="শুরুর তারিখ"
            value={custom.from}
            max={custom.to}
            onChange={(e) => e.target.value && setCustom({ ...custom, from: e.target.value })}
            className="h-10 rounded-full border border-line bg-surface px-3 text-fg"
          />
          <span className="text-subtle">থেকে</span>
          <input
            type="date"
            aria-label="শেষ তারিখ"
            value={custom.to}
            min={custom.from}
            onChange={(e) => e.target.value && setCustom({ ...custom, to: e.target.value })}
            className="h-10 rounded-full border border-line bg-surface px-3 text-fg"
          />
        </div>
      )}
    </div>
  );
}
