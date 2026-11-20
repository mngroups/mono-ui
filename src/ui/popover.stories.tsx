import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info } from "lucide-react";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    docs: {
      importPath: 'import { Popover, PopoverTrigger, PopoverContent } from "@mono/ui";',
    },
  },
  args: { modal: false },
  argTypes: {
    open: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    modal: { control: "boolean" },
  },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Info /> Info target
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <p className="text-sm font-semibold">Target produksi</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Target harian Pit Utara adalah 1.500 ton. Realisasi hari ini 1.240 ton (83%).
        </p>
      </PopoverContent>
    </Popover>
  ),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Rendered open with `defaultOpen`. */
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 240 } } },
};

/** `align` and `sideOffset` on `PopoverContent` position the panel against the trigger. */
export const Alignment: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align} {...args}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="capitalize">
              {align}
            </Button>
          </PopoverTrigger>
          <PopoverContent align={align} sideOffset={8} className="w-56 p-3 text-sm">
            Rata {align} terhadap tombol.
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

/** A small form in the panel, e.g. to set a fuel threshold without leaving the table. */
export const WithForm: Story = {
  args: { defaultOpen: true },
  parameters: { docs: { story: { inline: false, iframeHeight: 300 } } },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Atur batas fuel</Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-72 gap-3 p-4">
        <div className="grid gap-2">
          <Label htmlFor="batas-fuel">Batas harian per unit (L)</Label>
          <Input id="batas-fuel" type="number" defaultValue={450} />
        </div>
        <Button size="sm" className="justify-self-end">
          Simpan
        </Button>
      </PopoverContent>
    </Popover>
  ),
};

/** Below `md`, tapping the trigger opens the content in a `BottomSheet` instead. */
export const Mobile: Story = {
  ...mobileStory,
};
