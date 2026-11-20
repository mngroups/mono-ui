"use client";

import { cn } from "@mono/utils";
import { type CSSProperties, type ReactNode, useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { buildNiceTicks, buildStepTicks } from "./build-ticks.js";
import { useChartDetailSheet } from "./chart-detail-sheet.js";
import { ChartTooltip } from "./chart-tooltip.js";
import { AXIS_TICK, TREND_CHART_DEFAULTS as D } from "./constants.js";
import { LegendChip } from "./legend-chip.js";
import { useChartReveal } from "./use-chart-reveal.js";

type Row = Record<string, unknown>;

export type ComboSeries<T extends Row> = {
  key: Extract<keyof T, string>;
  label: string;
  color: string;
};

interface ComboChartProps<T extends Row> {
  /** Rows to plot, one per x-axis category. */
  data: T[];
  /** Row field shown on the x-axis. */
  xKey: Extract<keyof T, string>;
  /** Bar series, plotted on the left axis. */
  bars: readonly ComboSeries<T>[];
  /** Line series, plotted on a second axis on the right. */
  lines?: readonly ComboSeries<T>[];
  /** Formats bar values in the tooltip and mobile detail sheet. */
  barFormatter?: (value: number) => string;
  /** Formats line values in the tooltip and mobile detail sheet. */
  lineFormatter?: (value: number) => string;
  /** Formats left-axis ticks; defaults to `barFormatter`. */
  barTickFormatter?: (value: number) => string;
  /** Formats right-axis ticks; defaults to `lineFormatter`. */
  lineTickFormatter?: (value: number) => string;
  /** Lock the line axis to fixed steps from 0 (e.g. 0/50/100/150%) instead of auto-fitting. */
  lineScale?: { step: number; minMax: number };
  /** Dashed guide on the line axis (e.g. the 100% achievement mark). */
  lineReference?: number;
  /** Maps an x-axis label to the full title shown in the tooltip / mobile detail sheet. */
  labelFormatter?: (label: string) => string;
  /** Minimum plot height in px. */
  minHeight?: number;
  /** Mobile only: below this width the plot scrolls horizontally instead of squeezing the bars. */
  minWidth?: number;
  /** Width in px reserved for the left-axis labels. */
  barAxisWidth?: number;
  /** Shows the legend row above the plot. */
  showLegend?: boolean;
  /** Extra content on the right of the legend row (e.g. a data caveat). */
  legendNote?: ReactNode;
  /** Boolean row field; truthy rows render faded bars (e.g. a month still in progress). */
  dimKey?: Extract<keyof T, string>;
  /** Legend label for the faded bars; shown only when some row is dimmed. */
  dimLabel?: string;
  className?: string;
}

const NO_SERIES: readonly never[] = [];
const LEFT = "bars";
const RIGHT = "lines";

function collect<T extends Row>(data: T[], series: readonly ComboSeries<T>[]) {
  return data.flatMap((row) =>
    series.flatMap((s) => (typeof row[s.key] === "number" ? [row[s.key] as number] : []))
  );
}

/**
 * Bars and lines on two y-axes in one chart, e.g. plan vs actual tonnage as bars with the
 * achievement percentage as a line. Supports a dashed guide on the line axis, faded bars for
 * incomplete periods, horizontal scrolling on narrow screens, and a tap-for-detail sheet on mobile.
 */
export function ComboChart<T extends Row>({
  data,
  xKey,
  bars,
  lines = NO_SERIES,
  barFormatter = String,
  lineFormatter = String,
  barTickFormatter = barFormatter,
  lineTickFormatter = lineFormatter,
  lineScale,
  lineReference,
  labelFormatter = String,
  minHeight = D.minHeight,
  minWidth,
  barAxisWidth = 48,
  showLegend = true,
  legendNote,
  dimKey,
  dimLabel,
  className,
}: ComboChartProps<T>) {
  const barTicks = useMemo(() => buildNiceTicks(collect(data, bars), { min: 0 }), [data, bars]);
  const lineTicks = useMemo(() => {
    const values = collect(data, lines);
    return lineScale ? buildStepTicks(values, lineScale) : buildNiceTicks(values, { min: 0 });
  }, [data, lines, lineScale]);
  const labels = useMemo(
    () => new Map([...bars, ...lines].map((s) => [s.key, s.label])),
    [bars, lines]
  );
  const formats = useMemo(
    () =>
      new Map([
        ...bars.map((s) => [s.key, barFormatter] as const),
        ...lines.map((s) => [s.key, lineFormatter] as const),
      ]),
    [bars, lines, barFormatter, lineFormatter]
  );

  const detail = useChartDetailSheet(labels, formats, undefined, labelFormatter);
  const reveal = useChartReveal();

  return (
    <div className={cn("flex h-full flex-col gap-3", className)}>
      {showLegend && (
        <div className="flex flex-wrap items-center gap-4">
          {bars.map((s) => (
            <LegendChip key={s.key} color={s.color} label={s.label} shape="square" />
          ))}
          {lines.map((s) => (
            <LegendChip key={s.key} color={s.color} label={s.label} />
          ))}
          {dimKey && dimLabel && data.some((row) => row[dimKey]) && (
            <LegendChip
              color={bars[0]?.color ?? D.axisColor}
              label={dimLabel}
              shape="square"
              opacity={D.dimOpacity}
            />
          )}
          {legendNote && <div className="md:ml-auto">{legendNote}</div>}
        </div>
      )}
      <div
        className="scrollbar-modern flex-1 overflow-x-auto md:overflow-x-visible"
        style={{ minHeight }}
      >
        <div
          ref={reveal.ref}
          className="h-full min-w-(--chart-min-w) md:min-w-0"
          style={
            { minHeight, "--chart-min-w": minWidth ? `${minWidth}px` : "0px" } as CSSProperties
          }
        >
          <ResponsiveContainer width="100%" height="100%" minHeight={minHeight}>
            <ComposedChart
              data={data}
              margin={{ top: 12, right: 0, bottom: 0, left: 0 }}
              onClick={detail.onChartClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={D.gridColor} vertical={false} />
              <XAxis
                dataKey={xKey}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={8}
                tickMargin={8}
              />
              <YAxis
                yAxisId={LEFT}
                domain={barTicks.domain}
                ticks={barTicks.ticks}
                tickFormatter={barTickFormatter}
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={barAxisWidth}
              />
              {lines.length > 0 && (
                <YAxis
                  yAxisId={RIGHT}
                  orientation="right"
                  domain={lineTicks.domain}
                  ticks={lineTicks.ticks}
                  tickFormatter={lineTickFormatter}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                />
              )}
              <Tooltip
                content={
                  detail.isMobile ? (
                    () => null
                  ) : (
                    <ChartTooltip
                      labels={labels}
                      formats={formats}
                      labelFormatter={labelFormatter}
                    />
                  )
                }
                cursor={{ fill: D.gridColor, opacity: 0.6 }}
              />
              {reveal.show &&
                bars.map((s) => (
                  <Bar
                    key={s.key}
                    yAxisId={LEFT}
                    dataKey={s.key}
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={bars.length === 1 ? D.barSize.single : D.barSize.grouped}
                    isAnimationActive={reveal.animate}
                    animationDuration={D.animation.duration}
                    animationEasing={D.animation.easing}
                  >
                    {dimKey &&
                      data.map((row, i) => (
                        <Cell key={i} fillOpacity={row[dimKey] ? D.dimOpacity : 1} />
                      ))}
                  </Bar>
                ))}
              {lines.length > 0 && lineReference !== undefined && (
                <ReferenceLine
                  yAxisId={RIGHT}
                  y={lineReference}
                  stroke={D.axisColor}
                  strokeDasharray="4 4"
                  ifOverflow="extendDomain"
                />
              )}
              {reveal.show &&
                lines.map((s) => (
                  <Line
                    key={s.key}
                    yAxisId={RIGHT}
                    type="monotone"
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2.5}
                    connectNulls
                    dot={{ r: 3.5, strokeWidth: 2, stroke: D.surfaceColor, fill: s.color }}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: D.surfaceColor }}
                    isAnimationActive={reveal.animate}
                    animationBegin={D.animation.lineDelay}
                    animationDuration={D.animation.duration}
                    animationEasing={D.animation.easing}
                  />
                ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {detail.sheet}
    </div>
  );
}
