import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button.js";
import { Toaster } from "./sonner.js";
import { toast } from "./toast.js";

const meta = {
  title: "Components/Toast",
  component: Toaster,
  parameters: {
    docs: {
      importPath: 'import { Toaster, toast } from "@mono/ui";',
      description: {
        component:
          'Mount `<Toaster />` once near the app root (pass `theme` from your theme provider), then call `toast()` anywhere. Import `toast` from `@mono/ui`, not from `sonner`: it adds the dismiss "Ok" action to every toast. Each example below has its own toaster (`toasterId`) so the docs page does not show duplicates; an app needs only the one.',
      },
    },
  },
  args: { position: "bottom-right" },
  argTypes: {
    position: {
      control: "select",
      options: [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    },
    theme: { control: "select", options: ["system", "light", "dark"] },
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args, { id }) => (
    <>
      <Button onClick={() => toast.success("Data tersimpan", { toasterId: id })}>
        Tampilkan toast
      </Button>
      <Toaster {...args} id={id} />
    </>
  ),
};

/** Error toasts are solid red with white text; the others use the popover surface. */
export const Types: Story = {
  render: (args, { id }) => (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => toast("Shift 2 dimulai", { toasterId: id })}>
          Default
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.success("Laporan fuel terkirim", { toasterId: id })}
        >
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info("Data diperbarui 5 menit lalu", { toasterId: id })}
        >
          Info
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.warning("Stok fuel Site Tabang menipis", { toasterId: id })}
        >
          Warning
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.error("Gagal menyimpan data kontraktor", { toasterId: id })}
        >
          Error
        </Button>
      </div>
      <Toaster {...args} id={id} />
    </>
  ),
};

export const WithDescription: Story = {
  render: (args, { id }) => (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Import gagal", {
            toasterId: id,
            description: "3 baris tidak valid. Periksa kode unit dan tonase.",
          })
        }
      >
        Import file
      </Button>
      <Toaster {...args} id={id} />
    </>
  ),
};

/** Pass your own `action` to replace the default "Ok", e.g. an undo. */
export const CustomAction: Story = {
  render: (args, { id }) => (
    <>
      <Button
        variant="destructive"
        onClick={() =>
          toast("Unit HD-785-07 dihapus", {
            toasterId: id,
            action: {
              label: "Urungkan",
              onClick: () => toast.success("Dibatalkan", { toasterId: id }),
            },
          })
        }
      >
        Hapus unit
      </Button>
      <Toaster {...args} id={id} />
    </>
  ),
};

/** `toast.promise` shows a loading toast that turns into success or error. */
export const LoadingPromise: Story = {
  render: (args, { id }) => (
    <>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
            toasterId: id,
            loading: "Menyinkronkan data dispatch…",
            success: "Sinkronisasi selesai",
            error: "Sinkronisasi gagal",
          })
        }
      >
        Sinkronkan
      </Button>
      <Toaster {...args} id={id} />
    </>
  ),
};
