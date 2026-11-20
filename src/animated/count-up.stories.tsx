import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../ui/button.js";
import { CountUp } from "./count-up.js";
import { GrowFill } from "./grow-fill.js";

const meta = {
  title: "Components/CountUp",
  component: CountUp,
  parameters: {
    docs: { importPath: 'import { CountUp } from "@mono/ui";' },
  },
  args: { value: "12.480 ton" },
  render: (args) => (
    <p className="text-3xl font-bold">
      <CountUp {...args} />
    </p>
  ),
} satisfies Meta<typeof CountUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Grouping, decimals, prefix and suffix are kept; non-numeric text ("—") renders as-is. */
export const Formats: Story = {
  render: () => (
    <dl className="grid max-w-md grid-cols-2 gap-4">
      {[
        ["Produksi", "2.912.340,10 ton"],
        ["Fuel ratio", "1,85 L/ton"],
        ["Perubahan", "+4,5%"],
        ["Unit aktif", "128"],
        ["Belum ada data", "—"],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="text-xl font-bold">
            <CountUp value={value} />
          </dd>
        </div>
      ))}
    </dl>
  ),
};

/** A new `value` counts from the previous one, not from 0. */
export const ValueChange: Story = {
  render: function Render() {
    const values = ["9.875 ton", "12.480 ton", "15.300 ton"];
    const [index, setIndex] = useState(0);
    return (
      <div className="space-y-3">
        <p className="text-3xl font-bold">
          <CountUp value={values[index]} />
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIndex((i) => (i + 1) % values.length)}
        >
          Ganti periode
        </Button>
      </div>
    );
  },
};

/** KPI tile: the number counts up while a `GrowFill` bar draws in. */
export const KpiTile: Story = {
  render: () => (
    <div className="w-72 rounded-xl border p-4">
      <p className="text-sm text-muted-foreground">Produksi vs target, Site Sangatta</p>
      <p className="mt-1 text-2xl font-bold">
        <CountUp value="12.480" /> <span className="text-base font-normal">ton</span>
      </p>
      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-muted">
        <GrowFill pct={83} className="absolute inset-y-0 left-0 rounded-full bg-primary" />
      </div>
      <p className="mt-1 text-xs text-muted-foreground">83% dari 15.000 ton</p>
    </div>
  ),
};
