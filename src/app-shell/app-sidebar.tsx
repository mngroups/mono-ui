"use client";

import { cn } from "@mono/utils";
import { ChevronsLeft } from "lucide-react";
import type { ReactNode } from "react";

import { PlainButton } from "../ui/plain-button.js";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "../ui/sidebar.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";
import {
  appShellEntryHref,
  appShellEntryMatches,
  findActiveAppShellEntry,
  isAppShellGroup,
  isRouteActive,
} from "./menu.js";
import type {
  AppShellEntry,
  AppShellLink,
  AppShellLinkComponent,
  AppShellUser,
  AppShellUserMenuItem,
} from "./types.js";
import { UserFooter } from "./user-footer.js";

const LINK_BASE =
  "relative flex w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors";
const LINK_ACTIVE =
  "bg-primary/10 text-primary before:absolute before:inset-y-1.5 before:left-0 before:w-1 before:rounded-r-full before:bg-primary";
const LINK_IDLE = "text-sidebar-foreground hover:bg-sidebar-foreground/10";

export type AppSidebarProps = {
  menu: AppShellEntry[];
  pathname: string;
  linkComponent: AppShellLinkComponent;
  brand: ReactNode;
  brandMark?: ReactNode;
  user?: AppShellUser | null;
  userLoading: boolean;
  userMenu: AppShellUserMenuItem[];
  onLogout?: () => void;
  appVersion?: string;
};

/**
 * The shell's sidebar, in one of four layouts:
 * - wide (desktop, expanded): logo, labelled menu, user footer;
 * - nested (desktop, expanded, on a group's route): icon rail + a panel listing the group;
 * - collapsed (desktop): icon rail only;
 * - mobile: the wide layout in a slide-in sheet, the active group's pages listed inline.
 */
export function AppSidebar({
  menu,
  pathname,
  linkComponent: Link,
  brand,
  brandMark,
  user,
  userLoading,
  userMenu,
  onLogout,
  appVersion,
}: AppSidebarProps) {
  const { state, isMobile, toggleSidebar, setOpenMobile } = useSidebar();
  // The mobile sheet is always wide, whatever the desktop state.
  const collapsed = state === "collapsed" && !isMobile;
  const active = findActiveAppShellEntry(menu, pathname);
  const nestedGroup = !isMobile && active && isAppShellGroup(active) ? active : null;

  const closeMobile = () => setOpenMobile(false);
  const isActive = (href: string) => isRouteActive(href, pathname);

  const collapseToggle = (
    <PlainButton
      type="button"
      onClick={toggleSidebar}
      aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
      className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      <ChevronsLeft className={cn("size-6 transition-transform", collapsed && "rotate-180")} />
    </PlainButton>
  );

  const rail = (
    <nav aria-label="Menu" className="flex flex-col items-center gap-2">
      {menu.map((entry) => {
        const Icon = entry.icon;
        const current = appShellEntryMatches(entry, pathname);
        return (
          <Tooltip key={entry.label}>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Link
                  href={appShellEntryHref(entry)}
                  aria-label={entry.label}
                  aria-current={current ? "page" : undefined}
                  data-testid={entry.testId}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl transition-colors",
                    current
                      ? "bg-primary/10 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="size-5" />
                </Link>
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} showArrow={false}>
              {entry.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );

  /**
   * A menu row. `groupOpen` marks a group's own row: it links to the first page and
   * turns primary while one of its pages is open (the page itself gets the bar).
   */
  const pageLink = (
    link: AppShellLink,
    { child = false, groupOpen }: { child?: boolean; groupOpen?: boolean } = {}
  ) => {
    const Icon = link.icon;
    const isGroupRow = groupOpen !== undefined;
    const current = !isGroupRow && isActive(link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={current ? "page" : undefined}
        data-testid={link.testId}
        onClick={closeMobile}
        className={cn(
          LINK_BASE,
          isMobile ? "py-3.5" : "py-2.5",
          child ? "font-medium" : "font-semibold",
          current
            ? LINK_ACTIVE
            : groupOpen
              ? "text-primary hover:bg-sidebar-foreground/10"
              : LINK_IDLE
        )}
      >
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="min-w-0 truncate">{link.label}</span>
      </Link>
    );
  };

  const footer = (
    <UserFooter
      user={user}
      loading={userLoading}
      collapsed={collapsed || nestedGroup !== null}
      menu={userMenu}
      onLogout={onLogout}
      appVersion={appVersion}
      isActive={isActive}
      linkComponent={Link}
      onItemClick={closeMobile}
    />
  );

  let body: ReactNode;
  if (collapsed) {
    body = (
      <>
        <SidebarHeader className="flex flex-row items-center justify-center px-4 pt-3">
          {collapseToggle}
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden p-1">{rail}</SidebarContent>
        {footer}
      </>
    );
  } else if (nestedGroup) {
    body = (
      <div className="flex h-full w-full">
        <div className="flex w-16 shrink-0 flex-col items-center gap-2 border-r border-border pt-3">
          {collapseToggle}
          <div className="mt-1">{rail}</div>
          <div className="mt-auto w-full">{footer}</div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <div className="shrink-0">{brandMark ?? brand}</div>
            <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
            <h2 className="min-w-0 truncate text-base font-semibold" title={nestedGroup.label}>
              {nestedGroup.label}
            </h2>
          </div>
          <hr className="mx-2 mb-1 shrink-0 border-sidebar-foreground/10" />
          <nav
            aria-label={nestedGroup.label}
            className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pt-1"
          >
            {nestedGroup.children.map((child) => pageLink(child, { child: true }))}
          </nav>
        </div>
      </div>
    );
  } else {
    body = (
      <>
        <SidebarHeader className="flex flex-row items-center justify-between gap-2 px-4 pt-3">
          <div className="min-w-0">{brand}</div>
          {!isMobile && collapseToggle}
        </SidebarHeader>
        <SidebarContent className="overflow-x-hidden">
          <nav aria-label="Menu" className="flex flex-col gap-0.5 px-3 pt-3">
            {menu.map((entry) => {
              if (!isAppShellGroup(entry)) return pageLink(entry);
              const open = entry === active;
              return (
                <div key={entry.id} className="flex flex-col gap-0.5">
                  {pageLink({ ...entry, href: appShellEntryHref(entry) }, { groupOpen: open })}
                  {open && (
                    <div className="ml-4 flex flex-col gap-0.5 border-l border-sidebar-foreground/10 pl-2">
                      {entry.children.map((child) => pageLink(child, { child: true }))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </SidebarContent>
        {footer}
      </>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-x-hidden rounded-none text-sidebar-foreground shadow-[2px_0_8px_rgba(0,0,0,0.04)] transition-[width] duration-300 ease-in-out dark:shadow-[2px_0_8px_rgba(0,0,0,0.4)]"
    >
      {body}
    </Sidebar>
  );
}
