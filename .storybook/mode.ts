/**
 * Colour mode shared by the manager (sidebar/toolbar) and the preview (docs + stories):
 * the `mode` toolbar global, `light | dark | system`, remembered in localStorage.
 * Manager and preview iframe share an origin, so both read the same stored value.
 */
export type Mode = "light" | "dark" | "system";
export type ResolvedMode = "light" | "dark";

export const MODE_GLOBAL = "mode";
const STORAGE_KEY = "mono-ui:storybook-mode";
const DARK_QUERY = "(prefers-color-scheme: dark)";
const MODES: Mode[] = ["light", "dark", "system"];

export function isMode(value: unknown): value is Mode {
  return typeof value === "string" && (MODES as string[]).includes(value);
}

export function readStoredMode(): Mode | undefined {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return isMode(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function storeMode(mode: Mode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Storage blocked (private mode, sandbox): the toolbar still works for this session.
  }
}

export function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia(DARK_QUERY).matches;
}

export function resolveMode(mode: Mode | undefined): ResolvedMode {
  if (mode === "system" || mode === undefined) return systemPrefersDark() ? "dark" : "light";
  return mode;
}

/** Calls `onChange` when the OS colour scheme flips (matters for `system`). */
export function onSystemChange(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Initial toolbar value: the stored choice, else follow the OS. */
export const initialMode: Mode = readStoredMode() ?? "system";
