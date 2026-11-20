import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fuel, MapPin, Truck } from "lucide-react";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    docs: {
      importPath: 'import { Tabs, TabsList, TabsTrigger, TabsContent } from "@mono/ui";',
    },
  },
  args: { defaultValue: "fuel" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
  render: (args) => (
    <Tabs {...args} className="max-w-md">
      <TabsList>
        <TabsTrigger value="fuel">Fuel</TabsTrigger>
        <TabsTrigger value="boundary">Boundary</TabsTrigger>
        <TabsTrigger value="unit">Unit</TabsTrigger>
      </TabsList>
      <TabsContent value="fuel" className="text-sm text-foreground/70">
        Konsumsi fuel hari ini: 12.480 L di 4 site.
      </TabsContent>
      <TabsContent value="boundary" className="text-sm text-foreground/70">
        3 unit keluar boundary dalam 24 jam terakhir.
      </TabsContent>
      <TabsContent value="unit" className="text-sm text-foreground/70">
        86 unit aktif, 7 unit dalam perawatan.
      </TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `variant="line"` on `TabsList` swaps the pill track for an underline. */
export const Line: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="line">
        <TabsTrigger value="fuel">Fuel</TabsTrigger>
        <TabsTrigger value="boundary">Boundary</TabsTrigger>
        <TabsTrigger value="unit">Unit</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

/** Icons inside a trigger are sized automatically. */
export const WithIcons: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="fuel">
          <Fuel /> Fuel
        </TabsTrigger>
        <TabsTrigger value="boundary">
          <MapPin /> Boundary
        </TabsTrigger>
        <TabsTrigger value="unit">
          <Truck /> Unit
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <Tabs {...args} className="max-w-lg">
      <TabsList>
        <TabsTrigger value="fuel">Fuel</TabsTrigger>
        <TabsTrigger value="boundary">Boundary</TabsTrigger>
        <TabsTrigger value="unit">Unit</TabsTrigger>
      </TabsList>
      <TabsContent value="fuel" className="text-sm text-foreground/70">
        Konsumsi fuel per site dan kontraktor.
      </TabsContent>
      <TabsContent value="boundary" className="text-sm text-foreground/70">
        Riwayat pelanggaran boundary.
      </TabsContent>
      <TabsContent value="unit" className="text-sm text-foreground/70">
        Status unit per site.
      </TabsContent>
    </Tabs>
  ),
};

export const DisabledTab: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList>
        <TabsTrigger value="fuel">Fuel</TabsTrigger>
        <TabsTrigger value="boundary">Boundary</TabsTrigger>
        <TabsTrigger value="laporan" disabled>
          Laporan
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

/** Controlled: keep the selected tab in your own state with `value` / `onValueChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [tab, setTab] = useState("fuel");
    return (
      <div className="space-y-3">
        <Tabs {...args} value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="fuel">Fuel</TabsTrigger>
            <TabsTrigger value="boundary">Boundary</TabsTrigger>
            <TabsTrigger value="unit">Unit</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-foreground/60">
          Tab aktif: <span className="font-semibold text-foreground">{tab}</span>
        </p>
      </div>
    );
  },
};
