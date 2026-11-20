import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { TipeOptionGroup } from "./tipe-option.js";

const meta = {
  title: "Components/TipeOptionGroup",
  component: TipeOptionGroup,
  parameters: {
    docs: { importPath: 'import { TipeOptionGroup, type TipeOptionItem } from "@mono/ui";' },
  },
  args: {
    "aria-label": "Level laporan",
    value: "site",
    onChange: fn(),
    options: [
      { value: "root", label: "Level root", desc: "Rekap semua site" },
      { value: "site", label: "Level site", desc: "Satu site, semua kontraktor" },
      { value: "kontraktor", label: "Level kontraktor", desc: "Satu kontraktor di satu site" },
    ],
    className: "max-w-md",
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return (
      <TipeOptionGroup
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next);
          args.onChange(next);
        }}
      />
    );
  },
} satisfies Meta<typeof TipeOptionGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `disabled` greys a card out; `badge` adds a small pill, e.g. for a coming feature. */
export const DisabledWithBadge: Story = {
  args: {
    options: [
      { value: "root", label: "Level root", desc: "Rekap semua site" },
      { value: "site", label: "Level site" },
      { value: "kontraktor", label: "Level kontraktor", disabled: true, badge: "Segera" },
    ],
  },
};

/** `value: null` starts with nothing selected, e.g. a required choice in a form. */
export const NothingSelected: Story = {
  args: { value: null },
};

/** Lay the cards out with `className`, e.g. a two-column grid. */
export const Grid: Story = {
  args: {
    "aria-label": "Jenis unit",
    value: "dt",
    className: "grid max-w-xl grid-cols-2 gap-3",
    options: [
      { value: "dt", label: "Dump truck", desc: "HD-785, HD-465" },
      { value: "ex", label: "Excavator", desc: "PC-2000, PC-1250" },
      { value: "dz", label: "Dozer", desc: "D375A, D155A" },
      { value: "gd", label: "Grader", desc: "GD-825" },
    ],
  },
};
