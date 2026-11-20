import { zodResolver } from "@hookform/resolvers/zod";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Form } from "../../ui/form.js";
import {
  FloatingMultiSelect,
  type MultiSelectOption,
  SELECT_ALL_VALUE,
} from "../floating-multi-select.js";

const isMobileMock = vi.fn(() => false);
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => isMobileMock(),
}));

vi.mock("../../dynamic-modal/dynamic-modal.js", () => ({
  DynamicModal: ({
    open,
    onOpenChange,
    title,
    children,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    children?: ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
        <button type="button" onClick={() => onOpenChange(false)}>
          Tutup
        </button>
      </div>
    ) : null,
}));

beforeEach(() => {
  isMobileMock.mockReturnValue(false);
});

const OPTIONS: MultiSelectOption[] = [
  { value: "s1", label: "Site Satu" },
  { value: "s2", label: "Site Dua" },
];

const schema = z.object({ sites: z.array(z.string()).min(1, "Pilih minimal satu site") });

type Values = { sites: string[] };

function Harness({
  initial = [],
  withError = false,
  ...props
}: Partial<Omit<ComponentProps<typeof FloatingMultiSelect<Values>>, "control" | "name">> & {
  initial?: unknown;
  withError?: boolean;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { sites: initial as string[] },
  });
  useEffect(() => {
    if (withError) void form.trigger();
  }, [form, withError]);
  return (
    <Form {...form}>
      <form>
        <FloatingMultiSelect
          control={form.control}
          name="sites"
          label="Site"
          noun="Site"
          options={OPTIONS}
          {...props}
        />
        <output data-testid="value">{JSON.stringify(form.watch("sites"))}</output>
      </form>
    </Form>
  );
}

const value = () => screen.getByTestId("value").textContent;

describe("FloatingMultiSelect (desktop)", () => {
  it("toggles options, searches and summarises the selection", async () => {
    const user = userEvent.setup();
    render(<Harness withError searchPlaceholder="Cari site" />);
    expect(await screen.findByText("Pilih minimal satu site")).toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "Site" });
    await user.click(trigger);

    await user.click(screen.getByRole("checkbox", { name: "Site Satu" }));
    expect(value()).toBe('["s1"]');
    expect(trigger).toHaveTextContent("1 Site Terpilih");
    await user.click(screen.getByRole("checkbox", { name: "Site Dua" }));
    await user.click(screen.getByRole("checkbox", { name: "Site Satu" }));
    expect(value()).toBe('["s2"]');

    await user.type(screen.getByPlaceholderText("Cari site"), "dua");
    expect(screen.queryByRole("checkbox", { name: "Site Satu" })).not.toBeInTheDocument();
    await user.clear(screen.getByPlaceholderText("Cari site"));
    await user.type(screen.getByPlaceholderText("Cari site"), "zzz");
    expect(screen.getByText("Tidak ada data")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByPlaceholderText("Cari site")).not.toBeInTheDocument();
    // Search is reset on close.
    await user.click(trigger);
    expect(screen.getByPlaceholderText("Cari site")).toHaveValue("");
  });

  it("centres the resting label on the field and floats it onto the border line", () => {
    const { unmount } = render(<Harness />);
    const resting = screen.getByText("Site", { selector: "label" });
    expect(resting).toHaveClass("top-1/2", "text-sm");
    expect(resting).not.toHaveClass("top-3.5");
    unmount();

    render(<Harness initial={["s1"]} />);
    const floated = screen.getByText("Site", { selector: "label" });
    expect(floated).toHaveClass("top-0", "text-xs");
    expect(floated).not.toHaveClass("-top-2");
  });

  it("selects all, locks individual rows, and clears again", async () => {
    const user = userEvent.setup();
    render(<Harness allowSelectAll initial={["s1"]} />);
    await user.click(screen.getByRole("button", { name: "Site" }));
    await user.click(screen.getByRole("checkbox", { name: "Pilih Semua" }));
    expect(value()).toBe(JSON.stringify([SELECT_ALL_VALUE]));
    expect(screen.getByRole("button", { name: "Site" })).toHaveTextContent("Semua Site");
    expect(screen.getByRole("checkbox", { name: "Site Satu" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Site Satu" })).toBeChecked();
    await user.click(screen.getByRole("checkbox", { name: "Pilih Semua" }));
    expect(value()).toBe("[]");
  });

  it("still labels 'Semua' when the option list is empty", async () => {
    const user = userEvent.setup();
    render(<Harness initial={[SELECT_ALL_VALUE]} options={[]} />);
    expect(screen.getByRole("button", { name: "Site" })).toHaveTextContent("Semua Site");
    await user.click(screen.getByRole("button", { name: "Site" }));
    expect(screen.getByText("Tidak ada data")).toBeInTheDocument();
  });

  it("shows loading and handles a non-array value", async () => {
    const user = userEvent.setup();
    render(<Harness loading initial={null} />);
    await user.click(screen.getByRole("button", { name: "Site" }));
    expect(screen.getByRole("status", { name: "Memuat opsi" })).toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("keeps the trigger disabled", async () => {
    render(<Harness disabled />);
    expect(screen.getByRole("button", { name: "Site" })).toBeDisabled();
  });
});

describe("FloatingMultiSelect (mobile)", () => {
  it("opens a sheet with search and options", async () => {
    isMobileMock.mockReturnValue(true);
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Site" }));
    const dialog = screen.getByRole("dialog", { name: "Site" });
    await user.click(within(dialog).getByRole("checkbox", { name: "Site Dua" }));
    expect(value()).toBe('["s2"]');
    await user.type(within(dialog).getByPlaceholderText("Cari"), "x");
    await user.click(within(dialog).getByText("Tutup"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
