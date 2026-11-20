import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";
import { Input } from "./input.js";
import { Label } from "./label.js";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet.js";

/** Open stories render in their own frame so the overlay doesn't cover the docs page. */
const inFrame = { docs: { story: { inline: false, iframeHeight: 520 } } };

const FilterBody = () => (
  <div className="grid gap-4 px-4">
    <div className="grid gap-2">
      <Label htmlFor="sheet-site">Site</Label>
      <Input id="sheet-site" defaultValue="Pit Utara" />
    </div>
    <div className="grid gap-2">
      <Label htmlFor="sheet-kontraktor">Kontraktor</Label>
      <Input id="sheet-kontraktor" placeholder="Semua kontraktor" />
    </div>
  </div>
);

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  parameters: {
    docs: {
      importPath:
        'import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@mono/ui";',
    },
  },
  args: { modal: true },
  argTypes: {
    open: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    modal: { control: "boolean" },
  },
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Filter</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter laporan</SheetTitle>
          <SheetDescription>Saring data produksi berdasarkan site dan kontraktor.</SheetDescription>
        </SheetHeader>
        <FilterBody />
        <SheetFooter>
          <SheetClose asChild>
            <Button>Terapkan</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="outline">Batal</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Rendered open with `defaultOpen`. */
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: inFrame,
};

/** `side` on `SheetContent` picks the edge: `right` (default), `left`, `top` or `bottom`. */
export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {(["right", "left", "top", "bottom"] as const).map((side) => (
        <Sheet key={side} {...args}>
          <SheetTrigger asChild>
            <Button variant="outline" className="capitalize">
              {side}
            </Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>Ringkasan shift</SheetTitle>
              <SheetDescription>Shift pagi · 1.240 ton · 18 unit aktif</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
};

/** `showCloseButton={false}` hides the corner ×; give the user another way out, like a footer button. */
export const WithoutCloseButton: Story = {
  args: { defaultOpen: true },
  parameters: inFrame,
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Detail unit</Button>
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>DT-102</SheetTitle>
          <SheetDescription>Dump truck · PT Kontraktor Satu</SheetDescription>
        </SheetHeader>
        <dl className="grid grid-cols-2 gap-2 px-4 text-sm">
          <dt className="text-muted-foreground">Fuel hari ini</dt>
          <dd className="text-right tabular-nums">412 L</dd>
          <dt className="text-muted-foreground">Muatan</dt>
          <dd className="text-right tabular-nums">86 ton</dd>
        </dl>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Tutup</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};
