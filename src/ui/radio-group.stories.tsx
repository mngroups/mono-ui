import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Label } from "./label.js";
import { RadioGroup, RadioGroupItem } from "./radio-group.js";

const shifts = [
  { value: "pagi", label: "Shift pagi (06.00 - 18.00)" },
  { value: "malam", label: "Shift malam (18.00 - 06.00)" },
];

const meta = {
  title: "Components/RadioGroup",
  component: RadioGroup,
  parameters: {
    docs: {
      importPath: 'import { RadioGroup, RadioGroupItem } from "@mono/ui";',
    },
  },
  args: { defaultValue: "pagi", "aria-label": "Shift" },
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
  render: (args) => (
    <RadioGroup {...args}>
      {shifts.map((shift) => (
        <div key={shift.value} className="flex items-center gap-2">
          <RadioGroupItem value={shift.value} id={`shift-${shift.value}`} />
          <Label htmlFor={`shift-${shift.value}`}>{shift.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Lay the items out in a row with a flex class; set `orientation` so arrow keys match. */
export const Horizontal: Story = {
  args: { orientation: "horizontal", className: "flex gap-6" },
};

/** Controlled with `value` + `onValueChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("harian");
    return (
      <div className="grid gap-3">
        <RadioGroup {...args} value={value} onValueChange={setValue} aria-label="Periode laporan">
          {[
            { value: "harian", label: "Harian" },
            { value: "mingguan", label: "Mingguan" },
            { value: "bulanan", label: "Bulanan" },
          ].map((period) => (
            <div key={period.value} className="flex items-center gap-2">
              <RadioGroupItem value={period.value} id={`period-${period.value}`} />
              <Label htmlFor={`period-${period.value}`}>{period.label}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-sm text-muted-foreground">Periode terpilih: {value}</p>
      </div>
    );
  },
};

/** Disable one item with its own `disabled`, or the whole group from the group. */
export const DisabledItem: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="hauling" aria-label="Jenis aktivitas">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="hauling" id="act-hauling" />
        <Label htmlFor="act-hauling">Hauling</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="loading" id="act-loading" />
        <Label htmlFor="act-loading">Loading</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="blasting" id="act-blasting" disabled />
        <Label htmlFor="act-blasting">Blasting (butuh izin)</Label>
      </div>
    </RadioGroup>
  ),
};

/** Items can sit inside larger clickable cards; the `Label` wraps the whole card. */
export const Cards: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="solar" aria-label="Jenis fuel" className="max-w-sm">
      {[
        { value: "solar", title: "Solar B35", desc: "Untuk unit hauling dan loader" },
        { value: "pertalite", title: "Pertalite", desc: "Untuk kendaraan ringan" },
      ].map((fuel) => (
        <Label
          key={fuel.value}
          htmlFor={`fuel-${fuel.value}`}
          className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 has-data-[state=checked]:border-primary"
        >
          <RadioGroupItem value={fuel.value} id={`fuel-${fuel.value}`} />
          <span className="grid gap-1">
            <span className="font-medium">{fuel.title}</span>
            <span className="text-muted-foreground">{fuel.desc}</span>
          </span>
        </Label>
      ))}
    </RadioGroup>
  ),
};
