import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import { TabBar, type TabItem } from "./tab-bar.js";

const ITEMS: TabItem<string>[] = [
  { key: "fuel", label: "Fuel" },
  { key: "boundary", label: "Boundary" },
  { key: "unit", label: "Unit" },
];

const MANY_ITEMS: TabItem<string>[] = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "fuel", label: "Fuel" },
  { key: "boundary", label: "Boundary" },
  { key: "unit", label: "Unit" },
  { key: "kontraktor", label: "Kontraktor" },
  { key: "produksi", label: "Produksi (ton)" },
  { key: "akses", label: "Akses Pengguna" },
];

const meta = {
  title: "Components/TabBar",
  component: TabBar,
  parameters: {
    docs: { importPath: 'import { TabBar, type TabItem } from "@mono/ui";' },
  },
  args: {
    items: ITEMS,
    active: "fuel",
    onChange: fn(),
    "aria-label": "Kategori data",
  },
  argTypes: {
    bleed: { control: "boolean" },
  },
  render: function Render(args) {
    const [active, setActive] = useState(args.active);
    return (
      <TabBar
        {...args}
        active={active}
        onChange={(key) => {
          setActive(key);
          args.onChange(key);
        }}
      />
    );
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The bar only renders the tabs; swap your own content on `active`. */
export const WithContent: Story = {
  render: function Render(args) {
    const [active, setActive] = useState("fuel");
    const content: Record<string, string> = {
      fuel: "Konsumsi fuel hari ini: 12.480 L di 4 site.",
      boundary: "3 unit keluar boundary dalam 24 jam terakhir.",
      unit: "86 unit aktif, 7 unit dalam perawatan.",
    };
    return (
      <div className="space-y-4">
        <TabBar {...args} active={active} onChange={setActive} />
        <p className="text-sm text-foreground/70">{content[active]}</p>
      </div>
    );
  },
};

/** Too many tabs for the width: the list scrolls sideways and keeps the active tab in view. */
export const Overflow: Story = {
  args: { items: MANY_ITEMS, active: "kontraktor" },
  render: function Render(args) {
    const [active, setActive] = useState(args.active);
    return (
      <div className="max-w-sm">
        <TabBar {...args} active={active} onChange={setActive} />
      </div>
    );
  },
};

/** `className="border-b-0"` drops the underline, e.g. inside a card that has its own border. */
export const WithoutBorder: Story = {
  args: { className: "border-b-0" },
};

/** On a phone, `bleed` lets the bar scroll edge to edge past the page gutter. */
export const Mobile: Story = {
  ...mobileStory,
  args: { items: MANY_ITEMS, active: "fuel", bleed: true },
};
