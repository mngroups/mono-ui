"use client";

import { cn } from "@mono/utils";
import { ChevronsUpDown, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { PlainButton } from "../ui/plain-button.js";
import { SidebarFooter } from "../ui/sidebar.js";
import { Skeleton } from "../ui/skeleton.js";
import type { AppShellLinkComponent, AppShellUser, AppShellUserMenuItem } from "./types.js";

/** Up to two initials, e.g. "Budi Santoso" → "BS". */
export function userInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/**
 * Sidebar footer: the signed-in user, opening an account menu (details, the
 * given menu items, and Keluar). A skeleton of the same height while loading.
 */
export function UserFooter({
  user,
  loading,
  collapsed,
  menu,
  onLogout,
  appVersion,
  isActive,
  linkComponent: Link,
  onItemClick,
}: {
  user?: AppShellUser | null;
  loading: boolean;
  collapsed: boolean;
  menu: AppShellUserMenuItem[];
  onLogout?: () => void;
  appVersion?: string;
  isActive: (href: string) => boolean;
  linkComponent: AppShellLinkComponent;
  /** Called after any item is chosen (closes the mobile sheet). */
  onItemClick: () => void;
}) {
  if (loading) {
    return (
      <SidebarFooter className="border-t px-4 py-2">
        <div
          data-testid="app-shell-user-loading"
          className={cn(
            "flex items-center gap-3 p-1",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="size-6 shrink-0" />
            {!collapsed && <Skeleton variant="text" className="h-3.5 w-28" />}
          </div>
          {!collapsed && <Skeleton className="size-4 shrink-0 rounded" />}
        </div>
      </SidebarFooter>
    );
  }

  if (!user) return null;

  return (
    <SidebarFooter className="border-t px-4 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PlainButton
            type="button"
            aria-label={`Akun ${user.name}`}
            data-testid="app-shell-user-menu"
            className={cn(
              "flex w-full items-center gap-3 rounded-md p-1 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <span className="flex min-w-0 items-center gap-3">
              <Avatar className="size-6 shrink-0 bg-primary/20">
                {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
                <AvatarFallback className="text-[10px] font-semibold text-sidebar-foreground">
                  {userInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <span className="min-w-0 truncate text-sm font-medium">{user.name}</span>
              )}
            </span>
            {!collapsed && <ChevronsUpDown className="size-4 shrink-0 opacity-70" />}
          </PlainButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="start"
          sideOffset={12}
          className="z-9999 w-70 rounded-xl bg-card p-2 text-card-foreground shadow-xl"
        >
          <DropdownMenuLabel className="px-2 py-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 text-base font-semibold wrap-break-word">{user.name}</div>
              {appVersion && (
                <span
                  title="Versi aplikasi"
                  className="mt-1 shrink-0 rounded-full border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground"
                >
                  v{appVersion}
                </span>
              )}
            </div>
            {user.description && (
              <div className="mt-0.5 text-xs font-normal text-muted-foreground">
                {user.description}
              </div>
            )}
          </DropdownMenuLabel>

          {menu.length > 0 && <DropdownMenuSeparator />}

          {menu.map((item) => {
            const current = item.href !== undefined && isActive(item.href);
            const className = cn(
              "gap-2 rounded-md px-2 py-2",
              current &&
                "bg-primary/10 font-semibold text-primary focus:bg-primary/15 focus:text-primary [&_svg]:text-primary!"
            );
            if (item.href !== undefined) {
              return (
                <DropdownMenuItem key={item.label} asChild className={className}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    data-testid={item.testId}
                    onClick={onItemClick}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              );
            }
            return (
              <DropdownMenuItem
                key={item.label}
                className={className}
                data-testid={item.testId}
                onSelect={() => {
                  onItemClick();
                  item.onSelect?.();
                }}
              >
                {item.icon}
                {item.label}
              </DropdownMenuItem>
            );
          })}

          {onLogout && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="app-shell-logout"
                className="gap-2 rounded-md px-2 py-2 text-destructive focus:text-destructive"
                onSelect={onLogout}
              >
                <LogOut className="size-4" />
                Keluar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  );
}
