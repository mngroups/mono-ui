"use client";

import { cn } from "@mono/utils";
import { Settings } from "lucide-react";
import { type CSSProperties, type ReactNode, useState } from "react";

import { SidebarProvider } from "../ui/sidebar.js";
import { AppSidebar } from "./app-sidebar.js";
import { DefaultLink } from "./default-link.js";
import {
  appShellMenuWithout,
  findActiveAppShellEntry,
  isAppShellGroup,
  isAppShellMenuPage,
  isRouteActive,
  MAX_BOTTOM_NAV_TABS,
} from "./menu.js";
import { MobileBottomNav } from "./mobile-bottom-nav.js";
import { MobileSettings } from "./mobile-settings.js";
import { NavProgressBar } from "./nav-progress-bar.js";
import type {
  AppShellEntry,
  AppShellLinkComponent,
  AppShellNavItem,
  AppShellUser,
  AppShellUserMenuItem,
} from "./types.js";

/** Desktop sidebar widths: wide menu, nested (rail + group panel), icon rail. */
const SIDEBAR_WIDTH = "18rem";
const SIDEBAR_WIDTH_NESTED = "22rem";
const SIDEBAR_WIDTH_RAIL = "4rem";

export type AppShellProps = {
  /** Sidebar entries, top to bottom. Filter out what the user can't open first (`filterAppShellMenu`). */
  menu: AppShellEntry[];
  /** Current route, e.g. `usePathname()`. Drives the active item, nested panel and bottom nav. */
  pathname: string;
  /** Router link for every link in the shell (e.g. `next/link`). Defaults to a plain `<a>`. */
  linkComponent?: AppShellLinkComponent;
  /** Logo shown in the wide sidebar and on the mobile Pengaturan screen. */
  brand: ReactNode;
  /** Compact logo for the nested panel header. Falls back to `brand`. */
  brandMark?: ReactNode;
  /** Signed-in user in the sidebar footer. Omit (or `null`) to hide the footer. */
  user?: AppShellUser | null;
  /** Shows a skeleton footer while the user is loading. */
  userLoading?: boolean;
  /** Account-menu items above Keluar. */
  userMenu?: AppShellUserMenuItem[];
  /** Adds Keluar to the account menu. */
  onLogout?: () => void;
  /** Shown as a `v1.2.3` badge in the account menu. */
  appVersion?: string;
  /**
   * Mobile navigation (there is no sidebar on mobile). Up to 5 tabs are used;
   * the shell adds a Pengaturan tab as the 6th, opening a screen with the
   * account and every menu page that isn't a tab. The bar shows on the tabs'
   * routes, the menu's pages and the account-menu pages (exact match) and gives
   * way to the page's back navigation deeper in.
   */
  bottomNav?: AppShellNavItem[];
  /** Label of the mobile Pengaturan tab and screen. */
  settingsLabel?: string;
  /** Shows a progress bar along the top while a navigation is pending. */
  navigating?: boolean;
  /** Initial desktop open state, e.g. from the `sidebar_state` cookie. */
  defaultOpen?: boolean;
  /** Desktop open state (controlled). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
};

/**
 * The application frame for a new app: desktop sidebar, mobile bottom
 * tab bar and the scrolling page area. Router-agnostic: pass the current
 * `pathname` and your router's `linkComponent`. Groups open a nested panel on
 * desktop. Mobile has no sidebar: only the bottom nav, whose Pengaturan tab
 * holds the account and the menu pages that aren't tabs.
 */
export function AppShell({
  menu,
  pathname,
  linkComponent = DefaultLink,
  brand,
  brandMark,
  user,
  userLoading = false,
  userMenu = [],
  onLogout,
  appVersion,
  bottomNav,
  settingsLabel = "Pengaturan",
  navigating = false,
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: AppShellProps) {
  const active = findActiveAppShellEntry(menu, pathname);
  const nested = active !== undefined && isAppShellGroup(active);
  const tabs = bottomNav?.slice(0, MAX_BOTTOM_NAV_TABS) ?? [];

  // The Pengaturan screen belongs to the route it was opened on: navigating closes it.
  const [settingsPath, setSettingsPath] = useState<string | null>(null);
  const settingsOpen = tabs.length > 0 && settingsPath === pathname;
  const closeSettings = () => setSettingsPath(null);

  const onTabRoot = tabs.some((item) => item.href === pathname);
  const onSettingsPage =
    isAppShellMenuPage(menu, pathname) || userMenu.some((item) => item.href === pathname);
  const showBottomNav = tabs.length > 0 && (settingsOpen || onTabRoot || onSettingsPage);
  // A menu or account page that isn't a tab was reached from Pengaturan, so that tab stays marked.
  const settingsActive = settingsOpen || !tabs.some((item) => isRouteActive(item.href, pathname));

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className={cn("h-dvh overflow-hidden", className)}
      style={
        {
          "--sidebar-width": nested ? SIDEBAR_WIDTH_NESTED : SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_RAIL,
        } as CSSProperties
      }
    >
      {navigating && <NavProgressBar />}
      <AppSidebar
        menu={menu}
        pathname={pathname}
        linkComponent={linkComponent}
        brand={brand}
        brandMark={brandMark}
        user={user}
        userLoading={userLoading}
        userMenu={userMenu}
        onLogout={onLogout}
        appVersion={appVersion}
      />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <main
          className={cn(
            "scrollbar-modern relative min-h-0 w-full flex-1 overflow-y-auto pt-safe pb-safe",
            showBottomNav && "max-md:pb-(--mobile-bottom-nav-height)"
          )}
        >
          {settingsOpen && (
            <MobileSettings
              title={settingsLabel}
              brand={brand}
              user={user}
              userLoading={userLoading}
              userMenu={userMenu}
              onLogout={onLogout}
              appVersion={appVersion}
              menu={appShellMenuWithout(
                menu,
                tabs.map((item) => item.href)
              )}
              pathname={pathname}
              linkComponent={linkComponent}
              onNavigate={closeSettings}
            />
          )}
          <div className={cn("contents", settingsOpen && "max-md:hidden")}>{children}</div>
        </main>
      </div>
      {showBottomNav && (
        <MobileBottomNav
          items={tabs}
          pathname={pathname}
          linkComponent={linkComponent}
          onNavigate={closeSettings}
          action={{
            label: settingsLabel,
            icon: Settings,
            active: settingsActive,
            onSelect: () => setSettingsPath(settingsOpen ? null : pathname),
            testId: "app-shell-settings-tab",
          }}
        />
      )}
    </SidebarProvider>
  );
}
