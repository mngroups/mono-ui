import { MOBILE_BREAKPOINT, useIsMobile } from "@mono/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { mobileStory } from "../../../.storybook/docs/mobile";

function Demo() {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4 text-sm">
      <div>
        <code>useIsMobile()</code> → <strong className="text-primary">{String(isMobile)}</strong>
      </div>
      <div className="text-muted-foreground">
        Breakpoint: {MOBILE_BREAKPOINT}px. This frame is {isMobile ? "below" : "at or above"} it.
      </div>
      {isMobile ? (
        <div className="rounded-lg bg-accent p-3">
          Mobile tree: a bottom sheet would render here.
        </div>
      ) : (
        <div className="rounded-lg bg-muted p-3">Desktop tree: a popover would render here.</div>
      )}
    </div>
  );
}

const meta = {
  title: "Hooks/useIsMobile",
  parameters: {
    docs: {
      importPath: 'import { useIsMobile, MOBILE_BREAKPOINT } from "@mono/hooks";',
      description: {
        component: `\`useIsMobile(breakpoint = 768): boolean\` is \`true\` below the breakpoint (Tailwind \`md\`).

- Always \`false\` during SSR and hydration, so server and client markup match; it flips after mount.
- Prefer \`max-md:\` / \`md:\` utilities. Use this hook only when the **component tree** differs (bottom sheet vs popover), not for spacing or visibility.
- In tests, mock it partially: \`vi.mock("@mono/hooks", async (o) => ({ ...(await o()), useIsMobile: () => true }))\`.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { render: () => <Demo /> };

/** The same hook inside a 360px frame. */
export const Mobile: Story = { ...mobileStory, render: () => <Demo /> };
