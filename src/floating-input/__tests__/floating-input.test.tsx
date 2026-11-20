import { zodResolver } from "@hookform/resolvers/zod";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { Form } from "../../ui/form.js";
import { FLOATED_LABEL, FloatingInput } from "../floating-input.js";
import { FloatingTextarea } from "../floating-textarea.js";

const schema = z.object({ name: z.string().min(1, "Nama wajib diisi") });

function Harness({
  children,
  withError = false,
}: {
  children: (control: ReturnType<typeof useForm<{ name: string }>>["control"]) => ReactNode;
  withError?: boolean;
}) {
  const form = useForm<{ name: string }>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "" },
  });
  useEffect(() => {
    if (withError) void form.trigger();
  }, [form, withError]);
  return (
    <Form {...form}>
      <form>{children(form.control)}</form>
    </Form>
  );
}

/** jsdom's AnimationEvent ignores `animationName` in its init dict. */
function fireAnimationStart(el: HTMLElement, animationName: string) {
  const event = new Event("animationstart", { bubbles: true });
  Object.defineProperty(event, "animationName", { value: animationName });
  act(() => {
    el.dispatchEvent(event);
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("FloatingInput", () => {
  it("renders a floating label wired to the input and accepts typing", async () => {
    const user = userEvent.setup();
    render(
      <Harness withError>
        {(control) => <FloatingInput control={control} name="name" label="Nama" />}
      </Harness>
    );
    const input = screen.getByLabelText("Nama");
    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Nama", { selector: "label" })).toHaveClass("text-destructive");
    expect(input).toHaveAttribute("placeholder", " ");
    expect(input).toHaveAttribute("type", "text");
    await user.type(input, "Budi");
    expect(input).toHaveValue("Budi");
  });

  it("uses the label as placeholder when floating is disabled, with prefix/suffix", async () => {
    render(
      <Harness withError>
        {(control) => (
          <FloatingInput
            control={control}
            name="name"
            label="Nama"
            type="password"
            disableFloating
            prefix={<span>pre</span>}
            suffix={<span>suf</span>}
          />
        )}
      </Harness>
    );
    const input = screen.getByPlaceholderText("Nama");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveClass("pl-10", "pr-10");
    expect(screen.getByText("pre")).toBeInTheDocument();
    // Adornments sit on the field's vertical centre, not near its top edge.
    expect(screen.getByText("suf").parentElement).toHaveClass("top-1/2");
    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
  });

  it("tracks the autofill animations and reports changes", () => {
    const onAutofillChange = vi.fn();
    const onAnimationStart = vi.fn();
    render(
      <Harness>
        {(control) => (
          <FloatingInput
            control={control}
            name="name"
            label="Nama"
            prefix={<span>pre</span>}
            suffix={<span>suf</span>}
            onAutofillChange={onAutofillChange}
            onAnimationStart={onAnimationStart}
          />
        )}
      </Harness>
    );
    const input = screen.getByLabelText("Nama");
    expect(onAutofillChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByText("suf").parentElement).toHaveClass("top-1/2");
    expect(screen.getByText("pre").parentElement).toHaveClass("top-1/2");
    // Resting label centred on the 48px field, where the typed text sits.
    const label = screen.getByText("Nama", { selector: "label" });
    expect(label).toHaveClass("top-1/2");
    expect(label).not.toHaveClass("top-3.5");

    fireAnimationStart(input, "floating-input-autofill-start");
    expect(onAutofillChange).toHaveBeenLastCalledWith(true);
    // Floated label centred on the border line, inside the legend's notch.
    expect(screen.getByText("Nama", { selector: "label" })).toHaveClass("top-0", "text-xs");
    expect(screen.getByText("Nama", { selector: "label" })).not.toHaveClass("-top-2");

    fireAnimationStart(input, "something-else");
    expect(onAutofillChange).toHaveBeenCalledTimes(2);

    fireAnimationStart(input, "floating-input-autofill-end");
    expect(onAutofillChange).toHaveBeenLastCalledWith(false);
    expect(onAnimationStart).toHaveBeenCalledTimes(3);
  });

  it("detects an autofill already present on mount", () => {
    vi.spyOn(HTMLInputElement.prototype, "matches").mockImplementation((selector: string) => {
      if (selector === ":autofill") throw new SyntaxError("unsupported");
      return selector === ":-webkit-autofill";
    });
    const onAutofillChange = vi.fn();
    render(
      <Harness>
        {(control) => (
          <FloatingInput
            control={control}
            name="name"
            label="Nama"
            onAutofillChange={onAutofillChange}
          />
        )}
      </Harness>
    );
    expect(onAutofillChange).toHaveBeenLastCalledWith(true);
  });

  it("polls for a late autofill, then stops after the window", () => {
    vi.useFakeTimers();
    let autofilled = false;
    const matches = vi
      .spyOn(HTMLInputElement.prototype, "matches")
      .mockImplementation(() => autofilled);
    const onAutofillChange = vi.fn();
    const { unmount } = render(
      <Harness>
        {(control) => (
          <FloatingInput
            control={control}
            name="name"
            label="Nama"
            onAutofillChange={onAutofillChange}
          />
        )}
      </Harness>
    );
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onAutofillChange).toHaveBeenLastCalledWith(false);
    autofilled = true;
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onAutofillChange).toHaveBeenLastCalledWith(true);
    unmount();

    // Never autofilled: the poll gives up after its window.
    autofilled = false;
    render(
      <Harness>{(control) => <FloatingInput control={control} name="name" label="Nama" />}</Harness>
    );
    act(() => {
      vi.advanceTimersByTime(3500);
    });
    const callsAfterWindow = matches.mock.calls.length;
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(matches.mock.calls.length).toBe(callsAfterWindow);
  });
});

describe("FloatingTextarea", () => {
  it("renders a labelled textarea and shows errors", async () => {
    const user = userEvent.setup();
    render(
      <Harness withError>
        {(control) => (
          <FloatingTextarea control={control} name="name" label="Catatan" className="h-40" />
        )}
      </Harness>
    );
    const textarea = screen.getByLabelText("Catatan");
    expect(textarea).toHaveClass("h-40");
    expect(await screen.findByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Catatan", { selector: "label" })).toHaveClass("text-destructive");
    await user.type(textarea, "Halo");
    expect(textarea).toHaveValue("Halo");
    expect(screen.getByText("Catatan", { selector: "label" })).toHaveClass("text-muted-foreground");
  });

  it("counts characters against maxChars, red past the limit", async () => {
    const user = userEvent.setup();
    render(
      <Harness>
        {(control) => (
          <FloatingTextarea
            control={control}
            name="name"
            label="Catatan"
            maxChars={3}
            data-testid="note"
          />
        )}
      </Harness>
    );
    const counter = screen.getByTestId("note-counter");
    expect(counter).toHaveTextContent("0/3");
    expect(counter).toHaveClass("text-muted-foreground");
    await user.type(screen.getByLabelText("Catatan"), "Halo");
    expect(counter).toHaveTextContent("4/3");
    expect(counter).toHaveClass("text-destructive");
  });

  it("counts an unset value as empty and has no counter test id without one on the textarea", () => {
    function NoDefault() {
      const form = useForm<{ name?: string }>();
      return (
        <Form {...form}>
          <FloatingTextarea control={form.control} name="name" label="Catatan" maxChars={5} />
        </Form>
      );
    }
    render(<NoDefault />);
    const counter = screen.getByText("0/5");
    expect(counter).not.toHaveAttribute("data-testid");
  });
});

describe("FLOATED_LABEL", () => {
  // Shared by FloatingInput and FloatingTextarea: the floated label must sit on the
  // border line (top-0 + -translate-y-1/2), not 8px above it.
  it("floats onto the border line for every float trigger", () => {
    expect(FLOATED_LABEL).not.toMatch(/-top-2/);
    for (const variant of [
      "peer-focus",
      "peer-[:not(:placeholder-shown)]",
      "peer-[:autofill]",
      "peer-[:-webkit-autofill]",
    ]) {
      expect(FLOATED_LABEL.split(" ")).toContain(`${variant}:top-0`);
    }
  });
});
