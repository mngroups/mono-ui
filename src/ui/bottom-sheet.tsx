"use client";

import { useDragDismiss } from "@mono/hooks";
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface BottomSheetProps {
  /** Whether the sheet is shown (controlled). */
  isOpen: boolean;
  /** Called on overlay click or when the sheet is dragged down. */
  onClose: () => void;
  /** Heading under the drag handle. */
  title?: string;
  /** Sheet body. */
  children: ReactNode;
  /** CSS max height of the sheet. Default "82vh". */
  maxHeight?: string;
  /**
   * false: the body doesn't scroll; the child fills it and scrolls its own
   * list, so it can keep a footer pinned outside the scroll (MapLayers).
   */
  scrollBody?: boolean;
}

/**
 * Lightweight drag-to-dismiss bottom sheet portalled to `document.body`, at any screen width.
 * Used by `Popover` and `Tooltip` on mobile. For a modal with header and actions, use `DynamicModal`.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = "82vh",
  scrollBody = true,
}: BottomSheetProps) {
  const { sheetRef, handleRef } = useDragDismiss(isOpen, onClose);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-4000 bg-black/40 transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none" }}
        onClick={onClose}
      />

      <div
        ref={sheetRef}
        className="fixed right-0 bottom-0 left-0 z-4100 flex max-h-[90vh] flex-col rounded-t-3xl bg-card px-6 pt-6 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-xl"
        style={{ maxHeight, transform: "translateY(100%)" }}
      >
        <div
          ref={handleRef}
          className="flex shrink-0 cursor-grab flex-col active:cursor-grabbing"
          style={{ touchAction: "none" }}
        >
          <div
            aria-hidden
            className="mx-auto mb-6 h-1.5 w-12 shrink-0 rounded-full bg-foreground/20"
          />

          {title && (
            <div className="mb-4 min-w-0 flex-1">
              <h2 className="text-lg font-semibold wrap-break-word text-card-foreground">
                {title}
              </h2>
            </div>
          )}
        </div>

        {/* overflow-x-hidden: full-bleed rows (StickyFormFooter's `sheet` surface)
            reach past this box; clip them here instead of scrolling sideways. */}
        <div
          className={
            scrollBody
              ? "scrollbar-modern -mx-2 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-2"
              : // No overflow clip: the child bounds and scrolls its own list,
                // and its footer may reach into the sheet's bottom padding.
                "-mx-2 flex min-h-0 flex-1 flex-col px-2"
          }
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
