import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  // The linked @mono/* packages have their own node_modules; one React only.
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.tsx",
    include: ["src/**/__tests__/**/*.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "dist/**", "storybook-static/**"],
    css: true,
    // Transform the linked @mono/* packages so vi.mock applies to their imports.
    server: { deps: { inline: [/@mono\//] } },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/__tests__/**",
        "src/**/index.ts",
        "src/**/*.stories.tsx",
        "src/types/**",
        "src/test-utils/**",
      ],
      thresholds: { lines: 100, statements: 100, functions: 100, branches: 100 },
    },
  },
});
