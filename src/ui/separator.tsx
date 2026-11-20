"use client";

import { cn } from "@mono/utils";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import type * as React from "react";

/**
 * 1px divider line (Radix Separator), horizontal or vertical. It is decorative by default (hidden
 * from screen readers); pass `decorative={false}` when it separates content semantically.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
