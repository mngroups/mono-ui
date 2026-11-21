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

  it("has no sidebar and no top bar or logo", () => {
    const { container } = renderShell();
    expect(sidebar(container)).toBeNull();
    expect(container.querySelector("header")).toBeNull();
    expect(screen.queryByText("MoNo")).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Navigasi utama" })).not.toBeInTheDocument();
  });

  it("shows the tabs plus Pengaturan on tab roots and menu pages, padding the page", async () => {
    const { rerender } = renderShell({ bottomNav: BOTTOM_NAV });
    const main = screen.getByText("Isi halaman").closest("main");
    expect(main).toHaveClass("pt-safe", "max-md:pb-(--mobile-bottom-nav-height)");
    const nav = screen.getByRole("navigation", { name: "Navigasi utama" });
    expect(within(nav).getAllByRole("link")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByTestId("app-shell-settings-tab")).toHaveAttribute("aria-pressed", "false");

    // A menu page that isn't a tab keeps the bar, with Pengaturan marked.
    rerender(
      <AppShell menu={MENU} pathname="/unit/mapping" brand="MoNo" bottomNav={BOTTOM_NAV}>
        <p>Isi halaman</p>
      </AppShell>
    );
    expect(screen.getByRole("button", { name: "Pengaturan" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await userEvent.click(screen.getByRole("button", { name: "Pengaturan" }));
    expect(screen.getByRole("link", { name: "Mapping Kontraktor" })).toHaveAttribute(
      "aria-current",
      "page"
    );

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

  it("uses at most five tabs; the rest move to Pengaturan", async () => {
    const user = userEvent.setup();
    const many: AppShellEntry[] = Array.from({ length: 7 }, (_, i) => ({
      href: `/p${i}`,
      label: `Page ${i}`,
      icon: Home,
    }));
    render(
      <AppShell
        menu={many}
        pathname="/p0"
        brand="MoNo"
        bottomNav={many as AppShellNavItem[]}
        settingsLabel="Lainnya"
      >
        <p>Isi halaman</p>
      </AppShell>
    );
    const nav = screen.getByRole("navigation", { name: "Navigasi utama" });
    expect(within(nav).getAllByRole("link")).toHaveLength(5);
    await user.click(screen.getByRole("button", { name: "Lainnya" }));
    const settings = screen.getByTestId("app-shell-mobile-settings");
    expect(within(settings).getByRole("heading", { name: "Lainnya" })).toBeInTheDocument();
    expect(
      within(settings)
        .getAllByRole("link")
        .map((link) => link.textContent)
    ).toEqual(["Page 5", "Page 6"]);
  });

  it("opens Pengaturan with the account and the menu pages that aren't tabs", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    const onSelect = vi.fn();
    renderShell({
      bottomNav: BOTTOM_NAV,
      user: { name: "Budi Santoso", description: "PT Contoh · Admin", avatarUrl: "data:," },
      appVersion: "1.4.0",
      onLogout,
      userMenu: [
        { label: "Profil", href: "/profile", testId: "menu-profile" },
        { label: "Ubah Password", onSelect, testId: "menu-password" },
        { label: "Tanpa aksi" },
      ],
    });
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();

    const tab = screen.getByTestId("app-shell-settings-tab");
    await user.click(tab);
    expect(tab).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("link", { name: "Beranda" })).not.toHaveAttribute("aria-current");
    // The page stays mounted, hidden on mobile.
    expect(screen.getByText("Isi halaman").parentElement).toHaveClass("contents", "max-md:hidden");

    const settings = screen.getByTestId("app-shell-mobile-settings");
    const account = within(settings).getByTestId("app-shell-mobile-user");
    // The logo is the card's faint backdrop, not a row of its own.
    expect(within(account).getByTestId("app-shell-mobile-brand")).toHaveTextContent("MoNo");
    expect(within(account).getByTestId("app-shell-mobile-brand")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
    expect(account).toHaveTextContent("MoNoBSBudi SantosoPT Contoh · Adminv1.4.0");
    expect(within(settings).getByTestId("menu-profile")).toHaveAttribute("href", "/profile");
    expect(within(settings).getByTestId("menu-profile")).not.toHaveAttribute("aria-current");
    // Dashboard and Alert are tabs; the group's pages are listed under its name.
    expect(within(settings).queryByRole("link", { name: "Dashboard" })).toBeNull();
    expect(within(settings).queryByRole("heading", { name: "Menu" })).toBeNull();
    expect(within(settings).getByRole("heading", { name: "Unit Management" })).toBeInTheDocument();
    expect(within(settings).getByTestId("menu-unit-config")).toHaveAttribute(
      "href",
      "/unit/config"
    );

    await user.click(within(settings).getByTestId("menu-password"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();

    await user.click(tab);
    await user.click(screen.getByRole("button", { name: "Tanpa aksi" }));
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();

    await user.click(tab);
    await user.click(screen.getByTestId("app-shell-mobile-logout"));
    expect(onLogout).toHaveBeenCalledTimes(1);

    // Tapping the tab again closes it, as does tapping a link tab (even the current one).
    await user.click(tab);
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();
    await user.click(tab);
    await user.click(screen.getByRole("link", { name: "Beranda" }));
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();
    await user.click(tab);
    await user.click(
      within(screen.getByTestId("app-shell-mobile-settings")).getByTestId("menu-unit-config")
    );
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();
  });

  it("closes Pengaturan on navigation and marks the current page in it", async () => {
    const user = userEvent.setup();
    const { rerender } = renderShell({
      pathname: "/profile",
      bottomNav: [{ href: "/alert", label: "Notifikasi", icon: Bell }],
      userMenu: [{ label: "Profil", href: "/profile" }],
    });
    await user.click(screen.getByRole("button", { name: "Pengaturan" }));
    const settings = screen.getByTestId("app-shell-mobile-settings");
    expect(within(settings).getByRole("link", { name: "Profil" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    // Loose items list under Menu; no user, no Keluar.
    expect(within(settings).getByRole("heading", { name: "Menu" })).toBeInTheDocument();
    expect(within(settings).getByTestId("menu-dashboard")).not.toHaveAttribute("aria-current");
    expect(within(settings).queryByTestId("app-shell-mobile-user")).toBeNull();
    expect(within(settings).queryByTestId("app-shell-mobile-logout")).toBeNull();

    rerender(
      <AppShell
        menu={MENU}
        pathname="/dashboard"
        brand="MoNo"
        bottomNav={[{ href: "/alert", label: "Notifikasi", icon: Bell }]}
      >
        <p>Isi halaman</p>
      </AppShell>
    );
    expect(screen.queryByTestId("app-shell-mobile-settings")).not.toBeInTheDocument();
    expect(screen.getByText("Isi halaman").parentElement).not.toHaveClass("max-md:hidden");
    expect(screen.getByRole("button", { name: "Pengaturan" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("shows a skeleton account while the user loads, and a bare screen otherwise", async () => {
    const user = userEvent.setup();
    renderShell({ bottomNav: BOTTOM_NAV, userLoading: true });
    await user.click(screen.getByRole("button", { name: "Pengaturan" }));
    expect(screen.getByTestId("app-shell-mobile-user-loading")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Akun" })).toBeNull();
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
});

describe("userInitials", () => {
  it("takes up to two initials", () => {
    expect(userInitials("budi  santoso wibowo")).toBe("BS");
    expect(userInitials("Siti")).toBe("S");
  });
});
