"use client";

import { cn } from "@mono/utils";
import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";

/**
 * On/off switch (Radix) for a setting that applies immediately. Control it with `checked` +
 * `onCheckedChange`, and give it a `Label` or an `aria-label`.
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-all outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground/20",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-lg ring-0 transition-all duration-200",
          "data-[state=checked]:ml-5 data-[state=unchecked]:ml-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
