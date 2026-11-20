"use client";

import { formatIndonesianNumber } from "@mono/utils";
import { scaleLinear } from "d3-scale";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { parseChart } from "./chart-parser.js";
import { ChartTooltip } from "./chart-tooltip.js";

const COLORS = ["#3087EF", "#EC5E5E", "#22C55E", "#F59E0B"];

const numberFormat = (value: number) => formatIndonesianNumber(value, { maximumFractionDigits: 2 });

/**
 * Draws a bar, stacked bar, line, area or pie chart from the plain-text chart format (see
 * `parseChart`). Renders nothing when there are no data rows.
 */
export function ChartRenderer({
  raw,
}: {
  /** Chart text: an optional `type: …` line, then `Label | key=value …` or `Label=value` rows. */
  raw: string;
}) {
  const { type, data } = parseChart(raw);
  if (!data.length) return null;

  const keys = Object.keys(data[0]).filter((k) => k !== "name");

  const maxValue = Math.max(...data.flatMap((d) => keys.map((k) => Number(d[k] ?? 0))));

  const yScale = scaleLinear().domain([0, maxValue]).nice();

  const commonXAxis = (
    <XAxis
      dataKey="name"
      tick={{ fontSize: 11, fill: "#94a3b8" }}
      tickLine={false}
      axisLine={false}
    />
  );

  const commonYAxis = (
    <YAxis
      domain={yScale.domain()}
      tickFormatter={(v) => numberFormat(v)}
      tick={{ fontSize: 11, fill: "#94a3b8" }}
      tickLine={false}
      axisLine={false}
      width={48}
    />
  );

  const commonTooltip = <Tooltip content={<ChartTooltip />} />;

  const commonLegend = <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} iconSize={8} />;

  return (
    <div className="my-6 rounded-xl border border-white/10 bg-card p-4 text-sm">
      <div className="h-64">
        {/* ================= BAR / STACKED ================= */}
        {(type === "bar" || type === "bar-stacked") && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%" barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              {commonXAxis}
              {commonYAxis}
              {commonTooltip}
              {commonLegend}

              {keys.map((k, i) => (
                <Bar
                  key={k}
                  dataKey={k}
                  fill={COLORS[i % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  stackId={type === "bar-stacked" ? "stack" : undefined}
                  maxBarSize={32}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* ================= LINE ================= */}
        {type === "line" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              {commonXAxis}
              {commonYAxis}
              {commonTooltip}
              {commonLegend}

              {keys.map((k, i) => (
                <Line
                  key={k}
                  dataKey={k}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* ================= AREA ================= */}
        {type === "area" && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              {commonXAxis}
              {commonYAxis}
              {commonTooltip}
              {commonLegend}

              {keys.map((k, i) => (
                <Area
                  key={k}
                  dataKey={k}
                  fill={COLORS[i % COLORS.length]}
                  stroke={COLORS[i % COLORS.length]}
                  fillOpacity={0.35}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* ================= PIE ================= */}
        {type === "pie" && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {commonTooltip}
              {commonLegend}

              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                innerRadius={40}
                labelLine={false}
                label={({ value, percent }) => {
                  if (typeof value !== "number") return "";
                  const pct =
                    typeof percent === "number"
                      ? `${formatIndonesianNumber(percent * 100, { maximumFractionDigits: 0 })}%`
                      : "";
                  return `${numberFormat(value)} (${pct})`;
                }}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
