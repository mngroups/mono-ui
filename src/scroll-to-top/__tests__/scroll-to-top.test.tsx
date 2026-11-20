import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ScrollToTop from "../scroll-to-top.js";

const BUTTON = { name: "Kembali ke atas" };

afterEach(() => {
  for (const main of document.querySelectorAll("body > main")) main.remove();
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 768 });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  document.documentElement.scrollTop = 0;
});

function mountMain(scrollTop: number) {
  const main = document.createElement("main");
  main.scrollTop = scrollTop;
  main.scrollTo = vi.fn();
  document.body.appendChild(main);
  return main;
}

describe("ScrollToTop", () => {
  it("shows once <main> scrolls past the threshold and scrolls it back up", () => {
    const main = mountMain(0);
    const { unmount } = render(<ScrollToTop />);
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();

    main.scrollTop = 500;
    act(() => {
      main.dispatchEvent(new Event("scroll"));
    });
    fireEvent.click(screen.getByRole("button", BUTTON));
    expect(main.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    const remove = vi.spyOn(main, "removeEventListener");
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("falls back to window scrolling when there is no <main>", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 400 });
    window.scrollTo = vi.fn();
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ScrollToTop />);

    fireEvent.click(screen.getByRole("button", BUTTON));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    unmount();
    expect(remove).toHaveBeenCalledWith("scroll", expect.any(Function));
    remove.mockRestore();
  });

  it("reads documentElement.scrollTop, then 0, with a 300px fallback threshold", () => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 0 });
    document.documentElement.scrollTop = 350;
    render(<ScrollToTop />);
    expect(screen.getByRole("button", BUTTON)).toBeInTheDocument();

    document.documentElement.scrollTop = 0;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
  });

  it("stays hidden when hidden is set", () => {
    mountMain(1000);
    render(<ScrollToTop hidden />);
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
  });

  it("rechecks the scroll position when resetKey changes", () => {
    const main = mountMain(0);
    const { rerender } = render(<ScrollToTop resetKey="/a" />);
    expect(screen.queryByRole("button", BUTTON)).not.toBeInTheDocument();
    main.scrollTop = 900;
    rerender(<ScrollToTop resetKey="/b" />);
    expect(screen.getByRole("button", BUTTON)).toBeInTheDocument();
  });
});
