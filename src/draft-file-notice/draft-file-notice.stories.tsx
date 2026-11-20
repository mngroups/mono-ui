import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";

import { FloatingInput } from "../floating-input/floating-input.js";
import { Form } from "../ui/form.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";
import { DraftFileNotice } from "./draft-file-notice.js";

const meta = {
  title: "Components/DraftFileNotice",
  component: DraftFileNotice,
  parameters: {
    docs: { importPath: 'import { DraftFileNotice } from "@mono/ui";' },
  },
  args: { fileNames: ["foto-odometer-DT1024.jpg"] },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DraftFileNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Several files are listed comma-separated. */
export const MultipleFiles: Story = {
  args: { fileNames: ["surat-jalan-0425.pdf", "foto-tiket-timbang.jpg", "invoice-fuel.pdf"] },
};

/** With an empty list it renders nothing, so it can stay mounted. */
export const Empty: Story = {
  args: { fileNames: [] },
};

/** Typical placement: at the top of a form restored from a draft, above the file field. */
export const InARestoredForm: Story = {
  render: function Render(args) {
    const form = useForm({
      defaultValues: { kontraktor: "PT Kontraktor Tambang 3", tonase: "42" },
    });
    return (
      <Form {...form}>
        <form className="grid gap-4">
          <DraftFileNotice {...args} />
          <FloatingInput control={form.control} name="kontraktor" label="Kontraktor" />
          <FloatingInput
            control={form.control}
            name="tonase"
            label="Tonase"
            suffix={<span className="text-xs">ton</span>}
          />
          <div className="grid gap-2">
            <Label htmlFor="lampiran">Foto odometer</Label>
            <Input id="lampiran" type="file" />
          </div>
        </form>
      </Form>
    );
  },
};
