"use client";

import { cn } from "@mono/utils";
import { useMemo } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { buildNiceTicks } from "./build-ticks.js";
import { useChartDetailSheet } from "./chart-detail-sheet.js";
import { ChartTooltip } from "./chart-tooltip.js";
import { AXIS_TICK, TREND_CHART_DEFAULTS as D } from "./constants.js";
import { LegendChip } from "./legend-chip.js";
import { useChartReveal } from "./use-chart-reveal.js";

type Row = Record<string, unknown>;

const NO_REFERENCES: readonly TrendReferenceLine[] = [];

const referenceKey = (r: TrendReferenceLine) => `reference:${r.label}`;

export type TrendSeries<T extends Row> = {
  key: Extract<keyof T, string>;
  label: string;
  color: string;
};

export type TrendReferenceLine = {
  value: number;
  label: string;
  color: string;
};

interface TrendLineChartProps<T extends Row> {
  /** Rows to plot, one per x-axis point. */
  data: T[];
  /** Row field shown on the x-axis (e.g. a day or month label). */
  xKey: Extract<keyof T, string>;
  /** One line per entry: the row field to plot, its legend label and colour. */
  series: readonly TrendSeries<T>[];
  /** Dashed horizontal lines for fixed values such as a target; listed in legend and tooltip. */
  referenceLines?: readonly TrendReferenceLine[];
  /** Formats values in point labels, tooltip and mobile detail sheet. */
  valueFormatter?: (value: number) => string;
  /** Formats the y-axis tick labels. */
  yTickFormatter?: (value: number) => string;
  /** Maps an x-axis label to the full title shown in the tooltip / mobile detail sheet. */
  labelFormatter?: (label: string) => string;
  /** Fixes the bottom of the y-axis instead of fitting it to the data. */
  yMin?: number;
  /** Fixes the top of the y-axis instead of fitting it to the data. */
  yMax?: number;
  /** Minimum plot height in px. */
  minHeight?: number;
  /** Shows the legend row above the plot. */
  showLegend?: boolean;
  className?: string;
}

/**
 * Line chart for a trend over time, with automatic "nice" y-axis ticks, optional dashed
 * reference lines, value labels on short series, and a tap-for-detail sheet on mobile in place
 * of the hover tooltip.
 */
export function TrendLineChart<T extends Row>({
  data,
  xKey,
  series,
  referenceLines = NO_REFERENCES,
  valueFormatter = String,
  yTickFormatter = String,
  labelFormatter = String,
  yMin,
  yMax,
  minHeight = D.minHeight,
  showLegend = true,
  className,
}: TrendLineChartProps<T>) {
  const values = useMemo(
    () =>
      data.flatMap((row) =>
        series.flatMap((s) => (typeof row[s.key] === "number" ? [row[s.key] as number] : []))
      ),
    [data, series]
  );
  const { domain, ticks } = useMemo(
    () =>
      buildNiceTicks([...values, ...referenceLines.map((r) => r.value)], { min: yMin, max: yMax }),
    [values, referenceLines, yMin, yMax]
  );
  const labels = useMemo(() => new Map(series.map((s) => [s.key, s.label])), [series]);
  const formats = useMemo(
    () => new Map(series.map((s) => [s.key, valueFormatter])),
    [series, valueFormatter]
  );

  const pointCount = series.length ? values.length / series.length : 0;
  const showDots = pointCount <= D.maxDotPoints;
  const showLabels = pointCount <= D.maxLabelPoints;

  const referenceEntries = useMemo(
    () => referenceLines.map((r) => ({ dataKey: referenceKey(r), value: r.value, color: r.color })),
    [referenceLines]
  );
  const tooltipLabels = useMemo(
    () => new Map([...labels, ...referenceLines.map((r) => [referenceKey(r), r.label] as const)]),
    [labels, referenceLines]
  );
  const tooltipFormats = useMemo(
    () =>
      new Map([
        ...formats,
        ...referenceLines.map((r) => [referenceKey(r), valueFormatter] as const),
      ]),
    [formats, referenceLines, valueFormatter]
  );

  const detail = useChartDetailSheet(
    tooltipLabels,
    tooltipFormats,
    referenceEntries,
    labelFormatter
  );
  const reveal = useChartReveal();

  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      {showLegend && (
        <div className="flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <LegendChip key={s.key} color={s.color} label={s.label} shape="line" />
          ))}
          {referenceLines.map((r) => (
            <LegendChip key={r.label} color={r.color} label={r.label} shape="dashed" />
          ))}
        </div>
      )}
      <div ref={reveal.ref} className="flex-1" style={{ minHeight }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
          <LineChart
            data={data}
            margin={{ top: 20, right: 16, bottom: 0, left: 0 }}
            onClick={detail.onChartClick}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={D.gridColor} vertical={false} />
            <XAxis
              dataKey={xKey}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
              tickMargin={8}
              padding={{ left: 16, right: 16 }}
            />
            <YAxis
              domain={domain}
              ticks={ticks}
              tickFormatter={yTickFormatter}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              width={44}
            />
            <Tooltip
              content={
                detail.isMobile ? (
                  () => null
                ) : (
                  <ChartTooltip
                    labels={tooltipLabels}
                    formats={tooltipFormats}
                    extras={referenceEntries}
                    labelFormatter={labelFormatter}
                  />
                )
              }
              cursor={{ stroke: D.cursorColor, strokeDasharray: "3 3" }}
            />
            {referenceLines.map((r) => (
              <ReferenceLine
                key={r.label}
                y={r.value}
                stroke={r.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                ifOverflow="extendDomain"
              />
            ))}
            {reveal.show &&
              series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2.5}
                  connectNulls
                  dot={
                    showDots
                      ? { r: 4, strokeWidth: 2, stroke: D.surfaceColor, fill: s.color }
                      : false
                  }
                  activeDot={{ r: 5, strokeWidth: 2, stroke: D.surfaceColor }}
                  isAnimationActive={reveal.animate}
                  animationDuration={D.animation.duration}
                  animationEasing={D.animation.easing}
                >
                  {showLabels && (
                    <LabelList
                      dataKey={s.key}
                      position="top"
                      offset={10}
                      className="fill-foreground/70 text-[11px] font-semibold"
                      stroke={D.surfaceColor}
                      strokeWidth={3}
                      paintOrder="stroke"
                      formatter={(v: number | null) => (v == null ? "" : valueFormatter(v))}
                    />
                  )}
                </Line>
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {detail.sheet}
    </div>
  );
}
