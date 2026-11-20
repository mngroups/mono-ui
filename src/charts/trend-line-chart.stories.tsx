import type { Meta, StoryObj } from "@storybook/react-vite";

import { mobileStory } from "../../.storybook/docs/mobile";
import { TrendLineChart } from "./trend-line-chart.js";

const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum"];
const DAY_NAMES: Record<string, string> = {
  Sen: "Senin",
  Sel: "Selasa",
  Rab: "Rabu",
  Kam: "Kamis",
  Jum: "Jumat",
};

const PRODUCTION = DAYS.map((day, i) => ({
  day,
  plan: 1200 + i * 50,
  actual: 1120 + i * 75,
}));

const FUEL_RATIO = [
  { week: "M1", siteA: 1.42, siteB: 1.31 },
  { week: "M2", siteA: 1.38, siteB: 1.35 },
  { week: "M3", siteA: 1.29, siteB: 1.4 },
  { week: "M4", siteA: 1.33, siteB: 1.27 },
];

const MONTHLY = Array.from({ length: 30 }, (_, i) => ({
  date: String(i + 1),
  actual: Math.round(1150 + Math.sin(i / 3) * 120 + i * 4),
}));

const ton = (value: number) => `${value.toLocaleString("id-ID")} ton`;
const ratio = (value: number) => `${value.toLocaleString("id-ID")} L/ton`;

const meta = {
  title: "Components/TrendLineChart",
  component: TrendLineChart,
  parameters: {
    docs: {
      importPath: 'import { TrendLineChart } from "@mono/ui/charts";',
      description: {
        component: `Line chart for a trend over time (days, weeks, months), built on Recharts. Pass the rows as \`data\`, the x-axis field as \`xKey\` and one entry per line in \`series\`. The y-axis gets "nice" ticks automatically, dashed \`referenceLines\` mark targets, and the lines draw in the first time the chart scrolls into view. Dots show up to 13 points per line and value labels up to 6. On mobile, tapping a point opens a detail sheet instead of a hover tooltip.

### Helpers

The same entry point exports the building blocks the charts use, for custom Recharts charts that should look the same:

- \`buildNiceTicks(values, { min?, max? })\` returns \`{ domain, ticks }\` with round steps (1, 2, 2.5, 5, 10 × 10ⁿ, at most 6 ticks).
- \`buildStepTicks(values, { step, minMax })\` returns fixed-step ticks from 0 that reach at least \`minMax\` (e.g. 0/50/100/150%).
- \`TREND_CHART_DEFAULTS\` holds the shared sizes, colours, dot/label limits and animation timing; \`AXIS_TICK\` is the axis tick style.
- \`useChartReveal()\` returns \`{ ref, show, animate }\`: attach \`ref\` to the chart wrapper and render the series only when \`show\` is true, so the draw-in plays where the user sees it (and is skipped with reduced motion).`,
      },
    },
  },
  args: {
    data: PRODUCTION,
    xKey: "day",
    series: [
      { key: "plan", label: "Plan", color: "#94a3b8" },
      { key: "actual", label: "Aktual", color: "#0097b2" },
    ],
    valueFormatter: ton,
    yTickFormatter: (value: number) => value.toLocaleString("id-ID"),
    labelFormatter: (label: string) => DAY_NAMES[label] ?? label,
  },
  argTypes: {
    showLegend: { control: "boolean" },
    minHeight: { control: "number" },
    yMin: { control: "number" },
    yMax: { control: "number" },
  },
} satisfies Meta<typeof TrendLineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Dashed reference lines mark fixed targets; they also appear in the legend and the tooltip. */
export const WithReferenceLine: Story = {
  args: {
    data: FUEL_RATIO,
    xKey: "week",
    series: [
      { key: "siteA", label: "Site A", color: "#0097b2" },
      { key: "siteB", label: "Site B", color: "#f59e0b" },
    ],
    referenceLines: [{ value: 1.35, label: "Target fuel ratio", color: "#ef4444" }],
    valueFormatter: ratio,
    yTickFormatter: (value: number) => value.toLocaleString("id-ID"),
    labelFormatter: (label: string) => `Minggu ${label.slice(1)}`,
  },
};

/** With many points the dots and value labels are hidden so the line stays readable. */
export const ManyPoints: Story = {
  args: {
    data: MONTHLY,
    xKey: "date",
    series: [{ key: "actual", label: "Produksi harian", color: "#0097b2" }],
    labelFormatter: (label: string) => `${label} November`,
  },
};

/** `yMin` / `yMax` lock the axis instead of fitting it to the data. */
export const FixedAxis: Story = {
  args: { yMin: 0, yMax: 2000 },
};

/** Hide the legend when the card title already names the single series. */
export const WithoutLegend: Story = {
  args: {
    series: [{ key: "actual", label: "Aktual", color: "#0097b2" }],
    showLegend: false,
  },
};

/** On a phone the hover tooltip is off; tap a point to open the detail sheet. */
export const Mobile: Story = {
  ...mobileStory,
};
