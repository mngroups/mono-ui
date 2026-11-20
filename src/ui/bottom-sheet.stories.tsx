import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { BottomSheet } from "./bottom-sheet.js";
import { Button } from "./button.js";

/** Open stories render in their own frame so the overlay doesn't cover the docs page. */
const inFrame = { docs: { story: { inline: false, iframeHeight: 480 } } };

const units = [
  { code: "DT-102", type: "Dump truck", fuel: "412 L" },
  { code: "DT-118", type: "Dump truck", fuel: "389 L" },
  { code: "EX-07", type: "Excavator", fuel: "655 L" },
  { code: "WL-03", type: "Wheel loader", fuel: "214 L" },
  { code: "GR-01", type: "Grader", fuel: "158 L" },
];

const UnitList = ({ rows = units }: { rows?: typeof units }) => (
  <ul className="divide-y">
    {rows.map((u) => (
      <li key={u.code} className="flex items-center justify-between py-3 text-sm">
        <div>
          <p className="font-medium">{u.code}</p>
          <p className="text-muted-foreground">{u.type}</p>
        </div>
        <span className="tabular-nums">{u.fuel}</span>
      </li>
    ))}
  </ul>
);

const meta = {
  title: "Components/BottomSheet",
  component: BottomSheet,
  parameters: {
    docs: { importPath: 'import { BottomSheet } from "@mono/ui";' },
  },
  args: {
    isOpen: false,
    onClose: fn(),
    title: "Pemakaian fuel hari ini",
    maxHeight: "82vh",
    scrollBody: true,
    children: null,
  },
  argTypes: {
    title: { control: "text" },
    maxHeight: { control: "text" },
    scrollBody: { control: "boolean" },
    children: { control: false },
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.isOpen);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Lihat unit</Button>
        <BottomSheet
          {...args}
          isOpen={open}
          onClose={() => {
            setOpen(false);
            args.onClose();
          }}
        >
          <UnitList />
        </BottomSheet>
      </>
    );
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Rendered open. Drag the handle down or tap the overlay to close. */
export const Open: Story = {
  args: { isOpen: true },
  parameters: inFrame,
};

/** Long content scrolls inside the sheet, which stops at `maxHeight`. */
export const LongContent: Story = {
  args: { isOpen: true, maxHeight: "60vh", title: "Semua unit site" },
  parameters: inFrame,
  render: function Render(args) {
    const [open, setOpen] = useState(args.isOpen);
    const many = Array.from({ length: 4 }, (_, i) =>
      units.map((u) => ({ ...u, code: `${u.code}-${i + 1}` }))
    ).flat();
    return (
      <>
        <Button onClick={() => setOpen(true)}>Lihat semua unit</Button>
        <BottomSheet {...args} isOpen={open} onClose={() => setOpen(false)}>
          <UnitList rows={many} />
        </BottomSheet>
      </>
    );
  },
};
