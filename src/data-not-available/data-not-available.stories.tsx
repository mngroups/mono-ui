import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { DataNotAvailable } from "./data-not-available.js";

// Stand-in for the app's illustration (e.g. "/empty-2.png" in the app's public folder).
const ILLUSTRATION = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#0097b2" fill-opacity="0.12"/><rect x="30" y="44" width="60" height="40" rx="6" fill="#0097b2" fill-opacity="0.35"/><rect x="38" y="34" width="44" height="14" rx="4" fill="#0097b2" fill-opacity="0.6"/></svg>'
)}`;

const meta = {
  title: "Components/DataNotAvailable",
  component: DataNotAvailable,
  parameters: {
    docs: { importPath: 'import { DataNotAvailable } from "@mono/ui";' },
  },
  args: {},
} satisfies Meta<typeof DataNotAvailable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default title and description, text only. */
export const Default: Story = {};

export const WithImage: Story = {
  args: { image: ILLUSTRATION },
};

/** Custom copy for a specific page; `description: null` hides the second line. */
export const CustomCopy: Story = {
  args: {
    image: ILLUSTRATION,
    imageSize: 80,
    title: "Belum ada laporan fuel",
    description: null,
  },
};

/** `onImageClick` makes the illustration clickable, e.g. to reload. */
export const ClickableImage: Story = {
  args: {
    image: ILLUSTRATION,
    title: "Gagal memuat data",
    description: "Klik gambar untuk memuat ulang.",
    onImageClick: fn(),
  },
};

/** Smaller floor via `className` when it sits inside a card. */
export const Compact: Story = {
  args: { className: "min-h-0 py-8" },
};
