import type { Meta, StoryObj } from "@storybook/react-vite";

import { ChartTooltip } from "./chart-tooltip.js";

const LABELS = new Map([
  ["plan", "Plan"],
  ["actual", "Aktual"],
  ["target", "Target"],
]);
const ton = (value: number) => `${value.toLocaleString("id-ID")} ton`;
const FORMATS = new Map([
  ["plan", ton],
  ["actual", ton],
  ["target", ton],
]);

const meta = {
  title: "Components/ChartTooltip",
  component: ChartTooltip,
  parameters: {
    docs: { importPath: 'import { ChartTooltip } from "@mono/ui/charts";' },
  },
  args: {
    active: true,
    label: "Sen",
    payload: [
      { dataKey: "plan", value: 1200, color: "#94a3b8" },
      { dataKey: "actual", value: 1120, color: "#0097b2" },
    ],
    labels: LABELS,
    formats: FORMATS,
  },
  argTypes: {
    active: { control: "boolean" },
    label: { control: "text" },
  },
} satisfies Meta<typeof ChartTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `extras` appends fixed rows, e.g. a reference line's value, to every tooltip. */
export const WithExtras: Story = {
  args: { extras: [{ dataKey: "target", value: 1250, color: "#ef4444" }] },
};

/** `labelFormatter` turns a short axis label into the full title. */
export const LabelFormatter: Story = {
  args: { label: "Nov", labelFormatter: (label: string) => `${label}ember 2026` },
};

/** Rows with a `null` value are skipped; with none left the tooltip renders nothing. */
export const MissingValues: Story = {
  args: {
    payload: [
      { dataKey: "plan", value: 1200, color: "#94a3b8" },
      { dataKey: "actual", value: null, color: "#0097b2" },
    ],
  },
};
