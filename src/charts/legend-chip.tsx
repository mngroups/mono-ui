type LegendShape = "line" | "dashed" | "square";

/** One legend entry: a small colour sample (line, dashed line or square) and its label. */
export function LegendChip({
  color,
  label,
  shape = "line",
  opacity = 1,
}: {
  /** Series colour (any CSS colour). */
  color: string;
  label: string;
  /** `line` for line series, `dashed` for reference lines, `square` for bars. */
  shape?: LegendShape;
  /** Opacity of the square sample, to match faded bars. */
  opacity?: number;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-foreground/70">
      {shape === "square" ? (
        <span className="h-2 w-2 rounded-sm" style={{ background: color, opacity }} />
      ) : (
        <svg width={16} height={6} aria-hidden="true">
          <line
            x1={0}
            y1={3}
            x2={16}
            y2={3}
            stroke={color}
            strokeWidth={2}
            strokeDasharray={shape === "dashed" ? "4 3" : undefined}
          />
        </svg>
      )}
      {label}
    </span>
  );
}
