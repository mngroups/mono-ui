import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Button } from "../ui/button.js";
import { GROW, GrowFill } from "./grow-fill.js";

const meta = {
  title: "Components/GrowFill",
  component: GrowFill,
  parameters: {
    docs: {
      importPath: 'import { GrowFill, GROW } from "@mono/ui";',
      description: {
        component:
          "Also exported: `GROW`, the motion transition the bar uses (0.8s, ease-out), for other elements that should animate in step with it.",
      },
    },
  },
  args: { pct: 72, className: "absolute inset-y-0 left-0 rounded-full bg-primary" },
  argTypes: { pct: { control: { type: "range", min: 0, max: 100 } } },
  render: (args) => (
    <div className="relative h-3 w-72 overflow-hidden rounded-full bg-muted">
      <GrowFill {...args} />
    </div>
  ),
} satisfies Meta<typeof GrowFill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const contractors = [
  { name: "PT Bara Jaya", pct: 92 },
  { name: "PT Tambang Nusantara", pct: 74 },
  { name: "PT Mitra Hauling", pct: 51 },
  { name: "CV Karya Alat Berat", pct: 28 },
];

/** Horizontal bar list: colour and position come from `className`. */
export const BarList: Story = {
  render: () => (
    <ul className="w-80 space-y-3">
      {contractors.map((c) => (
        <li key={c.name} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{c.name}</span>
            <span className="text-muted-foreground tabular-nums">{c.pct}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-muted">
            <GrowFill
              pct={c.pct}
              className={`absolute inset-y-0 left-0 rounded-full ${c.pct < 50 ? "bg-amber-500" : "bg-primary"}`}
            />
          </div>
        </li>
      ))}
    </ul>
  ),
};

/** Anchor on the right with `right-0` to grow leftwards. */
export const RightAnchored: Story = {
  args: { pct: 45, className: "absolute inset-y-0 right-0 rounded-full bg-emerald-500" },
};

/** Changing `pct` after the first view animates to the new width. */
export const ValueChange: Story = {
  render: function Render(args) {
    const [pct, setPct] = useState(30);
    return (
      <div className="space-y-3">
        <div className="relative h-3 w-72 overflow-hidden rounded-full bg-muted">
          <GrowFill {...args} pct={pct} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setPct((p) => (p >= 90 ? 30 : p + 30))}>
          Tambah {pct >= 90 ? "(reset)" : "30%"}
        </Button>
        <p className="text-xs text-muted-foreground">Transisi: {GROW.duration}s</p>
      </div>
    );
  },
};
