import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { addons } from "storybook/manager-api";

import { initialMode, isMode, MODE_GLOBAL, type Mode, onSystemChange, resolveMode } from "./mode";
import { darkTheme, lightTheme } from "./theme";

const themeFor = (mode: Mode | undefined) =>
  resolveMode(mode) === "dark" ? darkTheme : lightTheme;

addons.setConfig({
  theme: themeFor(initialMode),
  sidebar: { showRoots: true },
  enableShortcuts: true,
});

/** Re-themes the sidebar and toolbar live when the Mode toolbar (or the OS, for `system`) changes. */
addons.register("mono-ui/color-mode", (api) => {
  let mode: Mode = initialMode;
  const apply = () => api.setOptions({ theme: themeFor(mode) });
  const onGlobals = ({ globals }: { globals?: Record<string, unknown> }) => {
    const next = globals?.[MODE_GLOBAL];
    if (isMode(next) && next !== mode) {
      mode = next;
      apply();
    }
  };
  const channel = addons.getChannel();
  channel.on(SET_GLOBALS, onGlobals);
  channel.on(GLOBALS_UPDATED, onGlobals);
  onSystemChange(apply);
});
