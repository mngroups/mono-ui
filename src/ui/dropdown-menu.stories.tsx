import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "./button.js";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.js";

/** Open stories render in their own frame: an open menu blocks the page behind it. */
const inFrame = (iframeHeight: number) => ({
  docs: { story: { inline: false, iframeHeight } },
});

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    docs: {
      importPath:
        'import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@mono/ui";',
    },
  },
  args: { modal: true },
  argTypes: {
    open: { control: "boolean" },
    defaultOpen: { control: "boolean" },
    modal: { control: "boolean" },
  },
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Aksi baris">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>DT-102</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Eye /> Lihat detail
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil /> Ubah
            <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Download /> Unduh laporan
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Trash2 /> Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Rendered open with `defaultOpen`: labels, shortcuts, a disabled item and a destructive one. */
export const Open: Story = {
  args: { defaultOpen: true },
  parameters: inFrame(280),
};

/** `DropdownMenuCheckboxItem` toggles columns or filters; the menu stays open between clicks if you prevent `onSelect`. */
export const CheckboxItems: Story = {
  args: { defaultOpen: true },
  parameters: inFrame(240),
  render: function Render(args) {
    const [cols, setCols] = useState({ site: true, kontraktor: true, fuel: false });
    const toggle = (key: keyof typeof cols) => (checked: boolean) =>
      setCols((c) => ({ ...c, [key]: checked }));
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Kolom</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Tampilkan kolom</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={cols.site}
            onCheckedChange={toggle("site")}
            onSelect={(e) => e.preventDefault()}
          >
            Site
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={cols.kontraktor}
            onCheckedChange={toggle("kontraktor")}
            onSelect={(e) => e.preventDefault()}
          >
            Kontraktor
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={cols.fuel}
            onCheckedChange={toggle("fuel")}
            onSelect={(e) => e.preventDefault()}
          >
            Fuel (L)
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** `DropdownMenuRadioGroup` for a single choice, e.g. the shift shown in a report. */
export const RadioItems: Story = {
  args: { defaultOpen: true },
  parameters: inFrame(220),
  render: function Render(args) {
    const [shift, setShift] = useState("pagi");
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Shift: {shift}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuLabel>Pilih shift</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={shift} onValueChange={setShift}>
            <DropdownMenuRadioItem value="pagi">Pagi</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="malam">Malam</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
};

/** `DropdownMenuSub` nests a menu; `inset` lines plain items up with checkbox/radio items. */
export const Submenu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ekspor</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuItem inset>Laporan harian</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger inset>Per kontraktor</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem>PT Kontraktor Satu</DropdownMenuItem>
            <DropdownMenuItem>PT Kontraktor Dua</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
