import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import type { PropsWithChildren } from "react";

import { useResolvedMode } from "../preview-mode";
import { darkTheme, lightTheme } from "../theme";

/** Docs pages (blocks, code, props tables) follow the Mode toolbar like the rest of the UI. */
export function ThemedDocsContainer(props: PropsWithChildren<DocsContainerProps>) {
  const mode = useResolvedMode();
  return <DocsContainer {...props} theme={mode === "dark" ? darkTheme : lightTheme} />;
}
