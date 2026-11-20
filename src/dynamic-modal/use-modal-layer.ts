"use client";

import { useEffect, useState } from "react";

const BASE_Z = 9998;
const STEP = 10;

let stack: number[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/**
 * Assigns each open modal a z-index above every modal opened before it, so a
 * modal opened on top of another always gets its own overlay. Registration is
 * global rather than context-based because stacked modals are usually siblings
 * in the tree, not children.
 */
export function useModalLayer(open: boolean) {
  const [depth, setDepth] = useState(0);

  useEffect(() => {
    if (!open) return;

    const id = nextId++;
    stack.push(id);
    notify();

    const sync = () => setDepth(Math.max(0, stack.indexOf(id)));
    listeners.add(sync);
    sync();

    return () => {
      listeners.delete(sync);
      stack = stack.filter((entry) => entry !== id);
      notify();
    };
  }, [open]);

  return {
    depth,
    overlayZ: BASE_Z + depth * STEP,
    contentZ: BASE_Z + depth * STEP + 1,
  };
}
