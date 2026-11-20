import type { Meta, StoryObj } from "@storybook/react-vite";

import { Separator } from "./separator.js";

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    docs: { importPath: 'import { Separator } from "@mono/ui";' },
  },
  args: { orientation: "horizontal", decorative: true },
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
  render: (args) => (
    <div
      className={
        args.orientation === "vertical" ? "flex h-6 items-center gap-3 text-sm" : "w-72 space-y-3"
      }
    >
      <span className="text-sm">Produksi</span>
      <Separator {...args} />
      <span className="text-sm">Fuel</span>
    </div>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Vertical needs a parent with a height (it fills `h-full`). */
export const Vertical: Story = {
  args: { orientation: "vertical" },
};

/** Between sections of a card. */
export const InACard: Story = {
  render: (args) => (
    <div className="w-80 rounded-xl border p-4">
      <p className="font-semibold">PT Bara Jaya</p>
      <p className="text-sm text-muted-foreground">Kontraktor hauling, Site Sangatta</p>
      <Separator {...args} className="my-3" />
      <div className="flex h-5 items-center gap-3 text-sm">
        <span>24 unit</span>
        <Separator orientation="vertical" />
        <span>3 shift</span>
        <Separator orientation="vertical" />
        <span>12.480 ton</span>
      </div>
    </div>
  ),
};
