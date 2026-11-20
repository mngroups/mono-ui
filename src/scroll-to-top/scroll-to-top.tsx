"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PlainButton } from "../ui/plain-button.js";

export type ScrollToTopProps = {
  /** Force-hide the button (e.g. on full-screen map pages). */
  hidden?: boolean;
  /** Re-evaluate on change; pass the current pathname so a route change rechecks the scroll. */
  resetKey?: string;
};

/** Floating "back to top" button for mobile (`lg:hidden`), portalled to <body>. */
export default function ScrollToTop({ hidden = false, resetKey }: ScrollToTopProps = {}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Prefer the app main scroll container if present (SidebarLayout uses a scrolling <main>)
    const mainEl = document.querySelector("main");
    const scrollTarget: EventTarget = mainEl instanceof HTMLElement ? mainEl : window;

    function onScroll() {
      if (hidden) {
        setVisible(false);
        return;
      }

      // <main> is the actual scroll container (overflow-y-auto), not window —
      // window.scrollY stays 0 since the page body itself never scrolls.
      const scrolled =
        scrollTarget instanceof HTMLElement
          ? scrollTarget.scrollTop
          : window.scrollY || document.documentElement.scrollTop || 0;
      const threshold = Math.min(300, window.innerHeight || 300);
      setVisible(scrolled > threshold);
    }

    onScroll();

    if (scrollTarget === window) {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else {
      (scrollTarget as HTMLElement).addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("resize", onScroll);

    return () => {
      if (scrollTarget === window) {
        window.removeEventListener("scroll", onScroll);
      } else {
        (scrollTarget as HTMLElement).removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("resize", onScroll);
    };
  }, [hidden, resetKey]);

  if (!visible) return null;

  const scrollToTop = () => {
    // Scroll whichever container actually holds the content — <main> on most
    // pages, window as a fallback — same target onScroll reads from above.
    const mainEl = document.querySelector("main");
    if (mainEl instanceof HTMLElement) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const button = (
    <PlainButton
      id="scroll-to-top-button"
      aria-label="Kembali ke atas"
      onClick={scrollToTop}
      // inline styles to avoid being hidden by parent stacking contexts
      style={{
        position: "fixed",
        right: 16,
        // Clears a pinned mobile form footer when one is showing (it sets
        // --form-footer-offset; see components/sticky-form-footer.tsx).
        bottom:
          "max(calc(var(--safe-bottom) + 6.25rem), calc(var(--form-footer-offset, 0px) + 1rem))",
        zIndex: 1100,
      }}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-foreground/70 backdrop-blur-sm transition-colors hover:text-foreground active:scale-95 lg:hidden"
      type="button"
    >
      <ArrowUp size={20} strokeWidth={1.8} />
    </PlainButton>
  );

  // Use a portal to ensure the button is appended to document.body and not affected by layout overflow or stacking contexts
  /* v8 ignore else -- @preserve SSR guard: document is always defined in the browser/jsdom */
  if (typeof document !== "undefined") return createPortal(button, document.body);
  /* v8 ignore next -- @preserve SSR fallback */
  return null;
}
