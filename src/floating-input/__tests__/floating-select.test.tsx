import { zodResolver } from "@hookform/resolvers/zod";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Form } from "../../ui/form.js";
import { FloatingSelect, type SelectOption } from "../floating-select.js";

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

beforeAll(() => {
  // Radix Select relies on pointer capture + scrollIntoView, which jsdom lacks.
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.releasePointerCapture ??= () => {};
  Element.prototype.scrollIntoView ??= () => {};
});

beforeEach(() => {
  isMobileMock.mockReturnValue(false);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const schema = z.object({ category: z.string().min(1, "Kategori wajib dipilih") });

const OPTIONS: SelectOption[] = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function ResetOnMount() {
  const form = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { category: "" },
  });
  useEffect(() => {
    form.reset({ category: "lahan_bebas" });
    void form.trigger();
  }, [form]);
  return (
    <Form {...form}>
      <form>
        <FloatingSelect
          control={form.control}
          name="category"
          label="Kategori"
          options={[{ value: "lahan_bebas", label: "Lahan Bebas" }]}
        />
        <output data-testid="value">{form.watch("category")}</output>
      </form>
    </Form>
  );
}

type Extra = Partial<
  Omit<ComponentProps<typeof FloatingSelect<{ category: string }>>, "control" | "name">
>;

function Harness({
  initial = "",
  withError = false,
  ...props
}: Extra & { initial?: string; withError?: boolean }) {
  const form = useForm<{ category: string }>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { category: initial },
  });
  useEffect(() => {
    if (withError) void form.trigger();
  }, [form, withError]);
  return (
    <Form {...form}>
      <form>
        <FloatingSelect
          control={form.control}
          name="category"
          label="Kategori"
          options={OPTIONS}
          testId="select-trigger"
          {...props}
        />
        <output data-testid="value">{form.watch("category")}</output>
      </form>
    </Form>
  );
}

function viewport() {
  return document.querySelector("[data-radix-select-viewport]") as HTMLElement;
}

function setScroll(el: HTMLElement, { scrollTop }: { scrollTop: number }) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: 500 });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: 100 });
  Object.defineProperty(el, "scrollTop", { configurable: true, value: scrollTop });
}

describe("FloatingSelect", () => {
  it("keeps a value set by reset (draft restore) instead of clearing it", async () => {
    render(<ResetOnMount />);
    await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("lahan_bebas"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId("value")).toHaveTextContent("lahan_bebas");
    expect(screen.queryByText("Kategori wajib dipilih")).not.toBeInTheDocument();
  });

  describe("desktop", () => {
    it("opens, picks an option and reports it", async () => {
      const user = userEvent.setup();
      const onOptionSelect = vi.fn();
      render(<Harness onOptionSelect={onOptionSelect} withError />);
      expect(await screen.findByText("Kategori wajib dipilih")).toBeInTheDocument();
      const trigger = screen.getByTestId("select-trigger");
      await user.click(trigger);
      const listbox = await screen.findByRole("listbox");
      await user.click(within(listbox).getByText("Beta"));
      expect(onOptionSelect).toHaveBeenCalledWith({ value: "b", label: "Beta" });
      expect(screen.getByTestId("value")).toHaveTextContent("b");
      expect(trigger).toHaveTextContent("Beta");
    });

    it("shows the label inside the trigger when floating is disabled, with prefix and suffix", () => {
      render(<Harness disableFloating prefix={<span>pre</span>} suffix={<span>suf</span>} />);
      const trigger = screen.getByTestId("select-trigger");
      expect(trigger).toHaveTextContent("Kategori");
      expect(trigger).toHaveClass("pl-10", "pr-10");
      expect(screen.getByText("pre")).toBeInTheDocument();
      expect(screen.getByText("suf")).toBeInTheDocument();
      expect(screen.queryByText("Kategori", { selector: "label" })).not.toBeInTheDocument();
    });

    it("centres the resting label on the field", () => {
      render(<Harness />);
      const label = screen.getByText("Kategori", { selector: "label" });
      expect(label).toHaveClass("top-1/2", "text-sm");
      expect(label).not.toHaveClass("top-3.5");
    });

    it("floats the label over an existing value with a prefix", () => {
      render(<Harness initial="c" prefix={<span>pre</span>} />);
      expect(screen.getByTestId("select-trigger")).toHaveTextContent("Gamma");
      expect(screen.getByText("Kategori", { selector: "label" })).toHaveClass("left-10", "top-0");
    });

    it("filters options locally when searchable without onSearchChange", async () => {
      const user = userEvent.setup();
      render(<Harness searchable searchPlaceholder="Cari kategori" searchDebounce={0} />);
      await user.click(screen.getByTestId("select-trigger"));
      const input = await screen.findByPlaceholderText("Cari kategori");
      await user.type(input, "gam");
      const listbox = screen.getByRole("listbox");
      expect(within(listbox).queryByText("Alpha")).not.toBeInTheDocument();
      expect(within(listbox).getByText("Gamma")).toBeInTheDocument();
      await user.clear(input);
      await user.type(input, "   ");
      expect(within(listbox).getByText("Alpha")).toBeInTheDocument();
      await user.clear(input);
      await user.type(input, "zzz");
      expect(within(listbox).getByText("Tidak ada data")).toBeInTheDocument();
      // Pointer/click on the input stays inside it.
      fireEvent.pointerDown(input);
      fireEvent.click(input);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("hands the keyword to onSearchChange (server search) and keeps the picked label", async () => {
      const user = userEvent.setup();
      const onSearchChange = vi.fn();

      function ServerSearch() {
        const [keyword, setKeyword] = useState("");
        const options = keyword
          ? OPTIONS.filter((o) => o.label.toLowerCase().includes(keyword))
          : OPTIONS;
        return (
          <Harness
            searchable
            searchDebounce={10}
            options={options}
            onSearchChange={(k) => {
              onSearchChange(k);
              setKeyword(k);
            }}
          />
        );
      }

      render(<ServerSearch />);
      await waitFor(() => expect(onSearchChange).toHaveBeenCalledWith(""));
      await user.click(screen.getByTestId("select-trigger"));
      const input = await screen.findByPlaceholderText("Cari...");
      await user.type(input, "bet");
      await waitFor(() => expect(onSearchChange).toHaveBeenLastCalledWith("bet"));
      const listbox = screen.getByRole("listbox");
      await waitFor(() => expect(within(listbox).queryByText("Alpha")).not.toBeInTheDocument());
      await user.click(within(listbox).getByText("Beta"));
      // Closing resets the keyword.
      expect(onSearchChange).toHaveBeenLastCalledWith("");
      expect(screen.getByTestId("select-trigger")).toHaveTextContent("Beta");
    });

    it("keeps the picked label when the option list no longer has it", async () => {
      const user = userEvent.setup();
      function Swapping() {
        const [options, setOptions] = useState(OPTIONS);
        return (
          <>
            <Harness options={options} />
            <button type="button" onClick={() => setOptions([OPTIONS[0]])}>
              swap
            </button>
            <button type="button" onClick={() => setOptions([])}>
              empty
            </button>
          </>
        );
      }
      render(<Swapping />);
      await user.click(screen.getByTestId("select-trigger"));
      await user.click(within(await screen.findByRole("listbox")).getByText("Gamma"));
      await user.click(screen.getByText("swap"));
      expect(screen.getByTestId("select-trigger")).toHaveTextContent("Gamma");
    });

    it("loads more on scroll near the bottom, once per loading cycle", async () => {
      const onLoadMore = vi.fn();
      function Paged() {
        const [loading, setLoading] = useState(false);
        return (
          <>
            <Harness
              hasMore
              loading={loading}
              onLoadMore={() => {
                onLoadMore();
                setLoading(true);
              }}
            />
            <button type="button" onClick={() => setLoading(false)}>
              done
            </button>
          </>
        );
      }
      const user = userEvent.setup();
      render(<Paged />);
      await user.click(screen.getByTestId("select-trigger"));
      await screen.findByRole("listbox");
      const vp = viewport();

      setScroll(vp, { scrollTop: 0 });
      fireEvent.scroll(vp);
      await new Promise((r) => setTimeout(r, 250));
      expect(onLoadMore).not.toHaveBeenCalled();

      setScroll(vp, { scrollTop: 395 });
      fireEvent.scroll(vp);
      // Locked: a second scroll before the debounce fires is ignored.
      fireEvent.scroll(vp);
      await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));
      expect(screen.getByRole("status", { name: "Memuat opsi" })).toBeInTheDocument();
      // Loading: ignored.
      fireEvent.scroll(vp);

      // Loading finished: unlocks, the next scroll clears the stale timer and loads again.
      fireEvent.click(screen.getByText("done"));
      fireEvent.scroll(vp);
      await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(2));
    });

    it("loads more without an onLoadMore handler without throwing", async () => {
      const user = userEvent.setup();
      render(<Harness hasMore />);
      await user.click(screen.getByTestId("select-trigger"));
      await screen.findByRole("listbox");
      const vp = viewport();
      setScroll(vp, { scrollTop: 400 });
      fireEvent.scroll(vp);
      await new Promise((r) => setTimeout(r, 250));
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    it("shows the end-of-list hint only when the list overflows", async () => {
      vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (
        this: HTMLElement
      ) {
        return this.hasAttribute("data-radix-select-viewport") ? 500 : 0;
      });
      vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(100);
      const user = userEvent.setup();
      render(<Harness />);
      await user.click(screen.getByTestId("select-trigger"));
      expect(await screen.findByText("Tidak ada data lagi")).toBeInTheDocument();
    });

    it("joins the trigger to a dropdown placed above it", async () => {
      const original = Element.prototype.getAttribute;
      vi.spyOn(Element.prototype, "getAttribute").mockImplementation(function (
        this: Element,
        name: string
      ) {
        if (name === "data-side" && this.getAttribute === Element.prototype.getAttribute) {
          return "top";
        }
        return original.call(this, name);
      });
      const user = userEvent.setup();
      const { container } = render(<Harness withError />);
      await user.click(screen.getByTestId("select-trigger"));
      await screen.findByRole("listbox");
      await waitFor(() =>
        expect(container.querySelector("fieldset")).toHaveClass("rounded-t-none", "rounded-b-xl")
      );
      expect(container.querySelector("fieldset")).toHaveClass("border-destructive");
    });

    it("tolerates dropdown content without a viewport (no scroll wiring)", async () => {
      const original = Element.prototype.querySelector;
      vi.spyOn(Element.prototype, "querySelector").mockImplementation(function (
        this: Element,
        selector: string
      ) {
        if (selector === "[data-radix-select-viewport]") return null;
        return original.call(this, selector);
      });
      const user = userEvent.setup();
      render(<Harness hasMore />);
      await user.click(screen.getByTestId("select-trigger"));
      expect(await screen.findByRole("listbox")).toBeInTheDocument();
      expect(screen.queryByText("Tidak ada data lagi")).not.toBeInTheDocument();
    });

    it("ignores a native change to a value that has no option", async () => {
      const onOptionSelect = vi.fn();
      const { container } = render(<Harness onOptionSelect={onOptionSelect} />);
      const native = container.querySelector("select") as HTMLSelectElement;
      const stray = document.createElement("option");
      stray.value = "ghost";
      native.appendChild(stray);
      act(() => {
        native.value = "ghost";
      });
      fireEvent.change(native, { target: { value: "ghost" } });
      await waitFor(() => expect(screen.getByTestId("value")).toHaveTextContent("ghost"));
      expect(onOptionSelect).not.toHaveBeenCalled();
    });
  });

  describe("mobile", () => {
    beforeEach(() => {
      isMobileMock.mockReturnValue(true);
    });

    it("opens a sheet, marks the active option, picks and closes", async () => {
      const user = userEvent.setup();
      const onOptionSelect = vi.fn();
      render(<Harness initial="a" searchable onOptionSelect={onOptionSelect} />);
      const trigger = screen.getByRole("button", { name: "Kategori" });
      expect(trigger).toHaveTextContent("Alpha");
      await user.click(trigger);
      const dialog = screen.getByRole("dialog", { name: "Kategori" });
      expect(within(dialog).getByPlaceholderText("Cari...")).toBeInTheDocument();
      await user.click(within(dialog).getByText("Gamma"));
      expect(onOptionSelect).toHaveBeenCalledWith({ value: "c", label: "Gamma" });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByTestId("value")).toHaveTextContent("c");
    });

    it("shows loading / empty states and a disabled trigger", async () => {
      const { rerender } = render(<Harness options={[]} loading disableFloating suffix="x" />);
      const trigger = screen.getByRole("button", { name: "Kategori" });
      expect(trigger).toHaveClass("pr-10");
      fireEvent.click(trigger);
      expect(screen.getByRole("status", { name: "Memuat opsi" })).toBeInTheDocument();
      expect(screen.queryByText("Tidak ada data")).not.toBeInTheDocument();
      rerender(<Harness options={[]} disableFloating suffix="x" />);
      expect(screen.getByText("Tidak ada data")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Tutup"));
      rerender(<Harness disabled prefix={<span>pre</span>} />);
      expect(screen.getAllByRole("button")[0]).toBeDisabled();
    });

    it("loads more when the sheet list nears its bottom", async () => {
      const onLoadMore = vi.fn();
      render(<Harness hasMore onLoadMore={onLoadMore} />);
      fireEvent.click(screen.getAllByRole("button")[0]);
      const list = screen.getByRole("dialog").querySelector("[data-vaul-no-drag]") as HTMLElement;
      setScroll(list, { scrollTop: 0 });
      fireEvent.scroll(list);
      setScroll(list, { scrollTop: 395 });
      fireEvent.scroll(list);
      await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1));
    });
  });
});
