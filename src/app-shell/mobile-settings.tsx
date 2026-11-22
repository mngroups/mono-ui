"use client";

import { cn } from "@mono/utils";
import { ChevronRight, LogOut } from "lucide-react";
import type { ReactNode } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.js";
import { PlainButton } from "../ui/plain-button.js";
import { Skeleton } from "../ui/skeleton.js";
import { isAppShellGroup, isRouteActive } from "./menu.js";
import type {
  AppShellEntry,
  AppShellItem,
  AppShellLink,
  AppShellLinkComponent,
  AppShellUser,
  AppShellUserMenuItem,
} from "./types.js";
import { userInitials } from "./user-footer.js";

const ROW =
  "flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-medium transition-colors";
const ROW_IDLE = "text-foreground hover:bg-foreground/5 active:bg-foreground/10";
const ROW_ACTIVE = "bg-primary/10 font-semibold text-primary";

function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && (
        <h2 className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
      )}
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

/** The account card: the app's logo sits large and faint behind the content. */
function AccountCard({
  testId,
  brand,
  children,
}: {
  testId: string;
  brand: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      className="relative overflow-hidden rounded-xl border border-border bg-card bg-linear-to-br from-primary/10 to-transparent p-4"
    >
      <div
        aria-hidden
        data-testid="app-shell-mobile-brand"
        className="pointer-events-none absolute right-3 bottom-2 origin-bottom-right scale-[2.5] opacity-10 grayscale select-none"
      >
        {brand}
      </div>
      <div className="relative flex items-center gap-3">{children}</div>
    </div>
  );
}

export type MobileSettingsProps = {
  /** Title at the top, the same as the tab's label. */
  title: string;
  /** The app's logo, faint in the account card's background. */
  brand: ReactNode;
  user?: AppShellUser | null;
  userLoading: boolean;
  userMenu: AppShellUserMenuItem[];
  onLogout?: () => void;
  appVersion?: string;
  /** The menu pages the bottom nav doesn't have. */
  menu: AppShellEntry[];
  pathname: string;
  linkComponent: AppShellLinkComponent;
  /** Called after any row is chosen (closes the screen). */
  onNavigate: () => void;
};

/**
 * The shell's mobile Pengaturan screen: the account (on the logo's backdrop) (details, account menu,
 * Keluar) and every menu page that isn't a bottom-nav tab.
 */
export function MobileSettings({
  title,
  brand,
  user,
  userLoading,
  userMenu,
  onLogout,
  appVersion,
  menu,
  pathname,
  linkComponent: Link,
  onNavigate,
}: MobileSettingsProps) {
  const rowClass = (href?: string) =>
    cn(ROW, href !== undefined && isRouteActive(href, pathname) ? ROW_ACTIVE : ROW_IDLE);

  const linkRow = (link: AppShellLink) => {
    const Icon = link.icon;
    const current = isRouteActive(link.href, pathname);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={current ? "page" : undefined}
        data-testid={link.testId}
        onClick={onNavigate}
        className={rowClass(link.href)}
      >
        {Icon && <Icon className="size-5 shrink-0" />}
        <span className="min-w-0 flex-1 truncate">{link.label}</span>
        <ChevronRight className="size-4 shrink-0 opacity-50" />
      </Link>
    );
  };

  const looseItems = menu.filter((entry): entry is AppShellItem => !isAppShellGroup(entry));
  const groups = menu.filter(isAppShellGroup);

  return (
    <div data-testid="app-shell-mobile-settings" className="flex flex-col gap-6 p-4 md:hidden">
      <h1 className="text-xl font-semibold">{title}</h1>

      {userLoading ? (
        <AccountCard testId="app-shell-mobile-user-loading" brand={brand}>
          <Skeleton variant="circular" className="size-12 shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton variant="text" className="h-4 w-32" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        </AccountCard>
      ) : (
        user && (
          <AccountCard testId="app-shell-mobile-user" brand={brand}>
            <Avatar className="size-12 shrink-0 bg-primary/20">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
              <AvatarFallback className="text-sm font-semibold text-foreground">
                {userInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold wrap-break-word">{user.name}</div>
              {user.description && (
                <div className="mt-0.5 text-xs text-muted-foreground">{user.description}</div>
              )}
            </div>
            {appVersion && (
              <span
                title="Versi aplikasi"
                className="shrink-0 self-start rounded-full border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] leading-none text-muted-foreground"
              >
                v{appVersion}
              </span>
            )}
          </AccountCard>
        )
      )}

      {userMenu.length > 0 && (
        <Section title="Akun">
          {userMenu.map((item) =>
            item.href !== undefined ? (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isRouteActive(item.href, pathname) ? "page" : undefined}
                data-testid={item.testId}
                onClick={onNavigate}
                className={rowClass(item.href)}
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                <ChevronRight className="size-4 shrink-0 opacity-50" />
              </Link>
            ) : (
              <PlainButton
                key={item.label}
                type="button"
                data-testid={item.testId}
                onClick={() => {
                  onNavigate();
                  item.onSelect?.();
                }}
                className={rowClass()}
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </PlainButton>
            )
          )}
        </Section>
      )}

      {looseItems.length > 0 && <Section title="Menu">{looseItems.map(linkRow)}</Section>}

      {groups.map((group) => (
        <Section key={group.id} title={group.label}>
          {group.children.map(linkRow)}
        </Section>
      ))}

      {onLogout && (
        <Section>
          <PlainButton
            type="button"
            data-testid="app-shell-mobile-logout"
            onClick={onLogout}
            className={cn(ROW, "text-destructive hover:bg-destructive/5")}
          >
            <LogOut className="size-5 shrink-0" />
            Keluar
          </PlainButton>
        </Section>
      )}
    </div>
  );
}
