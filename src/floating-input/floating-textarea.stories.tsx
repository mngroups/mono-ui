import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "../ui/form.js";
import { FloatingTextarea } from "./floating-textarea.js";

const meta = {
  title: "Components/FloatingTextarea",
  component: FloatingTextarea,
  parameters: {
    docs: { importPath: 'import { FloatingTextarea } from "@mono/ui";' },
  },
  args: {
    name: "catatan",
    label: "Catatan",
    // Supplied by the form wrapper in `render`.
    control: undefined as never,
  },
  argTypes: {
    control: { table: { disable: true } },
    maxChars: { control: "number" },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: "" } });
    return (
      <Form {...form}>
        <form className="max-w-md">
          <FloatingTextarea {...args} control={form.control} />
        </form>
      </Form>
    );
  },
} satisfies Meta<typeof FloatingTextarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `maxChars` adds an `n/max` counter that turns red past the limit; it does not cut the text. */
export const WithCounter: Story = {
  args: { maxChars: 120, label: "Keterangan kerusakan unit" },
};

/** Over the limit: the counter turns red and the schema's `.max()` message shows. */
export const OverLimit: Story = {
  render: function Render() {
    const schema = z.object({
      keterangan: z.string().max(40, "Maksimal 40 karakter"),
    });
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: {
        keterangan:
          "Unit DT-1024 berhenti di jalan hauling KM 12 karena kebocoran selang hidrolik.",
      },
    });
    const { trigger } = form;
    useEffect(() => {
      void trigger();
    }, [trigger]);
    return (
      <Form {...form}>
        <form className="max-w-md">
          <FloatingTextarea
            control={form.control}
            name="keterangan"
            label="Keterangan"
            maxChars={40}
          />
        </form>
      </Form>
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
