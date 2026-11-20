"use client";

import { forwardRef } from "react";

export type PlainButtonProps = React.ComponentPropsWithoutRef<"button">;

/**
 * Unstyled native `<button>`, styled only by `className`. Use it for
 * custom-styled buttons (rows, triggers, icon buttons, map controls); use
 * `Button` (ui/button) for standard shadcn buttons.
 *
 * `type` defaults to `"submit"` like a native `<button>`, so a button without a
 * `type` still submits its form — pass `type="button"` for anything else.
 */
export const PlainButton = forwardRef<HTMLButtonElement, PlainButtonProps>(
  ({ type = "submit", ...props }, ref) => (
    // biome-ignore lint/correctness/noRestrictedElements: this is the one sanctioned native <button>.
    <button ref={ref} type={type} {...props} />
  )
);

PlainButton.displayName = "PlainButton";
