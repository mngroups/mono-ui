import type { Meta, StoryObj } from "@storybook/react-vite";

import { ThinkingIndicator } from "./thinking-indicator.js";

const meta = {
  title: "Components/ThinkingIndicator",
  component: ThinkingIndicator,
  parameters: {
    docs: { importPath: 'import { ThinkingIndicator } from "@mono/ui";' },
  },
  args: { label: "Sedang berpikir…" },
} satisfies Meta<typeof ThinkingIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Update the label as the assistant moves through its steps. */
export const StepLabels: Story = {
  render: () => (
    <div className="space-y-2">
      <ThinkingIndicator label="Mengambil data produksi…" />
      <ThinkingIndicator label="Menghitung konsumsi fuel per unit…" />
    </div>
  ),
};

/** In a chat thread, below the user's last message. */
export const InChat: Story = {
  render: (args) => (
    <div className="flex max-w-md flex-col gap-3">
      <div className="self-end rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground">
        Berapa total produksi Site Sangatta minggu ini?
      </div>
      <ThinkingIndicator {...args} />
    </div>
  ),
};
