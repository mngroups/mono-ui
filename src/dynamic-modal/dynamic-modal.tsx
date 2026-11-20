"use client";

import { cn } from "@mono/utils";
import { Loader2, X } from "lucide-react";
import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { useUiConfig } from "../config/ui-config.js";
import { Button } from "../ui/button.js";
import { PlainButton } from "../ui/plain-button.js";
import { useModalLayer } from "./use-modal-layer.js";

interface DynamicModalProps {
  /** Whether the modal is open (controlled). */
  open: boolean;
  /** Called when the modal asks to open or close (close button, cancel, drag or overlay). */
  onOpenChange: (open: boolean) => void;

  /** Heading. A title or description also renders the header's close (×) button. */
  title?: string;
  /** Text under the title. */
  description?: string | ReactNode;
  /** Modal body. */
  children?: ReactNode;
  /** Custom footer; replaces the built-in cancel/confirm buttons. */
  footer?: ReactNode;

  /** Confirm button text. Default "Konfirmasi". */
  confirmLabel?: string;
  /** Cancel button text. Default "Batal". */
  cancelLabel?: string;
  /** Shows the confirm button and handles its click. The modal stays open; close it yourself. */
  onConfirm?: () => void;
  /** Called on cancel, before the modal closes. */
  onCancel?: () => void;
  /** Disable the confirm button, e.g. while the form is invalid. */
  confirmDisabled?: boolean;

  /** Spinner on the confirm button; both buttons disabled. */
  loading?: boolean;
  /** Allow closing by dragging the sheet down or clicking outside. Default `false`. */
  dismissible?: boolean;
  /** `danger` paints the confirm button red, for destructive actions. */
  variant?: "default" | "danger";

  /** Desktop max width (CSS length, or px as a number). Default "32rem". */
  modalWidth?: string | number;
  /** Desktop alignment of the footer buttons. */
  footerAlign?: "start" | "center" | "end";
  /** Desktop footer: buttons side by side (`inline`) or stacked (`stack`). */
  footerLayout?: "inline" | "stack";
  /** Mobile: full-height sheet whose body fills the space between header and footer. */
  mobileFullHeight?: boolean;
  /** Pinned mobile header/footer. Defaults to `UiConfigProvider`'s `mobileNavV2`. */
  mobileNavV2?: boolean;

  testId?: string;
  confirmTestId?: string;
  cancelTestId?: string;
  closeTestId?: string;
}

/**
 * The app's modal: a centred dialog on desktop (`md` and up) and a vaul bottom sheet on mobile.
 * Built-in header (title, description, close button) and cancel/confirm footer, a loading state
 * and a `danger` variant. Stacked modals layer correctly through `useModalLayer`.
 */
export function DynamicModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  confirmDisabled = false,
  loading = false,
  dismissible = false,
  variant = "default",
  modalWidth = "32rem",
  footerAlign = "end",
  footerLayout = "inline",
  mobileFullHeight = false,
  mobileNavV2,
  testId,
  confirmTestId,
  cancelTestId,
  closeTestId,
}: DynamicModalProps) {
  const { depth, overlayZ, contentZ } = useModalLayer(open);
  // New mobile navigation: header and actions stay put while a long body scrolls.
  const config = useUiConfig();
  const pinnedChrome = (mobileNavV2 ?? config.mobileNavV2) || mobileFullHeight;

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const justifyDesktopMap = {
    start: "md:justify-start",
    center: "md:justify-center",
    end: "md:justify-end",
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} dismissible={dismissible}>
      <Drawer.Portal>
        <Drawer.Overlay
          className={cn("fixed inset-0 bg-black/40", depth === 0 && "pointer-events-none")}
          style={{ zIndex: overlayZ }}
        />

        <Drawer.Content
          style={{ zIndex: contentZ }}
          className={cn(
            "fixed inset-x-0 bottom-0 rounded-t-3xl bg-card p-6 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-xl",
            pinnedChrome && "max-md:flex max-md:max-h-[92dvh] max-md:flex-col",
            mobileFullHeight &&
              "max-md:top-0 max-md:max-h-none max-md:rounded-none max-md:pt-[calc(var(--safe-top)+0.75rem)]",
            "md:inset-0 md:flex md:items-center md:justify-center md:bg-transparent md:p-0"
          )}
        >
          <div
            aria-hidden
            className={cn(
              "mx-auto h-1.5 w-12 shrink-0 rounded-full bg-foreground/20 md:hidden",
              mobileFullHeight ? "mb-4" : "mb-8"
            )}
          />

          <div
            data-testid={testId}
            className={cn(
              "max-h-[90vh] w-full",
              mobileFullHeight && "md:flex md:flex-col",
              pinnedChrome &&
                "max-md:flex max-md:max-h-none max-md:min-h-0 max-md:flex-1 max-md:flex-col",
              "md:rounded-2xl md:bg-card md:p-6 md:shadow-xl"
            )}
            style={{
              maxWidth: typeof modalWidth === "number" ? `${modalWidth}px` : modalWidth,
            }}
          >
            {/* Header */}
            {(title || description) && (
              <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {title && (
                    <Drawer.Title
                      title={title}
                      className="text-lg font-semibold wrap-break-word text-card-foreground"
                    >
                      {title}
                    </Drawer.Title>
                  )}
                  {description && (
                    <Drawer.Description className="mt-1 text-sm text-muted-foreground">
                      {description}
                    </Drawer.Description>
                  )}
                </div>
                <PlainButton
                  type="button"
                  data-testid={closeTestId}
                  aria-label="Tutup"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleCancel}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
                >
                  <X size={18} strokeWidth={1.8} />
                </PlainButton>
              </div>
            )}

            {/* Body */}
            {children && (
              <div
                className={cn(
                  "space-y-4",
                  mobileFullHeight && "flex min-h-0 flex-1 flex-col space-y-0",
                  pinnedChrome &&
                    "max-md:-mx-6 max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto max-md:px-6"
                )}
              >
                {children}
              </div>
            )}

            {/* Footer */}
            {footer ? (
              <div className="mt-6 shrink-0">{footer}</div>
            ) : onConfirm || onCancel ? (
              <div
                className={cn(
                  "mt-6 flex shrink-0 flex-col-reverse gap-3",
                  footerLayout === "inline" ? "md:flex-row" : "md:flex-col-reverse",
                  justifyDesktopMap[footerAlign]
                )}
              >
                <Button
                  variant="outline"
                  data-testid={cancelTestId}
                  onClick={handleCancel}
                  disabled={loading}
                  className="w-full md:w-auto md:min-w-25"
                >
                  {cancelLabel}
                </Button>

                {onConfirm && (
                  <Button
                    data-testid={confirmTestId}
                    onClick={onConfirm}
                    disabled={loading || confirmDisabled}
                    className={cn(
                      variant === "danger" && "bg-red-600 hover:bg-red-700",
                      "w-full md:w-auto md:min-w-25"
                    )}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
                        <span className="sr-only">{confirmLabel}</span>
                      </span>
                    ) : (
                      confirmLabel
                    )}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
