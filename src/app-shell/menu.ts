import type { AppShellEntry, AppShellGroup } from "./types.js";

export function isAppShellGroup(entry: AppShellEntry): entry is AppShellGroup {
  return entry.kind === "group";
}

/** Whether `pathname` is `href` or a page below it. */
export function isRouteActive(href: string, pathname: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Where the entry links to: a group opens its first child. */
export function appShellEntryHref(entry: AppShellEntry): string {
  return isAppShellGroup(entry) ? entry.children[0].href : entry.href;
}

/** Whether `pathname` belongs to the entry (for a group: any of its children). */
export function appShellEntryMatches(entry: AppShellEntry, pathname: string): boolean {
  return isAppShellGroup(entry)
    ? entry.children.some((child) => isRouteActive(child.href, pathname))
    : isRouteActive(entry.href, pathname);
}

/** The entry the current route belongs to, if any. */
export function findActiveAppShellEntry(
  entries: AppShellEntry[],
  pathname: string
): AppShellEntry | undefined {
  return entries.find((entry) => appShellEntryMatches(entry, pathname));
}

/**
 * The entries a user may see: inaccessible pages go; a group keeps only its
 * accessible children and goes when none are left.
 */
export function filterAppShellMenu(
  entries: AppShellEntry[],
  canAccess: (href: string) => boolean
): AppShellEntry[] {
  return entries.flatMap((entry): AppShellEntry[] => {
    if (!isAppShellGroup(entry)) return canAccess(entry.href) ? [entry] : [];
    const children = entry.children.filter((child) => canAccess(child.href));
    return children.length ? [{ ...entry, children }] : [];
  });
}
