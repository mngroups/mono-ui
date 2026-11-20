import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eye, Pencil, Printer, Trash2 } from "lucide-react";
import { fn } from "storybook/test";

import { StatusLabel } from "../status-label/status-label.js";
import { CardSummary, IdCell, MobileDataCard } from "./mobile-data-card.js";

const meta = {
  title: "Components/MobileDataCard",
  component: MobileDataCard,
  parameters: {
    docs: {
      importPath: 'import { CardSummary, IdCell, MobileDataCard } from "@mono/ui";',
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    header: (
      <CardSummary
        title="HD785-12"
        subtitle="Site Bengalon · 12 Nov 2026"
        badge={<StatusLabel tone="success">Selesai</StatusLabel>}
      />
    ),
    rows: [
      { label: "Kontraktor", value: "PT Pama Persada" },
      { label: "Fuel", value: "1.250 L" },
      { label: "Tonase", value: "96 ton" },
    ],
    action: { label: "Lihat detail", icon: <Eye size={14} />, onClick: fn() },
  },
  argTypes: {
    collapsible: { control: "boolean" },
    defaultOpen: { control: "boolean" },
  },
} satisfies Meta<typeof MobileDataCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Expanded: Story = {
  args: { defaultOpen: true },
};

/** Three or more actions wrap into a two-column grid; an odd last one spans both. */
export const ManyActions: Story = {
  args: {
    defaultOpen: true,
    action: undefined,
    actions: [
      { label: "Lihat", icon: <Eye size={14} />, onClick: fn() },
      { label: "Ubah", icon: <Pencil size={14} />, onClick: fn() },
      { label: "Cetak", icon: <Printer size={14} />, onClick: fn(), disabled: true },
      { label: "Hapus", icon: <Trash2 size={14} />, onClick: fn(), variant: "danger" },
      { label: "Ajukan revisi", onClick: fn() },
    ],
  },
};

/** Long text and `stacked` rows put the value under its label. */
export const StackedRows: Story = {
  args: {
    defaultOpen: true,
    rows: [
      { label: "Kontraktor", value: "PT Pama Persada" },
      {
        label: "Catatan",
        value: "Pengisian fuel tertunda 30 menit karena antrean di fuel station pit utara.",
      },
      { label: "Lokasi", value: "Pit Utara, Blok C-12", stacked: true },
    ],
  },
};

/** `collapsible={false}` shows everything at once, for cards with only a few fields. */
export const NotCollapsible: Story = {
  args: { collapsible: false },
};

/**
 * `CardSummary` is the standard collapsed header (badge, title, one subtitle line);
 * `IdCell` shows a long ID in monospace, cut to `max` characters.
 */
export const SummaryAndIdCell: Story = {
  args: {
    defaultOpen: true,
    header: (
      <CardSummary
        title="Transaksi fuel"
        subtitle={<IdCell value="7f3c9a1e-52b4-4d0e-9c7a-0b1f2e3d4c5b" max={20} />}
        badge={<StatusLabel tone="warning">Proses</StatusLabel>}
      />
    ),
    rows: [
      { label: "ID unit", value: <IdCell value="UNIT-HD785-0012-BGL" /> },
      { label: "ID operator", value: <IdCell value={null} /> },
    ],
  },
};
