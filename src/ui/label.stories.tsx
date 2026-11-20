import type { Meta, StoryObj } from "@storybook/react-vite";

import { Checkbox } from "./checkbox.js";
import { Input } from "./input.js";
import { Label } from "./label.js";

const meta = {
  title: "Components/Label",
  component: Label,
  parameters: {
    docs: { importPath: 'import { Label } from "@mono/ui";' },
  },
  args: { children: "Nama site" },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `htmlFor` links the label to its input, so clicking the label focuses the field. */
export const WithInput: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label {...args} htmlFor="site-name" />
      <Input id="site-name" placeholder="Contoh: Site Sangatta" />
    </div>
  ),
};

/** Placed after a `peer` control, the label dims when that control is disabled. */
export const WithDisabledPeer: Story = {
  render: (args) => (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <Checkbox id="label-active" defaultChecked />
        <Label {...args} htmlFor="label-active">
          Kontraktor aktif
        </Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="label-disabled" disabled />
        <Label {...args} htmlFor="label-disabled">
          Kontraktor nonaktif
        </Label>
      </div>
    </div>
  ),
};

/** Mark required fields in the label text itself. */
export const Required: Story = {
  render: (args) => (
    <Label {...args}>
      Volume fuel <span className="text-destructive">*</span>
    </Label>
  ),
};
