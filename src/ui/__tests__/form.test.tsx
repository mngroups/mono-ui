import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form.js";

type Values = { nama: string };

function Harness({ error, hint }: { error?: { message?: string }; hint?: string }) {
  const form = useForm<Values>({ defaultValues: { nama: "" } });
  useEffect(() => {
    if (error) form.setError("nama", { type: "manual", ...error });
  }, [error, form]);
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="nama"
        render={({ field }) => (
          <FormItem className="item">
            <FormLabel>Nama</FormLabel>
            <FormControl>
              <input {...field} />
            </FormControl>
            <FormDescription>Nama lengkap</FormDescription>
            <FormMessage>{hint}</FormMessage>
          </FormItem>
        )}
      />
    </Form>
  );
}

describe("Form", () => {
  it("links the label, control and description while valid", async () => {
    const user = userEvent.setup();
    render(<Harness hint="Opsional" />);
    const input = screen.getByLabelText("Nama");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).toHaveAccessibleDescription("Nama lengkap");
    expect(screen.getByText("Opsional")).toBeInTheDocument();
    await user.type(input, "Budi");
    expect(input).toHaveValue("Budi");
  });

  it("renders nothing for an empty message", () => {
    const { container } = render(<Harness />);
    expect(container.querySelector('[data-slot="form-message"]')).toBeNull();
  });

  it("shows the field error and marks the control invalid", async () => {
    render(<Harness error={{ message: "Nama wajib diisi" }} hint="Opsional" />);
    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.queryByText("Opsional")).not.toBeInTheDocument();
    const input = screen.getByLabelText("Nama");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(/Nama lengkap Nama wajib diisi/);
    expect(screen.getByText("Nama")).toHaveAttribute("data-error", "true");
  });

  it("hides the message when the error carries no text", async () => {
    const { container } = render(<Harness error={{}} hint="Opsional" />);
    expect(await screen.findByLabelText("Nama")).toHaveAttribute("aria-invalid", "true");
    expect(container.querySelector('[data-slot="form-message"]')).toBeNull();
  });

  it("throws a clear error when a field part is used outside <FormField>", () => {
    function Orphan() {
      const form = useForm<Values>({ defaultValues: { nama: "" } });
      return (
        <Form {...form}>
          <FormItem>
            <FormLabel>Nama</FormLabel>
          </FormItem>
        </Form>
      );
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow("useFormField should be used within <FormField>");
    spy.mockRestore();
  });
});
