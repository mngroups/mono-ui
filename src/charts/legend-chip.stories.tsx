import type { Meta, StoryObj } from "@storybook/react-vite";

import { LegendChip } from "./legend-chip.js";

const meta = {
  title: "Components/LegendChip",
  component: LegendChip,
  parameters: {
    docs: { importPath: 'import { LegendChip } from "@mono/ui/charts";' },
  },
  args: { color: "#0097b2", label: "Aktual" },
  argTypes: {
    color: { control: "color" },
    shape: { control: "select", options: ["line", "dashed", "square"] },
    opacity: { control: { type: "range", min: 0, max: 1, step: 0.1 } },
  },
} satisfies Meta<typeof LegendChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `line` for line series, `dashed` for reference lines, `square` for bars. */
export const Shapes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <LegendChip {...args} shape="line" label="Aktual" />
      <LegendChip {...args} shape="dashed" color="#ef4444" label="Target" />
      <LegendChip {...args} shape="square" color="#94a3b8" label="Plan" />
    </div>
  ),
};

/** Lower `opacity` matches faded bars, e.g. a month still in progress. */
export const Faded: Story = {
  args: { shape: "square", label: "Bulan berjalan", opacity: 0.4 },
};

/** A custom chart legend: one chip per series in a wrapping row. */
export const LegendRow: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <LegendChip color="#cbd5e1" label="Plan" shape="square" />
      <LegendChip color="#0097b2" label="Aktual" shape="square" />
      <LegendChip color="#f59e0b" label="Pencapaian" />
      <LegendChip color="#ef4444" label="Target 100%" shape="dashed" />
    </div>
  ),
};
