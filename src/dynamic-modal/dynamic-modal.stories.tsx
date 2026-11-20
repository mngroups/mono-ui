import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";

import { mobileStory } from "../../.storybook/docs/mobile";
import { Button } from "../ui/button.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { DynamicModal } from "./dynamic-modal.js";

/** Open stories render in their own frame so the overlay doesn't cover the docs page. */
const inFrame = { docs: { story: { inline: false, iframeHeight: 460 } } };

const meta = {
  title: "Components/DynamicModal",
  component: DynamicModal,
  parameters: {
    docs: {
      importPath: 'import { DynamicModal, useModalLayer } from "@mono/ui";',
    },
  },
  args: {
    open: false,
    onOpenChange: fn(),
    title: "Simpan perubahan?",
    description: "Data fuel unit DT-102 untuk shift pagi akan diperbarui.",
    confirmLabel: "Simpan",
    cancelLabel: "Batal",
    onConfirm: fn(),
    variant: "default",
    loading: false,
    dismissible: false,
    confirmDisabled: false,
    footerAlign: "end",
    footerLayout: "inline",
  },
  argTypes: {
    variant: { control: "select", options: ["default", "danger"] },
    footerAlign: { control: "select", options: ["start", "center", "end"] },
    footerLayout: { control: "select", options: ["inline", "stack"] },
    modalWidth: { control: "text" },
    loading: { control: "boolean" },
    dismissible: { control: "boolean" },
    confirmDisabled: { control: "boolean" },
    mobileFullHeight: { control: "boolean" },
    mobileNavV2: { control: "boolean" },
  },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    const setBoth = (next: boolean) => {
      setOpen(next);
      args.onOpenChange(next);
    };
    return (
      <>
        <Button onClick={() => setBoth(true)}>Buka modal</Button>
        <DynamicModal
          {...args}
          open={open}
          onOpenChange={setBoth}
          onConfirm={() => {
            args.onConfirm?.();
            setBoth(false);
          }}
        />
      </>
    );
  },
} satisfies Meta<typeof DynamicModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Rendered open: the confirmation dialog as it appears on desktop. */
export const Open: Story = {
  args: { open: true },
  parameters: inFrame,
};

/** `variant="danger"` paints the confirm button red for destructive actions. */
export const Danger: Story = {
  args: {
    open: true,
    variant: "danger",
    title: "Hapus kontraktor?",
    description: "PT Kontraktor Satu dan seluruh data unitnya akan dihapus permanen.",
    confirmLabel: "Hapus",
  },
  parameters: inFrame,
};

/** `loading` swaps the confirm label for a spinner and disables both buttons. */
export const Loading: Story = {
  args: { open: true, loading: true },
  parameters: inFrame,
};

/** A form body; `confirmDisabled` keeps "Simpan" off until the field is filled. */
export const WithForm: Story = {
  args: {
    open: true,
    title: "Tambah unit",
    description: "Daftarkan unit baru untuk site ini.",
    dismissible: true,
  },
  parameters: inFrame,
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    const [code, setCode] = useState("");
    return (
      <>
        <Button onClick={() => setOpen(true)}>Tambah unit</Button>
        <DynamicModal
          {...args}
          open={open}
          onOpenChange={setOpen}
          confirmDisabled={!code}
          onConfirm={() => setOpen(false)}
        >
          <div className="grid gap-2">
            <Label htmlFor="kode-unit">Kode unit</Label>
            <Input
              id="kode-unit"
              placeholder="mis. DT-205"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </DynamicModal>
      </>
    );
  },
};

/**
 * A modal opened from inside another gets its own overlay on top. `useModalLayer(open)` does this:
 * it returns `{ depth, overlayZ, contentZ }` for each open layer; use it in your own overlays too.
 */
export const Stacked: Story = {
  args: {
    open: true,
    title: "Detail kontraktor",
    description: "PT Kontraktor Satu · 24 unit aktif",
  },
  parameters: { docs: { story: { inline: false, iframeHeight: 520 } } },
  render: function Render(args) {
    const [open, setOpen] = useState(args.open);
    const [confirmOpen, setConfirmOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Lihat kontraktor</Button>
        <DynamicModal
          {...args}
          open={open}
          onOpenChange={setOpen}
          onConfirm={undefined}
          footer={
            <div className="flex justify-end">
              <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
                Nonaktifkan
              </Button>
            </div>
          }
        />
        <DynamicModal
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          variant="danger"
          title="Nonaktifkan kontraktor?"
          description="Unit milik kontraktor ini tidak bisa dipakai di laporan baru."
          confirmLabel="Nonaktifkan"
          modalWidth="26rem"
          onConfirm={() => {
            setConfirmOpen(false);
            setOpen(false);
          }}
        />
      </>
    );
  },
};

/** Below `md` the same modal is a bottom sheet with a drag handle and full-width buttons. */
export const Mobile: Story = {
  ...mobileStory,
  args: { open: true },
};
