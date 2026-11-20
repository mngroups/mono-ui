"use client";

import { useIsMobile } from "@mono/hooks";
import { cn } from "@mono/utils";
import { Popover as PopoverPrimitive } from "radix-ui";
import * as React from "react";
import { BottomSheet } from "./bottom-sheet.js";

/**
 * Floating panel anchored to a trigger (Radix Popover). Pass `PopoverTrigger` and `PopoverContent`
 * as direct children: on mobile the content opens in a `BottomSheet` instead.
 */
function Popover({
  children,
  open,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const trigger = React.Children.toArray(children).find(
    (child): child is React.ReactElement<React.ComponentProps<typeof PopoverTrigger>> =>
      React.isValidElement(child) && child.type === PopoverTrigger
  );
  const content = React.Children.toArray(children).find(
    (child): child is React.ReactElement<React.ComponentProps<typeof PopoverContent>> =>
      React.isValidElement(child) && child.type === PopoverContent
  );

  const handleMobileTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    trigger?.props.onClick?.(event);
    if (!event.defaultPrevented) {
      setMobileOpen((prev) => !prev);
    }
  };

  if (isMobile && trigger && content) {
    return (
      <>
        <PopoverPrimitive.Root
          data-slot="popover"
          open={mobileOpen}
          onOpenChange={(nextOpen) => {
            setMobileOpen(nextOpen);
            onOpenChange?.(nextOpen);
          }}
          {...props}
        >
          {React.cloneElement(trigger, {
            onClick: handleMobileTriggerClick,
            onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) => {
              event.preventDefault();
              trigger.props.onPointerEnter?.(event);
            },
            onPointerLeave: (event: React.PointerEvent<HTMLButtonElement>) => {
              event.preventDefault();
              trigger.props.onPointerLeave?.(event);
            },
            onMouseEnter: (event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              trigger.props.onMouseEnter?.(event);
            },
            onMouseLeave: (event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              trigger.props.onMouseLeave?.(event);
            },
          })}
        </PopoverPrimitive.Root>

        <BottomSheet isOpen={mobileOpen} onClose={() => setMobileOpen(false)} title="">
          {content.props.children}
        </BottomSheet>
      </>
    );
  }

  return (
    <PopoverPrimitive.Root data-slot="popover" open={open} onOpenChange={onOpenChange} {...props}>
      {children}
    </PopoverPrimitive.Root>
  );
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-[10000] rounded-xl border border-white/10 bg-popover text-popover-foreground shadow-xl outline-none",
          "data-[state=closed]:animate-out data-[state=open]:animate-in",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

export { Popover, PopoverContent, PopoverTrigger };
