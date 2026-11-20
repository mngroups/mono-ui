import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { Button } from "../ui/button.js";
import { InfoNote } from "./info-note.js";

const meta = {
  title: "Components/InfoNote",
  component: InfoNote,
  parameters: {
    docs: { importPath: 'import { InfoNote } from "@mono/ui";' },
  },
  args: {
    type: "info",
    description: "Data produksi diperbarui setiap 15 menit dari sistem dispatch.",
  },
  argTypes: {
    type: { control: "select", options: ["info", "success", "warning", "error"] },
    title: { control: "text" },
    description: { control: "text" },
    closeable: { control: "boolean" },
  },
} satisfies Meta<typeof InfoNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Types: Story = {
  render: (args) => (
    <div className="grid max-w-xl gap-3">
      <InfoNote {...args} type="info" description="Target bulanan dihitung dari rencana tambang." />
      <InfoNote
        {...args}
        type="success"
        description="Semua laporan fuel minggu ini sudah lengkap."
      />
      <InfoNote
        {...args}
        type="warning"
        description="Stok fuel Site Tabang di bawah 20%. Jadwalkan pengiriman."
      />
      <InfoNote
        {...args}
        type="error"
        description="Sinkronisasi data kontraktor gagal. Coba lagi nanti."
      />
    </div>
  ),
};

export const WithTitle: Story = {
  args: {
    type: "warning",
    title: "Periode belum ditutup",
    description:
      "Angka produksi Oktober masih bisa berubah sampai periode ditutup oleh admin site.",
  },
};

/** `closeable` adds the close button; the caller hides the note in `onClose`. */
export const Closeable: Story = {
  args: { closeable: true, onClose: fn() },
  render: function Render(args) {
    const [open, setOpen] = useState(true);
    if (!open) {
      return (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Tampilkan lagi
        </Button>
      );
    }
    return (
      <InfoNote
        {...args}
        onClose={() => {
          setOpen(false);
          args.onClose?.();
        }}
      />
    );
  },
};
