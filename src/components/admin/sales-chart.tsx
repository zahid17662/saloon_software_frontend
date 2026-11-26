"use client";

import { useState } from "react";
import { CardHeader, TrendPill } from "../ui";
import { liveSales } from "@server/lib/reports";
import { bnDigits, taka } from "@server/lib/money";
import { dhakaDateKey, fmtDateKey, shiftDays, todayKey } from "@server/lib/time";
import type { Sale } from "@server/lib/types";

const DAYS = 14;
const W = 640;
const H = 220;
const PAD = { top: 36, right: 12, bottom: 28, left: 12 };

/** Smooth path through points (Catmull-Rom converted to cubic Béziers). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** Last 14 days of sales as a soft area chart (like the "Customer Orders" card). */
export function SalesChart({ sales }: { sales: Sale[] }) {
  const today = todayKey();
  const keys = Array.from({ length: DAYS }, (_, i) => shiftDays(today, i - DAYS + 1));
  const totals = new Map(keys.map((k) => [k, 0]));
  for (const s of liveSales(sales, { from: keys[0], to: today })) {
    const k = dhakaDateKey(s.createdAt);
    totals.set(k, (totals.get(k) ?? 0) + s.total);
  }
  const values = keys.map((k) => totals.get(k) ?? 0);
  const sum = values.reduce((a, b) => a + b, 0);
  const firstHalf = values.slice(0, DAYS / 2).reduce((a, b) => a + b, 0);
  const secondHalf = sum - firstHalf;
  const trend = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : null;

  const max = Math.max(...values, 1);
  const x = (i: number) => PAD.left + (i * (W - PAD.left - PAD.right)) / (DAYS - 1);
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
  const pts = values.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smooth(pts);
  const area = `${line} L${x(DAYS - 1)},${H - PAD.bottom} L${x(0)},${H - PAD.bottom} Z`;

  const peak = values.indexOf(Math.max(...values));
  const [hover, setHover] = useState<number | null>(null);
  const focus = hover ?? (sum > 0 ? peak : DAYS - 1);

  return (
    <>
      <CardHeader title="দৈনিক বিক্রি" sub={`${fmtDateKey(keys[0])} – ${fmtDateKey(today)}`} />
      <div className="mb-2 flex items-center gap-3">
        <span className="text-[28px] leading-none font-bold tabular-nums text-fg">{taka(sum)}</span>
        <TrendPill value={trend} />
        <span className="text-xs text-muted">গত ১৪ দিন</span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full select-none"
        role="img"
        aria-label={`গত ১৪ দিনের বিক্রি, মোট ${taka(sum)}`}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + (1 - f) * (H - PAD.top - PAD.bottom)}
            y2={PAD.top + (1 - f) * (H - PAD.top - PAD.bottom)}
            stroke="var(--color-line)"
            strokeDasharray="4 6"
          />
        ))}

        {/* Highlight column for the focused day */}
        <rect
          x={x(focus) - 14}
          y={PAD.top - 6}
          width={28}
          height={H - PAD.top - PAD.bottom + 6}
          rx={14}
          fill="var(--color-primary)"
          opacity={0.08}
        />

        <path d={area} fill="url(#salesFill)" />
        <path d={line} fill="none" stroke="var(--color-primary)" strokeWidth={3} strokeLinecap="round" />

        {/* Focus point + tooltip bubble */}
        <circle cx={x(focus)} cy={y(values[focus])} r={6} fill="var(--color-surface)" stroke="var(--color-primary)" strokeWidth={3} />
        <g transform={`translate(${Math.min(Math.max(x(focus), 44), W - 44)}, ${Math.max(y(values[focus]) - 26, 14)})`}>
          <rect x={-40} y={-15} width={80} height={28} rx={14} fill="var(--color-fg)" />
          <text textAnchor="middle" y={4} fontSize={12} fontWeight={600} fill="#fff">
            {taka(values[focus])}
          </text>
        </g>

        {/* X labels: every other day */}
        {keys.map((k, i) =>
          i % 2 === (DAYS - 1) % 2 ? (
            <text key={k} x={x(i)} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--color-subtle)">
              {bnDigits(Number(k.slice(8)))}
            </text>
          ) : null,
        )}

        {/* Hover targets */}
        {keys.map((k, i) => (
          <rect
            key={`h-${k}`}
            x={x(i) - (W - PAD.left - PAD.right) / (DAYS - 1) / 2}
            y={0}
            width={(W - PAD.left - PAD.right) / (DAYS - 1)}
            height={H}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
            onTouchStart={() => setHover(i)}
          >
            <title>{`${fmtDateKey(k)}: ${taka(values[i])}`}</title>
          </rect>
        ))}
      </svg>
    </>
  );
}
