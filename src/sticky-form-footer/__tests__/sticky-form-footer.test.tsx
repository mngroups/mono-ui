import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const flag = vi.hoisted(() => ({ enabled: true }));

vi.mock("../../config/ui-config.js", () => ({
  useUiConfig: () => ({ mobileNavV2: flag.enabled }),
}));

import { StickyFormFooter } from "../sticky-form-footer.js";

const root = document.documentElement;

function setMobile(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({ matches }) as unknown as typeof window.matchMedia;
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  flag.enabled = true;
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(56);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  root.style.removeProperty("--form-footer-offset");
});

describe("StickyFormFooter", () => {
  it("renders a plain row with the caller's className when the flag is off", () => {
    flag.enabled = false;
    const { container } = render(
      <StickyFormFooter className="row">
        <span>Simpan</span>
      </StickyFormFooter>
    );

    expect(container.firstChild).toHaveClass("row");
    expect(container.firstChild).not.toHaveClass("max-md:z-10");
    expect(container.children).toHaveLength(1);
  });

  it.each([
    ["sheet", "max-md:bg-card"],
    ["modal", "max-md:sticky"],
  ] as const)("renders only the sticky bar on the %s surface", (surface, cls) => {
    const { container } = render(
      <StickyFormFooter surface={surface}>
        <span>Simpan</span>
      </StickyFormFooter>
    );

    expect(container.children).toHaveLength(1);
    expect(container.firstChild).toHaveClass(cls);
    expect(container.firstChild).not.toHaveAttribute("style");
    expect(root.style.getPropertyValue("--form-footer-offset")).toBe("");
  });

  it("pins to the bottom of <main> on mobile and publishes its offset", () => {
    setMobile(true);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 700,
      top: 0,
    } as DOMRect);
    const observe = vi.fn();
    const disconnect = vi.fn();
    const OriginalRO = globalThis.ResizeObserver;
    globalThis.ResizeObserver = class {
      observe = observe;
      unobserve() {}
      disconnect = disconnect;
    } as unknown as typeof ResizeObserver;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    const { container, unmount } = render(
      <main>
        <StickyFormFooter>
          <span>Simpan</span>
        </StickyFormFooter>
      </main>
    );

    const bar = screen.getByText("Simpan").parentElement as HTMLElement;
    expect(bar).toHaveStyle({ top: "644px" });
    const spacer = container.querySelector("[aria-hidden]") as HTMLElement;
    expect(spacer).toHaveStyle({ height: "56px" });
    expect(root.style.getPropertyValue("--form-footer-offset")).toBe("156px");
    expect(observe).toHaveBeenCalledTimes(2);

    window.dispatchEvent(new Event("resize"));
    unmount();
    expect(disconnect).toHaveBeenCalled();
    expect(root.style.getPropertyValue("--form-footer-offset")).toBe("");
    globalThis.ResizeObserver = OriginalRO;
  });

  it("falls back to its own top edge without a <main> and no ResizeObserver", () => {
    setMobile(true);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      bottom: 0,
      top: 750,
    } as DOMRect);
    const OriginalRO = globalThis.ResizeObserver;
    // Simulate an environment without ResizeObserver.
    globalThis.ResizeObserver = undefined as unknown as typeof ResizeObserver;
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    render(
      <StickyFormFooter>
        <span>Simpan</span>
      </StickyFormFooter>
    );

    const bar = screen.getByText("Simpan").parentElement as HTMLElement;
    expect(bar.style.top).toBe("");
    expect(root.style.getPropertyValue("--form-footer-offset")).toBe("50px");
    globalThis.ResizeObserver = OriginalRO;
  });

  it("clears the offset on desktop widths", () => {
    setMobile(false);
    root.style.setProperty("--form-footer-offset", "10px");

    render(
      <StickyFormFooter>
        <span>Simpan</span>
      </StickyFormFooter>
    );

    expect(root.style.getPropertyValue("--form-footer-offset")).toBe("");
  });
});
