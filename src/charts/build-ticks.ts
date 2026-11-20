import { TREND_CHART_DEFAULTS } from "./constants.js";

function niceStep(span: number) {
  const raw = span / TREND_CHART_DEFAULTS.maxTicks;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const factor = TREND_CHART_DEFAULTS.stepFactors.find((f) => f * magnitude >= raw) ?? 10;
  return factor * magnitude;
}

/**
 * Y-axis domain and ticks with round steps (1, 2, 2.5, 5 or 10 times a power of ten), at most
 * `TREND_CHART_DEFAULTS.maxTicks`. `min` / `max` pin either end instead of fitting the values.
 */
export function buildNiceTicks(
  values: number[],
  { min, max }: { min?: number; max?: number } = {}
) {
  const low = min ?? (values.length ? Math.min(...values) : 0);
  const high = max ?? (values.length ? Math.max(...values) : 1);
  const step = niceStep(Math.max(high - low, 1));
  const start = min ?? Math.max(0, Math.floor(low / step) * step - (low > 0 ? step : 0));
  const end = max ?? Math.ceil(high / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= end + step / 1000; t += step) ticks.push(Number(t.toFixed(6)));
  return { domain: [start, end] as [number, number], ticks };
}

/** Fixed-step ticks from 0 that always reach at least `minMax` (e.g. 0/50/100/150%). */
export function buildStepTicks(
  values: number[],
  { step, minMax }: { step: number; minMax: number }
) {
  const high = Math.max(minMax, ...values);
  const end = Math.ceil(high / step) * step;
  const ticks = Array.from({ length: end / step + 1 }, (_, i) => i * step);
  return { domain: [0, end] as [number, number], ticks };
}
