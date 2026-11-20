"use client";

import { cn } from "@mono/utils";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useUiConfig } from "../config/ui-config.js";

/**
 * A form's submit/action row, held at the bottom of the screen on mobile:
 * full-bleed, top border, full-width buttons stacked like the bottom
 * sheet/modal footer — primary on top, so pass children as [Batal, Simpan].
 * Every style here is `max-md:`, so the caller's `className` alone decides the
 * desktop look — pass the row's existing classes and desktop stays as it was.
 * Behind `mobileNavV2` (prop, or `UiConfigProvider`): when off it is just a <div> with
 * `className`, exactly the row it replaced.
 *
 * - `surface="page"` — `fixed`, aligned to the bottom edge of the page's
 *   scroll container (<main>), clearing the home indicator, plus a spacer of
 *   the same height so the form's last fields can scroll above it. (Sticky
 *   only pins once the page is taller than the screen; a short form left its
 *   buttons mid-screen.) Not `bottom: 0`: in the edge-to-edge Capacitor
 *   WebView (`insetsHandling: "css"`) the page box runs to the screen edge
 *   while the fixed-position viewport stops a safe-area short of it, which
 *   left a strip of scrolling content showing under the bar.
 * - `surface="sheet"` — sticky inside BottomSheet's scroll body (content inset
 *   24px: `px-6` on the sheet, `-mx-2 px-2` on the body; `pb-2`),
 *   which already pads for the home indicator. The `-mx-6` bleed can run past
 *   the body (always when nested in a padded card); the body's
 *   `overflow-x-hidden` clips it rather than letting the sheet scroll sideways.
 * - `surface="modal"` — sticky inside DynamicModal's scroll body (`px-6`), for
 *   forms that render their own buttons as modal content.
 */
export function StickyFormFooter({
  children,
  surface = "page",
  className,
  mobileNavV2,
}: {
  /** The action buttons, secondary first: `[Batal, Simpan]`. */
  children: ReactNode;
  /** Where the form lives: a page, a `BottomSheet` or a `DynamicModal`. */
  surface?: "page" | "sheet" | "modal";
  /** Classes for the row; these alone decide the desktop look. */
  className?: string;
  /** Defaults to `UiConfigProvider`'s `mobileNavV2`. */
  mobileNavV2?: boolean;
}) {
  const config = useUiConfig();
  const enabled = mobileNavV2 ?? config.mobileNavV2;
  const barRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [barHeight, setBarHeight] = useState(0);
  const [barTop, setBarTop] = useState<number | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!enabled || surface !== "page" || !bar) return;
    const anchor = spacerRef.current?.closest("main") ?? null;

    const root = document.documentElement;
    const update = () => {
      setBarHeight(bar.offsetHeight);
      const top = anchor ? anchor.getBoundingClientRect().bottom - bar.offsetHeight : null;
      setBarTop(top);
      // Distance from the fixed-position bottom edge to the bar's top, so other
      // bottom-anchored floats (ScrollToTop) can sit above it.
      // Mobile only: from md up the row is static and must not lift anything.
      if (!window.matchMedia("(max-width: 767px)").matches) {
        root.style.removeProperty("--form-footer-offset");
        return;
      }
      const barTopEdge = top ?? bar.getBoundingClientRect().top;
      root.style.setProperty("--form-footer-offset", `${window.innerHeight - barTopEdge}px`);
    };
    update();

    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(bar);
    if (anchor) observer?.observe(anchor);
    window.addEventListener("resize", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      root.style.removeProperty("--form-footer-offset");
    };
  }, [enabled, surface]);

  if (!enabled) return <div className={className}>{children}</div>;

  const bar = (
    <div
      ref={barRef}
      // Only takes effect while `fixed` (mobile); desktop keeps the row static.
      style={surface === "page" && barTop !== null ? { top: barTop, bottom: "auto" } : undefined}
      className={cn(
        className,
        "max-md:z-10 max-md:flex max-md:flex-col-reverse max-md:gap-3 max-md:border-t max-md:border-foreground/10 max-md:pt-3 max-md:*:w-full max-md:*:flex-none",
        surface === "page" &&
          "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:mx-0 max-md:mt-0 max-md:bg-background max-md:px-4 max-md:pb-[calc(var(--safe-bottom)+0.75rem)]",
        surface === "sheet" &&
          "max-md:sticky max-md:bottom-0 max-md:-mx-6 max-md:-mb-2 max-md:bg-card max-md:px-6 max-md:pb-3",
        surface === "modal" &&
          "max-md:sticky max-md:bottom-0 max-md:-mx-6 max-md:bg-card max-md:px-6"
      )}
    >
      {children}
    </div>
  );

  if (surface !== "page") return bar;
  return (
    <>
      {bar}
      {/* Reserves the fixed bar's height at the end of the form (mobile). */}
      <div ref={spacerRef} aria-hidden className="md:hidden" style={{ height: barHeight }} />
    </>
  );
}
