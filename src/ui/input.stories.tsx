import type { Meta, StoryObj } from "@storybook/react-vite";
import { Search } from "lucide-react";

import { Input } from "./input.js";
import { Label } from "./label.js";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    docs: { importPath: 'import { Input } from "@mono/ui";' },
  },
  args: { placeholder: "Cari data", className: "max-w-sm" },
  argTypes: {
    type: { control: "select", options: ["text", "number", "email", "password", "search", "file"] },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Pair it with a `Label` through `htmlFor` / `id`. */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="unit-number">Nomor unit</Label>
      <Input {...args} id="unit-number" placeholder="Contoh: HD-785-07" className={undefined} />
    </div>
  ),
};

export const Types: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-3">
      <Input {...args} type="number" placeholder="Volume fuel (liter)" className={undefined} />
      <Input {...args} type="email" placeholder="email@kontraktor.co.id" className={undefined} />
      <Input {...args} type="password" placeholder="Kata sandi" className={undefined} />
      <Input {...args} type="file" className={undefined} />
    </div>
  ),
};

/** A leading icon is positioned by the caller; add left padding to the input. */
export const WithIcon: Story = {
  render: (args) => (
    <div className="relative max-w-sm">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input {...args} className="pl-9" placeholder="Cari site atau kontraktor" />
    </div>
  ),
};

/** `aria-invalid` switches to the error style (done for you inside `FormControl`). */
export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "-120" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Site Batu Hijau" },
};

/** `default` (48px) matches the `Floating*` fields; `sm` (36px) is for dense toolbars and tables. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex max-w-sm flex-col gap-3">
      <Input {...args} placeholder="Default (48px)" aria-label="Default" />
      <Input {...args} size="sm" placeholder="Small (36px)" aria-label="Small" />
    </div>
  ),
};
