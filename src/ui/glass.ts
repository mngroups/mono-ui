import type { CSSProperties } from "react";

/**
 * Frosted "glass" panel surface. Backed by the --glass-bg/--glass-border/
 * --glass-shadow tokens in styles.css, so it follows light/dark mode.
 * Apply with `style={GLASS_PANEL_STYLE}`.
 */
export const GLASS_PANEL_STYLE: CSSProperties = {
  background: "var(--glass-bg)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid var(--glass-border)",
  boxShadow: "var(--glass-shadow)",
};
