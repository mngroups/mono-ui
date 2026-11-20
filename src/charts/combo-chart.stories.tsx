import type { Meta, StoryObj } from "@storybook/react-vite";

import { mobileStory } from "../../.storybook/docs/mobile";
import { ComboChart } from "./combo-chart.js";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov"];
const MONTH_NAMES: Record<string, string> = {
  Jan: "Januari 2026",
  Feb: "Februari 2026",
  Mar: "Maret 2026",
  Apr: "April 2026",
  Mei: "Mei 2026",
  Jun: "Juni 2026",
  Jul: "Juli 2026",
  Agu: "Agustus 2026",
  Sep: "September 2026",
  Okt: "Oktober 2026",
  Nov: "November 2026",
};

const PRODUCTION = MONTHS.map((month, i) => {
  const plan = 42_000 + i * 1_500;
  const partial = i === MONTHS.length - 1;
  const actual = Math.round(plan * (partial ? 0.55 : 0.82 + ((i * 7) % 5) * 0.07));
  return { month, plan, actual, achievement: Math.round((actual / plan) * 100), partial };
});

const CONTRACTORS = [
  { contractor: "PT Bara", fuel: 182_000 },
  { contractor: "PT Tambang", fuel: 154_500 },
  { contractor: "PT Karya", fuel: 121_300 },
  { contractor: "PT Sinar", fuel: 98_700 },
];

const ton = (value: number) => `${value.toLocaleString("id-ID")} ton`;
const compactTon = (value: number) => `${(value / 1000).toLocaleString("id-ID")}rb`;
const percent = (value: number) => `${value}%`;

const meta = {
  title: "Components/ComboChart",
  component: ComboChart,
  parameters: {
    docs: { importPath: 'import { ComboChart } from "@mono/ui/charts";' },
  },
  args: {
    data: PRODUCTION,
    xKey: "month",
    bars: [
      { key: "plan", label: "Plan", color: "#cbd5e1" },
      { key: "actual", label: "Aktual", color: "#0097b2" },
    ],
    lines: [{ key: "achievement", label: "Pencapaian", color: "#f59e0b" }],
    barFormatter: ton,
    barTickFormatter: compactTon,
    lineFormatter: percent,
    lineScale: { step: 50, minMax: 150 },
    lineReference: 100,
    labelFormatter: (label: string) => MONTH_NAMES[label] ?? label,
  },
  argTypes: {
    showLegend: { control: "boolean" },
    lineReference: { control: "number" },
    minHeight: { control: "number" },
    minWidth: { control: "number" },
    barAxisWidth: { control: "number" },
  },
} satisfies Meta<typeof ComboChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Without `lines` the right axis disappears and it is a plain (grouped) bar chart. */
export const BarsOnly: Story = {
  args: {
    data: CONTRACTORS,
    xKey: "contractor",
    bars: [{ key: "fuel", label: "Fuel (liter)", color: "#0097b2" }],
    lines: undefined,
    lineScale: undefined,
    lineReference: undefined,
    barFormatter: (value: number) => `${value.toLocaleString("id-ID")} L`,
    barTickFormatter: compactTon,
    labelFormatter: undefined,
  },
};

/** `dimKey` fades the bars of rows still in progress; `dimLabel` adds them to the legend. */
export const InProgressMonth: Story = {
  args: { dimKey: "partial", dimLabel: "Bulan berjalan" },
};

/** `legendNote` puts extra content on the right of the legend row. */
export const WithLegendNote: Story = {
  args: {
    legendNote: (
      <span className="text-xs text-muted-foreground">Data November s.d. tanggal 20</span>
    ),
  },
};

/**
 * On a phone the plot scrolls sideways once it is narrower than `minWidth`, and tapping a bar
 * opens the detail sheet instead of a hover tooltip.
 */
export const Mobile: Story = {
  ...mobileStory,
  args: { minWidth: 640 },
};
