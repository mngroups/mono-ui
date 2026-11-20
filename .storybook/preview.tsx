import type { Decorator, Preview } from "@storybook/react-vite";

import { ThemedDocsContainer } from "./docs/docs-container";
import { DocsPage } from "./docs/docs-page";
import { initialMode, MODE_GLOBAL } from "./mode";
import { startColorMode } from "./preview-mode";

import "./preview.css";

// Keeps `.dark` on <html> in sync with the Mode toolbar, on story and docs pages alike.
startColorMode();

const withSurface: Decorator = (Story) => (
  <div className="bg-background p-4 text-foreground">
    <Story />
  </div>
);

const preview: Preview = {
  // Every story file gets a generated docs page (DocsPage below).
  tags: ["autodocs"],
  globalTypes: {
    [MODE_GLOBAL]: {
      description: "Colour mode",
      toolbar: {
        title: "Mode",
        icon: "sun",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
          { value: "system", icon: "browser", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { [MODE_GLOBAL]: initialMode },
  decorators: [withSurface],
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        mobile: { name: "Mobile 360", styles: { width: "360px", height: "740px" } },
        desktop: { name: "Desktop", styles: { width: "1280px", height: "800px" } },
      },
    },
    controls: {
      expanded: true,
      sort: "requiredFirst",
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    docs: {
      page: DocsPage,
      container: ThemedDocsContainer,
      toc: true,
      source: { type: "dynamic" },
    },
    options: {
      storySort: {
        method: "alphabetical",
        order: [
          "Introduction",
          ["Getting Started", "Guidelines"],
          "Design Tokens",
          ["Colors", "Typography", "Radius & Spacing"],
          "Theme",
          "Components",
          "Hooks",
          ["Overview"],
          "Utils",
          ["Overview"],
        ],
      },
    },
  },
};

export default preview;
