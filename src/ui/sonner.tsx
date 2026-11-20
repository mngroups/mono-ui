"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Sonner toaster with the design-system look. Pass `theme` from your theme
 * provider (e.g. `useTheme().theme` from `@mono/hooks`); defaults to "system".
 */
const Toaster = ({ theme = "system", ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Solid red error toast with white text (matches the agreed design).
          error: "!bg-[#B0332A] !text-white !border-[#B0332A]",
          // Sonner hardcodes a muted description colour, which is unreadable on
          // the red error toast — inherit the toast's own text colour instead.
          description: "!text-inherit !opacity-90",
          // Text-only action button that inherits the toast's text colour, so the
          // "Ok" reads white on the red error toast and dark on light toasts.
          actionButton:
            "!bg-transparent !text-inherit !font-semibold !ml-auto !px-2 hover:!opacity-80",
        },
      }}
      {...props}
      // Sonner positions its top stack from the physical viewport edge. On a
      // Capacitor WebView that edge sits behind the status bar, so include the
      // native inset for both desktop and Sonner's mobile layout.
      offset={{ top: "calc(var(--safe-top) + 1rem)" }}
      mobileOffset={{ top: "calc(var(--safe-top) + 1rem)" }}
    />
  );
};

export { Toaster };
