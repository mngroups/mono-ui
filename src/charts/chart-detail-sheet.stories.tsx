import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { mobileStory } from "../../.storybook/docs/mobile";
import { useChartDetailSheet } from "./chart-detail-sheet.js";
import { ChartTooltip, type TooltipEntry } from "./chart-tooltip.js";
import { AXIS_TICK, TREND_CHART_DEFAULTS } from "./constants.js";

const DATA = [
  { unit: "HD-01", fuel: 412, hours: 18 },
  { unit: "HD-02", fuel: 388, hours: 17 },
  { unit: "EX-01", fuel: 296, hours: 20 },
  { unit: "EX-02", fuel: 341, hours: 19 },
];

const LABELS = new Map([
  ["fuel", "Fuel"],
  ["hours", "Jam operasi"],
  ["limit", "Batas harian"],
]);
const FORMATS = new Map([
  ["fuel", (value: number) => `${value.toLocaleString("id-ID")} L`],
  ["hours", (value: number) => `${value} jam`],
  ["limit", (value: number) => `${value.toLocaleString("id-ID")} L`],
]);
const EXTRAS: readonly TooltipEntry[] = [{ dataKey: "limit", value: 400, color: "#ef4444" }];
const unitTitle = (label: string) => `Unit ${label}`;

/** What Recharts passes to `onClick` when the first unit is tapped. */
const FIRST_UNIT_CLICK = {
  activeLabel: DATA[0].unit,
  activePayload: [
    { dataKey: "fuel", value: DATA[0].fuel, color: "#0097b2" },
    { dataKey: "hours", value: DATA[0].hours, color: "#f59e0b" },
  ],
};

/** A custom Recharts chart wired to `useChartDetailSheet`, like `TrendLineChart` does inside. */
function FuelPerUnitChart({ openFirst = false }: { openFirst?: boolean }) {
  const { isMobile, onChartClick, sheet } = useChartDetailSheet(LABELS, FORMATS, EXTRAS, unitTitle);

  useEffect(() => {
    if (openFirst) onChartClick(FIRST_UNIT_CLICK);
  }, [openFirst, onChartClick]);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        {isMobile
          ? "Ketuk batang untuk melihat detail unit."
          : "Arahkan kursor ke batang untuk melihat detail unit."}
      </p>
      <div style={{ height: TREND_CHART_DEFAULTS.minHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={DATA} onClick={onChartClick}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={TREND_CHART_DEFAULTS.gridColor}
              vertical={false}
            />
            <XAxis dataKey="unit" tick={AXIS_TICK} tickLine={false} axisLine={false} />
            <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={40} />
            <Tooltip
              content={
                isMobile ? (
                  () => null
                ) : (
                  <ChartTooltip
                    labels={LABELS}
                    formats={FORMATS}
                    extras={EXTRAS}
                    labelFormatter={unitTitle}
                  />
                )
              }
            />
            <Bar dataKey="fuel" fill="#0097b2" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="hours" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {sheet}
    </div>
  );
}

const meta = {
  title: "Components/ChartDetailSheet",
  parameters: {
    docs: {
      importPath: 'import { useChartDetailSheet } from "@mono/ui/charts";',
      description: {
        component: `\`useChartDetailSheet(labels, formats, extras?, labelFormatter?)\` gives a chart the mobile replacement for its hover tooltip: tapping a point opens a bottom sheet listing every series value for that x-axis label. It returns \`{ isMobile, onChartClick, sheet }\`: pass \`onChartClick\` to the Recharts chart's \`onClick\`, render \`sheet\` next to the chart, and turn the hover tooltip off while \`isMobile\` is true. On desktop \`onChartClick\` does nothing. \`TrendLineChart\` and \`ComboChart\` already use it; reach for it only in a custom chart.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** On desktop the tooltip shows on hover; switch the viewport to mobile and tap a bar. */
export const Default: Story = {
  render: () => <FuelPerUnitChart />,
};

/** In a phone-sized frame the sheet for the first unit opens straight away. */
export const Mobile: Story = {
  ...mobileStory,
  render: () => <FuelPerUnitChart openFirst />,
};
