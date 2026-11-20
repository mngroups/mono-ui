import { clearAllFormDrafts, useDraftState, useFormDraft } from "@mono/hooks/form-draft";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";

import { FloatingInput } from "../../floating-input/floating-input.js";
import { FloatingTextarea } from "../../floating-input/floating-textarea.js";
import { Button } from "../../ui/button.js";
import { Form } from "../../ui/form.js";

type Values = { site: string; note: string };

function RhfDemo() {
  const form = useForm<Values>({ defaultValues: { site: "", note: "" } });
  const { clearDraft } = useFormDraft(form, { key: "storybook:fuel-report" });
  return (
    <Form {...form}>
      <form
        className="flex max-w-sm flex-col gap-3"
        onSubmit={form.handleSubmit(() => {
          clearDraft();
          form.reset();
        })}
      >
        <FloatingInput control={form.control} name="site" label="Site" />
        <FloatingTextarea control={form.control} name="note" label="Catatan" />
        <div className="flex gap-2">
          <Button type="submit">Simpan</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              clearDraft();
              form.reset();
            }}
          >
            Batal
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Type something, then reload this page: the values come back.
        </p>
      </form>
    </Form>
  );
}

function StateDemo() {
  const [note, setNote, { clearDraft }] = useDraftState("storybook:quick-note", "");
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <textarea
        aria-label="Catatan cepat"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-24 rounded-xl border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-primary"
        placeholder="Catatan cepat"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => {
            clearDraft();
            setNote("");
          }}
        >
          Hapus draf
        </Button>
        <Button variant="ghost" onClick={() => clearAllFormDrafts()}>
          clearAllFormDrafts()
        </Button>
      </div>
    </div>
  );
}

const meta = {
  title: "Hooks/Form drafts",
  parameters: {
    docs: {
      importPath:
        'import { useFormDraft, useDraftState, clearAllFormDrafts } from "@mono/hooks/form-draft";',
      description: {
        component: `Keeps a form's unsent values in \`sessionStorage\` (per tab, 24-hour TTL) and restores them after a reload or an accidental navigation. Needs \`zustand\`; \`useFormDraft\` also needs \`react-hook-form\`.

### \`useFormDraft(form, options)\`

For react-hook-form. Returns \`{ clearDraft, restoredFileNames, restoredFileGroups }\`. **Call \`clearDraft()\` when the form is submitted or dismissed**; a reload never reaches those paths, so the draft survives it.

| Option | |
| --- | --- |
| \`key\` | Storage key, e.g. \`"fuel:edit:<id>"\`. \`null\` turns drafting off; changing to \`null\` (the modal closed) also discards the draft |
| \`ready\` | Hold the restore until server prefill has landed (default \`true\`) |
| \`files\` | Files picked outside the form; only their names are kept, so the user can be asked to pick them again |
| \`clearOnUrlClose\` | Drop the draft when the URL closes the form (browser back) |
| \`clearOnLeave\` | Drop the draft when leaving for another route (page-level forms) |

### \`useDraftState(key, initial, options?)\`

\`useState\` with a draft, for forms not on react-hook-form: \`const [value, setValue, { clearDraft, restoredFileNames }] = useDraftState(key, initial)\`. The first render always shows \`initial\`; the draft is applied after mount.

### Store helpers

\`clearAllFormDrafts()\` (**call it on logout** so the next user of the tab sees nothing), \`readFormDraft(key)\`, \`clearFormDraft(key)\`, \`useFormDraftStore\`.

**Never draft passwords or secrets.**`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** react-hook-form, with `FloatingInput` / `FloatingTextarea` from `@mono/ui`. */
export const ReactHookForm: Story = { render: () => <RhfDemo /> };

/** Plain `useState` forms. */
export const DraftState: Story = { render: () => <StateDemo /> };
