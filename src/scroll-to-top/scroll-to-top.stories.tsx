import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useEffect, useRef } from "react";

import { mobileStory } from "../../.storybook/docs/mobile";
import ScrollToTop from "./scroll-to-top.js";

const SITES = ["Site Bontang", "Site Sangatta", "Site Kideco", "Site Berau"];

/**
 * A scrolling `<main>` like the app shell's, so the button has something to watch.
 * `startScrolled` scrolls it down on mount so the button is visible without scrolling by hand.
 */
function ScrollingPage({
  startScrolled = false,
  children,
}: {
  startScrolled?: boolean;
  children: ReactNode;
}) {
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (startScrolled) mainRef.current?.scrollTo({ top: 600 });
  }, [startScrolled]);

  return (
    <main
      ref={mainRef}
      className="h-[420px] overflow-y-auto rounded-xl border border-foreground/10"
    >
      <ul className="divide-y divide-foreground/10 text-sm">
        {Array.from({ length: 60 }, (_, i) => (
          <li key={i} className="flex justify-between px-4 py-3">
            <span>
              Transaksi fuel #{i + 1} · {SITES[i % SITES.length]}
            </span>
            <span className="text-foreground/60 tabular-nums">
              {(800 + i * 23).toLocaleString("id-ID")} L
            </span>
          </li>
        ))}
      </ul>
      {children}
    </main>
  );
}

const meta = {
  title: "Components/ScrollToTop",
  component: ScrollToTop,
  parameters: {
    docs: {
      importPath: 'import { ScrollToTop } from "@mono/ui";',
      // The button is position: fixed, so each example gets its own frame.
      story: { inline: false, iframeHeight: 460 },
    },
  },
  args: { hidden: false },
  render: (args) => (
    <ScrollingPage>
      <ScrollToTop {...args} />
    </ScrollingPage>
  ),
} satisfies Meta<typeof ScrollToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Scroll the list past 300px and the button appears bottom-right (hidden from `lg` up). */
export const Default: Story = {};

/** Already scrolled down, so the button shows; tap it to scroll the `<main>` back to the top. */
export const Scrolled: Story = {
  render: (args) => (
    <ScrollingPage startScrolled>
      <ScrollToTop {...args} />
    </ScrollingPage>
  ),
};

/** `hidden` force-hides it, e.g. on full-screen map pages. */
export const Hidden: Story = {
  args: { hidden: true },
  render: (args) => (
    <ScrollingPage startScrolled>
      <ScrollToTop {...args} />
    </ScrollingPage>
  ),
};

/** The button is meant for phones; this frame is 360px wide. */
export const Mobile: Story = {
  ...mobileStory,
  render: (args) => (
    <ScrollingPage startScrolled>
      <ScrollToTop {...args} />
    </ScrollingPage>
  ),
};
