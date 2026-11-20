/** Shared sizes, colours, dot/label limits and animation timing of the chart components. */
export const TREND_CHART_DEFAULTS = {
  minHeight: 236,
  stepFactors: [1, 2, 2.5, 5, 10],
  maxTicks: 6,
  maxDotPoints: 13,
  maxLabelPoints: 6,
  axisColor: "#8490A1",
  gridColor: "#EDF0F5",
  cursorColor: "#D5DBE5",
  surfaceColor: "var(--card)",
  barSize: { single: 40, grouped: 24 },
  dimOpacity: 0.4,
  /** Draw-in on first view; lines start once the bars are under way. */
  animation: { duration: 800, easing: "ease-out", lineDelay: 300 },
} as const;

/** Recharts axis `tick` style shared by the charts. */
export const AXIS_TICK = { fontSize: 11, fill: TREND_CHART_DEFAULTS.axisColor };
