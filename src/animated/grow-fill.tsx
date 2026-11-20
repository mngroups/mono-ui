"use client";

import { motion, useReducedMotion } from "motion/react";

/** Bar draw-in on first view; same easing as CardReveal. */
export const GROW = { duration: 0.8, ease: [0.22, 1, 0.36, 1] } as const;

/**
 * Bar fill that grows from its anchored edge to `pct`% of its parent the first time it scrolls
 * into view; later `pct` changes animate too. Position and colour come from `className`.
 */
export function GrowFill({
  pct,
  className,
}: {
  /** Fill width as a percentage of the parent, clamped to 0–100. */
  pct: number;
  /** Position and colour of the bar, e.g. `absolute inset-y-0 left-0 bg-primary`. */
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reduceMotion ? false : { width: 0 }}
      whileInView={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      viewport={{ once: true }}
      transition={GROW}
    />
  );
}
