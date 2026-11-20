import { useSyncExternalStore } from "react";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

import {
  initialMode,
  isMode,
  MODE_GLOBAL,
  type Mode,
  onSystemChange,
  type ResolvedMode,
  resolveMode,
  storeMode,
} from "./mode";

/**
 * Preview side of the colour mode: keeps `.dark` on <html> (what the components read)
 * in sync with the Mode toolbar, and lets the docs container re-theme its blocks.
 * Listening on the channel, not in a decorator, also covers MDX pages with no stories.
 */
let requested: Mode = initialMode;
let resolved: ResolvedMode = resolveMode(requested);
const listeners = new Set<() => void>();

function apply() {
  resolved = resolveMode(requested);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
  for (const listener of listeners) listener();
}

function setRequested(mode: Mode) {
  requested = mode;
  storeMode(mode);
  apply();
}

let started = false;
export function startColorMode() {
  if (started) return;
  started = true;
  const onGlobals = ({ globals }: { globals?: Record<string, unknown> }) => {
    const next = globals?.[MODE_GLOBAL];
    if (isMode(next)) setRequested(next);
  };
  const channel = addons.getChannel();
  channel.on(SET_GLOBALS, onGlobals);
  channel.on(GLOBALS_UPDATED, onGlobals);
  onSystemChange(apply);
  apply();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `light` or `dark`, after resolving `system`. */
export function useResolvedMode(): ResolvedMode {
  return useSyncExternalStore(
    subscribe,
    () => resolved,
    () => resolved
  );
}
