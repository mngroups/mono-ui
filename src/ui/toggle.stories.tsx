import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Filter, Fuel, Italic, Truck, Underline } from "lucide-react";
import { useState } from "react";

import { Toggle } from "./toggle.js";

const meta = {
  title: "Components/Toggle",
  component: Toggle,
  parameters: {
    docs: { importPath: 'import { Toggle } from "@mono/ui";' },
  },
  args: { children: "Hanya aktif", "aria-label": "Hanya unit aktif" },
  argTypes: {
    variant: { control: "select", options: ["default", "outline"] },
    size: { control: "select", options: ["default", "sm", "lg"] },
    pressed: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle {...args} aria-label="Filter default">
        <Filter /> Default
      </Toggle>
      <Toggle {...args} variant="outline" aria-label="Filter outline">
        <Filter /> Outline
      </Toggle>
    </div>
  ),
};

export const Sizes: Story = {
  args: { variant: "outline" },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Toggle {...args} size="sm" aria-label="Fuel kecil">
        <Fuel />
      </Toggle>
      <Toggle {...args} aria-label="Fuel default">
        <Fuel />
      </Toggle>
      <Toggle {...args} size="lg" aria-label="Fuel besar">
        <Fuel />
      </Toggle>
    </div>
  ),
};

/** Controlled with `pressed` + `onPressedChange`, e.g. to filter a list. */
export const Controlled: Story = {
  args: { variant: "outline" },
  render: function Render(args) {
    const [pressed, setPressed] = useState(true);
    return (
      <div className="flex items-center gap-3 text-sm">
        <Toggle
          {...args}
          pressed={pressed}
          onPressedChange={setPressed}
          aria-label="Hanya unit aktif"
        >
          <Truck /> Hanya unit aktif
        </Toggle>
        <span className="text-muted-foreground">
          {pressed ? "Menampilkan 42 unit aktif" : "Menampilkan semua 57 unit"}
        </span>
      </div>
    );
  },
};

/** Several independent toggles side by side, like a formatting toolbar. */
export const Toolbar: Story = {
  args: { size: "sm" },
  render: (args) => (
    <div className="flex w-fit items-center gap-1 rounded-md border p-1">
      <Toggle {...args} aria-label="Tebal" defaultPressed>
        <Bold />
      </Toggle>
      <Toggle {...args} aria-label="Miring">
        <Italic />
      </Toggle>
      <Toggle {...args} aria-label="Garis bawah">
        <Underline />
      </Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, variant: "outline" },
};
