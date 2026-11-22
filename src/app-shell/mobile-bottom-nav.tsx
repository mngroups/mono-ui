"use client";

import { cn } from "@mono/utils";
import { useEffect, useRef, useState } from "react";

import { PlainButton } from "../ui/plain-button.js";
import { DefaultLink } from "./default-link.js";
import { isRouteActive } from "./menu.js";
import type { AppShellIcon, AppShellLinkComponent, AppShellNavItem } from "./types.js";

/** A button tab after the links, e.g. the shell's Pengaturan screen. */
export type MobileBottomNavAction = {
  label: string;
  icon: AppShellIcon;
  /** Marks this tab instead of the route's. */
  active: boolean;
  onSelect: () => void;
  testId?: string;
};

const TAB_CLASS =
  "relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors";

function TabContent({
  icon: Icon,
  label,
  active,
}: {
  icon: AppShellIcon;
  label: string;
  active: boolean;
}) {
  return (
    <>
      <Icon className="size-[22px]" strokeWidth={active ? 2.3 : 1.8} />
      <span
        className={cn(
          "max-w-full truncate text-[10px] leading-none",
          active ? "font-semibold" : "font-medium"
        )}
      >
        {label}
      </span>
    </>
  );
}

const tabTone = (active: boolean) =>
  active ? "text-primary" : "text-foreground/60 active:text-foreground";

/** How long the lens stays lifted while it slides to a new tab. */
const LENS_MOVE_MS = 360;

/**
 * Mobile tab bar styled as "liquid glass": a floating frosted dock with a glass
 * lens that slides under the active tab. Hidden from `md` up. `AppShell` shows it
 * on the tab roots when given `bottomNav`; render it yourself for a custom shell.
 */
export function MobileBottomNav({
  items,
  pathname,
  linkComponent: Link = DefaultLink,
  action,
  onNavigate,
  dense = false,
  className,
}: {
  /** Tabs, left to right (3–5 fit best, 6 at most counting `action`). */
  items: AppShellNavItem[];
  /** A button tab after `items`. */
  action?: MobileBottomNavAction;
  /** Called when a link tab is tapped, even the current one. */
  onNavigate?: () => void;
  /** Current route; the matching tab (or a page below it) is active. */
  pathname: string;
  /** Router link for the tabs. Defaults to a plain `<a>`. */
  linkComponent?: AppShellLinkComponent;
  /** Denser, more opaque glass for busy backgrounds such as maps. */
  dense?: boolean;
  className?: string;
}) {
  const activeIndex = action?.active
    ? items.length
    : items.findIndex((item) => isRouteActive(item.href, pathname));
  const slots = items.length + (action ? 1 : 0);

  // Lift the lens into clear glass while it travels to a new tab.
  const [moving, setMoving] = useState(false);
  const previousIndex = useRef(activeIndex);
  useEffect(() => {
    if (previousIndex.current === activeIndex) return;
    const fromTab = previousIndex.current >= 0;
    previousIndex.current = activeIndex;
    if (!fromTab || activeIndex < 0) return;
    setMoving(true);
    const timer = setTimeout(() => setMoving(false), LENS_MOVE_MS);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        "liquid-glass fixed right-3 bottom-[calc(var(--safe-bottom)+0.75rem)] left-3 z-2500 h-16 rounded-full px-safe md:hidden",
        dense && "liquid-glass-dense",
        className
      )}
    >
      <div className="relative mx-auto flex h-full w-full max-w-lg items-stretch px-1.5">
        {/* Lens: one slot wide, slid with an inline transform. */}
        <span
          aria-hidden
          data-moving={moving}
          className="liquid-glass-lens pointer-events-none absolute top-1.5 bottom-1.5 left-1.5 rounded-full"
          style={{
            width: `calc((100% - 0.75rem) / ${slots})`,
            transform: `translateX(${Math.max(activeIndex, 0) * 100}%)`,
            opacity: activeIndex >= 0 ? 1 : 0,
          }}
        >
          <span className="liquid-glass-lens-body" />
        </span>

        {items.map((item, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              data-testid={item.testId}
              onClick={onNavigate}
              className={cn(TAB_CLASS, tabTone(active))}
            >
              <TabContent icon={item.icon} label={item.label} active={active} />
            </Link>
          );
        })}

        {action && (
          <PlainButton
            type="button"
            aria-label={action.label}
            aria-pressed={action.active}
            data-testid={action.testId}
            onClick={action.onSelect}
            className={cn(TAB_CLASS, tabTone(action.active))}
          >
            <TabContent icon={action.icon} label={action.label} active={action.active} />
          </PlainButton>
        )}
      </div>
    </nav>
  );
}
