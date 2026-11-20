import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert, CircleCheck, Info, OctagonX, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./alert.js";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    docs: {
      importPath: 'import { Alert, AlertTitle, AlertDescription } from "@mono/ui";',
    },
  },
  args: { variant: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "info", "success", "warning", "error"],
    },
  },
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <Info />
      <AlertTitle>Jadwal maintenance</AlertTitle>
      <AlertDescription>Sistem dispatch tidak tersedia Sabtu, 22.00–23.00 WITA.</AlertDescription>
    </Alert>
  ),
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A leading icon is optional; when present it takes the first grid column. */
export const Variants: Story = {
  render: (args) => (
    <div className="grid max-w-xl gap-3">
      <Alert {...args} variant="info">
        <Info />
        <AlertTitle>Data sedang disinkronkan</AlertTitle>
        <AlertDescription>Angka produksi akan diperbarui dalam beberapa menit.</AlertDescription>
      </Alert>
      <Alert {...args} variant="success">
        <CircleCheck />
        <AlertTitle>Laporan terkirim</AlertTitle>
        <AlertDescription>
          Laporan harian Site Sangatta sudah dikirim ke kontraktor.
        </AlertDescription>
      </Alert>
      <Alert {...args} variant="warning">
        <TriangleAlert />
        <AlertTitle>Fuel hampir habis</AlertTitle>
        <AlertDescription>Sisa fuel di tangki utama 1.850 L (12%).</AlertDescription>
      </Alert>
      <Alert {...args} variant="error">
        <OctagonX />
        <AlertTitle>Gagal menyimpan</AlertTitle>
        <AlertDescription>
          Koneksi ke server terputus. Periksa jaringan lalu coba lagi.
        </AlertDescription>
      </Alert>
      <Alert {...args} variant="destructive">
        <CircleAlert />
        <AlertTitle>Akses ditolak</AlertTitle>
        <AlertDescription>Anda tidak punya izin mengubah data kontraktor ini.</AlertDescription>
      </Alert>
    </div>
  ),
};

export const WithoutIcon: Story = {
  args: { variant: "info" },
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <AlertTitle>Catatan</AlertTitle>
      <AlertDescription>Ritase dihitung per shift, bukan per hari kalender.</AlertDescription>
    </Alert>
  ),
};

/** `AlertDescription` can hold paragraphs or a list. */
export const WithList: Story = {
  args: { variant: "error" },
  render: (args) => (
    <Alert {...args} className="max-w-xl">
      <OctagonX />
      <AlertTitle>Import gagal: 3 baris tidak valid</AlertTitle>
      <AlertDescription>
        <p>Perbaiki baris berikut lalu unggah ulang file.</p>
        <ul className="list-inside list-disc text-sm">
          <li>Baris 4: kode unit kosong</li>
          <li>Baris 9: tonase bukan angka</li>
          <li>Baris 15: site tidak dikenal</li>
        </ul>
      </AlertDescription>
    </Alert>
  ),
};
