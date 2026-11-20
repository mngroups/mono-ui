"use client";

import { formatIndonesianNumber } from "@mono/utils";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

// Gentler than the bar's GROW curve: that one lands ~80% of the value in the first frames, which
// reads as a jump then a crawl when the digits are what's moving.
const COUNT = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] } as const;

// An id-ID formatted number ("2.912.340,10", "106,03", "12") with optional non-numeric
// prefix/suffix ("+", " Ha").
const NUMBER_PATTERN = /^(\D*?)(\d[\d.]*(?:,\d+)?)(\D*)$/;

type Parsed = { value: number; format: (n: number) => string };

function parse(text: string): Parsed | null {
  const match = NUMBER_PATTERN.exec(text);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const [whole, fraction = ""] = digits.split(",");
  const value = Number(`${whole.replaceAll(".", "")}.${fraction || 0}`);
  if (!Number.isFinite(value)) return null;
  // The end value prints the original text, so the count always lands on the exact format.
  const format = (n: number) =>
    n === value
      ? text
      : `${prefix}${formatIndonesianNumber(n, {
          minimumFractionDigits: fraction.length,
          maximumFractionDigits: fraction.length,
        })}${suffix}`;
  return { value, format };
}

/**
 * Counts a formatted highlight number up from 0 the first time it scrolls into view, keeping its
 * format (grouping, fraction digits); later changes count from the previous value. Non-numeric
 * text ("—") renders as-is. Screen readers get the final value only.
 */
export function CountUp({
  value,
}: {
  /** Formatted id-ID number with optional prefix/suffix, e.g. "12.480 ton" or "+4,5%". */
  value: string;
}) {
  const parsed = parse(value);
  return parsed ? <AnimatedNumber text={value} parsed={parsed} /> : value;
}

function AnimatedNumber({ text, parsed }: { text: string; parsed: Parsed }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const format = useRef(parsed.format);
  format.current = parsed.format;
  const count = useMotionValue(0);
  const display = useTransform(count, (n) => format.current(n));
  const target = parsed.value;

  useEffect(() => {
    if (reduceMotion) {
      count.set(target);
      return;
    }
    if (!inView) return;
    const controls = animate(count, target, COUNT);
    return () => controls.stop();
  }, [count, target, inView, reduceMotion]);

  return (
    <>
      <span className="sr-only">{text}</span>
      {/* The invisible final value reserves the width, so the unit beside it doesn't shift as
          digits and separators appear; digits stay right-aligned like an odometer. */}
      <span ref={ref} aria-hidden className="inline-grid justify-items-end tabular-nums">
        <span className="invisible col-start-1 row-start-1">{text}</span>
        <motion.span className="col-start-1 row-start-1">{display}</motion.span>
      </span>
    </>
  );
}
