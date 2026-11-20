"use client";

import { Plus, Trash2 } from "lucide-react";
import {
  type ArrayPath,
  type Control,
  type FieldValues,
  type Path,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import { Button } from "../ui/button.js";
import { PlainButton } from "../ui/plain-button.js";
import { FloatingSelect, type SelectOption } from "./floating-select.js";

interface DynamicSelectListProps<T extends FieldValues> {
  /** `control` from the surrounding `useForm()`. */
  control: Control<T>;
  /** Field array path, e.g. "roles" — each row is shaped `{ value: string }`. */
  name: ArrayPath<T>;
  /** Row label, e.g. "Role" — rendered as "Role 1", "Role 2", ... */
  label: string;
  /** Label for the add-row button, e.g. "Role lain". */
  addLabel: string;
  /** All options; each row hides the ones already picked in other rows. */
  options: SelectOption[];
  /** Show a search box in each row's list. */
  searchable?: boolean;
  /** Placeholder of the search box. */
  searchPlaceholder?: string;
  /** Server-side search, passed through to every row's `FloatingSelect`. */
  onSearchChange?: (keyword: string) => void;
  /** Show skeleton rows in the lists while options are being fetched. */
  loading?: boolean;
  /** Prefix for the rows' `data-testid`s (`-select-n`, `-remove-n`, `-add`). */
  testIdPrefix?: string;
}

/**
 * A repeatable list of selects (add/remove rows) backed by a react-hook-form
 * field array. Once an option is picked in one row, it's excluded from every
 * other row's options so the same value can't be selected twice.
 */
export function DynamicSelectList<T extends FieldValues>({
  control,
  name,
  label,
  addLabel,
  options,
  searchable = true,
  searchPlaceholder,
  onSearchChange,
  loading,
  testIdPrefix,
}: DynamicSelectListProps<T>) {
  const fieldArray = useFieldArray({ control, name });
  const values = useWatch({ control, name: name as unknown as Path<T> }) as unknown as
    | { value: string }[]
    | undefined;
  const rows = values ?? [];

  return (
    <div className="space-y-4">
      {fieldArray.fields.map((field, index) => {
        const selectedElsewhere = new Set(
          rows
            .filter((_, i) => i !== index)
            .map((row) => row?.value)
            .filter(Boolean)
        );
        const rowOptions = options.filter((opt) => !selectedElsewhere.has(opt.value));

        return (
          <div key={field.id} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <FloatingSelect
                control={control}
                name={`${name}.${index}.value` as Path<T>}
                label={`${label} ${index + 1}`}
                options={rowOptions}
                searchable={searchable}
                searchPlaceholder={searchPlaceholder}
                onSearchChange={onSearchChange}
                loading={loading}
                testId={testIdPrefix ? `${testIdPrefix}-select-${index}` : undefined}
              />
            </div>
            {fieldArray.fields.length > 1 && (
              <PlainButton
                type="button"
                onClick={() => fieldArray.remove(index)}
                aria-label={`Hapus ${label.toLowerCase()} ${index + 1}`}
                data-testid={testIdPrefix ? `${testIdPrefix}-remove-${index}` : undefined}
                className="mt-3 shrink-0 text-foreground/50 transition-colors hover:text-destructive"
              >
                <Trash2 size={18} />
              </PlainButton>
            )}
          </div>
        );
      })}

      <Button
        variant="ghost"
        type="button"
        className="w-fit"
        data-testid={testIdPrefix ? `${testIdPrefix}-add` : undefined}
        onClick={() => fieldArray.append({ value: "" } as never)}
      >
        <Plus size={16} className="mr-1" />
        {addLabel}
      </Button>
    </div>
  );
}
