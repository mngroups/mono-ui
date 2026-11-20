import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell, Home, List, Settings, Truck } from "lucide-react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "../app-shell.js";
import type { AppShellEntry, AppShellLinkProps, AppShellNavItem } from "../types.js";
import { userInitials } from "../user-footer.js";

const mobile = vi.hoisted(() => ({ value: false }));
vi.mock("@mono/hooks", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@mono/hooks")>()),
  useIsMobile: () => mobile.value,
}));

beforeEach(() => {
  mobile.value = false;
});

const MENU: AppShellEntry[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, testId: "menu-dashboard" },
  { href: "/alert", label: "Alert", icon: List },
  {
    kind: "group",
    id: "unit",
    label: "Unit Management",
    icon: Truck,
    testId: "menu-unit",
    children: [
      { href: "/unit/config", label: "Konfigurasi", icon: Settings, testId: "menu-unit-config" },
      { href: "/unit/mapping", label: "Mapping Kontraktor" },
    ],
  },
];

const BOTTOM_NAV: AppShellNavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: Home },
  { href: "/alert", label: "Notifikasi", icon: Bell },
];

function renderShell(props: Partial<ComponentProps<typeof AppShell>> = {}) {
  return render(
    <AppShell menu={MENU} pathname="/dashboard" brand={<span>MoNo</span>} {...props}>
      <p>Isi halaman</p>
    </AppShell>
  );
}

const wrapper = (container: HTMLElement) =>
  container.querySelector('[data-slot="sidebar-wrapper"]') as HTMLElement;
const sidebar = (container: HTMLElement) =>
  container.querySelector('[data-slot="sidebar"]') as HTMLElement;

describe("AppShell on desktop", () => {
  it("renders the wide sidebar with the active page, then collapses to the icon rail", async () => {
    const user = userEvent.setup();
    const { container } = renderShell();
    expect(screen.getByText("Isi halaman").closest("main")).toHaveClass("pb-safe");
    expect(wrapper(container).style.getPropertyValue("--sidebar-width")).toBe("18rem");
    expect(wrapper(container).style.getPropertyValue("--sidebar-width-icon")).toBe("4rem");

    const dashboard = screen.getByTestId("menu-dashboard");
    expect(dashboard).toHaveAttribute("href", "/dashboard");
    expect(dashboard).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Alert" })).not.toHaveAttribute("aria-current");
    // A closed group is one row linking to its first page.
    const groupRow = screen.getByTestId("menu-unit");
    expect(groupRow).toHaveAttribute("href", "/unit/config");
    expect(groupRow).not.toHaveClass("text-primary");
    expect(screen.queryByText("Mapping Kontraktor")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();

    expect(within(sidebar(container)).getByText("MoNo")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ciutkan sidebar" }));
    expect(within(sidebar(container)).queryByText("MoNo")).toBeNull();
    const rail = screen.getByRole("navigation", { name: "Menu" });
    expect(within(rail).getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(rail).getByRole("link", { name: "Unit Management" })).toHaveAttribute(
      "href",
      "/unit/config"
    );

    await user.click(screen.getByRole("button", { name: "Buka sidebar" }));
    expect(screen.getByRole("button", { name: "Ciutkan sidebar" })).toBeInTheDocument();
  });

  it("opens the nested panel on a group's route, with the brand mark or the brand", () => {
    const { container, rerender } = renderShell({
      pathname: "/unit/mapping/12",
      brandMark: <span>M</span>,
    });
    expect(wrapper(container).style.getPropertyValue("--sidebar-width")).toBe("22rem");
    expect(screen.getByRole("heading", { name: "Unit Management" })).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    const panel = screen.getByRole("navigation", { name: "Unit Management" });
    expect(within(panel).getByRole("link", { name: "Mapping Kontraktor" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(within(panel).getByTestId("menu-unit-config")).not.toHaveAttribute("aria-current");
    // The rail beside the panel marks the group.
    const rail = screen.getByRole("navigation", { name: "Menu" });
    expect(within(rail).getByRole("link", { name: "Unit Management" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    rerender(
      <AppShell menu={MENU} pathname="/unit/config" brand={<span>MoNo</span>}>
        <p>Isi halaman</p>
      </AppShell>
    );
    expect(within(sidebar(container)).getByText("MoNo")).toBeInTheDocument();
  });

  it("shows the rail only when collapsed on a group's route", () => {
    renderShell({ pathname: "/unit/config", defaultOpen: false });
    expect(screen.queryByRole("heading", { name: "Unit Management" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka sidebar" })).toBeInTheDocument();
  });

  it("can be controlled and shows the navigation progress bar", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderShell({ open: true, onOpenChange, navigating: true, className: "shell-x" });
    expect(screen.getByRole("progressbar", { name: "Memuat halaman" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ciutkan sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("passes link props through a custom link component", () => {
    const Link = ({ href, ...props }: AppShellLinkProps) => (
      <a href={`#${href}`} data-router="yes" {...props} />
    );
    renderShell({ linkComponent: Link });
    expect(screen.getByTestId("menu-dashboard")).toHaveAttribute("href", "#/dashboard");
    expect(screen.getByTestId("menu-dashboard")).toHaveAttribute("data-router", "yes");
  });
});

describe("AppShell on mobile", () => {
  beforeEach(() => {
    mobile.value = true;
  });

  it("opens the sidebar sheet from the top bar, lists the open group inline, closes on navigate", async () => {
    const user = userEvent.setup();
    renderShell({ pathname: "/unit/mapping", mobileHeaderAction: <span>Lonceng</span> });
    expect(screen.getByText("Lonceng")).toBeInTheDocument();
    expect(screen.getAllByText("MoNo")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).queryByRole("button", { name: "Ciutkan sidebar" })).toBeNull();
    // Mobile never nests: the open group's pages sit under its row.
    expect(within(sheet).queryByRole("heading", { name: "Unit Management" })).toBeNull();
    expect(within(sheet).getByTestId("menu-unit")).toHaveClass("text-primary");
    const page = within(sheet).getByRole("link", { name: "Mapping Kontraktor" });
    expect(page).toHaveAttribute("aria-current", "page");
    expect(page).toHaveClass("py-3.5");

    await user.click(page);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the bottom nav on a tab root only, padding the page for it", () => {
    const { rerender } = renderShell({ bottomNav: BOTTOM_NAV, mobileHeader: false });
    expect(screen.queryByRole("button", { name: "Buka menu" })).not.toBeInTheDocument();
    const main = screen.getByText("Isi halaman").closest("main");
    expect(main).toHaveClass("pt-safe", "max-md:pb-(--mobile-bottom-nav-height)");
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute("aria-current", "page");

    rerender(
      <AppShell menu={MENU} pathname="/dashboard/42" brand="MoNo" bottomNav={BOTTOM_NAV}>
        <p>Isi halaman</p>
      </AppShell>
    );
    expect(screen.queryByRole("navigation", { name: "Navigasi utama" })).not.toBeInTheDocument();
    expect(screen.getByText("Isi halaman").closest("main")).not.toHaveClass(
      "max-md:pb-(--mobile-bottom-nav-height)"
    );
  });
});

describe("AppShell user footer", () => {
  it("shows a skeleton while the user loads, wide and collapsed", () => {
    const { unmount } = renderShell({ userLoading: true });
    expect(screen.getByTestId("app-shell-user-loading")).toHaveClass("justify-between");
    unmount();
    renderShell({ userLoading: true, defaultOpen: false });
    expect(screen.getByTestId("app-shell-user-loading")).toHaveClass("justify-center");
  });

  it("hides the footer without a user", () => {
    renderShell({ user: null });
    expect(screen.queryByTestId("app-shell-user-menu")).not.toBeInTheDocument();
  });

  it("opens the account menu with details, links, actions and Keluar", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    const onSelect = vi.fn();
    renderShell({
      pathname: "/profile",
      user: { name: "Budi Santoso", description: "PT Contoh · Admin" },
      appVersion: "1.4.0",
      onLogout,
      userMenu: [
        { label: "Profil", href: "/profile", testId: "menu-profile" },
        { label: "Bantuan", href: "/help" },
        { label: "Ubah Password", onSelect, testId: "menu-password" },
        { label: "Tanpa aksi" },
      ],
    });
    const trigger = screen.getByRole("button", { name: "Akun Budi Santoso" });
    expect(trigger).toHaveTextContent("BSBudi Santoso");

    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByText("v1.4.0")).toBeInTheDocument();
    expect(within(menu).getByText("PT Contoh · Admin")).toBeInTheDocument();
    expect(within(menu).getByTestId("menu-profile")).toHaveAttribute("aria-current", "page");
    expect(within(menu).getByRole("menuitem", { name: "Bantuan" })).toHaveAttribute(
      "href",
      "/help"
    );
    expect(within(menu).getByRole("menuitem", { name: "Bantuan" })).not.toHaveAttribute(
      "aria-current"
    );

    await user.click(within(menu).getByTestId("menu-password"));
    expect(onSelect).toHaveBeenCalledTimes(1);

    await user.click(trigger);
    await user.click(await screen.findByRole("menuitem", { name: "Tanpa aksi" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    await user.click(trigger);
    await user.click(await screen.findByTestId("app-shell-logout"));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("shows a bare menu and only the avatar when collapsed", async () => {
    const user = userEvent.setup();
    renderShell({
      user: { name: "Siti", avatarUrl: "data:image/png;base64,AAAA" },
      defaultOpen: false,
    });
    const trigger = screen.getByRole("button", { name: "Akun Siti" });
    expect(trigger).toHaveTextContent("S");
    expect(trigger).not.toHaveTextContent("Siti");

    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(within(menu).queryByRole("separator")).toBeNull();
    expect(within(menu).queryByText(/^v/)).toBeNull();
    expect(within(menu).queryByTestId("app-shell-logout")).toBeNull();
  });

  it("closes the mobile sheet after choosing an account link", async () => {
    mobile.value = true;
    const user = userEvent.setup();
    renderShell({ user: { name: "Budi" }, userMenu: [{ label: "Profil", href: "/profile" }] });
    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    const sheet = await screen.findByRole("dialog");
    await user.click(within(sheet).getByRole("button", { name: "Akun Budi" }));
    await user.click(await screen.findByRole("menuitem", { name: "Profil" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("userInitials", () => {
  it("takes up to two initials", () => {
    expect(userInitials("budi  santoso wibowo")).toBe("BS");
    expect(userInitials("Siti")).toBe("S");
  });
});
