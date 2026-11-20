import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Checkbox } from "./checkbox.js";
import { Label } from "./label.js";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    docs: { importPath: 'import { Checkbox } from "@mono/ui";' },
  },
  args: { "aria-label": "Setujui laporan" },
  argTypes: {
    checked: { control: "select", options: [true, false, "indeterminate"] },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox {...args} id="agree" />
      <Label htmlFor="agree">Data fuel sudah dicek supervisor</Label>
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Checkbox {...args} id="state-off" />
        <Label htmlFor="state-off">Belum dipilih</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} id="state-on" defaultChecked />
        <Label htmlFor="state-on">Dipilih</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} id="state-disabled" disabled defaultChecked />
        <Label htmlFor="state-disabled">Nonaktif</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox {...args} id="state-invalid" aria-invalid />
        <Label htmlFor="state-invalid">Wajib dicentang</Label>
      </div>
    </div>
  ),
};

const sites = ["Site Batu Hijau", "Site Sangatta", "Site Kideco"];

/** A "select all" checkbox uses `"indeterminate"` when only some items are checked. */
export const SelectAll: Story = {
  render: function Render(args) {
    const [selected, setSelected] = useState<string[]>([sites[0] as string]);
    const all = selected.length === sites.length;
    const some = selected.length > 0 && !all;
    return (
      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            {...args}
            id="all-sites"
            checked={all ? true : some ? "indeterminate" : false}
            onCheckedChange={(value) => setSelected(value === true ? sites : [])}
          />
          <Label htmlFor="all-sites" className="font-medium">
            Semua site
          </Label>
        </div>
        {sites.map((site) => (
          <div key={site} className="flex items-center gap-2 pl-6">
            <Checkbox
              {...args}
              id={site}
              checked={selected.includes(site)}
              onCheckedChange={(value) =>
                setSelected((prev) =>
                  value === true ? [...prev, site] : prev.filter((s) => s !== site)
                )
              }
            />
            <Label htmlFor={site}>{site}</Label>
          </div>
        ))}
      </div>
    );
  },
};
