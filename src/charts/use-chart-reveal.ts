"use client";

import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/**
 * Series mount the first time the chart scrolls into view, so Recharts' draw-in animation plays
 * where the user sees it instead of off-screen on page load. With reduced motion they render at
 * once, unanimated.
 */
export function useChartReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduceMotion = useReducedMotion() ?? false;
  return { ref, show: inView || reduceMotion, animate: !reduceMotion };
}
