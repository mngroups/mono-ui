import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronRight, MapPin, Plus } from "lucide-react";

import { Input } from "./input.js";
import { PlainButton } from "./plain-button.js";

const meta = {
  title: "Components/PlainButton",
  component: PlainButton,
  parameters: {
    docs: { importPath: 'import { PlainButton } from "@mono/ui";' },
  },
  args: {
    type: "button",
    children: "Tombol polos",
    className: "rounded-lg border px-3 py-2 text-sm hover:bg-muted",
  },
  argTypes: {
    type: { control: "select", options: ["button", "submit", "reset"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof PlainButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Without a `className` it renders a bare native button: every style is yours to add. */
export const Unstyled: Story = {
  args: { className: undefined, children: "Tanpa gaya" },
};

/** A full-width list row, a common use where `Button`'s fixed padding and height get in the way. */
export const ListRow: Story = {
  render: (args) => (
    <div className="flex max-w-sm flex-col divide-y rounded-lg border">
      {["Site Batu Hijau", "Site Sangatta", "Site Kideco"].map((site) => (
        <PlainButton
          {...args}
          key={site}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted"
        >
          <span className="flex items-center gap-2">
            <MapPin className="size-4 text-muted-foreground" />
            {site}
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </PlainButton>
      ))}
    </div>
  ),
};

/** Icon-only controls need an `aria-label`. */
export const IconButton: Story = {
  args: {
    "aria-label": "Tambah unit",
    className:
      "grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow",
    children: <Plus className="size-5" />,
  },
};

export const Disabled: Story = {
  args: { disabled: true, className: "rounded-lg border px-3 py-2 text-sm disabled:opacity-50" },
};

/** `type` defaults to `"submit"`, like a native button: inside a form it submits unless you pass `type="button"`. */
export const SubmitInForm: Story = {
  args: { type: undefined, children: "Kirim laporan" },
  render: (args) => (
    <form
      className="flex max-w-sm items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Input aria-label="Nomor unit" defaultValue="HD-785-07" />
      <PlainButton
        {...args}
        className="h-9 shrink-0 rounded-md bg-primary px-4 text-sm text-primary-foreground"
      />
    </form>
  ),
};
