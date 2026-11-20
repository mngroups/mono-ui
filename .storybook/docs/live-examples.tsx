import type { ReactNode } from "react";

export type LiveExample = {
  /** The call as a developer would write it. */
  code: string;
  /** Its result, computed when the page renders (so it is always the package's real output). */
  result: ReactNode;
};

function show(value: ReactNode): ReactNode {
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  return value;
}

/** Two-column table: a call and what it returns right now, from the installed package. */
export function LiveExamples({ rows }: { rows: LiveExample[] }) {
  return (
    <div className="mono-docs-not-prose my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Call</th>
            <th className="px-3 py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-t border-border">
              <td className="px-3 py-2 align-top font-mono text-xs">{row.code}</td>
              <td className="px-3 py-2 align-top font-mono text-xs text-primary">
                {show(row.result)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
