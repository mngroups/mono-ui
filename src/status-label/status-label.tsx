import { cn } from "@mono/utils";
import type { HTMLAttributes, ReactNode } from "react";
import { Badge } from "../ui/badge.js";

export type StatusTone = "default" | "success" | "danger" | "info" | "warning";

export interface StatusLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Colour of the label: `default` is neutral grey; the others map to the Badge status tones. */
  tone?: StatusTone;
  /** Optional leading icon, e.g. a 12px lucide icon. */
  icon?: ReactNode;
  /** Status text, kept short (one or two words). */
  children: ReactNode;
}

/**
 * Rounded status pill for record states (Aktif, Selesai, Ditolak, …) on top of the shadcn
 * `Badge`. Pick a `tone` for meaning; text and border stay readable in light and dark mode.
 */
export function StatusLabel({
  tone = "default",
  icon,
  children,
  className,
  ...rest
}: StatusLabelProps) {
  return (
    <Badge
      {...rest}
      variant={tone === "default" ? "neutral" : tone}
      data-tone={tone}
      className={cn("rounded-full", className)}
    >
      {icon}
      {children}
    </Badge>
  );
}
