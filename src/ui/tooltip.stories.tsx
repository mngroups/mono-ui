import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fuel, Info, Pencil, Trash2 } from "lucide-react";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Button } from "./button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip.js";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      importPath:
        'import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@mono/ui";',
    },
  },
  args: { disableMobile: false },
  argTypes: {
    open: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    delayDuration: { control: "number" },
    disableMobile: { control: "boolean" },
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Info fuel">
          <Fuel />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Total fuel hari ini: 8.420 L</TooltipContent>
    </Tooltip>
  ),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Rendered open with `defaultOpen`. */
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 160 } } },
};

/** `side` on `TooltipContent` places it; `showArrow={false}` drops the pointer. */
export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3 py-10">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} {...args}>
          <TooltipTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side} showArrow={side !== "left"}>
            {side === "left" ? "Tanpa panah" : `Tooltip di ${side}`}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

/**
 * Label icon-only row actions. Each `Tooltip` brings its own provider;
 * wrap a group in `TooltipProvider` to share the open delay.
 */
export const IconActions: Story = {
  render: (args) => (
    <TooltipProvider delayDuration={300}>
      <div className="flex gap-1">
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Detail">
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Detail unit</TooltipContent>
        </Tooltip>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Ubah">
              <Pencil />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Ubah data fuel</TooltipContent>
        </Tooltip>
        <Tooltip {...args}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Hapus">
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hapus</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

/** Mobile has no hover: a tap on the trigger opens the content in a `BottomSheet`. */
export const Mobile: Story = {
  ...mobileStory,
};
