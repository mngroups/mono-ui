import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fuel, Search } from "lucide-react";
import { useEffect } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "../ui/button.js";
import { Form } from "../ui/form.js";
import { FloatingInput } from "./floating-input.js";

const meta = {
  title: "Components/FloatingInput",
  component: FloatingInput,
  parameters: {
    docs: { importPath: 'import { FloatingInput } from "@mono/ui";' },
  },
  args: {
    name: "unit",
    label: "Kode unit",
    // Supplied by the form wrapper in `render`.
    control: undefined as never,
  },
  argTypes: {
    control: { table: { disable: true } },
    disableFloating: { control: "boolean" },
    disabled: { control: "boolean" },
    type: { control: "select", options: ["text", "number", "email", "password"] },
  },
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: "" } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingInput {...args} control={form.control} />
        </form>
      </Form>
    );
  },
} satisfies Meta<typeof FloatingInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A field that already has a value starts with the label floated. */
export const WithValue: Story = {
  render: function Render(args) {
    const form = useForm<FieldValues>({ defaultValues: { [args.name]: "DT-1024" } });
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingInput {...args} control={form.control} />
        </form>
      </Form>
    );
  },
};

/** `prefix` and `suffix` sit inside the outline, e.g. an icon or a unit. */
export const PrefixAndSuffix: Story = {
  render: function Render() {
    const form = useForm({ defaultValues: { keyword: "", volume: "" } });
    return (
      <Form {...form}>
        <form className="grid max-w-sm gap-4">
          <FloatingInput
            control={form.control}
            name="keyword"
            label="Cari kontraktor"
            prefix={<Search size={16} />}
          />
          <FloatingInput
            control={form.control}
            name="volume"
            label="Volume fuel"
            type="number"
            prefix={<Fuel size={16} />}
            suffix={<span className="text-xs">L</span>}
          />
        </form>
      </Form>
    );
  },
};

/** The outline and label turn red and the schema message shows below the field. */
export const WithError: Story = {
  render: function Render() {
    const schema = z.object({
      tonase: z.string().min(1, "Tonase wajib diisi"),
    });
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: { tonase: "" },
    });
    const { trigger } = form;
    useEffect(() => {
      void trigger();
    }, [trigger]);
    return (
      <Form {...form}>
        <form className="max-w-sm">
          <FloatingInput
            control={form.control}
            name="tonase"
            label="Tonase"
            suffix={<span className="text-xs">ton</span>}
          />
        </form>
      </Form>
    );
  },
};

/** `disableFloating` turns the label into a plain placeholder. */
export const PlaceholderOnly: Story = {
  args: { disableFloating: true, label: "Catatan singkat" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

/** A fuel entry form: zod validates on submit and the errors land under each field. */
export const InAForm: Story = {
  render: function Render() {
    const schema = z.object({
      site: z.string().min(1, "Site wajib diisi"),
      kontraktor: z.string().min(1, "Kontraktor wajib diisi"),
      volume: z.string().regex(/^\d+$/, "Isi dengan angka"),
    });
    const form = useForm<z.infer<typeof schema>>({
      resolver: zodResolver(schema),
      defaultValues: { site: "", kontraktor: "", volume: "" },
    });
    return (
      <Form {...form}>
        <form className="grid max-w-sm gap-4" onSubmit={form.handleSubmit(() => form.reset())}>
          <FloatingInput control={form.control} name="site" label="Site" />
          <FloatingInput control={form.control} name="kontraktor" label="Kontraktor" />
          <FloatingInput
            control={form.control}
            name="volume"
            label="Volume fuel"
            inputMode="numeric"
            suffix={<span className="text-xs">L</span>}
          />
          <Button type="submit">Simpan</Button>
        </form>
      </Form>
    );
  },
};
