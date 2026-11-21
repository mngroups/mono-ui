import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "../sidebar.js";

const mobile = vi.hoisted(() => ({ value: false }));
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => mobile.value,
}));

function State() {
  const { state, openMobile } = useSidebar();
  return (
    <output data-testid="state">
      {state}/{String(openMobile)}
    </output>
  );
}

function sidebarRoot(container: HTMLElement) {
  return container.querySelector('[data-slot="sidebar"]') as HTMLElement;
}

beforeEach(() => {
  mobile.value = false;
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useSidebar", () => {
  it("throws outside a SidebarProvider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<State />)).toThrow("useSidebar must be used within a SidebarProvider.");
    spy.mockRestore();
  });
});

describe("Sidebar on desktop", () => {
  it("toggles through the trigger, the rail and the keyboard shortcut", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <SidebarProvider style={{ color: "red" }} className="extra">
        <Sidebar>
          <SidebarRail />
        </Sidebar>
        <SidebarTrigger onClick={onClick} />
        <State />
      </SidebarProvider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");
    expect(sidebarRoot(container)).toHaveAttribute("data-collapsible", "");

    await user.click(container.querySelector('[data-sidebar="trigger"]') as HTMLElement);
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed/false");
    expect(sidebarRoot(container)).toHaveAttribute("data-collapsible", "offcanvas");
    expect(document.cookie).toContain("sidebar_state=false");

    await user.click(screen.getByTitle("Toggle Sidebar"));
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed/false");
    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");
    fireEvent.keyDown(window, { key: "b" });
    fireEvent.keyDown(window, { key: "x", ctrlKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");
  });

  it("still toggles when uncontrolled with onOpenChange only (persist-the-cookie pattern)", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <SidebarProvider defaultOpen onOpenChange={onOpenChange}>
        <Sidebar />
        <SidebarTrigger />
        <State />
      </SidebarProvider>
    );
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");

    await user.click(container.querySelector('[data-sidebar="trigger"]') as HTMLElement);
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed/false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
  });

  it("accepts a plain value through setOpen", async () => {
    const user = userEvent.setup();
    function Closer() {
      const { setOpen } = useSidebar();
      return (
        <button type="button" onClick={() => setOpen(false)}>
          close
        </button>
      );
    }
    render(
      <SidebarProvider>
        <Closer />
        <State />
      </SidebarProvider>
    );
    await user.click(screen.getByText("close"));
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed");
  });

  it("reports changes to a controlled owner", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <SidebarProvider
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        >
          <SidebarTrigger />
          <State />
        </SidebarProvider>
      );
    }
    render(<Controlled />);
    expect(screen.getByTestId("state")).toHaveTextContent("collapsed");
    await user.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByTestId("state")).toHaveTextContent("expanded");
  });

  it.each([
    ["floating", "right", true],
    ["inset", "left", false],
  ] as const)("renders the %s variant on the %s side", (variant, side, noGap) => {
    const { container } = render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar variant={variant} side={side} collapsible="icon" noGap={noGap}>
          content
        </Sidebar>
      </SidebarProvider>
    );
    const root = sidebarRoot(container);
    expect(root).toHaveAttribute("data-variant", variant);
    expect(root).toHaveAttribute("data-side", side);
    expect(root).toHaveAttribute("data-collapsible", "icon");
  });

  it("renders a static sidebar when not collapsible", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar collapsible="none" className="static-one">
          fixed
        </Sidebar>
      </SidebarProvider>
    );
    expect(sidebarRoot(container)).toHaveClass("static-one");
    expect(screen.getByText("fixed")).toBeInTheDocument();
  });
});

describe("Sidebar on mobile", () => {
  it("opens a sheet and enables the glass style after the slide-in", () => {
    vi.useFakeTimers();
    mobile.value = true;
    render(
      <SidebarProvider>
        <Sidebar mobileFullWidth>
          <span>mobile menu</span>
        </Sidebar>
        <SidebarTrigger />
        <State />
      </SidebarProvider>
    );
    expect(screen.queryByText("mobile menu")).not.toBeInTheDocument();

    act(() => {
      fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    });
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/true");
    const sheet = document.querySelector('[data-mobile="true"]') as HTMLElement;
    expect(sheet).toHaveClass("bg-sidebar");
    expect(sheet.style.getPropertyValue("--sidebar-width")).toBe("100vw");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(document.querySelector('[data-mobile="true"]')).not.toHaveClass("bg-sidebar");

    act(() => {
      fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    });
    expect(screen.getByTestId("state")).toHaveTextContent("expanded/false");
  });

  it("uses the narrow mobile width by default", () => {
    mobile.value = true;
    render(
      <SidebarProvider>
        <Sidebar>
          <span>menu</span>
        </Sidebar>
      </SidebarProvider>
    );
    act(() => {
      fireEvent.keyDown(window, { key: "b", metaKey: true });
    });
    const sheet = document.querySelector('[data-mobile="true"]') as HTMLElement;
    expect(sheet.style.getPropertyValue("--sidebar-width")).toBe("18rem");
  });
});

describe("Sidebar building blocks", () => {
  it("renders every slot", () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>header</SidebarHeader>
          <SidebarInput placeholder="Cari" />
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>label</SidebarGroupLabel>
              <SidebarGroupLabel asChild>
                <span>slot label</span>
              </SidebarGroupLabel>
              <SidebarGroupAction aria-label="group action" />
              <SidebarGroupAction asChild>
                <a href="#x">group link</a>
              </SidebarGroupAction>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>plain</SidebarMenuButton>
                    <SidebarMenuButton asChild size="lg" variant="outline" isActive>
                      <a href="#a">as link</a>
                    </SidebarMenuButton>
                    <SidebarMenuAction aria-label="action" />
                    <SidebarMenuAction showOnHover asChild>
                      <a href="#b">hover action</a>
                    </SidebarMenuAction>
                    <SidebarMenuBadge>3</SidebarMenuBadge>
                    <SidebarMenuSkeleton />
                    <SidebarMenuSkeleton showIcon />
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#c">sub md</SidebarMenuSubButton>
                        <SidebarMenuSubButton size="sm" isActive asChild>
                          <span>sub sm</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>footer</SidebarFooter>
        </Sidebar>
        <SidebarInset>main</SidebarInset>
      </SidebarProvider>
    );
    expect(screen.getByPlaceholderText("Cari")).toHaveAttribute("data-sidebar", "input");
    expect(screen.getByText("slot label")).toHaveAttribute("data-sidebar", "group-label");
    expect(screen.getByText("group link")).toHaveAttribute("data-sidebar", "group-action");
    expect(screen.getByText("as link")).toHaveAttribute("data-active", "true");
    expect(screen.getByText("hover action")).toHaveClass("md:opacity-0");
    expect(screen.getByText("sub md")).toHaveClass("text-sm");
    expect(screen.getByText("sub sm")).toHaveClass("text-xs");
    expect(container.querySelectorAll('[data-sidebar="menu-skeleton-icon"]')).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveTextContent("main");
  });

  it("wraps the menu button in a tooltip when given one", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider defaultOpen={false}>
        <SidebarMenuButton tooltip="Peta">string tip</SidebarMenuButton>
        <SidebarMenuButton tooltip={{ children: "Bahan bakar" }}>object tip</SidebarMenuButton>
      </SidebarProvider>
    );
    await user.hover(screen.getByRole("button", { name: "string tip" }));
    expect((await screen.findAllByText("Peta")).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "object tip" })).toBeInTheDocument();
  });
});
