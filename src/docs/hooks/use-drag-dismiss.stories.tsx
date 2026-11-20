import { useDragDismiss } from "@mono/hooks";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { mobileStory } from "../../../.storybook/docs/mobile";
import { Button } from "../../ui/button.js";

function Demo() {
  const [open, setOpen] = useState(true);
  const { sheetRef, handleRef } = useDragDismiss(open, () => setOpen(false));
  return (
    <div className="relative h-[520px] overflow-hidden rounded-xl border border-border bg-muted">
      <div className="p-4">
        <Button onClick={() => setOpen(true)} disabled={open}>
          Buka sheet
        </Button>
      </div>
      {open && (
        <div
          ref={sheetRef}
          className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background shadow-xl transition-transform"
        >
          <div ref={handleRef} className="flex cursor-grab touch-none justify-center py-3">
            <span className="h-1.5 w-12 rounded-full bg-foreground/20" />
          </div>
          <div className="px-5 pb-8 text-sm">
            <p className="font-semibold">Seret pegangan ke bawah untuk menutup.</p>
            <p className="mt-1 text-muted-foreground">
              Only the handle starts a drag, so the content can still scroll.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const meta = {
  title: "Hooks/useDragDismiss",
  parameters: {
    docs: {
      importPath: 'import { useDragDismiss } from "@mono/hooks";',
      description: {
        component: `\`useDragDismiss(isOpen, onClose)\` adds drag-down-to-close to a bottom sheet. It returns \`{ sheetRef, handleRef }\`: put \`sheetRef\` on the sheet and \`handleRef\` on its grab area.

- The sheet follows the finger while dragging; released past min(120px, 35% of the sheet height) it calls \`onClose\`, otherwise it springs back.
- Buttons and links inside the handle stay plain presses (they never start a drag).
- The refs are callback refs, so it also works for a sheet that mounts already open.
- \`BottomSheet\` and \`DynamicModal\` in \`@mono/ui\` already use it; reach for the hook only for a custom sheet.`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Mobile: Story = { ...mobileStory, render: () => <Demo /> };
