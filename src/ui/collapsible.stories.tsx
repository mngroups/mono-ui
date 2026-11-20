import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Button } from "./button.js";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible.js";

const meta = {
  title: "Components/Collapsible",
  component: Collapsible,
  parameters: {
    docs: {
      importPath: 'import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@mono/ui";',
    },
  },
  args: { defaultOpen: false, disabled: false },
  render: (args) => (
    <Collapsible {...args} className="w-80 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Rincian fuel Site Tabang</p>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronDown /> Detail
          </Button>
        </CollapsibleTrigger>
      </div>
      <div className="rounded-lg border px-4 py-2 text-sm">Total: 2.640 L</div>
      <CollapsibleContent className="space-y-2">
        <div className="rounded-lg border px-4 py-2 text-sm">Shift 1: 1.420 L</div>
        <div className="rounded-lg border px-4 py-2 text-sm">Shift 2: 1.220 L</div>
      </CollapsibleContent>
    </Collapsible>
  ),
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `defaultOpen` starts it expanded (uncontrolled). */
export const OpenByDefault: Story = {
  args: { defaultOpen: true },
};

/** Controlled with `open` + `onOpenChange`; the chevron follows the state. */
export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <Collapsible {...args} open={open} onOpenChange={setOpen} className="w-80 rounded-xl border">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            Filter lanjutan
            <ChevronDown
              className={open ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 px-4 pb-3 text-sm text-muted-foreground">
          <p>Kontraktor: semua</p>
          <p>Jenis unit: Dump truck</p>
          <p>Periode: Oktober 2026</p>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
