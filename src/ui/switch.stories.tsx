import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "./label.js";
import { Switch } from "./switch.js";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    docs: { importPath: 'import { Switch } from "@mono/ui";' },
  },
  args: { "aria-label": "Aktif" },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Switch {...args} id="auto-refresh" defaultChecked />
      <Label htmlFor="auto-refresh">Perbarui data otomatis</Label>
    </div>
  ),
};

/** Controlled with `checked` + `onCheckedChange`; the change applies right away, no save button. */
export const Controlled: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex max-w-sm items-center justify-between gap-4 rounded-lg border p-4">
        <div className="grid gap-1">
          <Label htmlFor="fuel-alert">Notifikasi fuel menipis</Label>
          <p className="text-sm text-muted-foreground">
            {checked ? "Aktif: kirim saat stok di bawah 20%." : "Nonaktif"}
          </p>
        </div>
        <Switch {...args} id="fuel-alert" checked={checked} onCheckedChange={setChecked} />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Switch {...args} disabled aria-label="Nonaktif mati" />
      <Switch {...args} disabled defaultChecked aria-label="Nonaktif menyala" />
    </div>
  ),
};
