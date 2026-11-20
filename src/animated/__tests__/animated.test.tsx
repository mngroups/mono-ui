import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const motionState = vi.hoisted(() => ({
  inView: false,
  reduceMotion: false as boolean | null,
  stop: vi.fn(),
  animate: vi.fn(),
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return {
    ...actual,
    useInView: () => motionState.inView,
    useReducedMotion: () => motionState.reduceMotion,
    animate: (...args: unknown[]) => {
      motionState.animate(...args);
      // Jump straight to the target so the rendered text is deterministic.
      (args[0] as { set: (v: number) => void }).set(args[1] as number);
      return { stop: motionState.stop };
    },
  };
});

import { CountUp } from "../count-up.js";
import { GrowFill } from "../grow-fill.js";

function visible(container: HTMLElement) {
  return container.querySelector("[aria-hidden] > span:last-child")?.textContent;
}

beforeEach(() => {
  motionState.inView = false;
  motionState.reduceMotion = false;
  motionState.stop.mockClear();
  motionState.animate.mockClear();
});

describe("CountUp", () => {
  it("renders non-numeric text as-is", () => {
    const { container } = render(<CountUp value="—" />);
    expect(container.textContent).toBe("—");
  });

  it("renders text whose number overflows as-is", () => {
    const huge = "9".repeat(400);
    const { container } = render(<CountUp value={huge} />);
    expect(container.querySelector(".sr-only")).toBeNull();
    expect(container.textContent).toBe(huge);
  });

  it("starts from zero in the original format until it scrolls into view", () => {
    const { container } = render(<CountUp value="+2.912,10 Ha" />);
    expect(screen.getByText("+2.912,10 Ha", { selector: ".sr-only" })).toBeInTheDocument();
    expect(visible(container)).toBe("+0,00 Ha");
    expect(motionState.animate).not.toHaveBeenCalled();
  });

  it("counts to the exact text once in view and stops on unmount", async () => {
    motionState.inView = true;
    const { container, unmount } = render(<CountUp value="12" />);
    expect(motionState.animate).toHaveBeenCalledWith(expect.anything(), 12, expect.anything());
    await waitFor(() => {
      expect(visible(container)).toBe("12");
    });
    unmount();
    expect(motionState.stop).toHaveBeenCalled();
  });

  it("jumps to the value when reduced motion is preferred", async () => {
    motionState.reduceMotion = true;
    const { container } = render(<CountUp value="1.234" />);
    expect(motionState.animate).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(visible(container)).toBe("1.234");
    });
  });
});

describe("GrowFill", () => {
  it.each([
    [true, 150],
    [false, -5],
  ])("renders the bar (reduceMotion=%s, pct=%s)", (reduce, pct) => {
    motionState.reduceMotion = reduce;
    const { container } = render(<GrowFill pct={pct} className="bar" />);
    expect(container.querySelector("span.bar")).toBeInTheDocument();
  });
});
