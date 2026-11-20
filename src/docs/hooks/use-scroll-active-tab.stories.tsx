import { useScrollActiveTab } from "@mono/hooks";
import { cn } from "@mono/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";

import { mobileStory } from "../../../.storybook/docs/mobile";
import { PlainButton } from "../../ui/plain-button.js";

const SITES = [
  "Bontang",
  "Sangatta",
  "Tanjung",
  "Kideco",
  "Senakin",
  "Satui",
  "Asam-Asam",
  "Melak",
];

function Demo() {
  const [active, setActive] = useState(SITES[0]);
  const ref = useRef<HTMLDivElement>(null);
  useScrollActiveTab(ref, active);
  return (
    <div className="flex flex-col gap-3">
      <div ref={ref} role="tablist" aria-label="Site" className="flex gap-2 overflow-x-auto pb-1">
        {SITES.map((site) => (
          <PlainButton
            key={site}
            type="button"
            role="tab"
            aria-selected={site === active}
            onClick={() => setActive(site)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm",
              site === active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card"
            )}
          >
            {site}
          </PlainButton>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Tap a half-hidden tab at the edge: the strip scrolls it to the middle.
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useScrollActiveTab",
  parameters: {
    docs: {
      importPath: 'import { useScrollActiveTab } from "@mono/hooks";',
      description: {
        component: `\`useScrollActiveTab(ref, activeKey)\` centres the selected tab in its horizontal scroller whenever \`activeKey\` changes. It looks for the tab with \`role="tab"\` and \`aria-selected="true"\` inside \`ref\`.

- Needed because tapping doesn't scroll on its own: iOS Safari never focuses a tapped button.
- Only the scroller moves, never the page, and nothing happens when the tabs already fit.
- Instant on mount, smooth afterwards.
- \`TabBar\` in \`@mono/ui\` already uses it.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...mobileStory, render: () => <Demo /> };
