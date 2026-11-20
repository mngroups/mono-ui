"use client";

import { detectUnit, formatValue } from "@mono/utils";
import type { TooltipProps } from "recharts";

/**
 * Recharts tooltip for `ChartRenderer`: the label, then each numeric series with a unit detected
 * from its value and name (e.g. ton, Rp).
 */
export function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-card px-3 py-2 text-xs shadow">
      <div className="mb-1 font-semibold text-card-foreground">{label}</div>

      <div className="space-y-1">
        {payload.map((p) => {
          if (typeof p.value !== "number") return null;

          const unit = detectUnit(p.value, p.name);

          return (
            <div key={p.dataKey} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>

              <span className="font-medium text-card-foreground">{formatValue(p.value, unit)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
