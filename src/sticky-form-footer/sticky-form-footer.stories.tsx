import type { Meta, StoryObj } from "@storybook/react-vite";

import { mobileStory } from "../../.storybook/docs/mobile";
import { UiConfigProvider } from "../config/ui-config.js";
import { Button } from "../ui/button.js";
import { StickyFormFooter } from "./sticky-form-footer.js";

const meta = {
  title: "Components/StickyFormFooter",
  component: StickyFormFooter,
  parameters: {
    docs: { importPath: 'import { StickyFormFooter } from "@mono/ui";' },
  },
  args: {
    className: "flex justify-end gap-2",
    surface: "page",
    mobileNavV2: true,
    children: [
      <Button key="batal" variant="outline">
        Batal
      </Button>,
      <Button key="simpan">Simpan</Button>,
    ],
  },
  argTypes: {
    surface: { control: "select", options: ["page", "sheet", "modal"] },
    mobileNavV2: { control: "boolean" },
    children: { table: { disable: true } },
  },
} satisfies Meta<typeof StickyFormFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** On desktop the row is exactly `className`; the pinned style only applies below `md`. */
export const Default: Story = {};

/** With `mobileNavV2` off it renders a plain `<div className>`, the row it replaced. */
export const LegacyRow: Story = {
  args: { mobileNavV2: false },
};

/** `UiConfigProvider` can switch `mobileNavV2` for the whole app; the prop still wins. */
export const FromProvider: Story = {
  args: { mobileNavV2: undefined },
  decorators: [
    (Story) => (
      <UiConfigProvider mobileNavV2>
        <Story />
      </UiConfigProvider>
    ),
  ],
};

/**
 * On a phone the row is pinned to the bottom of the page, full-bleed, with the
 * buttons stacked full width and the primary on top.
 */
export const Mobile: Story = {
  ...mobileStory,
  render: (args) => (
    <main className="h-[600px] overflow-y-auto">
      <div className="space-y-3">
        {["Site", "Kontraktor", "Unit", "Volume fuel (L)", "Tonase", "Catatan"].map((field) => (
          <div key={field} className="rounded-xl border border-border px-4 py-3 text-sm">
            {field}
          </div>
        ))}
      </div>
      <StickyFormFooter {...args} />
    </main>
  ),
};
