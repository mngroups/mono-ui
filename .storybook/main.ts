import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.tsx"],
  addons: [
    {
      name: "@storybook/addon-docs",
      // MDX 3 has no GitHub-flavoured Markdown by default: tables would render as raw pipes.
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
    "@storybook/addon-a11y",
  ],
  staticDirs: ["./public"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  typescript: {
    // Props tables come from the TypeScript types. Keep the component's own props and
    // drop the hundreds inherited from DOM / React / Radix typings.
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      // Only the library's components need props tables; skip .storybook/ helpers.
      include: ["src/**/*.tsx"],
      exclude: ["**/*.stories.tsx", "**/__tests__/**"],
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) =>
        !prop.parent || !/node_modules|@types[\\/]react/.test(prop.parent.fileName),
    },
  },
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
    // The linked @mono/* packages have their own node_modules; one React only.
    viteConfig.resolve = { ...viteConfig.resolve, dedupe: ["react", "react-dom"] };

    const userOnWarn = viteConfig.build?.rollupOptions?.onwarn;
    viteConfig.build = {
      ...viteConfig.build,
      // The preview bundle holds every story; its size doesn't reach the npm package.
      chunkSizeWarningLimit: 4096,
      rollupOptions: {
        ...viteConfig.build?.rollupOptions,
        onwarn(warning, warn) {
          // `"use client"` is for React Server Components consumers; in this client-only
          // bundle Rollup drops it and warns, then fails to map that line 1:0 position.
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
          if (
            warning.code === "SOURCEMAP_ERROR" &&
            warning.loc?.line === 1 &&
            warning.loc?.column === 0
          ) {
            return;
          }
          // Third-party code (e.g. zod) placing `@__PURE__` where Rollup can't use it.
          if (warning.code === "INVALID_ANNOTATION" && warning.id?.includes("/node_modules/")) {
            return;
          }
          if (userOnWarn) userOnWarn(warning, warn);
          else warn(warning);
        },
      },
    };
    return viteConfig;
  },
};

export default config;
