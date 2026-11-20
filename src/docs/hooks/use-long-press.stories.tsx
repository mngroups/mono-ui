import { useLongPress } from "@mono/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PlainButton } from "../../ui/plain-button.js";

function Demo() {
  const [count, setCount] = useState(0);
  const handlers = useLongPress(() => setCount((c) => c + 1), 600);
  return (
    <div className="flex flex-col items-start gap-3">
      <PlainButton
        type="button"
        {...handlers}
        className="touch-none rounded-xl border border-border bg-card px-5 py-4 text-sm select-none active:bg-accent"
      >
        Tahan 0,6 detik
      </PlainButton>
      <p className="text-sm">
        Long presses: <strong className="text-primary">{count}</strong>
      </p>
    </div>
  );
}

const meta = {
  title: "Hooks/useLongPress",
  parameters: {
    docs: {
      importPath: 'import { useLongPress } from "@mono/hooks";',
      description: {
        component: `\`useLongPress(callback, ms = 500)\` returns pointer handlers to spread on an element: \`onPointerDown\`, \`onPointerMove\`, \`onPointerUp\`, \`onPointerLeave\`, \`onPointerCancel\`.

- \`callback\` fires once the pointer has been held for \`ms\`.
- Moving more than 10px (a scroll or drag) cancels it, so it is safe on scrollable lists.
- Add \`touch-none select-none\` to the element so the browser doesn't start a text selection or its own long-press menu.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Demo /> };
