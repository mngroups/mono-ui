import { act, fireEvent, render, screen } from "@testing-library/react";
import { Home, List, Map as MapIcon, Settings } from "lucide-react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MobileBottomNav } from "../mobile-bottom-nav.js";
import type { AppShellLinkProps, AppShellNavItem } from "../types.js";

const ITEMS: AppShellNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, testId: "tab-dashboard" },
  { href: "/map", label: "Peta", icon: MapIcon },
  { href: "/alert", label: "Alert", icon: List },
];

const lens = (container: HTMLElement) =>
  container.querySelector(".liquid-glass-lens") as HTMLElement;

afterEach(() => {
  vi.useRealTimers();
});

describe("MobileBottomNav", () => {
  it("marks the active tab and places the lens under it", () => {
    const { container } = render(<MobileBottomNav items={ITEMS} pathname="/map/layers" />);
    const nav = screen.getByRole("navigation", { name: "Navigasi utama" });
    expect(nav).toHaveClass("liquid-glass", "md:hidden");
    expect(nav).not.toHaveClass("liquid-glass-dense");
    expect(screen.getByRole("link", { name: "Peta" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByTestId("tab-dashboard")).toHaveAttribute("href", "/dashboard");
    // jsdom normalises calc(); the slot is a third of the track minus its padding.
    expect(lens(container).style.width).toContain("0.75rem");
    expect(lens(container).style.width).toMatch(/0\.333|\/ 3/);
    expect(lens(container).style.transform).toBe("translateX(100%)");
    expect(lens(container).style.opacity).toBe("1");
  });

  it("hides the lens off the tabs and uses the dense glass and a custom link", () => {
    const Link = ({ href, ...props }: AppShellLinkProps) => (
      <a href={`/app${href}`} data-router="yes" {...props} />
    );
    const { container } = render(
      <MobileBottomNav
        items={ITEMS}
        pathname="/settings"
        dense
        linkComponent={Link}
        className="x"
      />
    );
    expect(screen.getByRole("navigation")).toHaveClass("liquid-glass-dense", "x");
    expect(lens(container).style.opacity).toBe("0");
    expect(lens(container).style.transform).toBe("translateX(0%)");
    expect(screen.getByRole("link", { name: "Alert" })).toHaveAttribute("href", "/app/alert");
  });

  it("lifts the lens while it moves between tabs, then settles", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<MobileBottomNav items={ITEMS} pathname="/dashboard" />);
    expect(lens(container)).toHaveAttribute("data-moving", "false");

    rerender(<MobileBottomNav items={ITEMS} pathname="/alert" />);
    expect(lens(container)).toHaveAttribute("data-moving", "true");
    act(() => {
      vi.advanceTimersByTime(360);
    });
    expect(lens(container)).toHaveAttribute("data-moving", "false");
  });

  it("does not lift the lens when arriving from or leaving to a non-tab route", () => {
    const { container, rerender } = render(<MobileBottomNav items={ITEMS} pathname="/settings" />);
    rerender(<MobileBottomNav items={ITEMS} pathname="/map" />);
    expect(lens(container)).toHaveAttribute("data-moving", "false");
    rerender(<MobileBottomNav items={ITEMS} pathname="/settings" />);
    expect(lens(container)).toHaveAttribute("data-moving", "false");
    rerender(<MobileBottomNav items={ITEMS} pathname="/settings" />);
    expect(lens(container)).toHaveAttribute("data-moving", "false");
  });

  it("adds a button tab after the links that can take the lens", async () => {
    const onSelect = vi.fn();
    const onNavigate = vi.fn();
    const action = { label: "Pengaturan", icon: Settings, onSelect, testId: "tab-settings" };
    const { container, rerender } = render(
      <MobileBottomNav
        items={ITEMS}
        pathname="/map"
        onNavigate={onNavigate}
        action={{ ...action, active: false }}
      />
    );
    const button = screen.getByRole("button", { name: "Pengaturan" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(lens(container).style.width).toMatch(/0\.25|\/ 4/);
    expect(lens(container).style.transform).toBe("translateX(100%)");

    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("link", { name: "Peta" }));
    expect(onNavigate).toHaveBeenCalledTimes(1);

    rerender(
      <MobileBottomNav items={ITEMS} pathname="/map" action={{ ...action, active: true }} />
    );
    expect(screen.getByTestId("tab-settings")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("tab-settings")).toHaveClass("text-primary");
    expect(screen.getByRole("link", { name: "Peta" })).not.toHaveAttribute("aria-current");
    expect(lens(container).style.transform).toBe("translateX(300%)");
  });
});
