"use client";

import { useIsMobile } from "@mono/hooks";
import { useCallback, useState } from "react";
import { DynamicModal } from "../dynamic-modal/dynamic-modal.js";

import type { TooltipEntry } from "./chart-tooltip.js";

type ChartClickState = { activeLabel?: string; activePayload?: TooltipEntry[] } | null;
type Detail = { label: string; entries: TooltipEntry[] };

const NO_EXTRAS: readonly TooltipEntry[] = [];

/**
 * Mobile replacement for a chart's hover tooltip. Pass `onChartClick` to the Recharts chart's
 * `onClick` and render `sheet` next to it: on mobile, tapping a point opens a bottom sheet listing
 * every series value (plus `extras`) for that label. On desktop `onChartClick` does nothing.
 */
export function useChartDetailSheet(
  labels: Map<string, string>,
  formats: Map<string, (value: number) => string>,
  extras: readonly TooltipEntry[] = NO_EXTRAS,
  labelFormatter: (label: string) => string = String
) {
  const isMobile = useIsMobile();
  const [detail, setDetail] = useState<Detail | null>(null);

  const onChartClick = useCallback(
    (state: ChartClickState) => {
      const entries = state?.activePayload?.filter((e) => e.value != null) ?? [];
      if (isMobile && entries.length) {
        setDetail({
          label: labelFormatter(state?.activeLabel ?? ""),
          entries: [...entries, ...extras],
        });
      }
    },
    [isMobile, extras, labelFormatter]
  );

  const sheet = (
    <DynamicModal
      open={!!detail}
      onOpenChange={(open) => !open && setDetail(null)}
      title={detail?.label ?? ""}
      dismissible
    >
      <div className="-mt-1 divide-y divide-foreground/10">
        {detail?.entries.map((e) => {
          const key = String(e.dataKey);
          return (
            <div key={key} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="flex items-center gap-2 text-foreground/70">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: e.color }} />
                {labels.get(key)}
              </span>
              <span className="font-bold text-foreground tabular-nums">
                {(formats.get(key) ?? String)(e.value as number)}
              </span>
            </div>
          );
        })}
      </div>
    </DynamicModal>
  );

  return { isMobile, onChartClick, sheet };
}
