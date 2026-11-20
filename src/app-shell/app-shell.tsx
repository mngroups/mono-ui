"use client";

import { cn } from "@mono/utils";
import { Menu } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { PlainButton } from "../ui/plain-button.js";
import { SidebarProvider, useSidebar } from "../ui/sidebar.js";
import { AppSidebar } from "./app-sidebar.js";
import { DefaultLink } from "./default-link.js";
import { findActiveAppShellEntry, isAppShellGroup } from "./menu.js";
import { MobileBottomNav } from "./mobile-bottom-nav.js";
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
  /** Logo shown in the wide sidebar and the mobile top bar. */
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
   * Mobile tab bar. It shows on the tabs' own routes (exact match) and gives way
   * to the page's back navigation deeper in.
   */
  bottomNav?: AppShellNavItem[];
  /** Mobile top bar with the menu button and logo. Turn off when pages bring their own header. */
  mobileHeader?: boolean;
  /** Trailing slot of the mobile top bar, e.g. a notification button. */
  mobileHeaderAction?: ReactNode;
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

function MobileTopBar({ brand, action }: { brand: ReactNode; action?: ReactNode }) {
  const { toggleSidebar } = useSidebar();
  return (
    <header className="shrink-0 border-b border-border bg-background pt-safe md:hidden">
      <div className="flex h-14 items-center justify-between gap-2 px-4">
        <PlainButton
          type="button"
          onClick={toggleSidebar}
          aria-label="Buka menu"
          className="flex size-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/10"
        >
          <Menu className="size-6" />
        </PlainButton>
        <div className="flex min-w-0 justify-center">{brand}</div>
        <div className="flex size-10 items-center justify-center">{action}</div>
      </div>
    </header>
  );
}

/**
 * The application frame for a new app: sidebar, mobile top bar, mobile bottom
 * tab bar and the scrolling page area. Router-agnostic: pass the current
 * `pathname` and your router's `linkComponent`. Groups open a nested panel on
 * desktop; on mobile the sidebar is a sheet opened from the top bar.
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
  mobileHeader = true,
  mobileHeaderAction,
  navigating = false,
  defaultOpen,
  open,
  onOpenChange,
  className,
  children,
}: AppShellProps) {
  const active = findActiveAppShellEntry(menu, pathname);
  const nested = active !== undefined && isAppShellGroup(active);
  const showBottomNav = bottomNav?.some((item) => item.href === pathname) ?? false;

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
        {mobileHeader && <MobileTopBar brand={brand} action={mobileHeaderAction} />}
        <main
          className={cn(
            "scrollbar-modern relative min-h-0 w-full flex-1 overflow-y-auto pb-safe",
            !mobileHeader && "pt-safe",
            showBottomNav && "max-md:pb-(--mobile-bottom-nav-height)"
          )}
        >
          {children}
        </main>
      </div>
      {showBottomNav && (
        <MobileBottomNav items={bottomNav!} pathname={pathname} linkComponent={linkComponent} />
      )}
    </SidebarProvider>
  );
}
