"use client";

import { useScrollActiveTab } from "@mono/hooks";
import { cn } from "@mono/utils";
import { Tabs as TabsPrimitive } from "radix-ui";
import { useRef } from "react";

export type TabItem<T extends string> = {
  key: T;
  label: string;
};

interface TabBarProps<T extends string> {
  /** Tabs in display order; `key` identifies the tab, `label` is the visible text. */
  items: readonly TabItem<T>[];
  /** Key of the selected tab (controlled). */
  active: T;
  /** Called with the clicked tab's key. */
  onChange: (key: T) => void;
  /** Applied to the wrapper (e.g. `border-b-0` to drop its underline). */
  className?: string;
  /** Mobile: scroll edge-to-edge past the page's px-4 gutter. Leave off inside a card. */
  bleed?: boolean;
  /** Accessible name of the tab list. Defaults to "Tab". */
  "aria-label"?: string;
}

/**
 * Underlined tab bar shared by the ATM views and Akses Pengguna, on top of
 * Radix Tabs (tab roles, arrow-key focus). Only the tab list is rendered —
 * callers swap their own content on `active`. Tabs switch on click or
 * Enter/Space only (manual activation), like the plain buttons they replace.
 */
export function TabBar<T extends string>({
  items,
  active,
  onChange,
  className,
  bleed = false,
  "aria-label": ariaLabel = "Tab",
}: TabBarProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollActiveTab(rootRef, active);

  return (
    <div ref={rootRef} className={cn("border-b border-foreground/10", className)}>
      <TabsPrimitive.Root
        value={active}
        onValueChange={(key) => onChange(key as T)}
        activationMode="manual"
      >
        {/* -mb-px belongs on the scroller; on the tabs it overflows the scroll
            box and adds a vertical scrollbar. Scrollbar itself hidden — this is a
            tab bar, not a content area with a visible scroll affordance. */}
        <TabsPrimitive.List
          aria-label={ariaLabel}
          className={cn(
            "-mb-px flex [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden",
            bleed && "mobile-bleed-x"
          )}
        >
          {items.map((item) => (
            <TabsPrimitive.Trigger
              key={item.key}
              value={item.key}
              className={cn(
                "shrink-0 cursor-pointer border-b-2 px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                active === item.key
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/60 hover:text-foreground"
              )}
            >
              {item.label}
            </TabsPrimitive.Trigger>
          ))}
        </TabsPrimitive.List>
      </TabsPrimitive.Root>
    </div>
  );
}
