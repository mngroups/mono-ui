"use client";

import { useIsMobile } from "@mono/hooks";
import { cn } from "@mono/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";
import { BottomSheet } from "./bottom-sheet.js";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

/**
 * Hover hint (Radix Tooltip) with its own provider. Pass `TooltipTrigger` and `TooltipContent`
 * as direct children: on mobile a tap opens the content in a `BottomSheet` instead.
 */
function Tooltip({
  children,
  open,
  onOpenChange,
  disableMobile = false,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  /** Mobile: render only the trigger, no sheet (for controls that open their own sheet). */
  disableMobile?: boolean;
}) {
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const trigger = React.Children.toArray(children).find(
    (child): child is React.ReactElement<React.ComponentProps<typeof TooltipTrigger>> =>
      React.isValidElement(child) && child.type === TooltipTrigger
  );
  const content = React.Children.toArray(children).find(
    (child): child is React.ReactElement<React.ComponentProps<typeof TooltipContent>> =>
      React.isValidElement(child) && child.type === TooltipContent
  );

  const setMobile = (next: boolean) => {
    setMobileOpen(next);
    onOpenChange?.(next);
  };

  const handleMobileTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    trigger?.props.onClick?.(event);
    if (!event.defaultPrevented) {
      setMobile(!mobileOpen);
    }
  };

  // Some controls (for example feedback actions) open their own sheet on tap.
  // Rendering their tooltip as a mobile BottomSheet would otherwise create a
  // second, competing sheet.
  if (isMobile && disableMobile && trigger) {
    return trigger.props.children;
  }

  if (isMobile && trigger && content) {
    return (
      <>
        <TooltipProvider>
          <TooltipPrimitive.Root
            data-slot="tooltip"
            open={mobileOpen}
            // Only the tap toggles the sheet. Radix's own open triggers (focus
            // on Android's tap, mouse hover, the click's close) would otherwise
            // open it and then toggle it straight back shut.
            disableHoverableContent
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
          </TooltipPrimitive.Root>
        </TooltipProvider>

        <BottomSheet isOpen={mobileOpen} onClose={() => setMobile(false)} title="">
          {content.props.children}
        </BottomSheet>
      </>
    );
  }

  return (
    <TooltipProvider>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        open={open}
        onOpenChange={onOpenChange}
        disableHoverableContent={props.disableHoverableContent}
        {...props}
      >
        {children}
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  showArrow = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Draw the pointer arrow. Default `true`. */
  showArrow?: boolean;
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-lg bg-foreground px-3 py-2 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          className
        )}
        {...props}
      >
        {children}
        {/* Radix draws a real triangle — styling the svg as a rotated box
            paints its square background alongside the polygon. */}
        {showArrow && (
          <TooltipPrimitive.Arrow className="z-50 fill-foreground" width={9} height={4} />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
