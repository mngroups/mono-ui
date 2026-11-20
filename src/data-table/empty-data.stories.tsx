import type { Meta, StoryObj } from "@storybook/react-vite";

import EmptyData from "./empty-data.js";

const meta = {
  title: "Components/EmptyData",
  component: EmptyData,
  parameters: {
    docs: { importPath: 'import { EmptyData } from "@mono/ui";' },
  },
  args: { backUrl: "/" },
} satisfies Meta<typeof EmptyData>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The illustration is loaded from `/empty-image.png` in the app's public folder;
 * Storybook does not ship that file, so only the title shows here.
 */
export const Default: Story = {};

/** Clicking the illustration sends the user to `backUrl`, e.g. the list's parent page. */
export const CustomBackUrl: Story = {
  args: { backUrl: "/fuel/transaksi" },
};
