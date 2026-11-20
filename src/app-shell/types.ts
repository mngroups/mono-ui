import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";

/** An icon component, e.g. from `lucide-react`. */
export type AppShellIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

/** A page link. The icon is optional inside a group. */
export type AppShellLink = {
  href: string;
  label: string;
  icon?: AppShellIcon;
  testId?: string;
};

/** A top-level page in the sidebar. */
export type AppShellItem = AppShellLink & { kind?: "link"; icon: AppShellIcon };

/**
 * A group of pages with no page of its own (one level deep, at least one child).
 * It links to its first child; on desktop its routes open the nested layout
 * (icon rail + a panel listing the children).
 */
export type AppShellGroup = {
  kind: "group";
  id: string;
  label: string;
  icon: AppShellIcon;
  testId?: string;
  children: AppShellLink[];
};

export type AppShellEntry = AppShellItem | AppShellGroup;

/** A tab of the mobile bottom navigation. */
export type AppShellNavItem = {
  href: string;
  label: string;
  icon: AppShellIcon;
  testId?: string;
};

/** The signed-in user shown in the sidebar footer. */
export type AppShellUser = {
  name: string;
  /** Extra lines under the name in the account menu, e.g. company and role. */
  description?: ReactNode;
  avatarUrl?: string;
};

/** An account-menu entry: a link (`href`) or an action (`onSelect`). */
export type AppShellUserMenuItem = {
  label: string;
  icon?: ReactNode;
  href?: string;
  onSelect?: () => void;
  testId?: string;
};

export type AppShellLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
};

/**
 * Renders every link in the shell. Defaults to a plain `<a>`; pass your router's
 * link (e.g. `next/link`) for client-side navigation. It must forward its props
 * to the anchor.
 */
export type AppShellLinkComponent = ComponentType<AppShellLinkProps>;
