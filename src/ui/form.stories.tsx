import { zodResolver } from "@hookform/resolvers/zod";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "./button.js";
import { Checkbox } from "./checkbox.js";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form.js";
import { Input } from "./input.js";
import { RadioGroup, RadioGroupItem } from "./radio-group.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select.js";
import { Switch } from "./switch.js";
import { Textarea } from "./textarea.js";

const fuelSchema = z.object({
  site: z.string().min(1, "Pilih site"),
  unit: z.string().min(3, "Nomor unit minimal 3 karakter"),
  liters: z.string().refine((value) => Number(value) > 0, "Volume harus lebih dari 0"),
  note: z.string().max(200, "Catatan maksimal 200 karakter"),
});

type FuelValues = z.infer<typeof fuelSchema>;

const emptyFuel: FuelValues = { site: "", unit: "", liters: "", note: "" };

/** The fuel-entry form used by several stories; `validateOnMount` shows the error state. */
function FuelForm({ validateOnMount = false }: { validateOnMount?: boolean }) {
  const form = useForm<FuelValues>({
    resolver: zodResolver(fuelSchema),
    defaultValues: emptyFuel,
  });
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    if (validateOnMount) {
      void form.trigger();
    }
  }, [form, validateOnMount]);

  return (
    <Form {...form}>
      <form
        className="grid max-w-md gap-5"
        onSubmit={form.handleSubmit((values) =>
          setSubmitted(`${values.liters} L untuk ${values.unit} di ${values.site}`)
        )}
      >
        <FormField
          control={form.control}
          name="site"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih site" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Site Batu Hijau">Site Batu Hijau</SelectItem>
                  <SelectItem value="Site Sangatta">Site Sangatta</SelectItem>
                  <SelectItem value="Site Kideco">Site Kideco</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor unit</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: HD-785-07" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="liters"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume fuel (liter)</FormLabel>
              <FormControl>
                <Input type="number" inputMode="decimal" placeholder="0" {...field} />
              </FormControl>
              <FormDescription>Sesuai angka di flow meter dispenser.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan</FormLabel>
              <FormControl>
                <Textarea placeholder="Opsional" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button type="submit">Simpan</Button>
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
        </div>
        {submitted && <p className="text-sm text-muted-foreground">Tersimpan: {submitted}</p>}
      </form>
    </Form>
  );
}

const meta = {
  title: "Components/Form",
  component: Form,
  parameters: {
    docs: {
      importPath:
        'import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField } from "@mono/ui";',
      description: {
        component:
          "react-hook-form wiring with shadcn/ui styling. `Form` is react-hook-form's `FormProvider`: spread the `useForm()` result into it, then render one `FormField` per field. Inside its `render`, compose `FormItem` > `FormLabel` + `FormControl` (wrapping the input) + `FormDescription` + `FormMessage`; ids, `aria-describedby`, `aria-invalid` and the error text are connected automatically. `useFormField()` returns the field state and ids for custom parts.",
      },
    },
    controls: { disable: true },
  },
  // Typed as plain `Meta`: `Form` is react-hook-form's `FormProvider`, whose props are the whole
  // `useForm()` result, so each story builds its own form in `render` instead of using args.
} satisfies Meta;

export default meta;
// Plain `StoryObj` for the same reason: no story takes args.
type Story = StoryObj;

/** A fuel entry form validated with zod; submit it empty to see the messages. */
export const Default: Story = {
  render: () => <FuelForm />,
};

/** Errors turn the label red, mark the control `aria-invalid` and show `FormMessage`. */
export const WithErrors: Story = {
  render: () => <FuelForm validateOnMount />,
};

type SettingsValues = {
  shift: "pagi" | "malam";
  autoRefresh: boolean;
  agree: boolean;
};

/** Choice controls bind through `checked` / `value` instead of spreading `field`. */
export const ChoiceFields: Story = {
  render: function Render() {
    const form = useForm<SettingsValues>({
      defaultValues: { shift: "pagi", autoRefresh: true, agree: false },
    });
    return (
      <Form {...form}>
        <form className="grid max-w-md gap-6" onSubmit={form.handleSubmit(() => undefined)}>
          <FormField
            control={form.control}
            name="shift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shift</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="pagi" />
                      </FormControl>
                      <FormLabel className="font-normal">Pagi (06.00 - 18.00)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="malam" />
                      </FormControl>
                      <FormLabel className="font-normal">Malam (18.00 - 06.00)</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="autoRefresh"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="grid gap-1">
                  <FormLabel>Perbarui otomatis</FormLabel>
                  <FormDescription>Muat ulang data produksi setiap 15 menit.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agree"
            rules={{ validate: (value) => value || "Centang untuk melanjutkan" }}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => field.onChange(value === true)}
                    />
                  </FormControl>
                  <FormLabel>Data sudah dicek supervisor kontraktor</FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-fit">
            Kirim
          </Button>
        </form>
      </Form>
    );
  },
};

/** Without an error, `FormMessage` shows its own children, e.g. a neutral hint. */
export const MessageWithoutError: Story = {
  render: function Render() {
    const form = useForm<{ tonnage: string }>({ defaultValues: { tonnage: "1250" } });
    return (
      <Form {...form}>
        <form className="grid max-w-md gap-5">
          <FormField
            control={form.control}
            name="tonnage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target produksi (ton)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage className="text-muted-foreground">
                  Target bulan lalu: 1.180 ton
                </FormMessage>
              </FormItem>
            )}
          />
        </form>
      </Form>
    );
  },
};
