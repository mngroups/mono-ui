import { useZoomPan } from "@mono/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Minus, Plus, RotateCcw } from "lucide-react";

import { Button } from "../../ui/button.js";

function Demo() {
  const { scale, zoomTo, canZoomIn, canZoomOut, transform, handlers } = useZoomPan({ max: 4 });
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="outline"
          aria-label="Perkecil"
          disabled={!canZoomOut}
          onClick={() => zoomTo(scale - 0.5)}
        >
          <Minus />
        </Button>
        <span className="w-14 text-center font-mono text-sm">{scale.toFixed(1)}×</span>
        <Button
          size="icon"
          variant="outline"
          aria-label="Perbesar"
          disabled={!canZoomIn}
          onClick={() => zoomTo(scale + 0.5)}
        >
          <Plus />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Reset" onClick={() => zoomTo(1)}>
          <RotateCcw />
        </Button>
      </div>
      <div
        {...handlers}
        className="h-80 touch-none overflow-hidden rounded-xl border border-border bg-muted"
      >
        <div
          className="flex h-full w-full origin-center items-center justify-center"
          style={{ transform }}
        >
          <div className="grid size-56 grid-cols-4 grid-rows-4 gap-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div
                key={i}
                className="flex items-center justify-center rounded bg-primary/15 font-mono text-[10px] text-primary"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/useZoomPan",
  parameters: {
    docs: {
      importPath: 'import { useZoomPan } from "@mono/hooks";',
      description: {
        component: `\`useZoomPan({ min = 1, max = 4 })\` adds zoom (buttons, mouse wheel, pinch, double-click) and drag-to-pan once zoomed past 1×, e.g. for image and document previews.

Returns:

| Field | |
| --- | --- |
| \`scale\` | Current zoom |
| \`zoomTo(scale)\` | Set the zoom (clamped to \`min\`–\`max\`) |
| \`canZoomIn\`, \`canZoomOut\` | For disabling the buttons |
| \`transform\` | CSS \`transform\` for the content |
| \`handlers\` | Wheel, touch, mouse and double-click handlers for the viewport |

Spread \`handlers\` on the viewport (with \`touch-none overflow-hidden\`) and apply \`transform\` to the content. Try the wheel, a double-click, or a drag once zoomed in.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { render: () => <Demo /> };
