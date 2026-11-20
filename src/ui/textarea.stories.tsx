import type { Meta, StoryObj } from "@storybook/react-vite";

import { Label } from "./label.js";
import { Textarea } from "./textarea.js";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    docs: { importPath: 'import { Textarea } from "@mono/ui";' },
  },
  args: { placeholder: "Tulis catatan shift", className: "max-w-md" },
  argTypes: {
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    rows: { control: "number" },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid max-w-md gap-2">
      <Label htmlFor="shift-note">Catatan shift</Label>
      <Textarea {...args} id="shift-note" className={undefined} />
      <p className="text-sm text-muted-foreground">Maksimal 500 karakter.</p>
    </div>
  ),
};

/** The field grows with its content; type more lines to see it expand. */
export const AutoGrow: Story = {
  args: {
    defaultValue:
      "Unit HD-785-07 berhenti 40 menit karena antre fuel.\nJalan hauling km 3 licin setelah hujan.\nKontraktor sudah diinformasikan.",
  },
};

/** `aria-invalid` switches to the error style. */
export const Invalid: Story = {
  args: { "aria-invalid": true },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Laporan sudah dikunci oleh supervisor." },
};
