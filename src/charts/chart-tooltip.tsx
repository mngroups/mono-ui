export type TooltipEntry = { dataKey?: string | number; value?: number | null; color?: string };

/**
 * Tooltip card used by `TrendLineChart` and `ComboChart`: the x-axis label as title, then one row
 * per series with its colour, label and formatted value. Pass it as a Recharts `<Tooltip content>`.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  labels,
  formats,
  extras = [],
  labelFormatter = String,
}: {
  /** Set by Recharts while hovering; nothing renders when false. */
  active?: boolean;
  /** Set by Recharts: the hovered values. Entries with a `null` value are skipped. */
  payload?: TooltipEntry[];
  /** Set by Recharts: the hovered x-axis label. */
  label?: string;
  /** Series key to display name. */
  labels: Map<string, string>;
  /** Series key to value formatter; unformatted when missing. */
  formats: Map<string, (value: number) => string>;
  /** Static rows appended to every tooltip (e.g. reference lines such as a fixed target). */
  extras?: readonly TooltipEntry[];
  /** Maps the x-axis label to the tooltip title. */
  labelFormatter?: (label: string) => string;
}) {
  const data = payload?.filter((e) => e.value != null) ?? [];
  if (!active || !data.length) return null;
  const entries = [...data, ...extras];
  return (
    <div className="rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-semibold text-foreground">{labelFormatter(label ?? "")}</p>
      {entries.map((e) => {
        const key = String(e.dataKey);
        const format = formats.get(key) ?? String;
        return (
          <p key={key} className="flex items-center gap-1.5 text-foreground/60">
            <span className="h-2 w-2 rounded-full" style={{ background: e.color }} />
            {labels.get(key)}:
            <span className="font-bold text-foreground tabular-nums">
              {format(e.value as number)}
            </span>
          </p>
        );
      })}
    </div>
  );
}
