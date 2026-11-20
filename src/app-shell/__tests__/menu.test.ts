import { Home, Truck } from "lucide-react";
import { describe, expect, it } from "vitest";

import {
  appShellEntryHref,
  appShellEntryMatches,
  filterAppShellMenu,
  findActiveAppShellEntry,
  isAppShellGroup,
  isRouteActive,
} from "../menu.js";
import type { AppShellEntry, AppShellGroup } from "../types.js";

const GROUP: AppShellGroup = {
  kind: "group",
  id: "unit",
  label: "Unit",
  icon: Truck,
  children: [
    { href: "/unit/config", label: "Konfigurasi" },
    { href: "/unit/mapping", label: "Mapping" },
  ],
};
const MENU: AppShellEntry[] = [{ href: "/dashboard", label: "Dashboard", icon: Home }, GROUP];

describe("app shell menu helpers", () => {
  it("matches a route and the pages below it, not lookalike prefixes", () => {
    expect(isRouteActive("/fuel", "/fuel")).toBe(true);
    expect(isRouteActive("/fuel", "/fuel/42")).toBe(true);
    expect(isRouteActive("/fuel", "/fuel-ratio")).toBe(false);
  });

  it("tells groups from items and links a group to its first child", () => {
    expect(isAppShellGroup(GROUP)).toBe(true);
    expect(isAppShellGroup(MENU[0])).toBe(false);
    expect(appShellEntryHref(GROUP)).toBe("/unit/config");
    expect(appShellEntryHref(MENU[0])).toBe("/dashboard");
  });

  it("matches a group by any of its children and finds the active entry", () => {
    expect(appShellEntryMatches(GROUP, "/unit/mapping/7")).toBe(true);
    expect(appShellEntryMatches(GROUP, "/dashboard")).toBe(false);
    expect(findActiveAppShellEntry(MENU, "/unit/mapping")).toBe(GROUP);
    expect(findActiveAppShellEntry(MENU, "/dashboard/x")).toBe(MENU[0]);
    expect(findActiveAppShellEntry(MENU, "/other")).toBeUndefined();
  });

  it("filters inaccessible pages and drops empty groups", () => {
    const onlyMapping = filterAppShellMenu(MENU, (href) => href === "/unit/mapping");
    expect(onlyMapping).toEqual([{ ...GROUP, children: [GROUP.children[1]] }]);
    expect(filterAppShellMenu(MENU, (href) => href === "/dashboard")).toEqual([MENU[0]]);
    expect(filterAppShellMenu(MENU, () => false)).toEqual([]);
  });
});
